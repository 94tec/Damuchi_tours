"use client";

import { useCallback, useEffect, useState } from "react";
import { Map, Users, ShieldCheck, KeyRound, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { useAuthStore } from "@/store/auth-store";
import { adminApi } from "@/lib/admin-api";
import type { ApiError } from "@/types/auth";
import type { DashboardStats } from "@/types/admin-control";
import type { SystemStatusResponse } from "@/types/system";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin)();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState<SystemStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const calls: [Promise<DashboardStats | null>, Promise<SystemStatusResponse | null>] = [
        isAdmin ? adminApi.getDashboardStats() : Promise.resolve(null),
        adminApi.getSystemStatus(),
      ];
      const [statsData, healthData] = await Promise.all(calls);
      setStats(statsData);
      setHealth(healthData);
    } catch (err) {
      toast.error((err as ApiError).message || "Couldn't load dashboard data.");
      setStats(null);
      setHealth(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { load(); }, [load]);

  const hour = new Date().getHours();
  const greeting =
      hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const STAT_CARDS = [
    {
      label: "Total tours",
      value: stats?.totalTours ?? 0,
      icon: Map,
      sub: `${stats?.activeTours ?? 0} active`,
      show: true,
    },
    {
      label: "Team members",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      sub: "Registered accounts",
      show: isAdmin,
    },
    {
      label: "Pending approvals",
      value: stats?.pendingApprovals ?? 0,
      icon: ShieldCheck,
      sub: stats?.pendingApprovals ? "Needs your review" : "All clear",
      urgent: (stats?.pendingApprovals ?? 0) > 0,
      show: isAdmin,
    },
    {
      label: "Your roles",
      value: user?.roles?.length ?? 0,
      icon: KeyRound,
      sub: user?.roles?.join(", ") ?? "",
      show: true,
    },
  ].filter((s) => s.show);

  const services = health?.services ?? [];
  const allOperational = services.length > 0 && services.every((s) => s.status === "up");

  return (
      <div className="space-y-8">
        {/* Greeting */}
        <PageHeader
            eyebrow={new Date().toLocaleDateString("en-KE", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
            title={`${greeting}${user?.firstName ? `, ${user.firstName}` : ""}.`}
            subtitle="Here's what's happening across your Damuchi Safaris today."
        />

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
              ))
              : STAT_CARDS.map((s) => {
                const Icon = s.icon;
                return (
                    <Card key={s.label} className={s.urgent ? "border-warning/40 bg-warning/5" : ""}>
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                          <Icon
                              className={`h-4 w-4 ${s.urgent ? "text-warning" : "text-accent"}`}
                              strokeWidth={1.75}
                          />
                        </div>
                        <p className="mt-2 font-display text-3xl font-medium tracking-tight">
                          {s.value}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{s.sub}</p>
                      </CardContent>
                    </Card>
                );
              })}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* System health */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">System health</CardTitle>
              <CardDescription>
                {isLoading
                    ? "Checking services…"
                    : health
                        ? `${allOperational ? "All services operational" : "Some services need attention"} · authSys on port 8001`
                        : "Health check unavailable"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
              ) : services.length === 0 ? (
                  <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                    <AlertTriangle className="h-4 w-4" />
                    No health data returned.
                  </div>
              ) : (
                  services.map((s) => (
                      <div key={s.label} className="flex items-center justify-between">
                        <div className="text-sm">
                          <p>{s.label}</p>
                          <p className="text-xs text-muted-foreground">{s.detail}</p>
                        </div>
                        <Badge variant={s.status === "up" ? "success" : "destructive"} className="text-[10px]">
                          ● {s.status === "up" ? "Operational" : "Down"}
                        </Badge>
                      </div>
                  ))
              )}
            </CardContent>
          </Card>

          {/* Quick links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick actions</CardTitle>
              <CardDescription>Jump to what needs attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { href: "/tours", label: "Manage enquire-button.tsx catalogue", desc: "Add, edit, or deactivate tours" },
                ...(isAdmin
                    ? [
                      { href: "/admin/pending", label: "Review pending approvals", desc: stats ? `${stats.pendingApprovals} waiting` : "—" },
                      { href: "/admin/users", label: "Manage team members", desc: "Lock, unlock, update roles" },
                      { href: "/admin/audit", label: "View audit log", desc: "Full event history" },
                      { href: "/admin/roles", label: "Roles & permissions", desc: "View seeded roles" },
                    ]
                    : []),
                { href: "/profile", label: "Update your profile", desc: "Personal details & password" },
              ].map((link) => (
                  <a
                      key={link.href}
                      href={link.href}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
                  >
                    <div>
                      <p className="font-medium leading-tight">{link.label}</p>
                      <p className="text-xs text-muted-foreground">{link.desc}</p>
                    </div>
                    <span className="text-muted-foreground">→</span>
                  </a>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}