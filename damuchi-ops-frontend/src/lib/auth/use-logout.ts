"use client";

import { useCallback, useState } from "react";
import { authApi } from "@/lib/auth-api";
import { useAuthStore } from "@/store/auth-store";
import { buildLogoutUrl, isStaffUser } from "@/lib/auth-redirect-utils";
import { APP_URL } from "@/lib/config";

export function useLogout() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const logout = useCallback(async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        // Decide the target BEFORE the session is cleared.
        let target = `${APP_URL}/`; // safe default: the public landing page
        try {
            target = buildLogoutUrl(isStaffUser(useAuthStore.getState().user?.roles));
        } catch {
            // bad config: still sign out locally and land on the public page
        }

        try {
            await authApi.logout(); // revokes the refresh token server-side
        } catch {
            // never block logout on an API failure
        }

        useAuthStore.getState().clearSession();
        window.location.href = target;
    }, [isLoggingOut]);

    return { logout, isLoggingOut };
}