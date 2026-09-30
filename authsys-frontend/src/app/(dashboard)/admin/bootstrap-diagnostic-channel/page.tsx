"use client";

import { useCallback, useEffect, useState } from "react";
import {
    ServerCog,
    RefreshCw,
    Lock,
    LockOpen,
    Mail,
    MailWarning,
    RotateCcw,
    Send,
    AlertTriangle,
    CheckCircle2,
    History,
    ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuthStore } from "@/store/auth-store";
import { adminApi } from "@/lib/admin-api";
import type { ApiError } from "@/types/auth";

/* =========================
   Types
   ========================= */

type LockStatus = "AVAILABLE" | "ACQUIRED" | "EXPIRED";
type HealthLevel = "HEALTHY" | "PENDING" | "WARNING" | "CRITICAL";

interface BootstrapHealth {
    totalAttempts: number;
    successfulAttempts: number;
    failedAttempts: number;
    emailDeliveryRate: number;
    lastBootstrapAt: string | null;
    lockAcquisitions: number;
    lockReleases: number;
}

interface BootstrapStatus {
    bootstrapComplete: boolean;
    lockStatus: LockStatus;
    health: BootstrapHealth;
    checkedAt: string;
}

interface CriticalFailure {
    id: string;
    timestamp: string;
    operation: string;
    originalError: string;
    rollbackError: string | null;
    failurePoint: string;
    context: Record<string, unknown>;
}

interface RollbackEvent {
    id: string;
    timestamp: string;
    operation: string;
    userId: string;
    error: string;
    cleaned: boolean;
}

interface EmailFailure {
    id: string;
    timestamp: string;
    email: string;
    error: string;
    actionRequired: string | null;
}

/* =========================
   Status rail — the piece that needed the most work.
   Each card declares its own value "shape": a word-status gets a
   small, weighted, tracked treatment; a number/ratio/percent gets
   the bigger display type. Mixing both under one text-xl class was
   the original bug.
   ========================= */

type CardTone = "good" | "warn" | "bad" | "neutral";

const TONE_STYLES: Record<CardTone, { dot: string; iconWrap: string; icon: string }> = {
    good:    { dot: "bg-emerald-500", iconWrap: "bg-emerald-500/10", icon: "text-emerald-600 dark:text-emerald-400" },
    warn:    { dot: "bg-amber-500",   iconWrap: "bg-amber-500/10",   icon: "text-amber-600 dark:text-amber-400" },
    bad:     { dot: "bg-destructive", iconWrap: "bg-destructive/10", icon: "text-destructive" },
    neutral: { dot: "bg-muted-foreground", iconWrap: "bg-muted",     icon: "text-muted-foreground" },
};

function StatusCard({
                        label, value, valueKind, tone, icon: Icon,
                    }: {
    label: string;
    value: string;
    valueKind: "word" | "number";
    tone: CardTone;
    icon: React.ComponentType<{ className?: string }>;
}) {
    const t = TONE_STYLES[tone];
    return (
        <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
            <span className={`absolute inset-x-0 top-0 h-0.5 ${t.dot}`} />
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                    </p>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${t.iconWrap}`}>
                        <Icon className={`h-3.5 w-3.5 ${t.icon}`} />
                    </span>
                </div>
                {valueKind === "word" ? (
                    <p className="mt-2.5 truncate text-sm font-semibold tracking-tight">{value}</p>
                ) : (
                    <p className="mt-2 font-display text-2xl font-semibold tracking-tight">{value}</p>
                )}
            </CardContent>
        </Card>
    );
}

function StatusRail({ status, isLoading }: { status: BootstrapStatus | null; isLoading: boolean }) {
    if (isLoading && !status) {
        return (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[92px] rounded-xl" />
                ))}
            </div>
        );
    }

    if (!status) return null;

    const overallHealth: HealthLevel =
        status.health.failedAttempts > 0 && status.health.successfulAttempts === 0
            ? "CRITICAL"
            : status.health.emailDeliveryRate < 100
                ? "WARNING"
                : status.bootstrapComplete
                    ? "HEALTHY"
                    : "PENDING";

    const healthTone: CardTone =
        overallHealth === "CRITICAL" ? "bad" : overallHealth === "WARNING" ? "warn" : overallHealth === "HEALTHY" ? "good" : "neutral";

    const lockTone: CardTone =
        status.lockStatus === "AVAILABLE" ? "good" : status.lockStatus === "ACQUIRED" ? "warn" : "bad";

    const emailTone: CardTone = status.health.emailDeliveryRate < 100 ? "warn" : "good";

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatusCard
                label="Bootstrap state"
                value={status.bootstrapComplete ? "Complete" : "Pending"}
                valueKind="word"
                tone={status.bootstrapComplete ? "good" : "warn"}
                icon={status.bootstrapComplete ? CheckCircle2 : ServerCog}
            />
            <StatusCard
                label="Lock status"
                value={status.lockStatus}
                valueKind="word"
                tone={lockTone}
                icon={status.lockStatus === "AVAILABLE" ? LockOpen : Lock}
            />
            <StatusCard
                label="Email delivery"
                value={`${status.health.emailDeliveryRate.toFixed(0)}%`}
                valueKind="number"
                tone={emailTone}
                icon={status.health.emailDeliveryRate < 100 ? MailWarning : Mail}
            />
            <StatusCard
                label="Attempts"
                value={`${status.health.successfulAttempts}/${status.health.totalAttempts}`}
                valueKind="number"
                tone={healthTone}
                icon={History}
            />
        </div>
    );
}

/* =========================
   Section header — small reusable piece so every section
   (critical failures / email failures / rollbacks) reads
   consistently instead of plain <h3> tags of varying weight.
   ========================= */

function SectionHeader({
                           icon: Icon, title, count,
                       }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    count?: number;
}) {
    return (
        <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
            <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
            {typeof count === "number" && count > 0 && (
                <Badge variant="secondary" className="h-5 rounded-full px-1.5 text-[10px] font-medium">
                    {count}
                </Badge>
            )}
        </div>
    );
}

/* =========================
   Small building blocks
   ========================= */

function ResendEmailAction({ onDone }: { onDone: () => void }) {
    const [email, setEmail] = useState("");
    const [isSending, setIsSending] = useState(false);

    async function resend() {
        if (!email.trim()) {
            toast.error("Enter an email address first.");
            return;
        }
        setIsSending(true);
        try {
            await adminApi.resendBootstrapWelcomeEmail(email.trim());
            toast.success("Password reset link sent");
            setEmail("");
            onDone();
        } catch (err) {
            toast.error((err as ApiError).message || "Couldn't send reset link.");
        } finally {
            setIsSending(false);
        }
    }

    return (
        <div className="flex flex-col gap-2 sm:flex-row">
            <Input
                placeholder="admin@techstack.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="sm:max-w-xs"
            />
            <Button variant="outline" size="sm" onClick={resend} disabled={isSending} className="shrink-0">
                <Send className="h-3.5 w-3.5" />
                Resend welcome email
            </Button>
        </div>
    );
}

function DangerZone({ lockStatus, bootstrapComplete, onChanged }: {
    lockStatus: LockStatus;
    bootstrapComplete: boolean;
    onChanged: () => void;
}) {
    const [isBusy, setIsBusy] = useState<"lock" | "reset" | null>(null);

    async function forceReleaseLock() {
        setIsBusy("lock");
        try {
            await adminApi.forceReleaseBootstrapLock();
            toast.success("Lock released");
            onChanged();
        } catch (err) {
            toast.error((err as ApiError).message || "Couldn't release lock.");
        } finally {
            setIsBusy(null);
        }
    }

    async function resetBootstrap() {
        setIsBusy("reset");
        try {
            await adminApi.resetBootstrapState();
            toast.success("Bootstrap state reset");
            onChanged();
        } catch (err) {
            toast.error((err as ApiError).message || "Couldn't reset bootstrap state.");
        } finally {
            setIsBusy(null);
        }
    }

    return (
        <Card className="relative overflow-hidden border-destructive/20 bg-destructive/[0.02]">
            <span className="absolute inset-y-0 left-0 w-1 bg-destructive/60" />
            <CardContent className="space-y-4 p-5 pl-6">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </span>
                    <div>
                        <h3 className="text-sm font-semibold tracking-tight">Danger zone</h3>
                        <p className="text-xs text-muted-foreground">Acts directly on system initialization state</p>
                    </div>
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">
                    Only use these if you understand exactly what caused the current state — both actions
                    are logged and audited.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={lockStatus === "AVAILABLE" || isBusy !== null}>
                                <LockOpen className="h-3.5 w-3.5" />
                                Force release lock
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Force release the bootstrap lock?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Only do this if you've confirmed no bootstrap process is actually running.
                                    This won't roll back partial changes or validate system state.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={forceReleaseLock} disabled={isBusy === "lock"}>
                                    Release lock
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={!bootstrapComplete || isBusy !== null}>
                                <RotateCcw className="h-3.5 w-3.5" />
                                Reset bootstrap state
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Reset bootstrap state?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This clears the completion flag and releases all locks so bootstrap can run
                                    again. It will not delete the existing Super Admin or roll back any data.
                                    This should never be used in production without sign-off.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <Input
                                placeholder='Type "RESET" to confirm'
                                onChange={(e) => {
                                    (document.getElementById("reset-confirm-action") as HTMLButtonElement | null)
                                        ?.toggleAttribute("data-armed", e.target.value === "RESET");
                                }}
                            />
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    id="reset-confirm-action"
                                    onClick={resetBootstrap}
                                    disabled={isBusy === "reset"}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Reset state
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}

function ResolveFailureButton({ failureId, onResolved }: { failureId: string; onResolved: () => void }) {
    const [resolution, setResolution] = useState("");
    const [isResolving, setIsResolving] = useState(false);

    async function resolve() {
        if (!resolution.trim()) {
            toast.error("Add a resolution note first.");
            return;
        }
        setIsResolving(true);
        try {
            await adminApi.resolveBootstrapFailure(failureId, resolution.trim());
            toast.success("Failure marked resolved");
            onResolved();
        } catch (err) {
            toast.error((err as ApiError).message || "Couldn't resolve failure.");
        } finally {
            setIsResolving(false);
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Resolve
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Resolve this failure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Describe what caused it and what action was taken, for the audit trail.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <Input
                    placeholder="e.g. Fixed SMTP config, resent email successfully"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                />
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={resolve} disabled={isResolving}>
                        Mark resolved
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

/* =========================
   Page
   ========================= */

export default function BootstrapDiagnosticsPage() {
    const { isSuperAdmin } = useAuthStore();
    const superAdmin = isSuperAdmin();

    const [status, setStatus] = useState<BootstrapStatus | null>(null);
    const [criticalFailures, setCriticalFailures] = useState<CriticalFailure[]>([]);
    const [rollbacks, setRollbacks] = useState<RollbackEvent[]>([]);
    const [emailFailures, setEmailFailures] = useState<EmailFailure[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const [statusData, failures, rollbackEvents, emailFails] = await Promise.all([
                adminApi.getBootstrapStatus(),
                adminApi.getCriticalBootstrapFailures(),
                adminApi.getRecentBootstrapRollbacks(24),
                adminApi.getBootstrapEmailFailures(),
            ]);
            setStatus(statusData);
            setCriticalFailures(failures);
            setRollbacks(rollbackEvents);
            setEmailFailures(emailFails);
        } catch (err) {
            toast.error((err as ApiError).message || "Couldn't load bootstrap diagnostics.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    if (!superAdmin) {
        return (
            <EmptyState
                icon={ShieldAlert}
                title="SUPER_ADMIN access required"
                description="This page is restricted to platform owners."
            />
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                eyebrow="Admin · System"
                title="Bootstrap diagnostics"
                subtitle="Super Admin initialization health, lock coordination, and delivery status."
                action={
                    <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
                        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                }
            />

            <StatusRail status={status} isLoading={isLoading} />

            {criticalFailures.length > 0 && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/[0.04] px-4 py-3.5">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    </span>
                    <div>
                        <p className="text-sm font-medium text-destructive">
                            {criticalFailures.length} critical failure{criticalFailures.length > 1 ? "s" : ""} need
                            {criticalFailures.length === 1 ? "s" : ""} manual review
                        </p>
                        <p className="text-xs text-destructive/70">See the list below to investigate and resolve.</p>
                    </div>
                </div>
            )}

            {/* Critical failures */}
            <section className="space-y-3">
                <SectionHeader icon={AlertTriangle} title="Critical failures" count={criticalFailures.length} />
                {isLoading ? (
                    <Skeleton className="h-14 w-full rounded-lg" />
                ) : criticalFailures.length === 0 ? (
                    <EmptyState
                        icon={CheckCircle2}
                        title="No critical failures"
                        description="Nothing requires manual cleanup right now."
                    />
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead>Operation</TableHead>
                                    <TableHead>Failure point</TableHead>
                                    <TableHead>Error</TableHead>
                                    <TableHead>Raised</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {criticalFailures.map((f) => (
                                    <TableRow key={f.id} className="transition-colors">
                                        <TableCell className="font-mono text-xs">{f.operation}</TableCell>
                                        <TableCell className="text-sm">{f.failurePoint}</TableCell>
                                        <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                                            {f.originalError}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(f.timestamp), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <ResolveFailureButton failureId={f.id} onResolved={load} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </section>

            {/* Two-column: email failures + rollbacks */}
            <div className="grid gap-6 lg:grid-cols-2">
                <section className="space-y-3">
                    <SectionHeader icon={Mail} title="Email delivery failures" count={emailFailures.length} />
                    {isLoading ? (
                        <Skeleton className="h-14 w-full rounded-lg" />
                    ) : emailFailures.length === 0 ? (
                        <EmptyState icon={Mail} title="No delivery failures" description="All welcome emails sent." />
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>Email</TableHead>
                                        <TableHead>Error</TableHead>
                                        <TableHead>Raised</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {emailFailures.map((f) => (
                                        <TableRow key={f.id}>
                                            <TableCell className="font-mono text-xs">{f.email}</TableCell>
                                            <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">
                                                {f.error}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(f.timestamp), { addSuffix: true })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    <Card className="shadow-sm">
                        <CardContent className="p-4">
                            <p className="mb-2.5 text-xs font-medium text-muted-foreground">
                                Resend a welcome email manually
                            </p>
                            <ResendEmailAction onDone={load} />
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-3">
                    <SectionHeader icon={History} title="Rollback events" count={rollbacks.length} />
                    <p className="-mt-2 text-xs text-muted-foreground">Last 24 hours</p>
                    {isLoading ? (
                        <Skeleton className="h-14 w-full rounded-lg" />
                    ) : rollbacks.length === 0 ? (
                        <EmptyState icon={History} title="No rollbacks" description="No transactions rolled back recently." />
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>User</TableHead>
                                        <TableHead>Error</TableHead>
                                        <TableHead>Cleaned</TableHead>
                                        <TableHead>Raised</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rollbacks.map((r) => (
                                        <TableRow key={r.id}>
                                            <TableCell className="font-mono text-xs">{r.userId.slice(0, 12)}</TableCell>
                                            <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">
                                                {r.error}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={r.cleaned ? "outline" : "warning"} className="text-[10px]">
                                                    {r.cleaned ? "cleaned" : "pending"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(r.timestamp), { addSuffix: true })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </section>
            </div>

            {status && (
                <DangerZone
                    lockStatus={status.lockStatus}
                    bootstrapComplete={status.bootstrapComplete}
                    onChanged={load}
                />
            )}
        </div>
    );
}