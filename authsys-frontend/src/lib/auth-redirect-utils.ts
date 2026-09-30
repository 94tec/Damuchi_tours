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

const TRUSTED_REDIRECT_ORIGINS: string[] = [
  "http://localhost:3001",
  // Add production origins here when deploying:
  // "https://ops.damuchisafaris.co.ke",
];

// TODO: confirm these match your actual Permission enum in PermissionService —
// placeholders based on your Tour/Availability/Booking module scaffolding.
const STAFF_PERMISSIONS = ["MANAGE_TOURS", "MANAGE_BOOKINGS", "MANAGE_AVAILABILITY"];
const SYSTEM_ADMIN_PERMISSIONS = ["MANAGE_USERS", "MANAGE_ROLES", "MANAGE_SECURITY"];

const OPS_BASE_URL = process.env.NEXT_PUBLIC_OPS_URL ?? "http://localhost:3001";

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

/**
 * Builds the cross-origin handoff URL by appending tokens as a fragment.
 *
 * @param redirectUrl  The ?redirect= param value from the login page URL
 * @param accessToken  The newly issued access token
 * @param refreshToken The newly issued refresh token
 * @returns The full handoff URL with #token=...&refresh=... fragment
 */
export function buildHandoffUrl(
  redirectUrl: string,
  accessToken: string,
  refreshToken: string
): string {
  const url = new URL(redirectUrl);
  url.hash  = `token=${encodeURIComponent(accessToken)}&refresh=${encodeURIComponent(refreshToken)}`;
  return url.toString();
}

/**
 * Decides where a freshly-authenticated user should land.
 * Called right after login, before building the redirect/handoff URL.
 */
// ── Post-login destination resolution ─────────────────────────────
// Keep STAFF_/SYSTEM_ADMIN_PERMISSIONS in sync with the actual
// Permission seed data (58 permissions / 6 roles) in PermissionService.

/**
 * Decides where a freshly-authenticated user should land, given their
 * permissions from LoginResponse.user.permissions.
 *
 * - System admins stay on authsys-frontend (/dashboard, /admin/*)
 * - Staff go to damuchi-ops-frontend's staff console
 * - Everyone else (customers/guests) goes to the ops public landing
 */
export function resolveDestination(permissions: string[] = []): Destination {
  const perms = new Set(permissions);
  const isSystemAdmin = SYSTEM_ADMIN_PERMISSIONS.some((p) => perms.has(p));
  const isStaff = STAFF_PERMISSIONS.some((p) => perms.has(p));

  if (isSystemAdmin) return { crossOrigin: false, url: "/dashboard" };
  if (isStaff) return { crossOrigin: true, url: `${OPS_BASE_URL}/staff/dashboard` };
  return { crossOrigin: true, url: `${OPS_BASE_URL}/` };
}

