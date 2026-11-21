"use client";

import { motion } from "framer-motion";
import {
    Check,
    MapPin,
    MessageSquarePlus,
    Search,
    Sparkles,
    X,
} from "lucide-react";

import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { TourSummary } from "@/types/tour";

type HeaderTour = Pick<TourSummary, "id" | "name" | "destination">;

interface EnquiryModalHeaderProps {
    selectedTour: HeaderTour | null;
    /** False when the modal was opened for one specific tour. */
    canChangeTour: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    showSearch: boolean;
    onChangeTour: () => void;
    onClose: () => void;
}

/**
 * Layout (phones): every element is in normal flow, nothing is absolutely
 * positioned over text.
 *
 *   [ ✦ STEP 1 OF 2 · CHOOSE TOUR ............ (X) ]
 *   [ ▬▬▬▬▬▬▬▬▬▬▬▬  ▬▬▬▬▬▬▬▬▬▬▬▬ ]
 *   [ Plan your trip                              ]
 *   [ short description (max 2 lines)             ]
 *   [ 🔍 Search…                                  ]
 */
export function EnquiryModalHeader({
                                       selectedTour,
                                       canChangeTour,
                                       search,
                                       onSearchChange,
                                       showSearch,
                                       onChangeTour,
                                       onClose,
                                   }: EnquiryModalHeaderProps) {
    const isTwoStep = canChangeTour;
    const step = selectedTour ? 2 : 1;

    const eyebrow = !isTwoStep
        ? "Your safari enquiry"
        : step === 1
            ? "Step 1 of 2 · Choose tour"
            : "Step 2 of 2 · Your details";

    return (
        <div className="relative isolate shrink-0 overflow-hidden bg-gradient-to-br from-[#123D32] via-[#0F3329] to-[#0B2A22] text-white">
            {/* Backdrop: dots + glow everywhere, rings only on larger screens */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                <div
                    className="absolute inset-0 opacity-[0.1]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
                        backgroundSize: "22px 22px",
                    }}
                />
                <div className="absolute -right-16 -top-20 hidden h-52 w-52 rounded-full border border-white/10 sm:block" />
                <div className="absolute -right-4 -top-8 hidden h-32 w-32 rounded-full border border-white/10 sm:block" />
                <div className="absolute -bottom-16 left-1/4 h-36 w-36 rounded-full bg-coral/20 blur-3xl sm:h-44 sm:w-44" />
            </div>

            <DialogHeader className="space-y-0 px-4 pb-4 pt-3 text-left sm:px-6 sm:pb-6 sm:pt-5">
                {/* Top row: label + close (in flow, never overlaps) */}
                <div className="flex items-center justify-between gap-3">
                    <p className="flex min-w-0 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
                        <Sparkles className="h-3.5 w-3.5 shrink-0 text-coral" aria-hidden="true" />
                        <span className="truncate">{eyebrow}</span>
                    </p>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="-mr-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/90 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral sm:mr-0"
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                {isTwoStep && (
                    <div
                        className="mt-2.5 flex items-center gap-1.5"
                        role="progressbar"
                        aria-valuemin={1}
                        aria-valuemax={2}
                        aria-valuenow={step}
                        aria-label="Enquiry progress"
                    >
                        <span className="h-1 flex-1 rounded-full bg-coral" />
                        <span
                            className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                                step === 2 ? "bg-coral" : "bg-white/20"
                            }`}
                        />
                    </div>
                )}

                {/* Title block. Icon tile is hidden on phones to save width/height */}
                <div className="mt-4 flex items-start gap-3">
                    <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 sm:flex">
                        <MessageSquarePlus className="h-5 w-5 text-coral" aria-hidden="true" />
                    </span>

                    <div className="min-w-0 flex-1">
                        <DialogTitle className="font-display text-xl font-semibold leading-tight tracking-tight text-white sm:text-2xl">
                            {selectedTour ? "Make an enquiry" : "Plan your trip"}
                        </DialogTitle>

                        <DialogDescription className="mt-1 line-clamp-2 text-[13px] leading-5 text-white/65 sm:text-sm sm:leading-6">
                            {selectedTour
                                ? "Tell us about your trip and we'll plan the details."
                                : "Pick a tour you like and we'll help with the rest."}
                        </DialogDescription>
                    </div>
                </div>

                {/* Step 1: search */}
                {!selectedTour && showSearch && (
                    <div className="relative mt-4">
                        <Search
                            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
                            aria-hidden="true"
                        />

                        {/* text-base on phones prevents iOS zoom-on-focus */}
                        <Input
                            type="text"
                            inputMode="search"
                            enterKeyHint="search"
                            autoComplete="off"
                            value={search}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder="Search tours or destinations"
                            aria-label="Search tours"
                            className="h-12 rounded-xl border-white/15 bg-white/10 pl-10 pr-11 text-base text-white placeholder:text-white/45 focus-visible:border-coral/60 focus-visible:ring-coral/40 focus-visible:ring-offset-0 sm:h-11 sm:text-sm"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => onSearchChange("")}
                                aria-label="Clear search"
                                className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                            >
                                <X className="h-4 w-4" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                )}

                {/* Step 2: chosen tour */}
                {selectedTour && (
                    <motion.div
                        key={selectedTour.id}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 flex min-w-0 items-center gap-2.5 rounded-2xl border border-white/15 bg-white/[0.08] p-2.5"
                    >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-coral/20 text-coral">
                            <Check className="h-4 w-4" aria-hidden="true" />
                        </span>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">
                                {selectedTour.name}
                            </p>

                            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/60">
                                <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                                <span className="truncate">{selectedTour.destination}</span>
                            </p>
                        </div>

                        {canChangeTour && (
                            <button
                                type="button"
                                onClick={onChangeTour}
                                className="shrink-0 rounded-full border border-white/20 px-3 py-2 text-[11px] font-semibold text-white/90 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                            >
                                Change
                            </button>
                        )}
                    </motion.div>
                )}
            </DialogHeader>
        </div>
    );
}