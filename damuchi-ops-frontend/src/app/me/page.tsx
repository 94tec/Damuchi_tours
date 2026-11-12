"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import {
    ArrowRight,
    ArrowUpRight,
    CalendarDays,
    CheckCircle2,
    Compass,
    CreditCard,
    Heart,
    Inbox,
    Sparkles,
    Wallet,
} from "lucide-react";

import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import { useAuthStore } from "@/store/auth-store";
import { enquiryApi } from "@/lib/enquiry-api";
import { bookingApi } from "@/lib/booking-api";
import { formatCurrency } from "@/lib/utils";

import type { ApiError, Booking } from "@/types/index-types";

/* ============================================================
   TYPES & MOTION
============================================================ */

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

type Tone = "green" | "coral" | "amber";

const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0 },
};

const TONES: Record<Tone, { icon: string; bar: string; glow: string }> = {
    green: {
        icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        bar: "from-emerald-500 to-emerald-500/30",
        glow: "hover:shadow-emerald-500/10",
    },
    coral: {
        icon: "bg-coral/10 text-coral",
        bar: "from-coral to-coral/30",
        glow: "hover:shadow-coral/10",
    },
    amber: {
        icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        bar: "from-amber-500 to-amber-500/30",
        glow: "hover:shadow-amber-500/10",
    },
};

/* ============================================================
   HELPERS
============================================================ */

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

function bookingStatusText(status: Booking["status"]) {
    return String(status)
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function bookingStatusClass(status: Booking["status"]) {
    const s = String(status).toUpperCase();

    if (s.includes("CANCEL") || s.includes("REJECT") || s.includes("FAIL"))
        return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400";
    if (s.includes("PENDING") || s.includes("AWAIT") || s.includes("HOLD"))
        return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-400";
    if (s.includes("COMPLETE"))
        return "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/60 dark:bg-teal-950/30 dark:text-teal-400";

    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-400";
}

/* ============================================================
   PAGE
============================================================ */

export default function MeOverviewPage() {
    const reduceMotion = useReducedMotion();
    const user = useAuthStore((state) => state.user);

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
                        "Couldn't load your dashboard.",
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

    /* Never add amounts of different currencies together. */
    const currencies = new Set(balanceDue.map((b) => b.currency));
    const singleCurrency = currencies.size <= 1;
    const totalBalance = balanceDue.reduce((sum, item) => sum + item.amount, 0);
    const balanceValue = singleCurrency
        ? formatCurrency(totalBalance, balanceDue[0]?.currency ?? "USD")
        : `${balanceDue.length} balances`;

    const attentionCount = needsAction.length + balanceDue.length;
    const firstName = user?.displayName?.trim().split(/\s+/)[0];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-52 w-full rounded-3xl sm:h-44" />
                <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-2xl" />
                    ))}
                </div>
                <Skeleton className="h-52 rounded-3xl" />
            </div>
        );
    }

    return (
        <motion.div
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            variants={{
                visible: { transition: { staggerChildren: 0.08 } },
            }}
            className="space-y-8 pb-6 sm:space-y-10"
        >
            {/* Welcome banner */}
            <motion.section
                variants={fadeUp}
                className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-[#173D35] via-[#12332C] to-[#0C2620] p-6 text-white shadow-xl shadow-emerald-950/10 sm:p-9"
            >
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.12]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
                        backgroundSize: "22px 22px",
                    }}
                    aria-hidden="true"
                />
                <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -right-4 -top-12 h-48 w-48 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -bottom-28 left-1/3 h-60 w-60 rounded-full bg-coral/15 blur-3xl" />

                <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                    <div className="max-w-xl">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100 backdrop-blur-sm">
                            <Sparkles className="h-3.5 w-3.5 text-coral" />
                            Your travel journey
                        </span>

                        <h1 className="mt-4 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                            {getGreeting()}
                            {firstName ? `, ${firstName}` : ""}.
                        </h1>

                        <p className="mt-2.5 text-sm leading-6 text-emerald-100/75 sm:text-base sm:leading-7">
                            {attentionCount > 0
                                ? `You have ${attentionCount} ${
                                    attentionCount === 1 ? "item" : "items"
                                } waiting for you.`
                                : "Your next adventure starts here. Keep track of your safari requests, bookings and travel arrangements in one place."}
                        </p>

                        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                            {needsAction.length > 0 ? (
                                <Button
                                    asChild
                                    variant="accent"
                                    className="h-11 rounded-xl px-5 shadow-md"
                                >
                                    <Link href={`/me/enquiries/${needsAction[0].id}`}>
                                        Review your quote
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <Button
                                    asChild
                                    className="h-11 rounded-xl bg-white px-5 text-[#173D35] shadow-md hover:bg-emerald-50"
                                >
                                    <Link href="/tours">
                                        Explore safaris
                                        <ArrowUpRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            )}

                            <Button
                                asChild
                                variant="outline"
                                className="h-11 rounded-xl border-white/20 bg-white/10 px-5 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                            >
                                <Link href="/me/wishlist">
                                    <Heart className="mr-2 h-4 w-4" />
                                    Saved tours
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="hidden h-36 w-36 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] shadow-inner lg:flex">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
                            <Compass className="h-12 w-12 text-emerald-200/85" />
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Summary cards */}
            <motion.section
                variants={fadeUp}
                className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
            >
                <StatCard
                    icon={CalendarDays}
                    label="Active bookings"
                    value={bookings.length}
                    tone="green"
                    href="/me/bookings"
                />

                <StatCard
                    icon={Inbox}
                    label="Quotes to review"
                    value={needsAction.length}
                    tone="coral"
                    href="/me/enquiries"
                />

                <StatCard
                    icon={Wallet}
                    label="Outstanding balance"
                    value={balanceValue}
                    tone="amber"
                    href="/me/bookings"
                />
            </motion.section>

            {/* Action center */}
            <motion.section variants={fadeUp} className="space-y-4">
                <SectionHeader
                    title="Your attention"
                    description="Important updates and outstanding actions."
                    trailing={
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                attentionCount > 0
                                    ? "bg-coral/10 text-coral"
                                    : "bg-muted text-muted-foreground"
                            }`}
                        >
                            {attentionCount} {attentionCount === 1 ? "item" : "items"}
                        </span>
                    }
                />

                {attentionCount === 0 ? (
                    <Card className="relative overflow-hidden rounded-3xl border-dashed bg-gradient-to-b from-emerald-500/[0.04] to-transparent">
                        <CardContent className="flex flex-col items-center px-5 py-12 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-7 w-7" />
                            </div>

                            <h3 className="mt-4 font-semibold">
                                You're all caught up!
                            </h3>

                            <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                                There are no outstanding actions on your
                                account. Time to discover somewhere new.
                            </p>

                            <Button
                                asChild
                                variant="outline"
                                className="mt-5 h-10 w-full rounded-xl sm:w-auto"
                            >
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
                                tone="coral"
                            />
                        ))}

                        {balanceDue.map((item) => (
                            <ActionRow
                                key={`balance-${item.id}`}
                                href={`/me/bookings/${item.id}`}
                                icon={CreditCard}
                                title={item.tourName}
                                description={`Outstanding: ${formatCurrency(
                                    item.amount,
                                    item.currency,
                                )}`}
                                label="View booking"
                                tone="amber"
                            />
                        ))}
                    </div>
                )}
            </motion.section>

            {/* Recent bookings */}
            <motion.section variants={fadeUp} className="space-y-4">
                <SectionHeader
                    title="Your journeys"
                    description="Your latest travel arrangements."
                    trailing={
                        <Button asChild variant="ghost" size="sm" className="rounded-lg">
                            <Link href="/me/bookings">
                                View all
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                    }
                />

                {bookings.length === 0 ? (
                    <Card className="rounded-2xl border-dashed">
                        <CardContent className="flex items-center gap-4 p-6">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                <CalendarDays className="h-6 w-6" />
                            </span>
                            <div>
                                <p className="font-medium">No journeys yet</p>
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    Your confirmed travel arrangements will
                                    appear here.
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
                                className="group flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-4 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 focus-visible:ring-2 focus-visible:ring-coral"
                            >
                                <div className="flex min-w-0 items-center gap-3.5">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 transition-transform duration-300 group-hover:scale-105 dark:text-emerald-300">
                                        <CalendarDays className="h-5 w-5" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold">
                                            {booking.tourName}
                                        </p>

                                        <span
                                            className={`mt-1.5 inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${bookingStatusClass(
                                                booking.status,
                                            )}`}
                                        >
                                            {bookingStatusText(booking.status)}
                                        </span>
                                    </div>
                                </div>

                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-all group-hover:border-emerald-500/30 group-hover:bg-emerald-500/5 group-hover:text-emerald-700">
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </motion.section>
        </motion.div>
    );
}

/* ============================================================
   PIECES
============================================================ */

function SectionHeader({
                           title,
                           description,
                           trailing,
                       }: {
    title: string;
    description: string;
    trailing?: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
                <h2 className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight">
                    <span className="h-5 w-1 rounded-full bg-coral" aria-hidden="true" />
                    {title}
                </h2>
                <p className="mt-1 pl-[14px] text-sm text-muted-foreground">
                    {description}
                </p>
            </div>

            {trailing}
        </div>
    );
}

function StatCard({
                      icon: Icon,
                      label,
                      value,
                      tone,
                      href,
                  }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    tone: Tone;
    href: string;
}) {
    const t = TONES[tone];

    return (
        <Link
            href={href}
            className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-coral"
        >
            <Card
                className={`relative h-full overflow-hidden rounded-2xl border-border/60 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl ${t.glow}`}
            >
                <span
                    className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${t.bar}`}
                    aria-hidden="true"
                />

                <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                    <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${t.icon}`}
                    >
                        <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-muted-foreground">
                            {label}
                        </p>
                        <p className="mt-1 truncate font-display text-2xl font-semibold tabular-nums tracking-tight">
                            {value}
                        </p>
                    </div>

                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100" />
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
                       tone,
                   }: {
    href: string;
    icon: React.ElementType;
    title: string;
    description: string;
    label: string;
    tone: "coral" | "amber";
}) {
    const t = TONES[tone];

    return (
        <Link
            href={href}
            className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card p-4 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-coral"
        >
            <span
                className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${t.bar}`}
                aria-hidden="true"
            />

            <div className="flex min-w-0 items-center gap-3.5 pl-1">
                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${t.icon}`}
                >
                    <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-foreground">
                <span className="hidden sm:inline">{label}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 transition-all group-hover:border-coral/30 group-hover:bg-coral/5 group-hover:text-coral">
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
            </div>
        </Link>
    );
}