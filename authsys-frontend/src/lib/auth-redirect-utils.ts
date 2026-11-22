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
 *
 */
import { TOUR_PORTAL_URL } from "@/lib/portals";

const TRUSTED_REDIRECT_ORIGINS = [new URL(TOUR_PORTAL_URL).origin];

export type Destination = { crossOrigin: boolean; url: string };

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