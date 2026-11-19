"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { TourCard } from "./tour-card";
import type { TourSummary } from "@/types/tour";

interface PremiumTourCarouselProps {
    tours: TourSummary[];
    title?: string;
    subtitle?: string;
}

const AUTOPLAY_MS = 5500;

export function PremiumTourCarousel({
                                        tours,
                                        title = "Featured Safaris",
                                        subtitle = "Curated journeys across East Africa",
                                    }: PremiumTourCarouselProps) {
    const shouldReduceMotion = useReducedMotion();

    const [selected, setSelected] = React.useState(0);
    const [snapCount, setSnapCount] = React.useState(tours.length);
    const pausedRef = React.useRef(false);

    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        dragFree: false,
        loop: true,
    });

    // Selected dot + real number of snap points
    React.useEffect(() => {
        if (!emblaApi) return;

        const update = () => {
            setSelected(emblaApi.selectedScrollSnap());
            setSnapCount(emblaApi.scrollSnapList().length);
        };

        update();
        emblaApi.on("select", update);
        emblaApi.on("reInit", update);

        return () => {
            emblaApi.off("select", update);
            emblaApi.off("reInit", update);
        };
    }, [emblaApi]);

    // Autoplay — pauses while the user is touching / hovering / focused,
    // and is off entirely for reduced-motion users.
    React.useEffect(() => {
        if (!emblaApi || shouldReduceMotion) return;

        let resumeTimer: ReturnType<typeof setTimeout> | undefined;

        const pause = () => {
            pausedRef.current = true;
            if (resumeTimer) clearTimeout(resumeTimer);
        };
        const resumeSoon = () => {
            if (resumeTimer) clearTimeout(resumeTimer);
            resumeTimer = setTimeout(() => {
                pausedRef.current = false;
            }, AUTOPLAY_MS);
        };

        emblaApi.on("pointerDown", pause);
        emblaApi.on("pointerUp", resumeSoon);

        const interval = setInterval(() => {
            if (!pausedRef.current) emblaApi.scrollNext();
        }, AUTOPLAY_MS);

        return () => {
            clearInterval(interval);
            if (resumeTimer) clearTimeout(resumeTimer);
            emblaApi.off("pointerDown", pause);
            emblaApi.off("pointerUp", resumeSoon);
        };
    }, [emblaApi, shouldReduceMotion]);

    return (
        <section
            onMouseEnter={() => (pausedRef.current = true)}
            onMouseLeave={() => (pausedRef.current = false)}
            onFocusCapture={() => (pausedRef.current = true)}
            onBlurCapture={() => (pausedRef.current = false)}
            className="
                relative overflow-hidden rounded-3xl border border-white/10
                bg-white/[0.04] p-3 backdrop-blur-2xl
                shadow-[0_20px_80px_rgba(0,0,0,0.35)]
                sm:rounded-[32px] sm:p-6 lg:rounded-[36px] lg:p-8
            "
        >
            <div
                aria-hidden="true"
                className="
                    pointer-events-none absolute inset-0
                    bg-[radial-gradient(circle_at_top_right,rgba(255,115,0,.15),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,.15),transparent_35%)]
                "
            />

            {/* Header */}
            <header className="relative z-10 mb-5 grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 sm:mb-8 sm:gap-x-6">
                {/* Eyebrow + title */}
                <div className="col-start-1 row-start-1 min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground sm:text-xs sm:tracking-[0.25em]">
                        Premium Collection
                    </p>

                    <h2 className="mt-1.5 text-balance text-2xl font-bold leading-tight tracking-tight sm:mt-2 sm:text-3xl">
                        {title}
                    </h2>
                </div>

                {/* Subtitle: full width on phones, under the title from sm up */}
                <p className="col-span-2 col-start-1 row-start-2 max-w-xl text-sm leading-6 text-muted-foreground sm:col-span-1 sm:text-base">
                    {subtitle}
                </p>

                {/* Action: compact pill on phones, full button from sm up */}
                <Link
                    href="/tour"
                    className="
                        group col-start-2 row-start-1 inline-flex h-10 shrink-0
                        items-center gap-1.5 self-end whitespace-nowrap rounded-full
                        bg-coral px-4 text-sm font-semibold text-white shadow-sm
                        shadow-coral/20 transition-all duration-300
                        hover:-translate-y-0.5 hover:shadow-md hover:shadow-coral/30
                        active:scale-[0.97]
                        focus-visible:outline-none focus-visible:ring-2
                        focus-visible:ring-coral focus-visible:ring-offset-2
                        sm:row-span-2 sm:h-12 sm:gap-2 sm:px-7
                    "
                >
                    <span className="sm:hidden">View all</span>
                    <span className="hidden sm:inline">View all tours</span>

                    <ArrowRight
                        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                        aria-hidden="true"
                    />
                </Link>
            </header>

            {/* Viewport + edge fades (fades live here so they never cover the header) */}
            <div className="relative z-10">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-12 bg-gradient-to-r from-background/70 to-transparent sm:block lg:w-24"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-12 bg-gradient-to-l from-background/70 to-transparent sm:block lg:w-24"
                />

                {/* py/-my gives hover-lift and shadows room before overflow clips */}
                <div ref={emblaRef} className="-my-4 overflow-hidden py-4">
                    {/* Negative margin + slide padding instead of `gap` — Embla's recommended pattern */}
                    <div className="-ml-4 flex touch-pan-y sm:-ml-6">
                        {tours.map((tour) => (
                            <div
                                key={tour.id}
                                className="
                                    min-w-0 flex-[0_0_100%] pl-4
                                    sm:flex-[0_0_62%] sm:pl-6
                                    lg:flex-[0_0_40%]
                                    xl:flex-[0_0_32%]
                                "
                            >
                                <TourCard tour={tour} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dots — 24px touch targets around the small visual dot */}
            {snapCount > 1 && (
                <div className="relative z-10 mt-4 flex flex-wrap justify-center sm:mt-6">
                    {Array.from({ length: snapCount }).map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => emblaApi?.scrollTo(index)}
                            aria-label={`Go to slide ${index + 1}`}
                            aria-current={selected === index}
                            className="group/dot p-1.5"
                        >
                            <span
                                className={`block h-2 rounded-full transition-all duration-300 ${
                                    selected === index
                                        ? "w-8 bg-primary"
                                        : "w-2 bg-muted group-hover/dot:bg-muted-foreground/50"
                                }`}
                            />
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
}