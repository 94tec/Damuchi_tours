"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

import {
    LayoutDashboard,
    Inbox,
    CalendarDays,
    Heart,
    UserRound,
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
                pathname.startsWith(`${item.href}/`),
        ) ?? NAV[0]
    );
}

export default function MeLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const reduceMotion = useReducedMotion();

    const activeRoute = getActiveRoute(pathname);
    const activeRef = useRef<HTMLAnchorElement | null>(null);

    /* Keep the active tab visible on small screens. */
    useEffect(() => {
        activeRef.current?.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "nearest",
            inline: "center",
        });
    }, [activeRoute.href, reduceMotion]);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Shared public website navigation */}
            <Navbar />

            {/* Customer portal */}
            <div className="relative flex-1">
                {/* Soft ambient wash behind the portal */}
                <div
                    className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-72 bg-gradient-to-b from-emerald-900/[0.045] via-coral/[0.02] to-transparent dark:from-emerald-400/[0.04]"
                    aria-hidden="true"
                />

                <div className="relative mx-auto w-full max-w-7xl px-4 pb-14 pt-6 sm:px-6 sm:pt-10 lg:px-8">
                    {/* Customer navigation */}
                    <nav
                        aria-label="Customer account navigation"
                        className="mb-7 sm:mb-9"
                    >
                        <div className="relative rounded-2xl border border-border/60 bg-card/80 p-1.5 shadow-sm shadow-foreground/[0.03] backdrop-blur-xl">
                            <div className="flex items-center gap-1 overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                {NAV.map(({ href, label, icon: Icon }) => {
                                    const active = activeRoute.href === href;
                                    const profileTab = href === "/me/profile";

                                    return (
                                        <Link
                                            key={href}
                                            ref={active ? activeRef : undefined}
                                            href={href}
                                            aria-current={active ? "page" : undefined}
                                            className={cn(
                                                "relative flex shrink-0 items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-[13px] font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-coral sm:px-5 sm:py-3 sm:text-sm",
                                                active
                                                    ? profileTab
                                                        ? "text-emerald-700 dark:text-emerald-300"
                                                        : "text-coral"
                                                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                                                profileTab &&
                                                "ml-auto border-l border-border/60 pl-4 sm:pl-6",
                                            )}
                                        >
                                            {active && (
                                                <motion.span
                                                    layoutId="me-active-tab"
                                                    className={cn(
                                                        "absolute inset-0 rounded-xl ring-1 ring-inset",
                                                        profileTab
                                                            ? "bg-emerald-500/10 ring-emerald-500/15"
                                                            : "bg-coral/10 ring-coral/15",
                                                    )}
                                                    transition={
                                                        reduceMotion
                                                            ? { duration: 0 }
                                                            : {
                                                                type: "spring",
                                                                stiffness: 380,
                                                                damping: 32,
                                                            }
                                                    }
                                                />
                                            )}

                                            <Icon
                                                className={cn(
                                                    "relative z-10 h-[18px] w-[18px] shrink-0 transition-transform duration-200",
                                                    active && "scale-110",
                                                )}
                                            />

                                            <span className="relative z-10 whitespace-nowrap">
                                                {label}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Scroll hint on mobile */}
                            <div
                                className="pointer-events-none absolute inset-y-1.5 right-1.5 w-8 rounded-r-xl bg-gradient-to-l from-card to-transparent sm:hidden"
                                aria-hidden="true"
                            />
                        </div>
                    </nav>

                    {/* Current customer page */}
                    <motion.div
                        key={pathname}
                        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
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