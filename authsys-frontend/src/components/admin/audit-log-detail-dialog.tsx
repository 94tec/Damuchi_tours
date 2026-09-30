"use client";

import { useEffect, useState } from "react";
import { Copy, Mail, Phone, Shield, AlertCircle, Loader2, Check } from "lucide-react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { adminApi } from "@/lib/admin-api";
import type { AuditLog, User } from "@/types/auth";
import { format } from "date-fns";

/* =========================
   View model — merges the raw audit log with the lazily-fetched
   user record, so the dialog renders from one clean shape instead
   of juggling two data sources inline in JSX.
   ========================= */

interface AuditLogDetailViewModel {
    log: AuditLog;
    user: User | null;
    userLoading: boolean;
    userError: string | null;
}

function useAuditLogDetail(log: AuditLog | null, open: boolean): AuditLogDetailViewModel {
    const [user, setUser] = useState<User | null>(null);
    const [userLoading, setUserLoading] = useState(false);
    const [userError, setUserError] = useState<string | null>(null);

    useEffect(() => {
        if (!open || !log?.userId) {
            setUser(null);
            setUserError(null);
            return;
        }
        setUserLoading(true);
        setUserError(null);
        adminApi.getUserById(log.userId)
            .then(setUser)
            .catch(() => setUserError("Couldn't load this user — they may have been removed."))
            .finally(() => setUserLoading(false));
    }, [log?.userId, open]);

    return { log: log!, user, userLoading, userError };
}

/* =========================
   Small pieces
   ========================= */

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
    if (value === null || value === undefined || value === "") return null;
    return (
        <div>
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
            <dd className={`mt-0.5 text-sm ${mono ? "font-mono text-[13px]" : ""}`}>{value}</dd>
        </div>
    );
}

function CopyableId({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={() => {
                navigator.clipboard.writeText(value);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
        >
            {value}
            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
        </button>
    );
}

/* =========================
   Main dialog
   ========================= */

export function AuditLogDetailDialog({
                                         log,
                                         open,
                                         onOpenChange,
                                     }: {
    log: AuditLog | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { user, userLoading, userError } = useAuditLogDetail(log, open);

    if (!log) return null;

    const ts = log.timestamp ? new Date(log.timestamp) : null;
    const initials = user
        ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
        : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-mono text-base">
                        {log.action || log.actionType || "UNKNOWN_ACTION"}
                    </DialogTitle>
                    <DialogDescription>
                        {ts && !isNaN(ts.getTime())
                            ? format(ts, "EEEE, dd MMM yyyy · HH:mm:ss")
                            : "Timestamp unavailable"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                    {/* Event details */}
                    <dl className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Severity</dt>
                            <dd><Badge variant="outline" className="text-[10px]">{log.severity}</Badge></dd>
                        </div>
                        {log.ipAddress && (
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">IP address</dt>
                                <dd className="font-mono text-[13px]">{log.ipAddress}</dd>
                            </div>
                        )}
                        {log.entityType && (
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Entity</dt>
                                <dd className="truncate font-mono text-[13px]">
                                    {log.entityType}{log.entityId ? ` · ${log.entityId.slice(0, 12)}…` : ""}
                                </dd>
                            </div>
                        )}
                        {log.id && (
                            <div className="flex items-center justify-between gap-3">
                                <dt className="shrink-0 text-[11px] uppercase tracking-wide text-muted-foreground">Log ID</dt>
                                <dd><CopyableId value={log.id} /></dd>
                            </div>
                        )}
                    </dl>

                    {log.details && (
                        <div>
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Details</p>
                            <p className="mt-1 whitespace-pre-wrap break-words rounded-lg bg-muted/40 p-3 text-sm">
                                {log.details}
                            </p>
                        </div>
                    )}

                    <Separator />

                    {/* Associated user — lazily fetched */}
                    <div>
                        <p className="mb-2.5 text-[11px] uppercase tracking-wide text-muted-foreground">User</p>

                        {!log.userId ? (
                            <p className="text-sm text-muted-foreground">No user associated with this event.</p>
                        ) : userLoading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Loading user details…
                            </div>
                        ) : userError ? (
                            <div className="flex items-start gap-2 rounded-lg bg-destructive/5 p-3 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <div>
                                    <p>{userError}</p>
                                    <p className="mt-1 font-mono text-xs text-muted-foreground">{log.userId}</p>
                                </div>
                            </div>
                        ) : user ? (
                            <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                                    {initials || "?"}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />{user.email}
                        </span>
                                        {user.phoneNumber && (
                                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />{user.phoneNumber}
                            </span>
                                        )}
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {user.roles?.map((r) => (
                                            <Badge key={r} variant="secondary" className="text-[10px]">{r}</Badge>
                                        ))}
                                        <Badge variant="outline" className="gap-1 text-[10px]">
                                            <Shield className="h-2.5 w-2.5" />{user.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}