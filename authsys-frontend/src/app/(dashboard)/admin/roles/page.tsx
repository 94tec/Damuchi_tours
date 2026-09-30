"use client";

import { useCallback, useEffect, useState } from "react";
import { Key, ShieldCheck, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { adminApi } from "@/lib/admin-api";
import type { ApiError, RolePermissions } from "@/types/auth";

// Hierarchy order — mirrors AdminRolePermissionController's documented role levels.
const ROLE_ORDER = ["SUPER_ADMIN", "ADMIN", "OPERATOR", "MANAGER", "USER", "GUEST"] as const;

// Visual + copy only — counts always come from the API response, never from here.
const ROLE_META: Record<string, { color: string; description: string }> = {
  SUPER_ADMIN: { color: "bg-accent/10 text-accent border-accent/20", description: "Full system access" },
  ADMIN:       { color: "bg-accent/10 text-accent border-accent/20", description: "User management, role assignments" },
  OPERATOR:    { color: "bg-blue-500/10 text-blue-600 border-blue-200", description: "Portfolio publish, content creation" },
  MANAGER:     { color: "bg-secondary/10 text-secondary border-secondary/20", description: "Operations management" },
  USER:        { color: "bg-muted text-muted-foreground border-border", description: "Standard access" },
  GUEST:       { color: "bg-muted/50 text-muted-foreground border-border", description: "Read-only access" },
};

const VISIBLE_BADGE_LIMIT = 8;

function RoleCardSkeleton() {
  return <Skeleton className="h-48 rounded-xl" />;
}

function RolePermissionCard({ role }: { role: RolePermissions }) {
  const meta = ROLE_META[role.role] ?? {
    color: "bg-muted text-muted-foreground border-border",
    description: "No description configured for this role.",
  };
  const [expanded, setExpanded] = useState(false);
  const count = role.permissions.length; // source of truth — never derived from copy text
  const visible = expanded ? role.permissions : role.permissions.slice(0, VISIBLE_BADGE_LIMIT);
  const hiddenCount = role.permissions.length - visible.length;

  return (
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${meta.color}`}>
              <ShieldCheck className="h-3 w-3" />
              {role.role.replace(/_/g, " ")}
            </div>
            <span className="font-display text-xl font-medium">{count}</span>
          </div>
          <CardTitle className="text-sm font-normal text-muted-foreground">
            {meta.description}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {count === 0 ? (
              <p className="text-xs text-muted-foreground">
                No permissions assigned to this role.
              </p>
          ) : (
              <div className="flex flex-wrap gap-1.5">
                {visible.map((p) => (
                    <Badge key={p} variant="outline" className="text-[10px]">
                      {p}
                    </Badge>
                ))}
                {hiddenCount > 0 && (
                    <button
                        type="button"
                        onClick={() => setExpanded(true)}
                        className="text-[10px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
                    >
                      +{hiddenCount} more
                    </button>
                )}
                {expanded && role.permissions.length > VISIBLE_BADGE_LIMIT && (
                    <button
                        type="button"
                        onClick={() => setExpanded(false)}
                        className="text-[10px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
                    >
                      Show less
                    </button>
                )}
              </div>
          )}
        </CardContent>
      </Card>
  );
}

export default function RolesPage() {
  const [roles, setRoles] = useState<RolePermissions[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAllRolePermissions();
      setRoles(data);
    } catch (err) {
      const message = (err as ApiError).message || "Couldn't load role permissions.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const sortedRoles = (roles ?? []).slice().sort((a, b) => {
    const ai = ROLE_ORDER.indexOf(a.role as (typeof ROLE_ORDER)[number]);
    const bi = ROLE_ORDER.indexOf(b.role as (typeof ROLE_ORDER)[number]);
    return (ai === -1 ? ROLE_ORDER.length : ai) - (bi === -1 ? ROLE_ORDER.length : bi);
  });

  const totalPermissions = new Set(sortedRoles.flatMap((r) => r.permissions)).size;

  return (
      <div className="space-y-7">
        <PageHeader
            eyebrow="Admin"
            title="Roles & permissions"
            subtitle={
              roles
                  ? `${roles.length} role${roles.length === 1 ? "" : "s"}, ${totalPermissions} distinct permission${totalPermissions === 1 ? "" : "s"} — seeded from permissions.yaml`
                  : "Permission matrix seeded from your YAML config at startup."
            }
            action={
              <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            }
        />

        {isLoading && !roles ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <RoleCardSkeleton key={i} />)}
            </div>
        ) : error && !roles ? (
            <EmptyState
                icon={AlertTriangle}
                title="Couldn't load roles"
                description={error}
            />
        ) : sortedRoles.length === 0 ? (
            <EmptyState
                icon={ShieldCheck}
                title="No roles found"
                description="No role permissions are seeded yet. Run a reload from /api/admin/access/reload."
            />
        ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedRoles.map((r) => <RolePermissionCard key={r.role} role={r} />)}
            </div>
        )}

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Key className="h-4 w-4 text-accent" />
            How permissions work in authSys
          </div>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Permissions are seeded from <code className="rounded bg-muted px-1 font-mono text-xs">permissions.yml</code> at startup
            via <code className="rounded bg-muted px-1 font-mono text-xs">PermissionSeeder</code>, stored in Firestore, and cached
            in Redis. <code className="rounded bg-muted px-1 font-mono text-xs">PermissionService</code> resolves effective
            permissions per user at auth time via <code className="rounded bg-muted px-1 font-mono text-xs">FirestoreUserPermissionsRepository</code>.
          </p>
        </div>
      </div>
  );
}