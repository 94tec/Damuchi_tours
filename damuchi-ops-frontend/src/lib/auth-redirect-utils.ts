export const AUTH_FRONTEND_URL =
    process.env.NEXT_PUBLIC_AUTH_FRONTEND_URL ?? "http://localhost:3000";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "OPERATOR"];

/**
 * Returns true if the redirect is a safe same-origin path
 * (starts with / but not //).
 */
export function isSameOriginRedirect(redirectUrl: string): boolean {
    return (
        typeof redirectUrl === "string" &&
        redirectUrl.startsWith("/") &&
        !redirectUrl.startsWith("//")
    );
}

export function isStaffUser(roles?: readonly string[] | null): boolean {
    return (roles ?? []).some((r) => STAFF_ROLES.includes(r.replace(/^ROLE_/, "").toUpperCase()));
}

/** Authsys login, returning to `returnTo` (full URL) after sign-in. */
export function buildLoginUrl(returnTo?: string, reason?: string): string {
    const url = new URL(`${AUTH_FRONTEND_URL}/login`);
    if (returnTo) url.searchParams.set("redirect", returnTo);
    if (reason) url.searchParams.set("reason", reason);
    return url.toString();
}

/**
 * Staff -> authsys login. Customers -> this app's landing page.
 * Both go through authsys /logout first, so its own tab session is cleared too.
 * `next` must pass authsys's checks: a relative path, or a trusted origin.
 */
export function buildLogoutUrl(staff: boolean): string {
    const url = new URL(`${AUTH_FRONTEND_URL}/logout`);
    url.searchParams.set("next", staff ? "/login" : `${APP_URL}/`);
    return url.toString();
}