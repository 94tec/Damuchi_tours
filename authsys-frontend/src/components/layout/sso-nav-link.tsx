// ── components/layout/sso-nav-link.tsx ──────────────────────────
"use client";

import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ssoApi } from "@/lib/sso-api";

interface SsoNavLinkProps {
    targetPortalUrl: string;
    destinationPath?: string; // where the receiving portal should land the user after redeeming the code
    label: string;
    icon: React.ElementType;
    isActive?: boolean;
}

/**
 * Cross-portal nav link with secure session handoff.
 *
 * - Cmd/Ctrl/middle-click: falls through to a plain new-tab navigation
 *   (browser default) — the user lands logged out there, same as opening
 *   any external link. That's an acceptable tradeoff for preserving normal
 *   "open in new tab" behavior rather than fighting it.
 * - Plain click: fetches a one-time handoff code first, then navigates
 *   with the code (not a token) in the URL — see SsoHandoffController for
 *   why that's safe to put in a URL where a real token wouldn't be.
 */
export function SsoNavLink({ targetPortalUrl, destinationPath = "/", label, icon: Icon, isActive }: SsoNavLinkProps) {
    const [isHandingOff, setIsHandingOff] = useState(false);
    const plainHref = `${targetPortalUrl}${destinationPath}`;

    async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
        if (e.metaKey || e.ctrlKey || e.button === 1) return; // let the browser handle new-tab natively, unauthenticated

        e.preventDefault();
        setIsHandingOff(true);
        try {
            const { code } = await ssoApi.createHandoffCode();
            const url = new URL(`${targetPortalUrl}/auth-callback`);
            url.searchParams.set("code", code);
            url.searchParams.set("next", destinationPath);
            window.location.href = url.toString();
        } catch {
            toast.error("Couldn't establish a secure session on the enquire-button.tsx portal — you'll need to sign in there.");
            window.location.href = plainHref;
        } finally {
            setIsHandingOff(false);
        }
    }

    return (
        <a
            href={plainHref}
            onClick={handleClick}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-100",
                isActive ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
        >
            {isHandingOff ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
                <Icon className={cn("h-4 w-4", isActive ? "text-accent" : "text-muted-foreground")} strokeWidth={1.75} />
            )}
            <span className="flex-1">{label}</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground/50" />
        </a>
    );
}