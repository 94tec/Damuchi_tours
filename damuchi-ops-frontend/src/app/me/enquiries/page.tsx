
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    ArrowDownToLine,
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    Check,
    CheckCircle2,
    Clock3,
    Inbox,
    Mail,
    MapPin,
    MessageCircle,
    RefreshCw,
    Send,
    Sparkles,
    Users,
    Wallet,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { enquiryApi } from "@/lib/enquiry-api";

import type {
    EnquiryDetailResponse,
    EnquirySummaryResponse,
    QuoteResponse,
    TourEnquiryStatus,
} from "@/types/enquiry-types";

import type { ApiError } from "@/types/index-types";

/* ============================================================
   CONFIGURATION
============================================================ */

const PAGE_SIZE = 12;

const FILTERABLE_STATUSES: TourEnquiryStatus[] = [
    "NEW",
    "CONTACTED",
    "QUOTED",
    "CONVERTED",
    "COMPLETED",
    "LOST",
];

const STATUS_COPY: Record<
    TourEnquiryStatus,
    { label: string; description: string }
> = {
    NEW: {
        label: "Received",
        description: "We've received your enquiry and will be in touch shortly.",
    },
    CONTACTED: {
        label: "In conversation",
        description: "A safari specialist is working on your trip.",
    },
    QUOTED: {
        label: "Quote ready",
        description: "Your personalised quote is ready to review.",
    },
    CONVERTED: {
        label: "Booked",
        description: "Your trip is confirmed. We can't wait to host you.",
    },
    COMPLETED: {
        label: "Completed",
        description: "We hope you had an unforgettable journey.",
    },
    LOST: {
        label: "Closed",
        description: "This enquiry is no longer active.",
    },
    ARCHIVED: {
        label: "Archived",
        description: "This enquiry has been archived.",
    },
};

const STATUS_STYLES: Record<TourEnquiryStatus, string> = {
    NEW: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-400",
    CONTACTED:
        "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-400",
    QUOTED:
        "border-coral/30 bg-coral/10 text-coral dark:border-coral/30 dark:bg-coral/10",
    CONVERTED:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-400",
    COMPLETED:
        "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/60 dark:bg-teal-950/30 dark:text-teal-400",
    LOST:
        "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400",
    ARCHIVED:
        "border-border bg-muted text-muted-foreground",
};

const STATUS_ICONS: Record<TourEnquiryStatus, React.ElementType> = {
    NEW: Inbox,
    CONTACTED: Clock3,
    QUOTED: Send,
    CONVERTED: Sparkles,
    COMPLETED: CheckCircle2,
    LOST: XCircle,
    ARCHIVED: XCircle,
};

/* ============================================================
   HELPERS
============================================================ */

function getApiErrorMessage(err: unknown, fallback: string) {
    return (err as ApiError)?.message || fallback;
}

function formatDate(iso?: string) {
    if (!iso) return "—";

    const date = new Date(iso);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatAmount(amount: number, currency: string) {
    return `${currency} ${Number(amount || 0).toLocaleString()}`;
}

async function handleDownloadQuotePdf(
    enquiryId: string,
    quoteId: string,
) {
    try {
        const blob = await enquiryApi.downloadQuotePdf(
            enquiryId,
            quoteId,
            true,
        );

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = `quote-${quoteId}.pdf`;

        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();

        window.setTimeout(() => URL.revokeObjectURL(url), 1000);

        toast.success("Your quote PDF has been downloaded.");
    } catch (err) {
        toast.error(
            getApiErrorMessage(err, "Couldn't download your quote PDF."),
        );
    }
}

/**
 * The parent app/me/layout.tsx owns the shared Navbar,
 * account navigation, page container and Footer.
 *
 * Customer pages must only render their own content.
 */
function PageShell({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }: { status: TourEnquiryStatus }) {
    const Icon = STATUS_ICONS[status] ?? Inbox;

    return (
        <Badge
            variant="outline"
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold tracking-wide ${STATUS_STYLES[status]}`}
        >
            <Icon className="h-3 w-3" />
            {STATUS_COPY[status]?.label ?? status}
        </Badge>
    );
}

/* ============================================================
   SECTION LABEL
============================================================ */

function SectionLabel({
                          children,
                          trailing,
                      }: {
    children: React.ReactNode;
    trailing?: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold tracking-tight text-foreground">
                {children}
            </h2>
            {trailing}
        </div>
    );
}

/* ============================================================
   ACCEPT QUOTE DIALOG
============================================================ */

function AcceptQuoteDialog({
                               open,
                               quote,
                               onClose,
                               onAccepted,
                           }: {
    open: boolean;
    quote: QuoteResponse | null;
    onClose: () => void;
    onAccepted: () => void;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleAccept() {
        if (!quote || isSubmitting) return;

        setIsSubmitting(true);

        try {
            await enquiryApi.acceptQuote(quote.enquiryId, quote.id, {
                termsAccepted: true,
            });

            toast.success(
                "Quote accepted. Follow the payment instructions provided by our team.",
            );

            onAccepted();
        } catch (err) {
            toast.error(
                getApiErrorMessage(
                    err,
                    "Couldn't accept the quote. Please try again.",
                ),
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!quote) return null;

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="w-[calc(100%-2rem)] overflow-hidden rounded-2xl p-0 sm:max-w-md">
                <div className="bg-gradient-to-br from-forest-950 via-forest-900 to-emerald-950 px-6 py-6 text-white">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                        <Sparkles className="h-5 w-5 text-coral" />
                    </div>

                    <DialogHeader className="text-left">
                        <DialogTitle className="font-display text-2xl font-semibold text-white">
                            Ready for your adventure?
                        </DialogTitle>
                        <DialogDescription className="mt-2 text-sm leading-6 text-white/70">
                            Review your quote and confirm that you would like
                            to proceed.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                    <div className="rounded-2xl border border-coral/20 bg-coral/[0.06] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-coral">
                            Your quoted total
                        </p>

                        <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
                            {formatAmount(
                                quote.totalPrice,
                                quote.currency,
                            )}
                        </p>

                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                            {formatAmount(
                                quote.pricePerAdult,
                                quote.currency,
                            )}
                            {" / adult"}
                            {quote.pricePerChild
                                ? ` · ${formatAmount(
                                    quote.pricePerChild,
                                    quote.currency,
                                )} / child`
                                : ""}
                        </p>
                    </div>

                    <div className="flex gap-3 rounded-xl border border-border/70 bg-muted/30 p-4">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                        <div>
                            <p className="text-sm font-semibold">
                                Payment terms
                            </p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                By accepting this quote, you confirm that you
                                agree to the quoted price and payment terms.
                                Payment instructions will be provided after
                                acceptance.
                            </p>
                        </div>
                    </div>

                    {quote.validUntil && (
                        <p className="text-center text-xs text-muted-foreground">
                            This quote is valid until{" "}
                            <span className="font-semibold text-foreground">
                                {formatDate(quote.validUntil)}
                            </span>
                        </p>
                    )}

                    <DialogFooter className="flex-col gap-2 sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="w-full rounded-xl sm:w-auto"
                        >
                            Not now
                        </Button>

                        <Button
                            type="button"
                            variant="accent"
                            onClick={handleAccept}
                            disabled={isSubmitting}
                            className="w-full rounded-xl shadow-sm sm:flex-1"
                        >
                            {isSubmitting ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    Accepting…
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4" />
                                    Accept quote
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* ============================================================
   ENQUIRY DETAIL ITEM
============================================================ */

function DetailItem({
                        icon: Icon,
                        label,
                        children,
                    }: {
    icon: React.ElementType;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="min-w-0 rounded-xl border border-border/60 bg-background p-3.5">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-3.5 w-3.5 shrink-0 text-coral" />
                <p className="text-[11px] font-medium">{label}</p>
            </div>

            <div className="mt-2 break-words text-sm font-semibold text-foreground">
                {children}
            </div>
        </div>
    );
}

/* ============================================================
   ENQUIRY DETAIL VIEW
============================================================ */

function EnquiryDetailPanel({
                                detail,
                                onBack,
                                onRefresh,
                            }: {
    detail: EnquiryDetailResponse;
    onBack: () => void;
    onRefresh: () => void;
}) {
    const [acceptingQuote, setAcceptingQuote] =
        useState<QuoteResponse | null>(null);

    const statusInfo = STATUS_COPY[detail.status];
    const latestSentQuote = detail.quotes.find(
        (quote) => quote.status === "SENT",
    );

    const previousQuotes = detail.quotes.filter(
        (quote) => quote.status !== "SENT",
    );

    return (
        <div className="space-y-6">
            <button
                type="button"
                onClick={onBack}
                className="group inline-flex items-center gap-2 rounded-lg py-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background transition-all group-hover:border-coral/40 group-hover:bg-coral/5">
                    <ArrowLeft className="h-4 w-4" />
                </span>
                Back to my enquiries
            </button>

            {/* Detail hero */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-emerald-950 p-5 text-white shadow-lg shadow-forest-950/10 sm:p-7">
                <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -right-5 -top-9 h-36 w-36 rounded-full border border-white/10" />

                <div className="relative">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">
                            <MapPin className="h-3 w-3 text-coral" />
                            Your safari enquiry
                        </span>

                        <StatusBadge status={detail.status} />
                    </div>

                    <h1 className="mt-5 max-w-xl font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                        {detail.tourName}
                    </h1>

                    <p className="mt-2 max-w-lg text-sm leading-6 text-white/65">
                        {statusInfo?.description ??
                            "Track the progress of your safari enquiry."}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/60">
                        <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Submitted {formatDate(detail.createdDate)}
                        </span>

                        {detail.bookingReference && (
                            <span className="font-semibold text-white/80">
                                Ref: {detail.bookingReference}
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* Quote ready */}
            {latestSentQuote && (
                <section className="relative overflow-hidden rounded-2xl border border-coral/25 bg-gradient-to-br from-coral/[0.09] via-background to-background p-5 shadow-sm sm:p-6">
                    <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-coral/[0.06] blur-2xl" />

                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-coral">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Your personalised quote is ready
                                </div>

                                <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                    {formatAmount(
                                        latestSentQuote.totalPrice,
                                        latestSentQuote.currency,
                                    )}
                                </p>

                                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                    {formatAmount(
                                        latestSentQuote.pricePerAdult,
                                        latestSentQuote.currency,
                                    )}
                                    {" / adult"}
                                    {latestSentQuote.pricePerChild
                                        ? ` · ${formatAmount(
                                            latestSentQuote.pricePerChild,
                                            latestSentQuote.currency,
                                        )} / child`
                                        : ""}
                                </p>
                            </div>

                            <Badge
                                variant="outline"
                                className="rounded-full border-coral/30 bg-coral/10 px-3 py-1 text-[10px] font-bold text-coral"
                            >
                                Awaiting response
                            </Badge>
                        </div>

                        {latestSentQuote.inclusionsNote && (
                            <div className="mt-5 rounded-xl border border-border/60 bg-background/75 p-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                                    Quote notes
                                </p>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/80">
                                    {latestSentQuote.inclusionsNote}
                                </p>
                            </div>
                        )}

                        {latestSentQuote.validUntil && (
                            <p className="mt-4 text-xs text-muted-foreground">
                                Valid until{" "}
                                <span className="font-semibold text-foreground">
                                    {formatDate(latestSentQuote.validUntil)}
                                </span>
                            </p>
                        )}

                        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <Button
                                type="button"
                                variant="accent"
                                className="h-11 w-full rounded-xl shadow-sm"
                                onClick={() =>
                                    setAcceptingQuote(latestSentQuote)
                                }
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Accept this quote
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 w-full rounded-xl bg-background/80"
                                onClick={() =>
                                    handleDownloadQuotePdf(
                                        detail.id,
                                        latestSentQuote.id,
                                    )
                                }
                            >
                                <ArrowDownToLine className="h-4 w-4" />
                                Download quote PDF
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {/* Request details */}
            <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
                <CardContent className="p-5 sm:p-6">
                    <SectionLabel>Trip details</SectionLabel>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <DetailItem
                            icon={CalendarDays}
                            label="Preferred travel date"
                        >
                            {formatDate(detail.preferredDate)}
                            {detail.flexibleDates && (
                                <span className="ml-2 text-xs font-medium text-coral">
                                    Flexible
                                </span>
                            )}
                        </DetailItem>

                        <DetailItem
                            icon={Users}
                            label="Travellers"
                        >
                            {detail.groupSizeAdults ?? 0} adults
                            {detail.groupSizeChildren
                                ? `, ${detail.groupSizeChildren} children`
                                : ""}
                        </DetailItem>

                        {detail.budgetRange && (
                            <DetailItem
                                icon={Wallet}
                                label="Budget range"
                            >
                                {detail.budgetRange}
                            </DetailItem>
                        )}

                        {detail.travelStartDate &&
                            detail.travelEndDate && (
                                <DetailItem
                                    icon={CalendarDays}
                                    label="Confirmed travel dates"
                                >
                                    {formatDate(detail.travelStartDate)} –{" "}
                                    {formatDate(detail.travelEndDate)}
                                </DetailItem>
                            )}

                        {detail.bookingReference && (
                            <DetailItem
                                icon={CheckCircle2}
                                label="Booking reference"
                            >
                                {detail.bookingReference}
                            </DetailItem>
                        )}
                    </div>

                    {detail.requirements && (
                        <>
                            <Separator className="my-5" />

                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                                    Your message
                                </p>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground/80">
                                    {detail.requirements}
                                </p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Previous quotes */}
            {previousQuotes.length > 0 && (
                <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
                    <CardContent className="p-5 sm:p-6">
                        <SectionLabel>Quote history</SectionLabel>

                        <div className="mt-4 space-y-3">
                            {previousQuotes.map((quote) => (
                                <div
                                    key={quote.id}
                                    className="flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="min-w-0">
                                        <p className="font-display text-lg font-semibold">
                                            {formatAmount(
                                                quote.totalPrice,
                                                quote.currency,
                                            )}
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Valid until{" "}
                                            {formatDate(quote.validUntil)}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className="rounded-full text-[10px]"
                                        >
                                            {quote.status.replace(/_/g, " ")}
                                        </Badge>

                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="rounded-lg"
                                            onClick={() =>
                                                handleDownloadQuotePdf(
                                                    detail.id,
                                                    quote.id,
                                                )
                                            }
                                        >
                                            <ArrowDownToLine className="h-3.5 w-3.5" />
                                            PDF
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Activity timeline */}
            {detail.activity.length > 0 && (
                <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
                    <CardContent className="p-5 sm:p-6">
                        <SectionLabel>Enquiry activity</SectionLabel>

                        <div className="mt-5 space-y-0">
                            {detail.activity.map((event, index) => (
                                <div
                                    key={event.id}
                                    className="relative flex gap-3 pb-5 last:pb-0"
                                >
                                    {index !== detail.activity.length - 1 && (
                                        <div className="absolute bottom-0 left-[7px] top-4 w-px bg-border" />
                                    )}

                                    <div className="relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-[3px] border-coral/30 bg-coral" />

                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium leading-6">
                                            {event.note ||
                                                event.action
                                                    .replace(/_/g, " ")
                                                    .toLowerCase()}
                                        </p>

                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                            {formatDate(event.createdDate)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Support */}
            <section className="rounded-2xl border border-border/70 bg-muted/30 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="font-semibold text-foreground">
                            Need a little help?
                        </p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            Our safari team is happy to help with your enquiry.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:flex">
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl bg-background"
                            asChild
                        >
                            <a href="mailto:support@damuchi.com">
                                <Mail className="h-3.5 w-3.5" />
                                Email us
                            </a>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl bg-background"
                            asChild
                        >
                            <a
                                href="https://wa.me/254700000000"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <MessageCircle className="h-3.5 w-3.5" />
                                WhatsApp
                            </a>
                        </Button>
                    </div>
                </div>
            </section>

            <AcceptQuoteDialog
                open={!!acceptingQuote}
                quote={acceptingQuote}
                onClose={() => setAcceptingQuote(null)}
                onAccepted={() => {
                    setAcceptingQuote(null);
                    onRefresh();
                }}
            />
        </div>
    );
}

/* ============================================================
   LOADING STATE
============================================================ */

function EnquiriesSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-36 w-full rounded-3xl" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
            </div>
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
    );
}

/* ============================================================
   ENQUIRY CARD
============================================================ */

function EnquiryCard({
                         enquiry,
                         onOpen,
                     }: {
    enquiry: EnquirySummaryResponse;
    onOpen: (id: string) => void;
}) {
    const isQuoted = enquiry.status === "QUOTED";

    return (
        <Card
            className={`group overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                isQuoted
                    ? "border-coral/30 bg-gradient-to-br from-coral/[0.045] to-background"
                    : "border-border/70 hover:border-coral/25"
            }`}
        >
            <CardContent className="p-0">
                <button
                    type="button"
                    onClick={() => onOpen(enquiry.id)}
                    className="w-full p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-inset sm:p-5"
                    aria-label={`View enquiry for ${enquiry.tourName}`}
                >
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors sm:h-12 sm:w-12 ${
                                isQuoted
                                    ? "bg-coral/10 text-coral"
                                    : "bg-forest-900/[0.07] text-forest-900 dark:bg-emerald-400/10 dark:text-emerald-400"
                            }`}
                        >
                            {isQuoted ? (
                                <Sparkles className="h-5 w-5" />
                            ) : (
                                <MapPin className="h-5 w-5" />
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-coral sm:text-lg">
                                        {enquiry.tourName}
                                    </h3>

                                    <p className="mt-1.5 text-xs text-muted-foreground">
                                        Submitted{" "}
                                        {formatDate(enquiry.createdDate)}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between gap-3 sm:justify-end">
                                    <StatusBadge status={enquiry.status} />

                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-all group-hover:border-coral/30 group-hover:bg-coral/5 group-hover:text-coral">
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                    </span>
                                </div>
                            </div>

                            {isQuoted && (
                                <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-coral">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Your quote is ready to review
                                </p>
                            )}
                        </div>
                    </div>
                </button>
            </CardContent>
        </Card>
    );
}

/* ============================================================
   MAIN PAGE
============================================================ */

export default function MyEnquiriesPage() {
    const [enquiries, setEnquiries] = useState<
        EnquirySummaryResponse[]
    >([]);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [statusFilter, setStatusFilter] = useState<
        TourEnquiryStatus | "ALL"
    >("ALL");

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [detail, setDetail] =
        useState<EnquiryDetailResponse | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const load = useCallback(
        async (targetPage = 0) => {
            setIsLoading(true);
            setLoadError(null);

            try {
                const data = await enquiryApi.myEnquiries(
                    statusFilter === "ALL" ? undefined : statusFilter,
                    targetPage,
                    PAGE_SIZE,
                );

                setEnquiries(
                    Array.isArray(data?.content) ? data.content : [],
                );
                setTotalPages(data?.totalPages ?? 0);
                setPage(targetPage);
            } catch (err) {
                const message = getApiErrorMessage(
                    err,
                    "Couldn't load your enquiries.",
                );

                setLoadError(message);
                setEnquiries([]);
            } finally {
                setIsLoading(false);
            }
        },
        [statusFilter],
    );

    useEffect(() => {
        load(0);
    }, [load]);

    const openDetail = useCallback(async (id: string) => {
        setSelectedId(id);
        setDetail(null);
        setDetailLoading(true);

        try {
            const data = await enquiryApi.myEnquiryDetail(id);
            setDetail(data);
        } catch (err) {
            toast.error(
                getApiErrorMessage(
                    err,
                    "Couldn't load this enquiry.",
                ),
            );
            setSelectedId(null);
        } finally {
            setDetailLoading(false);
        }
    }, []);

    const refreshDetail = useCallback(async () => {
        if (!selectedId) return;

        try {
            const data = await enquiryApi.myEnquiryDetail(selectedId);
            setDetail(data);
            await load(page);
        } catch (err) {
            toast.error(
                getApiErrorMessage(
                    err,
                    "Couldn't refresh this enquiry.",
                ),
            );
        }
    }, [selectedId, page, load]);

    const summary = useMemo(() => {
        return {
            total: enquiries.length,
            awaitingResponse: enquiries.filter(
                (item) => item.status === "QUOTED",
            ).length,
            inProgress: enquiries.filter(
                (item) =>
                    item.status === "NEW" ||
                    item.status === "CONTACTED",
            ).length,
        };
    }, [enquiries]);

    const hasNeedsAttention = summary.awaitingResponse > 0;

    /* Detail view */
    if (selectedId) {
        return (
            <PageShell>
                <div className="mx-auto w-full max-w-4xl space-y-5">
                    {detailLoading || !detail ? (
                        <EnquiriesSkeleton />
                    ) : (
                        <EnquiryDetailPanel
                            detail={detail}
                            onBack={() => {
                                setSelectedId(null);
                                setDetail(null);
                            }}
                            onRefresh={refreshDetail}
                        />
                    )}
                </div>
            </PageShell>
        );
    }

    /* Enquiry list */
    return (
        <PageShell>
            <div className="mx-auto w-full max-w-5xl space-y-6 sm:space-y-8">
                {/* Page hero */}
                <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-emerald-950 px-5 py-7 text-black shadow-lg shadow-forest-950/10 sm:px-8 sm:py-9">
                    <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/[0.08]" />
                    <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full border border-white/[0.08]" />
                    <div className="pointer-events-none absolute bottom-0 right-1/4 h-28 w-28 rounded-full bg-coral/10 blur-3xl" />

                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.17em] text-white/75">
                                <Sparkles className="h-3 w-3 text-coral" />
                                Your travel workspace
                            </div>

                            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                                My enquiries
                            </h1>

                            <p className="mt-2 max-w-lg text-sm leading-6 text-white/65 sm:text-base">
                                Follow your safari plans, review personalised
                                quotes, and take the next step towards your
                                next adventure.
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => load(page)}
                            disabled={isLoading}
                            className="h-10 w-full rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white sm:w-auto"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    isLoading ? "animate-spin" : ""
                                }`}
                            />
                            Refresh enquiries
                        </Button>
                    </div>
                </section>

                {/* Attention message */}
                {!isLoading && hasNeedsAttention && (
                    <div className="flex items-start gap-3 rounded-2xl border border-coral/25 bg-coral/[0.06] p-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-coral/10 text-coral">
                            <Sparkles className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">
                                You have a quote waiting for you
                            </p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                Open your quoted enquiry to review the details
                                and decide whether to proceed.
                            </p>
                        </div>
                    </div>
                )}

                {/* Overview stats */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Card className="rounded-2xl border-border/70 shadow-sm">
                        <CardContent className="flex items-center gap-3 p-4 sm:p-5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-900/[0.07] text-forest-900 dark:bg-emerald-400/10 dark:text-emerald-400">
                                <Inbox className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    On this page
                                </p>
                                <p className="mt-0.5 text-2xl font-semibold tracking-tight">
                                    {isLoading ? "—" : summary.total}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-border/70 shadow-sm">
                        <CardContent className="flex items-center gap-3 p-4 sm:p-5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <Clock3 className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    In progress
                                </p>
                                <p className="mt-0.5 text-2xl font-semibold tracking-tight">
                                    {isLoading ? "—" : summary.inProgress}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-border/70 shadow-sm">
                        <CardContent className="flex items-center gap-3 p-4 sm:p-5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coral/10 text-coral">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    Quotes to review
                                </p>
                                <p className="mt-0.5 text-2xl font-semibold tracking-tight">
                                    {isLoading
                                        ? "—"
                                        : summary.awaitingResponse}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* List heading and filters */}
                <section className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                                Your safari requests
                            </h2>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                                Select an enquiry to see its progress and
                                quotation details.
                            </p>
                        </div>

                        <div className="w-full sm:w-52">
                            <Select
                                value={statusFilter}
                                onValueChange={(value) =>
                                    setStatusFilter(
                                        value as TourEnquiryStatus | "ALL",
                                    )
                                }
                            >
                                <SelectTrigger className="h-10 w-full rounded-xl border-border/70 bg-background">
                                    <SelectValue placeholder="Filter enquiries" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="ALL">
                                        All enquiries
                                    </SelectItem>

                                    {FILTERABLE_STATUSES.map((status) => (
                                        <SelectItem
                                            key={status}
                                            value={status}
                                        >
                                            {STATUS_COPY[status].label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Loading */}
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton
                                    key={index}
                                    className="h-28 w-full rounded-2xl"
                                />
                            ))}
                        </div>
                    ) : loadError ? (
                        <Card className="rounded-2xl border-destructive/20">
                            <CardContent className="flex flex-col items-center px-5 py-10 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>

                                <h3 className="mt-4 font-semibold">
                                    We couldn't load your enquiries
                                </h3>

                                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                                    {loadError}
                                </p>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="mt-5 rounded-xl"
                                    onClick={() => load(page)}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Try again
                                </Button>
                            </CardContent>
                        </Card>
                    ) : enquiries.length === 0 ? (
                        <Card className="rounded-2xl border-dashed border-border/80 shadow-none">
                            <CardContent className="px-4 py-8 sm:px-6 sm:py-10">
                                <EmptyState
                                    icon={Inbox}
                                    title={
                                        statusFilter === "ALL"
                                            ? "Your safari journey starts here"
                                            : "No matching enquiries"
                                    }
                                    description={
                                        statusFilter === "ALL"
                                            ? "You haven't sent an enquiry yet. Explore our safari experiences and let our team help plan your next adventure."
                                            : "There are no enquiries with this status. Try selecting another filter."
                                    }
                                />
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {enquiries.map((enquiry) => (
                                <EnquiryCard
                                    key={enquiry.id}
                                    enquiry={enquiry}
                                    onOpen={openDetail}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Pagination */}
                {!isLoading && !loadError && totalPages > 1 && (
                    <div className="flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-center text-xs text-muted-foreground sm:text-left">
                            Page{" "}
                            <span className="font-semibold text-foreground">
                                {page + 1}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-foreground">
                                {totalPages}
                            </span>
                        </p>

                        <div className="grid grid-cols-2 gap-2 sm:flex">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                                onClick={() => load(page - 1)}
                                disabled={page === 0 || isLoading}
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Previous
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                                onClick={() => load(page + 1)}
                                disabled={
                                    page + 1 >= totalPages || isLoading
                                }
                            >
                                Next
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Support footer */}
                <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/25 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div>
                        <p className="text-sm font-semibold">
                            Need help planning your trip?
                        </p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            Talk to our team for assistance with your safari.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:flex">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-xl bg-background"
                            asChild
                        >
                            <a href="mailto:support@damuchi.com">
                                <Mail className="h-3.5 w-3.5" />
                                Email support
                            </a>
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-xl bg-background"
                            asChild
                        >
                            <a
                                href="https://wa.me/254700000000"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <MessageCircle className="h-3.5 w-3.5" />
                                WhatsApp
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
