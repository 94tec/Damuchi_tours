import { useAuthStore } from "@/store/auth-store";

export type EndReason = "expired" | "idle";

export function endSession(reason: EndReason = "expired") {
    if (typeof window === "undefined") return;

    useAuthStore.getState().clearSession();

    // Already on the login page: don't redirect again (prevents loops)
    if (window.location.pathname.startsWith("/login")) return;

    const params = new URLSearchParams({ reason });
    const here = window.location.pathname + window.location.search;
    if (here !== "/") params.set("redirect", here);

    window.location.replace(`/login?${params.toString()}`);
}