"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";

import { cn } from "@/lib/utils";

/* ============================================================
   TYPES
============================================================ */

export interface CategoryFilterOption<T extends string = string> {
    value: T;
    label: string;
    emoji?: string;
    /** Optional result count shown as a small badge. */
    count?: number;
}

interface CategoryFilterProps<T extends string = string> {
    options: CategoryFilterOption<T>[];
    /** `null` means "All". */
    value: T | null;
    onChange: (value: T | null) => void;
    heading?: string;
    allLabel?: string;
    ariaLabel?: string;
    className?: string;
}

/* ============================================================
   COMPONENT

   < md : single swipeable row, edge-faded, snaps, auto-centres the
          selected chip. Never grows taller, never wraps.
   ≥ md : centred, wrapping pills.
============================================================ */

export function CategoryFilter<T extends string = string>({
                                                              options,
                                                              value,
                                                              onChange,
                                                              heading = "Explore by experience",
                                                              allLabel = "All tours",
                                                              ariaLabel = "Filter tours by category",
                                                              className,
                                                          }: CategoryFilterProps<T>) {
    const shouldReduceMotion = useReducedMotion();
    const railRef = useRef<HTMLDivElement>(null);
    const hasMounted = useRef(false);

    // Keep the selected chip in view when it changes (skip first render)
    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }

        railRef.current
            ?.querySelector<HTMLElement>('[aria-pressed="true"]')
            ?.scrollIntoView({
                inline: "center",
                block: "nearest",
                behavior: shouldReduceMotion ? "auto" : "smooth",
            });
    }, [value, shouldReduceMotion]);

    return (
        <div className={cn("w-full", className)}>
            {/* Heading row */}
            <div className="flex min-h-8 items-center justify-between gap-3 px-1 md:justify-center">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{heading}</span>
                </div>

                {value !== null && (
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        className="inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <X className="h-3 w-3" aria-hidden="true" />
                        Clear
                    </button>
                )}
            </div>

            {/* Rail (mobile) / wrap (desktop) */}
            <div
                ref={railRef}
                className="
                    mt-2 snap-x snap-proximity overflow-x-auto py-1.5
                    [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                    [mask-image:linear-gradient(to_right,transparent,#000_20px,#000_calc(100%-20px),transparent)]
                    md:mt-3 md:overflow-visible md:[mask-image:none]
                "
            >
                <div
                    role="group"
                    aria-label={ariaLabel}
                    className="mx-auto flex w-max items-center gap-2 px-5 md:w-full md:flex-wrap md:justify-center md:px-0"
                >
                    <FilterChip
                        active={value === null}
                        onClick={() => onChange(null)}
                    >
                        {allLabel}
                    </FilterChip>

                    {options.map((option) => (
                        <FilterChip
                            key={option.value}
                            active={value === option.value}
                            emoji={option.emoji}
                            count={option.count}
                            onClick={() => onChange(option.value)}
                        >
                            {option.label}
                        </FilterChip>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ============================================================
   CHIP
============================================================ */

function FilterChip({
                        active,
                        emoji,
                        count,
                        onClick,
                        children,
                    }: {
    active: boolean;
    emoji?: string;
    count?: number;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(
                "inline-flex h-11 shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium md:h-10",
                "transition-all duration-200 active:scale-[0.97]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                active
                    ? "border-accent bg-accent text-accent-foreground shadow-sm shadow-accent/20"
                    : "border-border bg-background/70 text-muted-foreground hover:border-accent/40 hover:bg-accent/5 hover:text-foreground",
            )}
        >
            {emoji && (
                <span aria-hidden="true" className="text-base leading-none">
                    {emoji}
                </span>
            )}

            {children}

            {typeof count === "number" && (
                <span
                    className={cn(
                        "rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums leading-none",
                        active
                            ? "bg-white/20 text-accent-foreground"
                            : "bg-muted text-muted-foreground",
                    )}
                >
                    {count}
                </span>
            )}
        </button>
    );
}