"use client";

import { useCallback, useState } from "react";
import { authApi } from "@/lib/auth-api";
import { useAuthStore } from "@/store/auth-store";
import { getLogoutTarget } from "@/lib/auth/destination";

export function useLogout() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const logout = useCallback(async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        // Decide the target BEFORE the session is cleared.
        const { user, accessToken } = useAuthStore.getState();
        const target = getLogoutTarget(user, accessToken); // staff -> "/login", customers -> portal "/"

        try {
            await authApi.logout(); // revokes the refresh token server-side
        } catch {
            // never block logout on an API failure
        }

        useAuthStore.getState().clearSession();
        window.location.replace(target); // leave isLoggingOut true: the page unloads
    }, [isLoggingOut]);

    return { logout, isLoggingOut };
}