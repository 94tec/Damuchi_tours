"use client";

import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { wishlistApi } from "@/lib/wishlist-api";

interface SaveToWishlistButtonProps {
    tourId: string;
    initialSaved?: boolean;
    className?: string;
    showLabel?: boolean;
    onSavedChange?: (saved: boolean) => void;
}

export function SaveToWishlistButton({
                                         tourId,
                                         initialSaved = false,
                                         className,
                                         showLabel = false,
                                         onSavedChange,
                                     }: SaveToWishlistButtonProps) {
    const [saved, setSaved] = useState(initialSaved);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        setSaved(initialSaved);
    }, [initialSaved]);

    const handleToggle = async (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        event.preventDefault();
        event.stopPropagation();

        if (isPending) {
            return;
        }

        const previousSaved = saved;
        const nextSaved = !saved;

        // Optimistic update.
        setSaved(nextSaved);
        onSavedChange?.(nextSaved);
        setIsPending(true);

        try {
            if (nextSaved) {
                await wishlistApi.add(tourId);

                toast.success("Saved to wishlist", {
                    description: "You can find this tour in your wishlist.",
                });
            } else {
                await wishlistApi.remove(tourId);

                toast.success("Removed from wishlist");
            }
        } catch (error) {
            // Roll back optimistic state.
            setSaved(previousSaved);
            onSavedChange?.(previousSaved);

            toast.error(
                nextSaved
                    ? "Couldn't save this tour"
                    : "Couldn't remove this tour",
                {
                    description:
                        "Please check your connection and try again.",
                }
            );

            console.error("Wishlist toggle failed:", error);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            aria-label={
                saved
                    ? "Remove from wishlist"
                    : "Save to wishlist"
            }
            aria-pressed={saved}
            title={saved ? "Remove from wishlist" : "Save to wishlist"}
            className={cn(
                "group inline-flex items-center justify-center gap-2",
                "rounded-full border backdrop-blur-md",
                "transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-70",
                showLabel
                    ? "h-10 px-4"
                    : "h-10 w-10",
                saved
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-border/60 bg-background/80 text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
                className
            )}
        >
            {isPending ? (
                <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                />
            ) : (
                <Heart
                    className={cn(
                        "h-4 w-4 transition-all duration-200",
                        saved
                            ? "fill-current scale-105"
                            : "group-hover:scale-110"
                    )}
                    aria-hidden="true"
                />
            )}

            {showLabel && (
                <span className="text-sm font-medium">
                    {saved ? "Saved" : "Save"}
                </span>
            )}
        </button>
    );
}