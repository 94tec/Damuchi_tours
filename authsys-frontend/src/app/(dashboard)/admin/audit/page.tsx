"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ShieldCheck, RefreshCw, Search, X, AlertTriangle, Info, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format, isValid } from "date-fns";
import { AuditLogDetailDialog } from "@/components/admin/audit-log-detail-dialog";
import { GenericLogDetailDialog } from "@/components/admin/generic-log-detail-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";
import type { ApiError, AuditLog, GenericLog } from "@/types/auth";

const PAGE_SIZE = 12;

/* =========================
   Two-tab model — every backend AuditCollection key gets grouped
   into "User logs" (actions tied to a specific person) or "System
   logs" (backend-internal events with no real actor). Matches the
   8 keys in AuditCollection.java exactly — if a new collection is
   added server-side, it needs a home in one of these two arrays or
   it silently won't appear anywhere.
   ========================= */

const TABS = [
    { key: "user", label: "User logs", collections: ["audit", "security", "password-change"] },
    { key: "system", label: "System logs", collections: ["system", "cache", "bootstrap", "rollbacks", "partial-saves"] },
] as const;

type TabKey = typeof TABS[number]["key"];

const SEVERITY_CONFIG: Record<string, { dot: string; ring: string; label: string; icon: React.ComponentType<{ className?: string }> }> = {
    INFO: { dot: "bg-emerald-500", ring: "ring-emerald-500/20", label: "Info", icon: Info },
    LOW: { dot: "bg-emerald-500", ring: "ring-emerald-500/20", label: "Low", icon: Info },
    WARN: { dot: "bg-amber-500", ring: "ring-amber-500/20", label: "Warning", icon: AlertTriangle },
    MEDIUM: { dot: "bg-amber-500", ring: "ring-amber-500/20", label: "Medium", icon: AlertTriangle },
    ERROR: { dot: "bg-destructive", ring: "ring-destructive/20", label: "Error", icon: XCircle },
    HIGH: { dot: "bg-destructive", ring: "ring-destructive/20", label: "High", icon: XCircle },
    CRITICAL: { dot: "bg-destructive", ring: "ring-destructive/20", label: "Critical", icon: XCircle },
};

function severityOf(sev: string) {
    return SEVERITY_CONFIG[sev?.toUpperCase()] ?? {
        dot: "bg-muted-foreground/40", ring: "ring-muted-foreground/10", label: sev || "Unknown", icon: Info,
    };
}

function safeTimestamp(value: string | undefined) {
    if (!value) return null;
    const d = new Date(value);
    return isValid(d) ? d : null;
}

function SummaryChip({ label, count, active, onClick, dotClass }: {
    label: string; count: number; active: boolean; onClick: () => void; dotClass: string;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                active ? "border-accent bg-accent/10 text-accent" : "border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground"
            }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
            {label}
            <span className="font-mono tabular-nums">{count}</span>
        </button>
    );
}

// Unified row shape both audit logs and generic-collection logs render into
interface Row {
    id: string;
    label: string;
    severity: string;
    timestamp?: string;
    userLabel: string;
    ip?: string;
    raw: AuditLog | GenericLog;
    kind: "audit" | "generic";
}

function auditLogToRow(l: AuditLog): Row {
    return {
        id: l.id ?? crypto.randomUUID(),
        label: l.action || l.actionType || "UNKNOWN_ACTION",
        severity: l.severity,
        timestamp: l.timestamp,
        userLabel: l.userEmail ?? (l.userId ? `${l.userId.slice(0, 12)}…` : "system"),
        ip: l.ipAddress,
        raw: l,
        kind: "audit",
    };
}

function genericLogToRow(l: GenericLog): Row {
    return {
        id: l.id,
        label: l.label,
        severity: l.severity,
        timestamp: l.timestamp,
        userLabel: l.userId ? `${l.userId.slice(0, 12)}…` : "—",
        ip: typeof l.fields?.ipAddress === "string" ? l.fields.ipAddress : undefined,
        raw: l,
        kind: "generic",
    };
}

/**
 * Fetch every collection belonging to one tab in parallel. Each collection
 * is caught individually so one bad/empty collection (e.g. a brand-new one
 * with no documents yet) doesn't blank out the whole tab.
 */
async function fetchTabRows(
    collectionKeys: readonly string[]
): Promise<Row[]> {

    const auditKeys = collectionKeys.filter(
        (key) => key === "audit"
    );

    const genericKeys = collectionKeys.filter(
        (key) => key !== "audit"
    );

    console.log(
        "[AuditLog] collectionKeys:",
        collectionKeys
    );

    const [auditRows, genericRows] = await Promise.all([
        auditKeys.length > 0
            ? adminApi
                .getAuditLogs()
                .then((logs) => {
                    return logs.map(auditLogToRow);
                })
            : Promise.resolve<Row[]>([]),

        genericKeys.length > 0
            ? adminApi
                .getCollectionLogsBatch(genericKeys)
                .then((logs) => {

                    return logs.map(genericLogToRow);
                })
            : Promise.resolve<Row[]>([]),
    ]);

    const rows = [
        ...auditRows,
        ...genericRows,
    ];

    return rows;
}

export default function AuditLogPage() {
    const [activeTab, setActiveTab] = useState<TabKey>("user");
    const [rows, setRows] = useState<Row[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [severityFilter, setSeverityFilter] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);
    const [selectedGenericLog, setSelectedGenericLog] = useState<GenericLog | null>(null);

    const load = useCallback(async (tabKey: TabKey) => {
        setIsLoading(true);
        setSeverityFilter(null);
        setPage(1);
        try {
            const tab = TABS.find((t) => t.key === tabKey)!;
            const combined = await fetchTabRows(tab.collections);
            const sorted = combined.sort((a, b) =>
                (safeTimestamp(b.timestamp)?.getTime() ?? 0) - (safeTimestamp(a.timestamp)?.getTime() ?? 0));
            setRows(sorted);
        } catch (err) {
            toast.error((err as ApiError).message || "Couldn't load logs.");
            setRows([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { load(activeTab); }, [activeTab, load]);

    const counts = useMemo(() => {
        const c: Record<string, number> = {};
        for (const r of rows) {
            const key = r.severity?.toUpperCase() ?? "INFO";
            c[key] = (c[key] ?? 0) + 1;
        }
        return c;
    }, [rows]);

    const filtered = useMemo(() => {
        return rows.filter((r) => {
            if (severityFilter && r.severity?.toUpperCase() !== severityFilter) return false;
            if (search === "") return true;
            return `${r.label} ${r.userLabel}`.toLowerCase().includes(search.toLowerCase());
        });
    }, [rows, search, severityFilter]);

    useEffect(() => { setPage(1); }, [search, severityFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const clampedPage = Math.min(page, totalPages);
    const paged = useMemo(
        () => filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE),
        [filtered, clampedPage]
    );

    function openDetail(row: Row) {
        if (row.kind === "audit") setSelectedAuditLog(row.raw as AuditLog);
        else setSelectedGenericLog(row.raw as GenericLog);
    }

    return (
        <div className="space-y-7">
            <PageHeader
                eyebrow="Admin"
                title="Audit log"
                subtitle="Every action tracked — who, what, when, from where."
                action={
                    <Button variant="outline" size="sm" onClick={() => load(activeTab)} disabled={isLoading}>
                        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                }
            />

            {/* User logs / System logs */}
            <div className="flex gap-1 border-b border-border pb-px">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`shrink-0 border-b-2 px-3.5 py-2 text-sm font-medium transition-colors ${
                            activeTab === t.key
                                ? "border-accent text-accent"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Summary strip */}
            {!isLoading && rows.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <SummaryChip label="All" count={rows.length} active={severityFilter === null}
                                 onClick={() => setSeverityFilter(null)} dotClass="bg-accent" />
                    {Object.keys(counts).map((sev) => (
                        <SummaryChip
                            key={sev}
                            label={severityOf(sev).label}
                            count={counts[sev] ?? 0}
                            active={severityFilter === sev}
                            onClick={() => setSeverityFilter(severityFilter === sev ? null : sev)}
                            dotClass={severityOf(sev).dot}
                        />
                    ))}
                </div>
            )}

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by action, user…" className="pl-9 pr-9" value={search}
                       onChange={(e) => setSearch(e.target.value)} />
                {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="space-y-3 rounded-xl border border-border bg-card p-5">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-2.5 w-2.5 shrink-0 rounded-full" />
                            <Skeleton className="h-10 flex-1 rounded-lg" />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={ShieldCheck}
                    title={rows.length === 0 ? "No entries yet" : "No matches"}
                    description={rows.length === 0 ? "Events in this category will appear here." : "Try a different search term or clear the severity filter."}
                />
            ) : (
                <>
                    <div className="rounded-xl border border-border bg-card">
                        <ol className="relative divide-y divide-border/60">
                            {paged.map((row, i) => {
                                const cfg = severityOf(row.severity);
                                const ts = safeTimestamp(row.timestamp);
                                return (
                                    <li key={row.id} onClick={() => openDetail(row)}
                                        className="relative flex cursor-pointer gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
                                        <div className="relative flex w-2.5 shrink-0 flex-col items-center">
                                            {i !== 0 && <span className="absolute -top-4 h-4 w-px bg-border" />}
                                            <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ${cfg.dot} ${cfg.ring}`} />
                                            {i !== paged.length - 1 && <span className="absolute top-4 bottom-[-1rem] w-px bg-border" />}
                                        </div>
                                        <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                            <div className="min-w-0">
                                                <p className="truncate font-mono text-[13px] font-medium tracking-tight">{row.label}</p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">{row.userLabel}</p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground sm:flex-col sm:items-end sm:gap-0.5">
                                                {row.ip && <span className="font-mono text-[11px]">{row.ip}</span>}
                                                <span className="font-mono text-[11px] tabular-nums">
                              {ts ? format(ts, "dd MMM · HH:mm:ss") : "—"}
                            </span>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-xs text-muted-foreground">
                            Showing {(clampedPage - 1) * PAGE_SIZE + 1}–{Math.min(clampedPage * PAGE_SIZE, filtered.length)} of {filtered.length}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={clampedPage <= 1}
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                Previous
                            </Button>
                            <span className="min-w-[4.5rem] text-center text-xs text-muted-foreground">
                                Page {clampedPage} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={clampedPage >= totalPages}
                            >
                                Next
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </>
            )}

            <AuditLogDetailDialog log={selectedAuditLog} open={!!selectedAuditLog} onOpenChange={(o) => !o && setSelectedAuditLog(null)} />
            <GenericLogDetailDialog log={selectedGenericLog} open={!!selectedGenericLog} onOpenChange={(o) => !o && setSelectedGenericLog(null)} />
        </div>
    );
}