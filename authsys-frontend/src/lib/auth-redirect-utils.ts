/**
 * auth-redirect-utils.ts  (authsys-frontend)
 *
 * Utilities for the cross-origin token handoff to trusted sibling apps
 * (e.g. damuchi-ops-frontend) after a successful login.
 *
 * Security model:
 *   - Only origins in TRUSTED_REDIRECT_ORIGINS receive token handoffs.
 *   - Same-origin redirects (/dashboard, /setup, etc.) are handled normally
 *     without appending tokens — they already share the session cookie.
 *   - Tokens are appended as a URL fragment (#token=...&refresh=...)
 *     which is never sent to the server in HTTP requests.
 */

const TRUSTED_REDIRECT_ORIGINS = [process.env.NEXT_PUBLIC_TOUR_PORTAL_URL ?? "http://localhost:3001"];
export type Destination = { crossOrigin: boolean; url: string };

export const AUTH_FRONTEND_URL =
    process.env.NEXT_PUBLIC_AUTH_FRONTEND_URL ?? "http://localhost:3000";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "OPERATOR"];

/**
 * Returns true if the given URL's origin is in the trusted list.
 * Used to decide whether to do a cross-origin token handoff.
 */
export function isTrustedCrossOriginRedirect(redirectUrl: string): boolean {
  try {
    const url    = new URL(redirectUrl);
    const origin = url.origin;

    // Same origin as authsys-frontend — handle normally, no handoff needed
    if (typeof window !== "undefined" && origin === window.location.origin) {
      return false;
    }

    return TRUSTED_REDIRECT_ORIGINS.includes(origin);
  } catch {
    return false;
  }
}

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