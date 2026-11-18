"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
    ArrowLeft,
    CalendarDays,
    Clock3,
    Gauge,
    MapPin,
    MessageSquarePlus,
    Share2,
    ShieldCheck,
    Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EnquiryModal } from "@/components/landing/enquiry/enquiry-modal";
import { availabilityApi, type AvailabilitySummary } from "@/lib/availability-api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DIFFICULTY_LABELS, type TourPublic } from "@/types/tour";

const DIFFICULTY_VARIANT = {
    EASY: "success",
    MODERATE: "secondary",
    CHALLENGING: "warning",
    STRENUOUS: "destructive",
} as const;

function Fact({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-border/70 bg-card p-4">
            <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {label}
            </p>
            <p className="mt-1 text-sm font-semibold">{value}</p>
        </div>
    );
}

export function TourDetailView({ tour }: { tour: TourPublic }) {
    const currency = tour.currency ?? "KES";
    const [dates, setDates] = useState<AvailabilitySummary[] | null>(null);
    const [datesError, setDatesError] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        availabilityApi
            .getUpcomingAvailability(tour.id)
            .then((d) => !cancelled && setDates(d))
            .catch(() => !cancelled && (setDatesError(true), setDates([])));
        return () => {
            cancelled = true;
        };
    }, [tour.id]);

    const selected = dates?.find((d) => d.id === selectedId) ?? null;
    const price = selected?.effectivePrice ?? tour.pricePerPerson;

    async function share() {
        const url = window.location.href;
        try {
            if (navigator.share) await navigator.share({ title: tour.name, url });
            else {
                await navigator.clipboard.writeText(url);
                toast.success("Link copied.");
            }
        } catch {
            /* user dismissed the share sheet */
        }
    }

    const enquireButton = (
        <Button variant="accent" size="lg" className="h-12 w-full gap-2 rounded-xl font-semibold">
            <MessageSquarePlus className="h-4 w-4" />
            Enquire about this tour
        </Button>
    );

    return (
        <main className="pb-28 lg:pb-0">
            {/* Hero */}
            <section className="relative isolate flex min-h-[360px] items-end overflow-hidden bg-gradient-to-br from-gray-950 via-[#102f3d] to-[#0b4657] sm:min-h-[460px]">
                {tour.coverImageUrl && (
                    <img
                        src={tour.coverImageUrl}
                        alt={tour.name}
                        className="absolute inset-0 -z-10 h-full w-full object-cover"
                    />
                )}
                <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

                <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-24 sm:px-6">
                    <Link
                        href="/tours"
                        className="group inline-flex items-center gap-1.5 text-xs font-medium text-white/70 transition-colors hover:text-white"
                    >
                        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                        All tours
                    </Link>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        {tour.featured && (
                            <span className="rounded-full bg-coral px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                                Featured journey
                            </span>
                        )}
                        <Badge
                            variant={DIFFICULTY_VARIANT[tour.difficulty]}
                            className="text-[10px] font-semibold uppercase tracking-wide"
                        >
                            {DIFFICULTY_LABELS[tour.difficulty]}
                        </Badge>
                    </div>

                    <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
                        {tour.name}
                    </h1>
                    {tour.tagline && (
                        <p className="mt-3 max-w-2xl text-sm text-white/75 sm:text-lg">{tour.tagline}</p>
                    )}
                    <p className="mt-4 flex items-center gap-1.5 text-sm text-white/70">
                        <MapPin className="h-4 w-4 text-coral" aria-hidden="true" />
                        {tour.destination}
                    </p>
                </div>
            </section>

            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px]">
                {/* Left column */}
                <div className="min-w-0 space-y-12">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <Fact
                            icon={Clock3}
                            label="Duration"
                            value={`${tour.durationDays} ${tour.durationDays === 1 ? "day" : "days"}`}
                        />
                        <Fact icon={Users} label="Group size" value={`Up to ${tour.maxGroupSize}`} />
                        <Fact icon={Gauge} label="Difficulty" value={DIFFICULTY_LABELS[tour.difficulty]} />
                        <Fact icon={MapPin} label="Destination" value={tour.destination} />
                    </div>

                    {tour.description && (
                        <section>
                            <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                                About this journey
                            </h2>
                            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                                {tour.description}
                            </p>
                        </section>
                    )}

                    {/* Dates */}
                    <section>
                        <h2 className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight sm:text-2xl">
                            <CalendarDays className="h-5 w-5 text-accent" aria-hidden="true" />
                            Upcoming dates
                        </h2>

                        {dates === null ? (
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
                                ))}
                            </div>
                        ) : dates.length === 0 ? (
                            <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
                                {datesError
                                    ? "We couldn't load dates right now."
                                    : "No open dates are published yet. Send an enquiry and we'll find one that suits you."}
                            </div>
                        ) : (
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {dates.map((d) => {
                                    const active = d.id === selectedId;
                                    const low = d.availableSlots <= 3;
                                    return (
                                        <button
                                            key={d.id}
                                            type="button"
                                            onClick={() => setSelectedId(active ? null : d.id)}
                                            aria-pressed={active}
                                            className={[
                                                "rounded-2xl border p-4 text-left transition-all",
                                                active
                                                    ? "border-coral bg-coral/[0.06] shadow-sm ring-1 ring-coral/30"
                                                    : "border-border/70 bg-card hover:-translate-y-0.5 hover:border-coral/40 hover:shadow-md",
                                            ].join(" ")}
                                        >
                                            <p className="text-sm font-semibold">
                                                {formatDate(d.date, {
                                                    weekday: "short",
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {formatCurrency(d.effectivePrice, currency)} per person
                                            </p>
                                            <p className={`mt-2 text-xs font-medium ${low ? "text-amber-600" : "text-emerald-600"}`}>
                                                {low
                                                    ? `Only ${d.availableSlots} spot${d.availableSlots === 1 ? "" : "s"} left`
                                                    : `${d.availableSlots} spots available`}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Add itinerary / inclusions / gallery sections here once TourPublic exposes them */}
                </div>

                {/* Booking card (desktop) */}
                <aside className="hidden lg:block">
                    <div className="sticky top-24 space-y-4 rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                {selected ? "Price for selected date" : "From"}
                            </p>
                            <p className="mt-1 font-display text-3xl font-semibold tracking-tight">
                                {formatCurrency(price, currency)}
                            </p>
                            <p className="text-xs text-muted-foreground">per person</p>
                        </div>

                        {selected && (
                            <div className="rounded-xl bg-muted/50 px-3 py-2 text-xs">
                                <span className="font-semibold">
                                    {formatDate(selected.date, { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                                {selected.bookingDeadline && (
                                    <span className="text-muted-foreground">
                                        {" "}· book by{" "}
                                        {formatDate(selected.bookingDeadline, { month: "short", day: "numeric" })}
                                    </span>
                                )}
                            </div>
                        )}

                        <EnquiryModal tour={tour} source="tour-detail-enquire">
                            {enquireButton}
                        </EnquiryModal>

                        <Button variant="outline" className="w-full gap-2 rounded-xl" onClick={share}>
                            <Share2 className="h-4 w-4" />
                            Share this tour
                        </Button>

                        <ul className="space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Reply within 2 hours
                            </li>
                            <li className="flex items-center gap-2">
                                <ShieldCheck className="h-3.5 w-3.5 text-accent" /> No obligation to book
                            </li>
                        </ul>
                    </div>
                </aside>
            </div>

            {/* Sticky action bar (mobile) */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
                <div className="mx-auto flex max-w-xl items-center gap-3">
                    <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {selected ? "Selected date" : "From"}
                        </p>
                        <p className="truncate font-display text-lg font-semibold">
                            {formatCurrency(price, currency)}
                        </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl" onClick={share} aria-label="Share">
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <EnquiryModal tour={tour} source="tour-detail-mobile-bar">
                            <Button variant="accent" size="lg" className="h-12 gap-2 rounded-xl px-6 font-semibold">
                                <MessageSquarePlus className="h-4 w-4" />
                                Enquire
                            </Button>
                        </EnquiryModal>
                    </div>
                </div>
            </div>
        </main>
    );
}