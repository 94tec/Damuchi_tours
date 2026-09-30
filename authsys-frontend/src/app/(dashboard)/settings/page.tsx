"use client";

import { useCallback, useEffect, useState } from "react";
import { Server, Database, Clock, Zap, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/admin-api";
import type { ApiError } from "@/types/auth";
import type { SystemStatusResponse, RoleCount } from "@/types/system";

interface ServiceStatus {
  label: string;
  detail: string;
  status: "up" | "down";
  latencyMs: number;
  error?: string;
}


export default function SettingsPage() {
  const [status, setStatus] = useState<SystemStatusResponse | null>(null);
  const [roles, setRoles] = useState<RoleCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statusData, roleData] = await Promise.all([
        adminApi.getSystemStatus(),
        adminApi.getRoleCounts(),
      ]);
      console.log("roleData:", roleData); // temporary — see what shape actually comes back
      setStatus(statusData ?? null);
      setRoles(Array.isArray(roleData) ? roleData : []);
      setLastChecked(new Date());
    } catch (err) {
      toast.error((err as ApiError).message || "Couldn't reach system status endpoint.");
      setStatus(null);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const maxRoleCount = Math.max(1, ...(Array.isArray(roles) ? roles.map((r) => r.count) : []));

  return (
      <div className="space-y-7">
        <PageHeader
            eyebrow="Settings"
            title="System overview"
            subtitle={
              lastChecked
                  ? `Live health check · last checked ${lastChecked.toLocaleTimeString()}`
                  : "Checking infrastructure…"
            }
            action={
              <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            }
        />

        {/* Infrastructure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="h-4 w-4 text-accent" />
              Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="my-2 h-9 w-full rounded-md" />
                ))
            ) : !status ? (
                <div className="flex items-center gap-2 py-3 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Status endpoint unreachable — showing no data rather than stale numbers.
                </div>
            ) : (
                status.services.map((s) => (
                    <div key={s.label} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <Database className="h-4 w-4 text-accent/70" strokeWidth={1.75} />
                        <div>
                          <p>{s.label}</p>
                          <p className="text-xs">{s.detail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{s.latencyMs}ms</span>
                        <Badge variant={s.status === "up" ? "success" : "destructive"} className="text-[10px]">
                          ● {s.status}
                        </Badge>
                      </div>
                    </div>
                ))
            )}
          </CardContent>
        </Card>

        {/* Role counts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-accent" />
              Roles in use
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)
            ) : roles.length === 0 ? (
                <p className="text-xs text-muted-foreground">No role data returned.</p>
            ) : (
                roles.map((r) => (
                    <div key={r.role} className="flex items-center justify-between">
                      <span className="font-mono text-xs text-foreground">{r.role}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 rounded-full bg-muted">
                          <div
                              className="h-full rounded-full bg-accent"
                              style={{ width: `${(r.count / maxRoleCount) * 100}%` }}
                          />
                        </div>
                        <span className="w-6 text-right font-mono text-xs text-muted-foreground">{r.count}</span>
                      </div>
                    </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>
  );
}