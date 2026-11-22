"use client";

import { useCallback, useState } from "react";
import { authApi } from "@/lib/auth-api";
import { useAuthStore } from "@/store/auth-store";
import { buildLogoutUrl, isStaffUser } from "@/lib/auth-redirect-utils";

export function useLogout() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const logout = useCallback(async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        // Decide the target BEFORE the session is cleared.
        const staff = isStaffUser(useAuthStore.getState().user?.roles);
        const target = buildLogoutUrl(staff);

        try {
            await authApi.logout(); // revokes the refresh token server-side
        } catch {
            // never block logout on an API failure
        }

        useAuthStore.getState().clearSession();
        window.location.href = target; // leave isLoggingOut true: the page unloads
    }, [isLoggingOut]);

    return { logout, isLoggingOut };
}