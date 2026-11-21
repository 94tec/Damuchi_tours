"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock3, MapPin } from "lucide-react";

import { CATEGORY_EMOJI, type TourSummary } from "@/types/tour";

interface EnquiryTourPickerProps {
    tours: TourSummary[];
    onSelect: (tour: TourSummary) => void;
}

export function EnquiryTourPicker({ tours, onSelect }: EnquiryTourPickerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="px-4 py-4 sm:px-6 sm:py-5"
        >
            <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Available tours
                </p>

                <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold tabular-nums text-muted-foreground">
                    {tours.length} {tours.length === 1 ? "option" : "options"}
                </span>
            </div>

            <ul className="grid gap-2.5">
                {tours.map((tour) => (
                    <li key={tour.id}>
                        <TourOption tour={tour} onSelect={onSelect} />
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}

function TourOption({
                        tour,
                        onSelect,
                    }: {
    tour: TourSummary;
    onSelect: (tour: TourSummary) => void;
}) {
    const emoji = CATEGORY_EMOJI[tour.category];
    const hasPrice = typeof tour.price === "number" && tour.price > 0;

    return (
        <button
            type="button"
            onClick={() => onSelect(tour)}
            className="
                group flex w-full items-center gap-3 rounded-2xl border
                border-border/70 bg-card p-2.5 text-left shadow-sm
                transition-all duration-300
                hover:-translate-y-0.5 hover:border-coral/30 hover:shadow-lg
                hover:shadow-foreground/[0.05] active:scale-[0.99]
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-coral focus-visible:ring-offset-2
                sm:gap-4 sm:p-3
            "
        >
            {/* Thumbnail */}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#123D32] via-[#0F3329] to-[#0B2A22] sm:h-[4.5rem] sm:w-[4.5rem]">
                {tour.coverImageUrl ? (
                    <img
                        src={tour.coverImageUrl}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <span
                        aria-hidden="true"
                        className="flex h-full w-full items-center justify-center text-2xl"
                    >
                        {emoji}
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-display text-[15px] font-semibold leading-snug tracking-tight transition-colors group-hover:text-coral">
                    {tour.name}
                </p>

                <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0 text-coral" aria-hidden="true" />
                    <span className="truncate">{tour.destination}</span>
                </p>

                {(hasPrice || tour.formattedDuration) && (
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                        {hasPrice && (
                            <span className="font-semibold text-foreground">
                                {tour.currency ?? "KES"}{" "}
                                {tour.price.toLocaleString("en-KE")}
                            </span>
                        )}

                        {tour.formattedDuration && (
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <Clock3 className="h-3 w-3" aria-hidden="true" />
                                {tour.formattedDuration}
                            </span>
                        )}
                    </p>
                )}
            </div>

            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/70 sm:h-9 sm:w-9 text-muted-foreground transition-all group-hover:border-coral group-hover:bg-coral group-hover:text-white">
                <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                />
            </span>
        </button>
    );
}