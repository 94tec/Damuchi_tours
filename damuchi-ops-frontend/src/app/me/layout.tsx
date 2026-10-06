"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LayoutDashboard, Inbox, Calendar, Heart, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
    { href: "/me", label: "Overview", icon: LayoutDashboard },
    { href: "/me/enquiries", label: "Enquiries", icon: Inbox },
    { href: "/me/bookings", label: "Bookings", icon: Calendar },
    { href: "/me/wishlist", label: "Wishlist", icon: Heart },
    { href: "/me/profile", label: "Profile", icon: UserRound },
];

export default function MeLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <div className="container flex-1 gap-8 py-10 sm:py-14 lg:grid lg:grid-cols-[200px_1fr]">
                <nav className="mb-6 flex gap-1 overflow-x-auto lg:mb-0 lg:flex-col lg:gap-0.5">
                    {NAV.map(({ href, label, icon: Icon }) => {
                        const active = href === "/me" ? pathname === "/me" : pathname.startsWith(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                                    active ? "bg-coral/10 text-coral" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>
                <main className="min-w-0">{children}</main>
            </div>
            <Footer />
        </div>
    );
}