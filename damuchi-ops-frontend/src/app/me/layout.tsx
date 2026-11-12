
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

                    {/* Contextual account header */}
                    <motion.section
                        key={isProfile ? "profile" : activeRoute.href}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={cn(
                            "relative mb-7 overflow-hidden rounded-[28px] border p-6 sm:p-8",
                            isProfile
                                ? "border-emerald-900/20 bg-gradient-to-br from-[#153B35] via-[#19483E] to-[#102F2B] text-white"
                                : "border-border/60 bg-gradient-to-br from-muted/60 via-background to-background"
                        )}
                    >
                        <div
                            className={cn(
                                "pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full blur-3xl",
                                isProfile
                                    ? "bg-emerald-400/10"
                                    : "bg-orange-400/10"
                            )}
                        />

                        <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                            <div className="min-w-0">

                                <div
                                    className={cn(
                                        "mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]",
                                        isProfile
                                            ? "text-emerald-200"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {isProfile ? (
                                        <UserRound className="h-4 w-4" />
                                    ) : (
                                        <Sparkles className="h-4 w-4 text-orange-500" />
                                    )}

                                    {isProfile
                                        ? "Your personal space"
                                        : "Kivana Trails & Safaris · My Account"}
                                </div>

                                <h1
                                    className={cn(
                                        "text-2xl font-bold tracking-tight sm:text-3xl",
                                        isProfile
                                            ? "text-white"
                                            : "text-foreground"
                                    )}
                                >
                                    {isProfile
                                        ? "Your Profile"
                                        : `Welcome to ${activeRoute.label}`}
                                </h1>

                                <p
                                    className={cn(
                                        "mt-2 max-w-xl text-sm leading-relaxed sm:text-base",
                                        isProfile
                                            ? "text-emerald-100/75"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {isProfile
                                        ? "Manage your personal details, account preferences and security settings."
                                        : `${activeRoute.description}. Everything you need for your next adventure, in one place.`}
                                </p>
                            </div>

                            <div
                                className={cn(
                                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                                    isProfile
                                        ? "bg-white/10 text-emerald-100"
                                        : "bg-orange-500/10 text-orange-600"
                                )}
                            >
                                {isProfile ? (
                                    <UserRound className="h-6 w-6" />
                                ) : (
                                    <Compass className="h-6 w-6" />
                                )}
                            </div>
                        </div>
                    </motion.section>

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
