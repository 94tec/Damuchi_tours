import { toast } from "sonner";
import { ssoApi } from "@/lib/sso-api";
import { TOUR_PORTAL_URL } from "@/lib/portals";
import {
    isSameOriginRedirect,
    isTrustedCrossOriginRedirect,
} from "@/lib/auth-redirect-utils";

export interface Destination {
    crossOrigin: boolean;
    path: string;
    portalUrl?: string;
}

const ADMIN_LANDS_IN_PORTAL = false;
const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"];
const OPS_ROLES = ["MANAGER", "OPERATOR"];

const norm = (r: string) => r.replace(/^ROLE_/, "").toUpperCase();

function jwtRoles(token?: string | null): string[] {
    try {
        const p = token?.split(".")[1];
        if (!p) return [];
        const b = p.replace(/-/g, "+").replace(/_/g, "/");
        const claims = JSON.parse(atob(b.padEnd(b.length + ((4 - (b.length % 4)) % 4), "=")));
        return Array.isArray(claims.roles) ? claims.roles.map(String) : [];
    } catch {
        return [];
    }
}

/** Roles from the user object, falling back to the JWT (user is null after OTP login). */
export function getRoles(user: any, accessToken?: string | null): string[] {
    const out: string[] = [];
    if (typeof user?.role === "string") out.push(user.role);
    for (const r of [...(user?.roles ?? []), ...(user?.authorities ?? [])]) {
        out.push(typeof r === "string" ? r : r?.name ?? r?.authority ?? "");
    }
    out.push(...jwtRoles(accessToken));
    return [...new Set(out.filter(Boolean).map(norm))];
}

export function getDefaultDestination(user: any, accessToken?: string | null): Destination {
    const roles = getRoles(user, accessToken);

    if (roles.some((r) => ADMIN_ROLES.includes(r))) {
        return ADMIN_LANDS_IN_PORTAL
            ? { crossOrigin: true, path: "/dashboard", portalUrl: TOUR_PORTAL_URL }
            : { crossOrigin: false, path: "/dashboard" };
    }
    if (roles.some((r) => OPS_ROLES.includes(r))) {
        return { crossOrigin: true, path: "/dashboard", portalUrl: TOUR_PORTAL_URL };
    }
    // customers, guests, or unknown: public landing page
    return { crossOrigin: true, path: "/", portalUrl: TOUR_PORTAL_URL };
}

/** Where to send someone after logout. Call BEFORE clearSession(). */
export function getLogoutTarget(user: any, accessToken?: string | null): string {
    const roles = getRoles(user, accessToken);
    const isStaff = roles.some((r) => [...ADMIN_ROLES, ...OPS_ROLES].includes(r));
    return isStaff ? "/login" : `${TOUR_PORTAL_URL}/`;
}

export function safeNavigate(path: string) {
    requestAnimationFrame(() => setTimeout(() => (window.location.href = path), 50));
}

export async function navigateToDestination(d: Destination) {
    if (!d.crossOrigin) return safeNavigate(d.path);
    try {
        const { code } = await ssoApi.createHandoffCode();
        const url = new URL(`${d.portalUrl}/auth-callback`);
        url.searchParams.set("code", code);
        url.searchParams.set("next", d.path);
        window.location.href = url.toString();
    } catch {
        toast.error("Couldn't establish a secure session there. Please sign in on that portal.");
        window.location.href = `${d.portalUrl}${d.path}`;
    }
}

/** For the ?redirect= param, e.g. the guard sending someone back to /revenue. */
export async function handoffToTrusted(redirectUrl: string) {
    const target = new URL(redirectUrl);
    await navigateToDestination({
        crossOrigin: true,
        portalUrl: target.origin,
        path: target.pathname + target.search,
    });
}

export { isSameOriginRedirect, isTrustedCrossOriginRedirect };