"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Compass, MessageSquarePlus, Search, ShieldCheck } from "lucide-react";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EnquiryForm } from "@/components/landing/enquiry/enquiry-form";
import { tourApi } from "@/lib/tour-api";
import type { TourPublic, TourSummary } from "@/types/tour";

import { EnquiryModalHeader } from "./enquiry-modal-header";
import { ModalLoading, ModalMessage } from "./enquiry-modal-states";
import { EnquiryTourPicker } from "./enquiry-tour-picker";

type EnquiryTarget = TourSummary | TourPublic;
type LoadStatus = "idle" | "loading" | "ready" | "error";

interface EnquiryModalProps {
    /** Custom trigger. Falls back to the default Enquire button. */
    children?: React.ReactNode;

    /** Analytics/source identifier passed to EnquiryForm. */
    source?: string;

    /**
     * Full tour object (tour detail page). The modal opens straight
     * on the enquiry form for this tour.
     */
    tour?: TourPublic;

    /**
     * Lightweight tour object (cards/lists). Used as-is for the form;
     * no extra fetch is made.
     */
    tourSummary?: TourSummary;
}

function priceOf(t: EnquiryTarget) {
    return "pricePerPerson" in t ? t.pricePerPerson : (t.price ?? undefined);
}

export function EnquiryModal({
                                 children,
                                 source = "nav-enquire-modal",
                                 tour,
                                 tourSummary,
                             }: EnquiryModalProps) {
    const [open, setOpen] = useState(false);
    const [tours, setTours] = useState<TourSummary[]>([]);
    const [status, setStatus] = useState<LoadStatus>("idle");
    const [search, setSearch] = useState("");
    const [picked, setPicked] = useState<TourSummary | null>(null);

    const preset: EnquiryTarget | null = tour ?? tourSummary ?? null;
    const hasPreset = preset !== null;
    const selectedTour: EnquiryTarget | null = picked ?? preset;

    /* ---------- data ---------- */

    const loadTours = useCallback(async () => {
        setStatus("loading");

        try {
            const data = await tourApi.getTours({ size: 100 });
            setTours(data.content ?? []);
            setStatus("ready");
        } catch {
            setTours([]);
            setStatus("error");
        }
    }, []);

    // Load the picker list once, only when it's actually needed
    useEffect(() => {
        if (open && !hasPreset && status === "idle") {
            void loadTours();
        }
    }, [open, hasPreset, status, loadTours]);

    const filteredTours = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return tours;

        return tours.filter((item) =>
            `${item.name} ${item.destination} ${item.category}`
                .toLowerCase()
                .includes(query),
        );
    }, [search, tours]);

    /* ---------- handlers ---------- */

    function handleOpenChange(next: boolean) {
        setOpen(next);

        if (!next) {
            setSearch("");
            setPicked(null);
        }
    }

    function handleChangeTour() {
        if (!hasPreset) setPicked(null);
    }

    /* ---------- body ---------- */

    function renderBody() {
        if (selectedTour) {
            return (
                <motion.div
                    key={`form-${selectedTour.id}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="px-4 py-5 sm:px-6 sm:py-6"
                >
                    <EnquiryForm
                        tourId={selectedTour.id}
                        tourName={selectedTour.name}
                        pricePerPerson={priceOf(selectedTour)}
                        currency={selectedTour.currency ?? undefined}
                        source={source}
                        hideTourContext
                        hideTrustNote
                        onSuccess={() => handleOpenChange(false)}
                    />
                </motion.div>
            );
        }

        if (status === "idle" || status === "loading") {
            return <ModalLoading key="loading" title="Finding available tours" />;
        }

        if (status === "error") {
            return (
                <ModalMessage
                    key="error"
                    tone="danger"
                    icon={AlertTriangle}
                    title="We couldn't load the tours"
                    description="Please check your connection and try again."
                    action={
                        <Button
                            type="button"
                            variant="outline"
                            className="h-10 rounded-xl"
                            onClick={() => void loadTours()}
                        >
                            Try again
                        </Button>
                    }
                />
            );
        }

        if (tours.length === 0) {
            return (
                <ModalMessage
                    key="empty"
                    icon={Compass}
                    title="No tours available"
                    description="There aren't any tours open for enquiry right now. Please check back soon."
                />
            );
        }

        if (filteredTours.length === 0) {
            return (
                <ModalMessage
                    key="no-results"
                    compact
                    icon={Search}
                    title="No matching tours"
                    description="Try another tour name or destination."
                    action={
                        <Button
                            type="button"
                            variant="outline"
                            className="h-10 rounded-xl"
                            onClick={() => setSearch("")}
                        >
                            Clear search
                        </Button>
                    }
                />
            );
        }

        return (
            <EnquiryTourPicker
                key="tour-list"
                tours={filteredTours}
                onSelect={setPicked}
            />
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children ?? (
                    <Button
                        variant="accent"
                        size="sm"
                        className="gap-2 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                    >
                        <MessageSquarePlus className="h-4 w-4" />
                        Enquire
                    </Button>
                )}
            </DialogTrigger>

            {/*
              Phones : full-screen sheet.
              ≥ sm   : centred rounded card.
              The dialog's built-in close button is hidden ([&>button]:hidden);
              the header renders its own X in normal flow so it can never
              overlap the title or label.
            */}
            <DialogContent
                className="
                    flex h-[100dvh] w-full max-w-none flex-col gap-0 overflow-hidden
                    rounded-none border-0 bg-background p-0 shadow-2xl
                    sm:h-auto sm:max-h-[min(780px,92dvh)] sm:max-w-[560px]
                    sm:rounded-3xl sm:border sm:border-border/60
                    lg:max-w-[620px]
                    [&>button]:hidden
                "
            >
                <EnquiryModalHeader
                    selectedTour={selectedTour}
                    canChangeTour={!hasPreset}
                    search={search}
                    onSearchChange={setSearch}
                    showSearch={status === "ready" && tours.length > 0}
                    onChangeTour={handleChangeTour}
                    onClose={() => handleOpenChange(false)}
                />

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                    <AnimatePresence mode="wait" initial={false}>
                        {renderBody()}
                    </AnimatePresence>
                </div>

                <div className="shrink-0 border-t border-border/60 bg-background px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-3.5">
                    <div className="flex items-center justify-center gap-3 sm:justify-between">
                        <p className="flex items-center gap-2 text-[11px] leading-4 text-muted-foreground">
                            <ShieldCheck
                                className="h-4 w-4 shrink-0 text-emerald-600"
                                aria-hidden="true"
                            />
                            Your details are handled securely.
                        </p>

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenChange(false)}
                            className="hidden h-9 shrink-0 rounded-full px-4 sm:inline-flex"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}