"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuthStore } from "@/store/auth-store";
import {
  getRoles,
  getDefaultDestination,
  navigateToDestination,
} from "@/lib/auth/destination";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"];
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
  return match ? ROUTE_PERMISSIONS[match] ?? null : null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const redirected = useRef(false);
  const [hasHydrated, setHasHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));
    setHasHydrated(useAuthStore.persist.hasHydrated());
    return unsub;
  }, []);

  // user can be null (e.g. after OTP login), so fall back to the JWT roles.
  const roles = getRoles(user, accessToken);
  const isAdminUser = roles.some((r) => ADMIN_ROLES.includes(r));
  const signedIn = hasHydrated && isAuthenticated && !!accessToken;

  useEffect(() => {
    if (!hasHydrated || redirected.current) return;

    // 1. Not signed in -> login (relative path, so the login page accepts it).
    if (!isAuthenticated || !accessToken) {
      const timeout = setTimeout(() => {
        const s = useAuthStore.getState();
        if ((!s.isAuthenticated || !s.accessToken) && !redirected.current) {
          redirected.current = true;
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      }, 0);
      return () => clearTimeout(timeout);
    }

    // 2. Signed in but not an admin: send them to where they belong
    //    (manager/operator -> portal dashboard, customer -> portal landing).
    //    Keep their session; they are valid users elsewhere.
    if (!isAdminUser) {
      redirected.current = true;
      toast.error("That area is for administrators only.");
      void navigateToDestination(getDefaultDestination(user, accessToken));
      return;
    }

    if (typeof document !== "undefined" && !document.cookie.includes("authsys-has-session")) {
      document.cookie = ["authsys-has-session=1", "path=/", "SameSite=Strict", "Max-Age=86400"].join("; ");
    }

    // 3. Per-section permission gate. SUPER_ADMIN bypasses it.
    const required = permissionForPath(pathname);
    if (!required || roles.includes("SUPER_ADMIN")) return;

    // Permissions may still be loading: don't deny until the profile is there.
    if (!user?.permissions) return;

    if (!user.permissions.includes(required)) {
      toast.error("You don't have access to that section.");
      router.replace("/dashboard");
    }
  }, [hasHydrated, isAuthenticated, accessToken, user, pathname, router, isAdminUser, roles]);

  // Render nothing until we know this is an admin who may be here.
  if (!signedIn || !isAdminUser) {
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