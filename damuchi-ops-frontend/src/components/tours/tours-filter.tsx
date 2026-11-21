"use client";

import { useEffect, useRef } from "react";
import { ArrowUpDown, ChevronDown, Mountain, Search, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
    CATEGORY_EMOJI,
    CATEGORY_LABELS,
    DIFFICULTY_LABELS,
    type TourCategory,
    type TourDifficulty,
} from "@/types/tour";
import { CATEGORIES, DIFFICULTIES, SORTS, type TourSort } from "../../hooks/tours-config";

interface ToursFilterBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    category: TourCategory | "";
    onCategoryChange: (value: TourCategory | "") => void;
    difficulty: TourDifficulty | "";
    onDifficultyChange: (value: TourDifficulty | "") => void;
    sort: TourSort;
    onSortChange: (value: TourSort) => void;
}

/**
 * Phones : static (so it doesn't eat the screen), stacked, one-row chips.
 * ≥ md   : sticky under the navbar, search + selects on one line.
 * Set --navbar-height on <html> if your navbar isn't 65px tall.
 */
export function ToursFilterBar({
                                   search,
                                   onSearchChange,
                                   category,
                                   onCategoryChange,
                                   difficulty,
                                   onDifficultyChange,
                                   sort,
                                   onSortChange,
                               }: ToursFilterBarProps) {
    return (
        <section
            aria-label="Filter tours"
            className="z-30 border-b border-border bg-background/95 backdrop-blur-md md:sticky md:top-[var(--navbar-height,65px)]"
        >
            <div className="mx-auto max-w-7xl space-y-3 px-4 py-3 sm:px-6">
                <div className="grid gap-2.5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-3">
                    {/* Search */}
                    <div role="search" className="relative">
                        <Search
                            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden="true"
                        />

                        {/* text-base on phones prevents iOS zoom-on-focus */}
                        <input
                            type="text"
                            inputMode="search"
                            enterKeyHint="search"
                            autoComplete="off"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Search tours or destinations"
                            aria-label="Search tours"
                            className="h-11 w-full rounded-xl border border-border/70 bg-card pl-10 pr-11 text-base outline-none transition-all placeholder:text-muted-foreground/60 focus:border-coral focus:ring-2 focus:ring-coral/15 md:text-sm"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => onSearchChange("")}
                                aria-label="Clear search"
                                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                            >
                                <X className="h-4 w-4" aria-hidden="true" />
                            </button>
                        )}
                    </div>

                    {/* Selects */}
                    <div className="grid gap-2.5 min-[420px]:grid-cols-2 md:flex md:gap-3">
                        <SelectBox
                            icon={Mountain}
                            label="Difficulty"
                            value={difficulty}
                            active={difficulty !== ""}
                            onChange={(v) => onDifficultyChange(v as TourDifficulty | "")}
                        >
                            <option value="">Any difficulty</option>
                            {DIFFICULTIES.map((d) => (
                                <option key={d} value={d}>
                                    {DIFFICULTY_LABELS[d]}
                                </option>
                            ))}
                        </SelectBox>

                        <SelectBox
                            icon={ArrowUpDown}
                            label="Sort tours"
                            value={sort}
                            active={sort !== "recommended"}
                            onChange={(v) => onSortChange(v as TourSort)}
                        >
                            {SORTS.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </SelectBox>
                    </div>
                </div>

                <CategoryChips value={category} onChange={onCategoryChange} />
            </div>
        </section>
    );
}

/* ============================================================
   SELECT
============================================================ */

function SelectBox({
                       icon: Icon,
                       label,
                       value,
                       active,
                       onChange,
                       children,
                   }: {
    icon: LucideIcon;
    label: string;
    value: string;
    active: boolean;
    onChange: (value: string) => void;
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-w-0">
            <Icon
                className={cn(
                    "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2",
                    active ? "text-coral" : "text-muted-foreground",
                )}
                aria-hidden="true"
            />

            <select
                aria-label={label}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    "h-11 w-full appearance-none rounded-xl border bg-card pl-10 pr-9 text-base outline-none transition-all focus:border-coral focus:ring-2 focus:ring-coral/15 md:min-w-[11.5rem] md:text-sm",
                    active ? "border-coral/50 bg-coral/[0.04]" : "border-border/70",
                )}
            >
                {children}
            </select>

            <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70"
                aria-hidden="true"
            />
        </div>
    );
}

/* ============================================================
   CATEGORY CHIPS
   < md : one swipeable row, edge-faded, selected chip auto-centres
   ≥ md : wraps
============================================================ */

function CategoryChips({
                           value,
                           onChange,
                       }: {
    value: TourCategory | "";
    onChange: (value: TourCategory | "") => void;
}) {
    const railRef = useRef<HTMLDivElement>(null);
    const mounted = useRef(false);

    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            return;
        }

        railRef.current
            ?.querySelector<HTMLElement>('[aria-pressed="true"]')
            ?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }, [value]);

    const options: { value: TourCategory | ""; label: string; emoji?: string }[] = [
        { value: "", label: "All" },
        ...CATEGORIES.map((c) => ({
            value: c,
            label: CATEGORY_LABELS[c],
            emoji: CATEGORY_EMOJI[c],
        })),
    ];

    return (
        <div
            ref={railRef}
            className="
                snap-x snap-proximity overflow-x-auto py-1
                [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                [mask-image:linear-gradient(to_right,transparent,#000_16px,#000_calc(100%-16px),transparent)]
                md:overflow-visible md:[mask-image:none]
            "
        >
            <div
                role="group"
                aria-label="Filter tours by category"
                className="flex w-max items-center gap-2 px-4 md:w-full md:flex-wrap md:px-0"
            >
                {options.map((option) => {
                    const active = value === option.value;

                    return (
                        <button
                            key={option.value || "all"}
                            type="button"
                            aria-pressed={active}
                            onClick={() => onChange(option.value)}
                            className={cn(
                                "inline-flex h-10 shrink-0 snap-start items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-all active:scale-[0.97] md:h-9 md:px-3.5 md:text-xs",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
                                active
                                    ? "border-coral bg-coral text-white shadow-sm shadow-coral/20"
                                    : "border-border/70 bg-card text-muted-foreground hover:border-coral/40 hover:text-foreground",
                            )}
                        >
                            {option.emoji && <span aria-hidden="true">{option.emoji}</span>}
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}