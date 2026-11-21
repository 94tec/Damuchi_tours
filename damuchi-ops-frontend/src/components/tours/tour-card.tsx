"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Clock3, MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
    CATEGORY_LABELS,
    CATEGORY_EMOJI,
    DIFFICULTY_LABELS,
    type TourSummary,
} from "@/types/tour";
import { EnquiryModal } from "@/components/landing/enquiry/enquiry-modal";

const DIFFICULTY_VARIANT = {
    EASY: "success",
    MODERATE: "secondary",
    CHALLENGING: "warning",
    STRENUOUS: "destructive",
} as const;

interface TourCardProps {
    tour: TourSummary;
}

export function TourCard({ tour }: TourCardProps) {
    const shouldReduceMotion = useReducedMotion();

    const emoji = CATEGORY_EMOJI[tour.category];
    const categoryLabel = CATEGORY_LABELS[tour.category];

    const hasRating =
        tour.averageRating !== null &&
        tour.averageRating !== undefined &&
        tour.averageRating > 0;

    const formattedPrice = (tour.price ?? 0).toLocaleString("en-KE");


    return (
        <motion.article
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={shouldReduceMotion ? undefined : { y: -4 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-full min-w-0"
        >
            <div
                className="
                    group relative flex h-full min-w-0 flex-col
                    overflow-hidden rounded-2xl border border-border/70 bg-card
                    shadow-sm transition-all duration-500
                    hover:border-accent/30 hover:shadow-2xl hover:shadow-black/[0.08]
                    dark:hover:shadow-black/20 sm:rounded-3xl
                "
                        >
                            {/* Stretched link: covers the whole card */}
                            <Link
                                href={`/tour/${tour.slug}`}
                                aria-label={`View ${tour.name}`}
                                className="
                        absolute inset-0 z-10 rounded-2xl sm:rounded-3xl
                        focus-visible:outline-none focus-visible:ring-2
                        focus-visible:ring-ring focus-visible:ring-offset-2
                    "
                />
                {/* ========================================
                    IMAGE
                ======================================== */}
                <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted sm:aspect-[16/9]">
                    {tour.coverImageUrl ? (
                        <>
                            <img
                                src={tour.coverImageUrl}
                                alt={tour.name}
                                loading="lazy"
                                className="
                                    absolute inset-0 h-full w-full object-cover
                                    transition-transform duration-700
                                    ease-[cubic-bezier(0.22,1,0.36,1)]
                                    group-hover:scale-[1.045]
                                "
                            />

                            <div
                                aria-hidden="true"
                                className="
                                    absolute inset-0 bg-gradient-to-b
                                    from-black/30 via-transparent to-black/70
                                    opacity-90 transition-opacity duration-500
                                    group-hover:opacity-100
                                "
                            />

                            <div
                                aria-hidden="true"
                                className="
                                    absolute inset-x-0 bottom-0 h-1/2
                                    bg-gradient-to-t from-black/55 via-black/10 to-transparent
                                "
                            />

                            <div
                                aria-hidden="true"
                                className="
                                    absolute inset-0 bg-gradient-to-tr
                                    from-transparent via-white/[0.04] to-white/[0.10]
                                    opacity-0 transition-opacity duration-500
                                    group-hover:opacity-100
                                "
                            />
                        </>
                    ) : (
                        <div
                            className="
                                flex h-full w-full flex-col items-center justify-center gap-2
                                bg-gradient-to-br from-expedition-moss/20
                                via-expedition-forest/15 to-expedition-clay/30
                                sm:gap-3
                            "
                        >
                            <motion.span
                                aria-hidden="true"
                                animate={
                                    shouldReduceMotion
                                        ? undefined
                                        : { y: [0, -5, 0], scale: [1, 1.03, 1] }
                                }
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="text-4xl drop-shadow-sm sm:text-5xl"
                            >
                                {emoji}
                            </motion.span>

                            <span className="font-display text-xs font-medium text-muted-foreground">
                                {categoryLabel}
                            </span>
                        </div>
                    )}

                    {/* TOP ROW — one flex row, so category and rating can never overlap */}
                    <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3 sm:p-4">
                        <Badge
                            variant="secondary"
                            className="
                                min-w-0 max-w-full border border-white/20 bg-black/40
                                px-2 py-1 text-[11px] text-white shadow-lg
                                shadow-black/10 backdrop-blur-xl sm:px-2.5 sm:py-1.5 sm:text-xs
                            "
                        >
                            <span aria-hidden="true" className="mr-1.5 shrink-0">
                                {emoji}
                            </span>
                            <span className="truncate">{categoryLabel}</span>
                        </Badge>

                        {hasRating && (
                            <div
                                className="
                                    flex shrink-0 items-center gap-1 rounded-full
                                    border border-white/20 bg-black/40 px-2 py-1
                                    text-[11px] font-semibold text-white shadow-lg
                                    shadow-black/10 backdrop-blur-xl
                                    sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-xs
                                "
                            >
                                <Star
                                    className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400 sm:h-3.5 sm:w-3.5"
                                    aria-hidden="true"
                                />
                                <span>{tour.averageRating?.toFixed(1)}</span>
                                {tour.totalReviews > 0 && (
                                    <span className="font-normal text-white/60">
                                        ({tour.totalReviews})
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* FEATURED */}
                    {tour.featured && (
                        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
                            <span
                                className="
                                    inline-flex max-w-full items-center rounded-full
                                    border border-white/20 bg-expedition-clay/90
                                    px-2.5 py-1 text-[10px] font-bold uppercase
                                    tracking-[0.14em] text-white shadow-lg
                                    backdrop-blur-md sm:px-3 sm:py-1.5
                                "
                            >
                                <span className="truncate">Featured journey</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* ========================================
                    CONTENT
                ======================================== */}
                <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6">
                    {/* Destination */}
                    <div className="flex min-w-0 items-center gap-1.5">
                        <MapPin
                            className="h-3.5 w-3.5 shrink-0 text-accent"
                            aria-hidden="true"
                        />
                        <p className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            {tour.destination}
                        </p>
                    </div>

                    {/* Title — 2 lines reserved so cards align (24px / 28px line height) */}
                    <h3
                        className="
                            mt-2 line-clamp-2 min-h-[3rem] break-words
                            font-display text-lg font-semibold leading-6
                            tracking-tight text-foreground transition-colors
                            duration-300 group-hover:text-accent
                            sm:mt-2.5 sm:min-h-[3.5rem] sm:text-xl sm:leading-7
                        "
                    >
                        {tour.name}
                    </h3>

                    {/* Description — 2 lines reserved (leading-6 = 24px) */}
                    <div className="min-h-[3rem] min-w-0">
                        {tour.shortDescription && (
                            <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-muted-foreground sm:mt-2.5">
                                {tour.shortDescription}
                            </p>
                        )}
                    </div>

                    {/* Metadata */}
                    <div className="mt-3 flex min-w-0 flex-wrap gap-1.5 sm:mt-4">
                        <Badge
                            variant={DIFFICULTY_VARIANT[tour.difficulty]}
                            className="max-w-full truncate px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
                        >
                            {DIFFICULTY_LABELS[tour.difficulty]}
                        </Badge>

                        <Badge
                            variant="outline"
                            className="max-w-full gap-1.5 truncate px-2.5 py-1 text-[10px] font-medium"
                        >
                            <Clock3 className="h-3 w-3 shrink-0" aria-hidden="true" />
                            <span className="truncate">{tour.formattedDuration}</span>
                        </Badge>
                    </div>

                    <div className="my-4 h-px bg-border/70 sm:my-5" />

                    {/* ========================================
                        FOOTER
                        flex-wrap = if price + actions don't fit on one line
                        (narrow phone OR narrow carousel slide) the actions drop
                        to their own line instead of overflowing.
                    ======================================== */}
                    <div className="mt-auto flex min-w-0 flex-wrap items-end justify-between gap-x-3 gap-y-3">
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                From
                            </p>

                            <p className="mt-0.5 whitespace-nowrap font-display text-lg font-semibold tracking-tight text-foreground sm:text-2xl">
                                {tour.currency ?? "KES"} {formattedPrice}
                            </p>

                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                per person
                            </p>
                        </div>

                        <div className="flex grow basis-36 items-center justify-end gap-2">
                            {tour.active && (
                                // Above the link layer so the button stays clickable
                                <div className="relative z-20">
                                    <EnquiryModal tourSummary={tour} source="tour-card-enquire" />
                                </div>
                            )}

                            {/* Explore: real link, sits above the card's stretched link */}
                            <Link
                                href={`/tour/${tour.slug}`}
                                aria-label={`Explore ${tour.name}`}
                                className="
                                    relative z-10
                                    inline-flex h-9 shrink-0 items-center justify-center gap-1.5
                                    rounded-full border border-border bg-background px-3
                                    text-xs font-semibold text-foreground shadow-sm
                                    transition-all duration-300
                                    group-hover:border-accent/40 group-hover:bg-accent
                                    group-hover:text-accent-foreground group-hover:shadow-md
                                    sm:px-4
                                "
                            >
                                <span className="hidden sm:inline">Explore</span>
                                <ArrowUpRight
                                    aria-hidden="true"
                                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}