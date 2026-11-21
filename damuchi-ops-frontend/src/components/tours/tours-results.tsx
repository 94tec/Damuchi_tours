"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Compass, SearchX, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TourCard } from "@/components/tours/tour-card";
import { TourCardSkeleton } from "@/components/tours/tour-card-skeleton"; // adjust path if different
import type { TourSummary } from "@/types/tour";
import { PAGE_STEP } from "../../hooks/tours-config";

export interface ActiveFilter {
    key: string;
    label: string;
    onRemove: () => void;
}

interface ToursResultsProps {
    /** Already filtered + sorted. */
    tours: TourSummary[];
    isLoading: boolean;
    isFetching: boolean;
    error: string | null;
    hasFilters: boolean;
    activeFilters: ActiveFilter[];
    onRetry: () => void;
    onClearAll: () => void;
}

export function ToursResults({
                                 tours,
                                 isLoading,
                                 isFetching,
                                 error,
                                 hasFilters,
                                 activeFilters,
                                 onRetry,
                                 onClearAll,
                             }: ToursResultsProps) {
    const [visible, setVisible] = useState(PAGE_STEP);

    // Back to the first page whenever the result set changes
    useEffect(() => setVisible(PAGE_STEP), [tours]);

    const shown = tours.slice(0, visible);
    const remaining = tours.length - shown.length;

    return (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
            {error ? (
                <StateMessage
                    tone="danger"
                    icon={AlertTriangle}
                    title="We couldn't load the tours"
                    description={error}
                    action={
                        <Button variant="outline" className="h-11 rounded-full px-6" onClick={onRetry}>
                            Try again
                        </Button>
                    }
                />
            ) : (
                <>
                    {/* Count + active filters */}
                    {!isLoading && (
                        <div className="mb-6 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                                <p aria-live="polite" className="text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">
                                        {tours.length}
                                    </span>{" "}
                                    {tours.length === 1 ? "journey" : "journeys"}
                                </p>

                                {hasFilters && (
                                    <button
                                        type="button"
                                        onClick={onClearAll}
                                        className="rounded-md py-1 text-xs font-semibold text-coral hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                                    >
                                        Clear all filters
                                    </button>
                                )}
                            </div>

                            {activeFilters.length > 0 && (
                                <ul className="flex flex-wrap gap-2" aria-label="Active filters">
                                    {activeFilters.map((filter) => (
                                        <li key={filter.key}>
                                            <button
                                                type="button"
                                                onClick={filter.onRemove}
                                                aria-label={`Remove filter: ${filter.label}`}
                                                className="inline-flex h-8 max-w-full items-center gap-1.5 rounded-full border border-coral/25 bg-coral/10 pl-3 pr-2 text-xs font-medium text-coral transition-colors hover:bg-coral/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                                            >
                                                <span className="truncate">{filter.label}</span>
                                                <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3" aria-busy="true">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <TourCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : tours.length === 0 ? (
                        hasFilters ? (
                            <StateMessage
                                icon={SearchX}
                                title="No tours match your filters"
                                description="Try a different search, or clear the filters."
                                action={
                                    <Button variant="outline" className="h-11 rounded-full px-6" onClick={onClearAll}>
                                        Clear filters
                                    </Button>
                                }
                            />
                        ) : (
                            <StateMessage
                                icon={Compass}
                                title="New journeys are on their way"
                                description="We're preparing our next tours. Please check back soon."
                            />
                        )
                    ) : (
                        <>
                            {/* Old cards stay (dimmed) while a refetch is in flight: no layout jump */}
                            <div
                                aria-busy={isFetching}
                                className={`grid gap-5 transition-opacity duration-200 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 ${
                                    isFetching ? "opacity-60" : ""
                                }`}
                            >
                                {shown.map((tour) => (
                                    <TourCard key={tour.id} tour={tour} />
                                ))}
                            </div>

                            {remaining > 0 && (
                                <div className="mt-10 flex flex-col items-center gap-2.5 sm:mt-12">
                                    <p className="text-xs text-muted-foreground">
                                        Showing {shown.length} of {tours.length}
                                    </p>

                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="h-12 w-full rounded-full sm:w-auto sm:px-8"
                                        onClick={() => setVisible((v) => v + PAGE_STEP)}
                                    >
                                        Show more ({remaining} left)
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </section>
    );
}

/* ============================================================
   SHARED STATE MESSAGE
============================================================ */

function StateMessage({
                          icon: Icon,
                          title,
                          description,
                          action,
                          tone = "neutral",
                      }: {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
    tone?: "neutral" | "danger";
}) {
    return (
        <div
            role={tone === "danger" ? "alert" : undefined}
            className="flex flex-col items-center rounded-3xl border border-dashed border-border/80 bg-muted/10 px-5 py-16 text-center sm:py-20"
        >
            <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                    tone === "danger"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-coral/10 text-coral"
                }`}
            >
                <Icon className="h-6 w-6" aria-hidden="true" />
            </span>

            <h2 className="mt-4 font-display text-xl font-semibold tracking-tight">{title}</h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                {description}
            </p>

            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}