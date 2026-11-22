"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { authApi } from "@/lib/auth-api";

// Matches your RoleHierarchy: everything above USER is staff.
const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "OPERATOR", "MANAGER"];

export function AdminGuard({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const accessToken = useAuthStore((s) => s.accessToken);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const user = useAuthStore((s) => s.user);

    const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());
    const [loadingUser, setLoadingUser] = useState(false);

    useEffect(() => {
        const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
        setHydrated(useAuthStore.persist.hasHydrated());
        return unsub;
    }, []);

    // Token present but no user (e.g. after OTP login): load the profile.
    useEffect(() => {
        if (!hydrated || !isAuthenticated || !accessToken || user || loadingUser) return;
        setLoadingUser(true);
        authApi
            .getCurrentUser() // <- use whatever your "current user" call is named
            .then((u) => useAuthStore.getState().setUser(u))
            .catch(() => useAuthStore.getState().clearSession())
            .finally(() => setLoadingUser(false));
    }, [hydrated, isAuthenticated, accessToken, user, loadingUser]);

    const roles = (user?.roles ?? []).map((r) => String(r).replace(/^ROLE_/, "").toUpperCase());
    const isStaff = roles.some((r) => STAFF_ROLES.includes(r));
    const allowed = hydrated && isAuthenticated && !!accessToken && !!user && isStaff;

    useEffect(() => {
        if (!hydrated || loadingUser) return;

        if (!isAuthenticated || !accessToken) {
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }
        if (user && !isStaff) {
            useAuthStore.getState().clearSession();
            router.replace("/login?reason=forbidden");
        }
    }, [hydrated, loadingUser, isAuthenticated, accessToken, user, isStaff, pathname, router]);

    if (!allowed) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
                Checking access…
            </div>
        );
    }

    return <>{children}</>;
}