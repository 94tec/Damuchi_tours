
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import {
    LayoutDashboard,
    Inbox,
    CalendarDays,
    Heart,
    UserRound,
    Compass,
    Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const NAV = [
    {
        href: "/me",
        label: "Overview",
        description: "Your travel dashboard",
        icon: LayoutDashboard,
    },
    {
        href: "/me/enquiries",
        label: "Enquiries",
        description: "Track your tour requests",
        icon: Inbox,
    },
    {
        href: "/me/bookings",
        label: "Bookings",
        description: "Manage your adventures",
        icon: CalendarDays,
    },
    {
        href: "/me/wishlist",
        label: "Saved Tours",
        description: "Your favourite destinations",
        icon: Heart,
    },
    {
        href: "/me/profile",
        label: "Profile",
        description: "Your personal information",
        icon: UserRound,
    },
];

function getActiveRoute(pathname: string) {
    return (
        NAV.find((item) =>
            item.href === "/me"
                ? pathname === "/me"
                : pathname === item.href ||
                pathname.startsWith(`${item.href}/`)
        ) ?? NAV[0]
    );
}

export default function MeLayout({
                                     children,
                                 }: {
    children: ReactNode;
}) {
    const pathname = usePathname();

    const activeRoute = getActiveRoute(pathname);

    const isProfile =
        pathname === "/me/profile" ||
        pathname.startsWith("/me/profile/");

    return (
        <div className="flex min-h-screen flex-col bg-background">

            {/* Shared public website navigation */}
            <Navbar />

            {/* Customer portal */}
            <div className="flex-1">

                <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-7 sm:px-6 sm:pt-10 lg:px-8">
                    {/* Horizontal customer navigation */}
                    <nav
                        aria-label="Customer account navigation"
                        className="mb-8"
                    >
                        <div className="rounded-2xl border border-border/60 bg-card/90 p-1.5 shadow-sm backdrop-blur-xl">

                            <div className="flex items-center gap-1 overflow-x-auto overscroll-x-contain scrollbar-none">

                                {NAV.map(({ href, label, icon: Icon }) => {
                                    const active = activeRoute.href === href;
                                    const profileTab = href === "/me/profile";

                                    return (
                                        <Link
                                            key={href}
                                            href={href}
                                            aria-current={active ? "page" : undefined}
                                            className={cn(
                                                "relative flex shrink-0 items-center justify-center gap-2 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors duration-200 sm:px-5",
                                                active
                                                    ? profileTab
                                                        ? "text-emerald-700 dark:text-emerald-300"
                                                        : "text-coral"
                                                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                                                profileTab &&
                                                "ml-auto border-l border-border/60 pl-4 sm:pl-6"
                                            )}
                                        >
                                            {active && (
                                                <motion.span
                                                    layoutId="me-active-tab"
                                                    className={cn(
                                                        "absolute inset-0 rounded-xl",
                                                        profileTab
                                                            ? "bg-emerald-500/10"
                                                            : "bg-coral/10"
                                                    )}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 380,
                                                        damping: 32,
                                                    }}
                                                />
                                            )}

                                            <Icon
                                                className={cn(
                                                    "relative z-10 h-[18px] w-[18px] shrink-0",
                                                    active && profileTab &&
                                                    "text-emerald-600 dark:text-emerald-300"
                                                )}
                                            />

                                            <span className="relative z-10 whitespace-nowrap">
                                                {label}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </nav>

                    {/* Current customer page */}
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.3,
                            ease: "easeOut",
                        }}
                        className="min-w-0"
                    >
                        {children}
                    </motion.div>
                </div>
            </div>

            {/* Shared public website footer */}
            <Footer />

        </div>
    );
}
