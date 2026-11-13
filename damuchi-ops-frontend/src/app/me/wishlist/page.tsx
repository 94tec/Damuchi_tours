"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Compass,
    Heart,
    Loader2,
    MapPin,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { wishlistApi } from "@/lib/wishlist-api";
import type { WishlistItem } from "@/lib/wishlist-api";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/* ============================================================
   HELPERS
============================================================ */

/** Each saved card gets a stable, slightly different cover tone. */
const COVER_TONES = [
    "from-forest-950 via-forest-900 to-emerald-800",
    "from-forest-950 via-emerald-900 to-teal-700",
    "from-forest-900 via-forest-950 to-emerald-900",
    "from-emerald-950 via-forest-900 to-emerald-700",
];

function getTone(id: string) {
    let sum = 0;
    for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
    return COVER_TONES[sum % COVER_TONES.length];
}

function getReference(id: string) {
    if (!id) return "—";
    return id.length > 18 ? `${id.slice(0, 8)}…${id.slice(-5)}` : id;
}

const ENTER =
    "animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both motion-reduce:animate-none";

/* ============================================================
   MAIN PAGE
============================================================ */

export default function WishlistPage() {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [removingIds, setRemovingIds] = useState<Set<string>>(
        () => new Set(),
    );

    const loadWishlist = useCallback(async (silent = false) => {
        if (silent) setIsRefreshing(true);
        else setIsLoading(true);
        setError(null);

        try {
            const wishlist = await wishlistApi.getWishlist();
            setItems(Array.isArray(wishlist) ? wishlist : []);
        } catch (err) {
            console.error("Failed to load wishlist:", err);
            setError("We couldn't load your saved adventures. Please try again.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        void loadWishlist();
    }, [loadWishlist]);

    const handleRemove = async (tourId: string) => {
        if (removingIds.has(tourId)) return;

        setRemovingIds((current) => new Set(current).add(tourId));

        try {
            await wishlistApi.remove(tourId);

            setItems((current) =>
                current.filter((item) => item.tourId !== tourId),
            );

            toast.success("Removed from your wishlist");
        } catch (err) {
            console.error("Failed to remove wishlist item:", err);

            toast.error("Couldn't remove this adventure", {
                description: "Please check your connection and try again.",
            });
        } finally {
            setRemovingIds((current) => {
                const next = new Set(current);
                next.delete(tourId);
                return next;
            });
        }
    };

    if (isLoading) {
        return <WishlistLoading />;
    }

    const count = items.length;

    return (
        <div className="mx-auto w-full max-w-7xl space-y-7 pb-10 sm:space-y-9">
            {/* HERO */}
            <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-emerald-950 px-5 py-8 text-white shadow-xl shadow-forest-950/10 sm:px-8 sm:py-11 lg:px-12">
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.12]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
                        backgroundSize: "24px 24px",
                    }}
                    aria-hidden="true"
                />
                <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/[0.08]" />
                <div className="pointer-events-none absolute -right-8 -top-12 h-48 w-48 rounded-full border border-white/[0.08]" />
                <div className="pointer-events-none absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-coral/15 blur-3xl" />

                <div className="relative flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
                            <Heart className="h-3.5 w-3.5 fill-coral text-coral" />
                            Your personal collection
                        </div>

                        <h1 className="mt-5 text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                            Saved adventures
                        </h1>

                        <p className="mt-3 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                            The journeys that caught your eye, all in one
                            place. Keep your favourite experiences close while
                            you plan your next escape.
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-white/65">
                            <span className="inline-flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                                Private to your account
                            </span>

                            <span className="inline-flex items-center gap-2">
                                <Compass className="h-4 w-4 text-coral" />
                                Plan at your own pace
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/[0.08] p-4 backdrop-blur-md md:min-w-[200px] md:flex-col md:items-start md:gap-1 md:p-5">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
                                Your collection
                            </p>
                            <p className="mt-1 font-display text-4xl font-semibold tabular-nums text-white">
                                {count.toString().padStart(2, "0")}
                            </p>
                            <p className="text-xs text-white/55">
                                {count === 1 ? "Saved adventure" : "Saved adventures"}
                            </p>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coral/15 text-coral md:mt-3">
                            <Heart className="h-5 w-5 fill-coral/40" />
                        </div>
                    </div>
                </div>
            </section>

            {/* COLLECTION */}
            <section className="space-y-5">
                <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-coral">
                            <Sparkles className="h-3.5 w-3.5" />
                            Curated by you
                        </div>

                        <h2 className="mt-2 font-display text-xl font-semibold tracking-tight sm:text-2xl">
                            Your wishlist
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Revisit an adventure whenever inspiration strikes.
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => void loadWishlist(true)}
                        disabled={isRefreshing}
                        aria-label="Refresh collection"
                        className="h-10 shrink-0 rounded-xl px-3 sm:px-4"
                    >
                        <RefreshCw
                            className={`h-4 w-4 sm:mr-2 ${
                                isRefreshing ? "animate-spin" : ""
                            }`}
                        />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>
                </div>

                {error ? (
                    <WishlistError
                        message={error}
                        onRetry={() => void loadWishlist()}
                    />
                ) : count === 0 ? (
                    <EmptyWishlist />
                ) : (
                    <>
                        <div
                            className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4"
                            aria-live="polite"
                        >
                            {items.map((item, index) => (
                                <WishlistCard
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    isRemoving={removingIds.has(item.tourId)}
                                    onRemove={() => handleRemove(item.tourId)}
                                />
                            ))}
                        </div>

                        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-border/60 bg-gradient-to-r from-muted/30 to-background px-5 py-4 text-center sm:flex-row sm:text-left">
                            <p className="text-xs text-muted-foreground">
                                Showing{" "}
                                <span className="font-semibold text-foreground">
                                    {count}
                                </span>{" "}
                                {count === 1 ? "saved adventure" : "saved adventures"}
                            </p>

                            <Link
                                href="/tours"
                                className="group inline-flex items-center gap-2 text-xs font-semibold text-forest-800 transition-colors hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral dark:text-emerald-400"
                            >
                                Discover more experiences
                                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}

/* ============================================================
   WISHLIST CARD
============================================================ */

function WishlistCard({
                          item,
                          index,
                          isRemoving,
                          onRemove,
                      }: {
    item: WishlistItem;
    index: number;
    isRemoving: boolean;
    onRemove: () => void;
}) {
    return (
        <Card
            className={`group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-coral/30 hover:shadow-xl hover:shadow-foreground/[0.07] ${ENTER} ${
                isRemoving ? "pointer-events-none opacity-60" : ""
            }`}
            style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
        >
            {/* Cover */}
            <div
                className={`relative isolate flex aspect-[16/10] items-end overflow-hidden bg-gradient-to-br ${getTone(
                    item.tourId,
                )} p-4 sm:p-5`}
            >
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.1]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)",
                        backgroundSize: "18px 18px",
                    }}
                    aria-hidden="true"
                />
                <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full border border-white/10 transition-transform duration-700 group-hover:scale-110" />
                <div className="pointer-events-none absolute -right-2 top-0 h-28 w-28 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-coral/15 blur-2xl" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/25 to-transparent" />

                <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110 sm:right-4 sm:top-4">
                    <Heart className="h-4 w-4 fill-coral text-coral" />
                </div>

                <div className="relative flex w-full items-end justify-between gap-3">
                    <div className="min-w-0">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm">
                            <Compass className="h-3 w-3 text-coral" />
                            Saved adventure
                        </span>

                        <p className="mt-3 font-display text-xl font-semibold tracking-tight text-white">
                            Your next journey
                        </p>
                        <p className="mt-0.5 text-[11px] text-white/65">
                            Ready when you are
                        </p>
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.1] text-white/85 backdrop-blur-sm transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105">
                        <MapPin className="h-5 w-5" />
                    </div>
                </div>
            </div>

            <CardContent className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-coral" />
                    Saved to your collection
                </div>

                <h3 className="mt-2 font-display text-lg font-semibold tracking-tight text-foreground">
                    Safari experience
                </h3>

                <p className="mt-1 break-all font-mono text-[11px] leading-5 text-muted-foreground">
                    Ref · {getReference(item.tourId)}
                </p>

                <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-5">
                    <Button
                        asChild
                        className="h-11 min-w-0 rounded-xl bg-forest-900 text-xs font-semibold text-white shadow-sm transition-all hover:bg-forest-800 active:scale-[0.98] dark:bg-emerald-700 dark:hover:bg-emerald-600"
                    >
                        <Link href={`/tours/${encodeURIComponent(item.tourId)}`}>
                            Explore tour
                            <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={onRemove}
                        disabled={isRemoving}
                        aria-label="Remove this adventure from wishlist"
                        title="Remove from wishlist"
                        className="h-11 w-11 rounded-xl border-border/70 text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                    >
                        {isRemoving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyWishlist() {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-dashed border-border bg-gradient-to-b from-muted/30 to-background px-5 py-14 text-center sm:px-8 sm:py-20">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-coral/[0.08] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-emerald-900/[0.08] blur-3xl" />

            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-coral/20 bg-coral/[0.08] text-coral shadow-sm">
                <Heart className="h-7 w-7" />
            </div>

            <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-[#123D32] via-[#0F3329] to-[#0B2A22] p-6 text-white shadow-xl shadow-emerald-950/10 sm:p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-coral">
                    Your collection awaits
                </p>

                <h3 className="mt-2 text-balance font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    Your wishlist is waiting for its first adventure
                </h3>

                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    Discover extraordinary safari experiences, find the
                    journeys you love, and save them here for when you're ready
                    to plan.
                </p>

                <Button
                    asChild
                    className="mt-7 h-11 w-full rounded-xl bg-forest-900 px-6 text-white shadow-sm hover:bg-forest-800 sm:w-auto dark:bg-emerald-700 dark:hover:bg-emerald-600"
                >
                    <Link href="/tours">
                        Explore safari experiences
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}

/* ============================================================
   ERROR STATE
============================================================ */

function WishlistError({
                           message,
                           onRetry,
                       }: {
    message: string;
    onRetry: () => void;
}) {
    return (
        <div
            role="alert"
            className="rounded-3xl border border-destructive/20 bg-destructive/[0.025] px-5 py-14 text-center sm:py-16"
        >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <RefreshCw className="h-6 w-6" />
            </div>

            <h3 className="mt-5 font-display text-xl font-semibold">
                We couldn't load your collection
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                {message}
            </p>

            <Button type="button" onClick={onRetry} className="mt-6 h-10 rounded-xl">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
            </Button>
        </div>
    );
}

/* ============================================================
   LOADING STATE
============================================================ */

function WishlistLoading() {
    return (
        <div className="mx-auto w-full max-w-7xl space-y-8">
            <Skeleton className="h-64 w-full rounded-3xl sm:h-60" />

            <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-full max-w-sm" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <Card
                        key={index}
                        className="overflow-hidden rounded-2xl border-border/60"
                    >
                        <Skeleton className="aspect-[16/10] w-full rounded-none" />

                        <CardContent className="space-y-3 p-5">
                            <Skeleton className="h-3 w-28" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="mt-4 h-11 w-full rounded-xl" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}