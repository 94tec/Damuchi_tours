"use client";

import { useState } from "react";
import { useVisitorContext } from "@/components/landing/visitor-provider";
import { useLogout} from "@/lib/auth/use-logout";

import { NAV_LINKS } from "@/lib/nav-links";
import { MobileNav } from "./mobile";

import { Brand } from "@/components/navigation/brand";
import { TrustBar } from "@/components/navigation/trust-bar";
import { DesktopNav } from "@/components/navigation/desktop-nav";
import { UserMenu } from "@/components/navigation/user-menu";
import { AuthActions } from "@/components/navigation/auth-actions";
import { MobileTrigger } from "@/components/navigation/mobile-trigger";

export function Navbar() {

    const [mobileOpen, setMobileOpen] = useState(false);
    const {logout, isLoggingOut} = useLogout();

    const { status, user } = useVisitorContext();

    const firstName =
        user?.displayName ||
        user?.email?.split("@")[0] ||
        "User";

    const initials =
        firstName.charAt(0).toUpperCase();

    return (
        <header className="sticky top-0 z-50">
            <TrustBar />

            <div className="px-4 py-3">
                <div
                    className="
                        mx-auto
                        max-w-7xl
                        rounded-2xl
                        border
                        bg-background/70
                        backdrop-blur-2xl
                        shadow-[0_10px_40px_rgba(0,0,0,.08)]
                    "
                >
                    <nav className="flex h-16 items-center justify-between px-6">
                        <Brand />

                        <DesktopNav links={NAV_LINKS} />

                        <div className="hidden items-center gap-4 lg:flex">
                            {status === "customer" ? (
                                <UserMenu
                                    firstName={firstName}
                                    email={user?.email}
                                    initials={initials}
                                    onLogout={logout}
                                />
                            ) : (
                                <AuthActions />
                            )}
                        </div>

                        <MobileTrigger
                            onClick={() =>
                                setMobileOpen(true)
                            }
                        />
                    </nav>
                </div>
            </div>

            <MobileNav
                open={mobileOpen}
                onOpenChange={setMobileOpen}
                navLinks={NAV_LINKS}
                visitorStatus={status}
                firstName={firstName}
                onLogout={logout}
            />
        </header>
    );
}