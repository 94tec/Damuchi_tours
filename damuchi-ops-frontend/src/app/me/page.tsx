
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import {
    ArrowRight,
    ArrowUpRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Compass,
    CreditCard,
    Inbox,
    Wallet,
    Sparkles,
} from "lucide-react";

import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import { enquiryApi } from "@/lib/enquiry-api";
import { bookingApi } from "@/lib/booking-api";
import { formatCurrency } from "@/lib/utils";

import type { ApiError, Booking } from "@/types/index-types";

type ActionItem = {
    id: string;
    tourName: string;
    label: string;
};

type BalanceItem = {
    id: string;
    tourName: string;
    amount: number;
    currency: string;
};

const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0 },
};

export default function MeOverviewPage() {
    const [needsAction, setNeedsAction] = useState<ActionItem[]>([]);
    const [balanceDue, setBalanceDue] = useState<BalanceItem[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function load() {
            try {
                const [enquiries, bookingData] = await Promise.all([
                    enquiryApi.myEnquiries(undefined, 0, 50),
                    bookingApi.myActiveBookings(),
                ]);

                if (!active) return;

                const quoted = (enquiries.content ?? [])
                    .filter((e) => e.status === "QUOTED")
                    .map((e) => ({
                        id: e.id,
                        tourName: e.tourName,
                        label: "Your quotation is ready for review",
                    }));

                const balances: BalanceItem[] = bookingData
                    .filter((booking) => {
                        const amount = booking.balanceAmount ?? 0;

                        return Number.isFinite(amount) && amount > 0;
                    })
                    .map((booking) => ({
                        id: booking.id,
                        tourName: booking.tourName,
                        amount: booking.balanceAmount ?? 0,
                        currency: booking.currency ?? "USD",
                    }));

                setNeedsAction(quoted);
                setBalanceDue(balances);
                setBookings(bookingData);
            } catch (err) {
                if (active) {
                    toast.error(
                        (err as ApiError)?.message ||
                        "Couldn't load your dashboard."
                    );
                }
            } finally {
                if (active) setIsLoading(false);
            }
        }

        load();

        return () => {
            active = false;
        };
    }, []);

    const totalBalance = balanceDue.reduce(
        (sum, item) => sum + item.amount,
        0
    );

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-36 w-full rounded-3xl" />
                <div className="grid gap-4 sm:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-2xl" />
                    ))}
                </div>
                <Skeleton className="h-52 rounded-3xl" />
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                visible: {
                    transition: { staggerChildren: 0.08 },
                },
            }}
            className="space-y-8"
        >
            {/* Welcome banner */}
            <motion.section
                variants={fadeUp}
                className="
                    relative overflow-hidden rounded-[28px]
                    bg-[#173D35] p-6 text-white
                    shadow-xl shadow-emerald-950/10
                    sm:p-8
                "
            >
                <div className="
                    pointer-events-none absolute -right-12 -top-20
                    h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl
                " />

                <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                    <div className="max-w-xl">
                        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                            <Sparkles className="h-4 w-4" />
                            Your travel journey
                        </span>

                        <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
                            Your next adventure starts here.
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-emerald-100/75">
                            Keep track of your safari requests, bookings
                            and travel arrangements all in one place.
                        </p>

                        <Button
                            asChild
                            className="mt-6 rounded-xl bg-white text-[#173D35] hover:bg-emerald-50"
                        >
                            <Link href="/tours">
                                Explore safaris
                                <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="hidden h-32 w-32 items-center justify-center rounded-full border border-white/10 bg-white/5 sm:flex">
                        <Compass className="h-16 w-16 text-emerald-200/80" />
                    </div>
                </div>
            </motion.section>

            {/* Summary cards */}
            <motion.section
                variants={fadeUp}
                className="grid gap-4 sm:grid-cols-3"
            >
                <StatCard
                    icon={CalendarDays}
                    label="Active bookings"
                    value={bookings.length}
                    color="green"
                    href="/me/bookings"
                />

                <StatCard
                    icon={Inbox}
                    label="Quotes to review"
                    value={needsAction.length}
                    color="coral"
                    href="/me/enquiries"
                />

                <StatCard
                    icon={Wallet}
                    label="Outstanding balance"
                    value={formatCurrency(
                        totalBalance,
                        balanceDue[0]?.currency ?? "USD"
                    )}
                    color="amber"
                    href="/me/bookings"
                />
            </motion.section>

            {/* Action center */}
            <motion.section variants={fadeUp} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="font-display text-xl font-semibold">
                            Your attention
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Important updates and outstanding actions.
                        </p>
                    </div>

                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
                        {needsAction.length + balanceDue.length} items
                    </span>
                </div>

                {needsAction.length === 0 && balanceDue.length === 0 ? (
                    <Card className="overflow-hidden rounded-3xl border-dashed">
                        <CardContent className="flex flex-col items-center py-12 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                                <CheckCircle2 className="h-7 w-7" />
                            </div>

                            <h3 className="mt-4 font-semibold">
                                You're all caught up!
                            </h3>

                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                There are no outstanding actions on your account.
                                Time to discover somewhere new.
                            </p>

                            <Button asChild variant="outline" className="mt-5 rounded-xl">
                                <Link href="/tours">
                                    Browse destinations
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-3">
                        {needsAction.map((item) => (
                            <ActionRow
                                key={`quote-${item.id}`}
                                href={`/me/enquiries/${item.id}`}
                                icon={Inbox}
                                title={item.tourName}
                                description={item.label}
                                label="Review quote"
                                color="coral"
                            />
                        ))}

                        {balanceDue.map((item) => (
                            <ActionRow
                                key={`balance-${item.id}`}
                                href={`/me/bookings/${item.id}`}
                                icon={CreditCard}
                                title={item.tourName}
                                description={`Outstanding: ${formatCurrency(item.amount, item.currency)}`}
                                label="View booking"
                                color="amber"
                            />
                        ))}
                    </div>
                )}
            </motion.section>

            {/* Recent bookings */}
            <motion.section variants={fadeUp} className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-display text-xl font-semibold">
                            Your journeys
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Your latest travel arrangements.
                        </p>
                    </div>

                    <Button asChild variant="ghost" size="sm">
                        <Link href="/me/bookings">
                            View all
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                {bookings.length === 0 ? (
                    <Card className="rounded-2xl">
                        <CardContent className="flex items-center gap-4 p-6">
                            <CalendarDays className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <p className="font-medium">No journeys yet</p>
                                <p className="text-sm text-muted-foreground">
                                    Your confirmed travel arrangements will appear here.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-3">
                        {bookings.slice(0, 3).map((booking) => (
                            <Link
                                key={booking.id}
                                href={`/me/bookings/${booking.id}`}
                                className="
                                    group flex items-center justify-between gap-4
                                    rounded-2xl border border-border/70
                                    bg-card p-4 transition-all
                                    hover:-translate-y-0.5
                                    hover:border-emerald-500/30
                                    hover:shadow-md
                                "
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                        <CalendarDays className="h-5 w-5" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold">
                                            {booking.tourName}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {bookingStatusText(booking.status)}
                                        </p>
                                    </div>
                                </div>

                                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                            </Link>
                        ))}
                    </div>
                )}
            </motion.section>
        </motion.div>
    );
}

function StatCard({
                      icon: Icon,
                      label,
                      value,
                      color,
                      href,
                  }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: "green" | "coral" | "amber";
    href: string;
}) {
    const colors = {
        green: "bg-emerald-500/10 text-emerald-600",
        coral: "bg-orange-500/10 text-orange-600",
        amber: "bg-amber-500/10 text-amber-600",
    };

    return (
        <Link href={href}>
            <Card className="group h-full rounded-2xl border-border/60 transition-all hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="flex items-center gap-4 p-5">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${colors[color]}`}>
                        <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-muted-foreground">
                            {label}
                        </p>
                        <p className="mt-1 truncate text-xl font-bold tracking-tight">
                            {value}
                        </p>
                    </div>

                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </CardContent>
            </Card>
        </Link>
    );
}

function ActionRow({
                       href,
                       icon: Icon,
                       title,
                       description,
                       label,
                       color,
                   }: {
    href: string;
    icon: React.ElementType;
    title: string;
    description: string;
    label: string;
    color: "coral" | "amber";
}) {
    return (
        <Link
            href={href}
            className="
                group flex items-center justify-between gap-4
                rounded-2xl border border-border/70
                bg-card p-4 transition-all duration-200
                hover:-translate-y-0.5 hover:shadow-md
            "
        >
            <div className="flex min-w-0 items-center gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    color === "coral"
                        ? "bg-orange-500/10 text-orange-600"
                        : "bg-amber-500/10 text-amber-600"
                }`}>
                    <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-primary">
                <span className="hidden sm:inline">{label}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
        </Link>
    );
}

function bookingStatusText(status: Booking["status"]) {
    return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
