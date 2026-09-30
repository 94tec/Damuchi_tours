"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuthStore } from "@/store/auth-store";

// Maps admin section prefixes to the permission required to view them.
// database/, disaster-recovery/, security/ already self-gate with an inline
// isSuperAdmin() check inside their own page components — listed here too
// so the redirect happens at the layout level before the page even mounts,
// instead of relying solely on each page remembering to check.
//
// SUPER_ADMIN bypasses this check entirely (see hasAccess below) — the
// permission-string checks below only apply to non-SUPER_ADMIN roles.
// TODO: confirm these permission strings against the real seed data in
// PermissionYamlLoader/permissions.yml — placeholders based on naming
// conventions seen elsewhere (MANAGE_USERS, MANAGE_ROLES, MANAGE_SECURITY).
const ROUTE_PERMISSIONS: Record<string, string> = {
  "/admin/users": "MANAGE_USERS",
  "/admin/pending": "MANAGE_USERS",
  "/admin/roles": "MANAGE_ROLES",
  "/admin/audit": "MANAGE_SECURITY",
  "/admin/database": "MANAGE_SECURITY",
  "/admin/disaster-recovery": "MANAGE_SECURITY",
  "/admin/security": "MANAGE_SECURITY",
};

function permissionForPath(pathname: string): string | null {
  const match = Object.keys(ROUTE_PERMISSIONS).find(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
  // @ts-ignore
  return match ? ROUTE_PERMISSIONS[match] : null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const redirected = useRef(false);
  const [hasHydrated, setHasHydrated] = useState(useAuthStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));
    setHasHydrated(useAuthStore.persist.hasHydrated());
    return unsub;
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated || !accessToken) {
      // Don't trust the very first unauthenticated reading right after
      // hydration flips true — give the store one more tick to actually
      // apply the rehydrated state before deciding to redirect.
      const timeout = setTimeout(() => {
        const stillUnauthed =
            !useAuthStore.getState().isAuthenticated || !useAuthStore.getState().accessToken;
        if (stillUnauthed && !redirected.current) {
          redirected.current = true;
          router.replace("/login");
        }
      }, 0);
      return () => clearTimeout(timeout);
    }

    if (
        typeof document !== "undefined" &&
        !document.cookie.includes("authsys-has-session")
    ) {
      document.cookie = [
        "authsys-has-session=1",
        "path=/",
        "SameSite=Strict",
        "Max-Age=86400",
      ].join("; ");
    }

    // Per-section admin permission gate. Runs after the session checks
    // above so we never redirect an authenticated-but-underprivileged
    // user through the unauthenticated /login path by mistake.
    // SUPER_ADMIN bypasses per-section permission strings entirely, since
    // the backend's effective-permissions resolution isn't yet wired into
    // the JWT/user object for this role (permissions currently arrives as
    // an empty array for SUPER_ADMIN accounts).
    const required = permissionForPath(pathname);
    const roles = user?.roles ?? [];
    const perms = user?.permissions ?? [];
    const hasAccess = !required || roles.includes("SUPER_ADMIN") || perms.includes(required);

    if (!hasAccess) {
      toast.error("You don't have access to that section.");
      router.replace("/dashboard");
    }
  }, [hasHydrated, isAuthenticated, accessToken, user, pathname, router]);

  if (!hasHydrated || !isAuthenticated || !accessToken) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex items-center gap-3 text-muted-foreground">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">Checking session…</span>
          </div>
        </div>
    );
  }

  return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
        </div>
      </div>
  );
}