"use client";

import { useCallback, useEffect, useState } from "react";
import { Database, RefreshCw, ShieldAlert, Server, Table2, GitBranch } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthStore } from "@/store/auth-store";
import { adminApi } from "@/lib/admin-api";
import type { ApiError } from "@/types/auth";
import type {
    ConnectionPoolStats,
    DatabaseInfo,
    TableRowCounts,
    MigrationStatus,
} from "@/types/admin-control";

export default function DatabaseAdminPage() {
    const { isSuperAdmin } = useAuthStore();
    const superAdmin = isSuperAdmin();

    const [pool, setPool] = useState<ConnectionPoolStats | null>(null);
    const [info, setInfo] = useState<DatabaseInfo | null>(null);
    const [counts, setCounts] = useState<TableRowCounts>({});
    const [migration, setMigration] = useState<MigrationStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const [poolData, infoData, countsData, migrationData] = await Promise.all([
                adminApi.getConnectionPoolStats(),
                adminApi.getDatabaseInfo(),
                adminApi.getTableRowCounts(),
                adminApi.getMigrationStatus(),
            ]);
            setPool(poolData);
            setInfo(infoData);
            setCounts(countsData);
            setMigration(migrationData);
        } catch (err) {
            toast.error((err as ApiError).message || "Couldn't load database stats.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    if (!superAdmin) {
        return (
            <EmptyState
                icon={ShieldAlert}
                title="SUPER_ADMIN access required"
                description="This page is restricted to platform owners."
            />
        );
    }

    const poolRows = pool && !pool.info
        ? [
            { label: "Pool name", value: pool.poolName },
            { label: "Active connections", value: pool.activeConnections },
            { label: "Idle connections", value: pool.idleConnections },
            { label: "Total connections", value: pool.totalConnections },
            { label: "Threads awaiting", value: pool.threadsAwaitingConnection },
            { label: "Max pool size", value: pool.maxPoolSize },
        ]
        : [];

    const infoRows = info
        ? [
            { label: "Product", value: `${info.productName} ${info.productVersion}` },
            { label: "Driver version", value: info.driverVersion },
            { label: "Connection URL", value: info.url },
            { label: "Read-only", value: info.readOnly ? "Yes" : "No" },
        ]
        : [];

    const tableEntries = Object.entries(counts).filter(([, count]) => count >= 0);

    const hasPendingMigrations = (migration?.pendingCount ?? 0) > 0;

    return (
        <div className="space-y-7">
            <PageHeader
                eyebrow="Admin · Database"
                title="Database administration"
                subtitle="Read-only — pool health, connection info, and row counts. No query execution from this dashboard, by design."
                action={
                    <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
                        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                }
            />

            <div className="grid gap-5 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Server className="h-4 w-4 text-accent" />
                            Connection pool
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y divide-border">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="my-1.5 h-6 w-full" />)
                        ) : pool?.info ? (
                            <p className="py-2 text-sm text-muted-foreground">{pool.info}</p>
                        ) : (
                            poolRows.map((row) => (
                                <div key={row.label} className="flex items-center justify-between py-2.5">
                                    <span className="text-sm text-muted-foreground">{row.label}</span>
                                    <span className="font-mono text-xs">{row.value ?? "—"}</span>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Database className="h-4 w-4 text-accent" />
                            Database info
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y divide-border">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="my-1.5 h-6 w-full" />)
                        ) : (
                            infoRows.map((row) => (
                                <div key={row.label} className="flex items-center justify-between py-2.5">
                                    <span className="text-sm text-muted-foreground">{row.label}</span>
                                    <span className="max-w-[60%] truncate font-mono text-xs" title={String(row.value)}>
                    {row.value}
                  </span>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Table2 className="h-4 w-4 text-accent" />
                            Table row counts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {tableEntries.map(([table, count]) => (
                                    <div key={table} className="rounded-lg border border-border p-3">
                                        <p className="font-mono text-[11px] text-muted-foreground">{table}</p>
                                        <p className="mt-1 font-display text-lg font-medium">{count.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="mt-4 text-xs text-muted-foreground">
                            Tables that don't exist yet in this environment are omitted automatically.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between text-base">
                            <span className="flex items-center gap-2">
                                <GitBranch className="h-4 w-4 text-accent" />
                                Migrations
                            </span>
                            {!isLoading && migration && (
                                <Badge variant={hasPendingMigrations ? "warning" : "success"} className="text-[10px]">
                                    {hasPendingMigrations ? `${migration.pendingCount} pending` : "up to date"}
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y divide-border">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="my-1.5 h-6 w-full" />)
                        ) : !migration ? (
                            <p className="py-2 text-sm text-muted-foreground">Migration status unavailable.</p>
                        ) : (
                            [
                                { label: "Current version", value: migration.currentVersion },
                                { label: "Applied migrations", value: migration.appliedCount },
                                { label: "Pending migrations", value: migration.pendingCount },
                            ].map((row) => (
                                <div key={row.label} className="flex items-center justify-between py-2.5">
                                    <span className="text-sm text-muted-foreground">{row.label}</span>
                                    <span className="font-mono text-xs">{row.value}</span>
                                </div>
                            ))
                        )}
                        <p className="pt-3 text-xs text-muted-foreground">
                            Pending migrations should be applied via your deploy pipeline, not from this dashboard.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}