"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Heart,
    Loader2,
    MapPin,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { wishlistApi, WishlistItem } from "@/lib/wishlist-api";
import { SaveToWishlistButton } from "@/components/tours/save-to-wishlist-button";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";

export default function WishlistPage() {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadWishlist = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const wishlist = await wishlistApi.getWishlist();

                if (mounted) {
                    setItems(wishlist);
                }
            } catch (err) {
                console.error("Failed to load wishlist:", err);

                if (mounted) {
                    setError(
                        "We couldn't load your wishlist. Please try again."
                    );
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadWishlist();

        return () => {
            mounted = false;
        };
    }, []);

    const savedTourIds = useMemo(
        () => new Set(items.map((item) => item.tourId)),
        [items]
    );

    const handleSavedChange = (
        tourId: string,
        saved: boolean
    ) => {
        if (!saved) {
            setItems((current) =>
                current.filter((item) => item.tourId !== tourId)
            );
        }
    };

    const handleRemove = async (tourId: string) => {
        const previousItems = items;

        setItems((current) =>
            current.filter((item) => item.tourId !== tourId)
        );

        try {
            await wishlistApi.remove(tourId);

            toast.success("Removed from wishlist");
        } catch (err) {
            console.error("Failed to remove wishlist item:", err);

            setItems(previousItems);

            toast.error("Couldn't remove this tour", {
                description:
                    "Please check your connection and try again.",
            });
        }
    };

    if (isLoading) {
        return <WishlistLoading />;
    }

    return (
        <main className="min-h-screen bg-background">
            <section className="border-b bg-muted/20">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm text-muted-foreground">
                                <Heart className="h-4 w-4 fill-current text-primary" />
                                Your saved adventures
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Wishlist
                            </h1>

                            <p className="mt-2 max-w-2xl text-muted-foreground">
                                Keep track of the tours you want to
                                experience next.
                            </p>
                        </div>

                        {!error && items.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                                {items.length}{" "}
                                {items.length === 1
                                    ? "saved tour"
                                    : "saved tours"}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {error ? (
                    <WishlistError
                        message={error}
                        onRetry={() => window.location.reload()}
                    />
                ) : items.length === 0 ? (
                    <EmptyWishlist />
                ) : (
                    <div
                        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                        aria-live="polite"
                    >
                        {items.map((item) => (
                            <WishlistCard
                                key={item.id}
                                item={item}
                                isSaved={savedTourIds.has(item.tourId)}
                                onSavedChange={(saved) =>
                                    handleSavedChange(
                                        item.tourId,
                                        saved
                                    )
                                }
                                onRemove={() =>
                                    handleRemove(item.tourId)
                                }
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

interface WishlistCardProps {
    item: WishlistItem;
    isSaved: boolean;
    onSavedChange: (saved: boolean) => void;
    onRemove: () => void;
}

function WishlistCard({
                          item,
                          isSaved,
                          onSavedChange,
                          onRemove,
                      }: WishlistCardProps) {
    return (
        <Card className="group overflow-hidden border-border/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <div className="absolute inset-0 flex items-center justify-center">
                    <Heart className="h-10 w-10 text-muted-foreground/20" />
                </div>

                <div className="absolute right-3 top-3 z-10">
                    <SaveToWishlistButton
                        tourId={item.tourId}
                        initialSaved={isSaved}
                        onSavedChange={onSavedChange}
                    />
                </div>
            </div>

            <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    Saved tour
                </div>

                <h2 className="line-clamp-2 text-lg font-semibold">
                    Tour
                </h2>

                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    Tour ID: {item.tourId}
                </p>

                <div className="mt-5 flex items-center justify-between gap-3">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/tours/${item.tourId}`}>
                            View tour
                            <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Link>
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onRemove}
                        aria-label="Remove from wishlist"
                        title="Remove from wishlist"
                        className="text-muted-foreground hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function EmptyWishlist() {
    return (
        <div className="flex min-h-[420px] items-center justify-center">
            <div className="mx-auto max-w-md text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Heart className="h-7 w-7 text-primary" />
                </div>

                <h2 className="text-2xl font-semibold">
                    Your wishlist is empty
                </h2>

                <p className="mt-2 text-muted-foreground">
                    Found a safari or adventure you love? Save it
                    here and come back when you're ready to plan.
                </p>

                <Button asChild className="mt-6">
                    <Link href="/tours">
                        Explore tours
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}

function WishlistError({
                           message,
                           onRetry,
                       }: {
    message: string;
    onRetry: () => void;
}) {
    return (
        <div className="flex min-h-[420px] items-center justify-center">
            <div className="max-w-md text-center">
                <h2 className="text-xl font-semibold">
                    Something went wrong
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                    {message}
                </p>

                <Button
                    type="button"
                    onClick={onRetry}
                    className="mt-5"
                >
                    Try again
                </Button>
            </div>
        </div>
    );
}

function WishlistLoading() {
    return (
        <main className="min-h-screen bg-background">
            <section className="border-b bg-muted/20">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                    <div className="mt-4 h-10 w-56 animate-pulse rounded bg-muted" />
                    <div className="mt-3 h-5 w-full max-w-xl animate-pulse rounded bg-muted" />
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Card
                            key={index}
                            className="overflow-hidden"
                        >
                            <div className="aspect-[16/10] animate-pulse bg-muted" />

                            <CardContent className="space-y-4 p-5">
                                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                                <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
                                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                                <div className="h-9 w-28 animate-pulse rounded bg-muted" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </main>
    );
}