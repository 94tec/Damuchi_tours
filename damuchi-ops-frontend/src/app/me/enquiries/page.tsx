"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";
import {
    AlertCircle,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Download,
    FileText,
    Inbox,
    Loader2,
    MapPin,
    MessageCircle,
    RefreshCw,
    Sparkles,
    Users,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { enquiryApi } from "@/lib/enquiry-api";
import { cn, formatDate, getApiErrorMessage } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type EnquiryStatus =
    | "NEW"
    | "PENDING"
    | "IN_REVIEW"
    | "QUOTED"
    | "QUOTE_SENT"
    | "ACCEPTED"
    | "CONVERTED"
    | "CLOSED"
    | "CANCELLED"
    | string;

interface Quote {
    id: string;
    enquiryId: string;

    pricePerAdult: number;
    pricePerChild?: number | null;

    totalPrice: number;
    currency: string;

    validUntil?: string | null;
    inclusionsNote?: string | null;

    status?: string | null;
    sentAt?: string | null;
    respondedAt?: string | null;
}

interface Enquiry {
    id: string;

    tourId: string;
    tourName: string;

    status: EnquiryStatus;

    preferredDate?: string | null;
    flexibleDates?: boolean;

    travelStartDate?: string | null;
    travelEndDate?: string | null;

    groupSizeAdults?: number | null;
    groupSizeChildren?: number | null;

    budgetRange?: string | null;
    requirements?: string | null;

    quotes?: Quote[];

    bookingReference?: string | null;

    createdDate?: string | null;
    lastModifiedDate?: string | null;
}

// -----------------------------------------------------------------------------
// Status configuration
// -----------------------------------------------------------------------------

const STATUS_CONFIG: Record<
    string,
    {
        label: string;
        description: string;
        icon: typeof Clock3;
        className: string;
        dotClassName: string;
    }
> = {
    NEW: {
        label: "Received",
        description: "We've received your travel request.",
        icon: Inbox,
        className:
            "border-sky-200/70 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300",
        dotClassName: "bg-sky-500",
    },

    PENDING: {
        label: "Being reviewed",
        description: "Our travel team is reviewing your request.",
        icon: Clock3,
        className:
            "border-amber-200/70 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
        dotClassName: "bg-amber-500",
    },

    IN_REVIEW: {
        label: "Being reviewed",
        description: "Our travel team is reviewing your request.",
        icon: Clock3,
        className:
            "border-amber-200/70 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
        dotClassName: "bg-amber-500",
    },

    QUOTED: {
        label: "Quote ready",
        description: "Your personalised trip quote is ready.",
        icon: Sparkles,
        className: "border-coral/25 bg-coral/10 text-coral",
        dotClassName: "bg-coral",
    },

    QUOTE_SENT: {
        label: "Quote ready",
        description: "Your personalised trip quote is ready.",
        icon: Sparkles,
        className: "border-coral/25 bg-coral/10 text-coral",
        dotClassName: "bg-coral",
    },

    ACCEPTED: {
        label: "Quote accepted",
        description: "Your quote has been accepted.",
        icon: CheckCircle2,
        className:
            "border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
        dotClassName: "bg-emerald-500",
    },

    CONVERTED: {
        label: "Booking created",
        description: "Your enquiry has become a booking.",
        icon: CheckCircle2,
        className:
            "border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
        dotClassName: "bg-emerald-500",
    },

    CLOSED: {
        label: "Closed",
        description: "This enquiry has been closed.",
        icon: CheckCircle2,
        className:
            "border-muted bg-muted/50 text-muted-foreground",
        dotClassName: "bg-muted-foreground",
    },

    CANCELLED: {
        label: "Cancelled",
        description: "This enquiry has been cancelled.",
        icon: XCircle,
        className:
            "border-destructive/20 bg-destructive/5 text-destructive",
        dotClassName: "bg-destructive",
    },
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function getStatusConfig(status?: string) {
    return (
        STATUS_CONFIG[status ?? ""] ?? {
            label: status
                ? status
                    .toLowerCase()
                    .replaceAll("_", " ")
                    .replace(/\b\w/g, (char) =>
                        char.toUpperCase()
                    )
                : "In progress",
            description:
                "Your enquiry is being processed.",
            icon: Clock3,
            className:
                "border-border bg-muted/50 text-muted-foreground",
            dotClassName: "bg-muted-foreground",
        }
    );
}

function getLatestQuote(enquiry: Enquiry) {
    if (!enquiry.quotes?.length) {
        return null;
    }

    return (
        [...enquiry.quotes]
            .sort((a, b) => {
                const aDate = a.sentAt
                    ? new Date(a.sentAt).getTime()
                    : 0;

                const bDate = b.sentAt
                    ? new Date(b.sentAt).getTime()
                    : 0;

                return bDate - aDate;
            })
            .find((quote) =>
                ["SENT", "ACCEPTED"].includes(
                    quote.status?.toUpperCase() ?? ""
                )
            ) ??
        enquiry.quotes[enquiry.quotes.length - 1]
    );
}

function formatMoney(
    amount?: number | null,
    currency = "USD"
) {
    if (amount == null) {
        return "—";
    }

    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currency} ${amount.toLocaleString()}`;
    }
}

function buildQuoteFileName(
    quoteId: string,
    tourName?: string
) {
    const safeTourName = tourName
        ?.trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const shortQuoteId = quoteId
        .slice(0, 8)
        .toUpperCase();

    return safeTourName
        ? `${safeTourName}-quote-${shortQuoteId}.pdf`
        : `quote-${shortQuoteId}.pdf`;
}

// -----------------------------------------------------------------------------
// Status badge
// -----------------------------------------------------------------------------

function StatusBadge({
                         status,
                     }: {
    status?: string;
}) {
    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border",
                "px-2.5 py-1 text-xs font-semibold",
                config.className
            )}
        >
            <Icon className="h-3.5 w-3.5" />

            {config.label}
        </span>
    );
}

// -----------------------------------------------------------------------------
// Detail item
// -----------------------------------------------------------------------------

function DetailItem({
                        icon: Icon,
                        label,
                        value,
                    }: {
    icon: typeof CalendarDays;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-muted-foreground">
                <Icon className="h-4 w-4" />
            </div>

            <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                </p>

                <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                    {value}
                </p>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// Quote preview
// -----------------------------------------------------------------------------

interface QuotePreviewProps {
    quote: Quote;

    onOpen: () => void;
    onDownload: () => void;

    downloading?: boolean;
}

function QuotePreview({
                          quote,
                          onOpen,
                          onDownload,
                          downloading = false,
                      }: QuotePreviewProps) {
    const expired =
        Boolean(quote.validUntil) &&
        new Date(
            quote.validUntil as string
        ).getTime() < Date.now();

    const accepted =
        quote.status?.toUpperCase() === "ACCEPTED";

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 8,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            className={cn(
                "mt-5 overflow-hidden rounded-2xl border",
                accepted
                    ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                    : expired
                        ? "border-border bg-muted/40"
                        : "border-coral/20 bg-coral/[0.045]"
            )}
        >
            <div className="flex flex-col gap-4 p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Quote information */}
                    <div className="flex min-w-0 items-start gap-3">
                        <div
                            className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                                accepted
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                                    : "bg-coral/10 text-coral"
                            )}
                        >
                            {accepted ? (
                                <CheckCircle2 className="h-5 w-5" />
                            ) : (
                                <Sparkles className="h-5 w-5" />
                            )}
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold">
                                    {accepted
                                        ? "Quote accepted"
                                        : expired
                                            ? "Quote expired"
                                            : "Your personalised quote"}
                                </p>

                                {!accepted && !expired && (
                                    <span className="rounded-full bg-coral/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-coral">
                                        Action needed
                                    </span>
                                )}
                            </div>

                            <p className="mt-1 text-xs text-muted-foreground">
                                {quote.validUntil
                                    ? expired
                                        ? `Expired ${formatDate(
                                            quote.validUntil
                                        )}`
                                        : `Valid until ${formatDate(
                                            quote.validUntil
                                        )}`
                                    : "Personalised pricing for your trip"}
                            </p>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="shrink-0 text-left sm:text-right">
                        <p className="text-xs text-muted-foreground">
                            Total
                        </p>

                        <p className="text-xl font-bold tracking-tight">
                            {formatMoney(
                                quote.totalPrice,
                                quote.currency
                            )}
                        </p>
                    </div>
                </div>

                {/* Optional inclusion note */}
                {quote.inclusionsNote && (
                    <div className="rounded-xl border border-border/60 bg-background/60 px-4 py-3">
                        <div className="flex items-start gap-2.5">
                            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                            <p className="text-xs leading-5 text-muted-foreground">
                                {quote.inclusionsNote}
                            </p>
                        </div>
                    </div>
                )}

                {/* Quote actions */}
                <div className="flex flex-col gap-2 border-t border-border/50 pt-4 sm:flex-row sm:items-center sm:justify-end">
                    <button
                        type="button"
                        onClick={onDownload}
                        disabled={downloading}
                        aria-busy={downloading}
                        className={cn(
                            "inline-flex h-10 items-center justify-center gap-2 rounded-xl border",
                            "border-border bg-background px-4 text-sm font-semibold text-foreground",
                            "transition-all duration-200",
                            "hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-muted/40",
                            "focus-visible:outline-none focus-visible:ring-2",
                            "focus-visible:ring-coral/50",
                            "disabled:pointer-events-none disabled:opacity-60"
                        )}
                    >
                        {downloading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />

                                Downloading...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />

                                Download PDF
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={onOpen}
                        className={cn(
                            "inline-flex h-10 items-center justify-center gap-2 rounded-xl",
                            "bg-foreground px-4 text-sm font-semibold text-background",
                            "transition-all duration-200",
                            "hover:-translate-y-0.5 hover:shadow-md",
                            "focus-visible:outline-none focus-visible:ring-2",
                            "focus-visible:ring-coral/50"
                        )}
                    >
                        View quote

                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// -----------------------------------------------------------------------------
// Enquiry card
// -----------------------------------------------------------------------------

interface EnquiryCardProps {
    enquiry: Enquiry;

    onQuote: (
        enquiry: Enquiry,
        quote: Quote
    ) => void;

    onDownloadQuote: (
        enquiry: Enquiry,
        quote: Quote
    ) => void;

    downloadingQuoteId: string | null;
}

function EnquiryCard({
                         enquiry,
                         onQuote,
                         onDownloadQuote,
                         downloadingQuoteId,
                     }: EnquiryCardProps) {
    const status =
        getStatusConfig(enquiry.status);

    const latestQuote =
        getLatestQuote(enquiry);

    const adults =
        enquiry.groupSizeAdults ?? 0;

    const children =
        enquiry.groupSizeChildren ?? 0;

    const travellers =
        adults + children;

    const travelDate =
        enquiry.travelStartDate
            ? enquiry.travelEndDate
                ? `${formatDate(
                    enquiry.travelStartDate
                )} – ${formatDate(
                    enquiry.travelEndDate
                )}`
                : formatDate(
                    enquiry.travelStartDate
                )
            : enquiry.preferredDate
                ? formatDate(
                    enquiry.preferredDate
                )
                : enquiry.flexibleDates
                    ? "Flexible dates"
                    : "Dates to be confirmed";

    return (
        <motion.article
            layout
            initial={{
                opacity: 0,
                y: 14,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            exit={{
                opacity: 0,
                y: -8,
            }}
            transition={{
                duration: 0.3,
                ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                ],
            }}
            className={cn(
                "group relative overflow-hidden rounded-3xl border",
                "bg-card shadow-sm",
                "transition-all duration-300",
                "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/[0.04]",
                "dark:hover:shadow-black/20"
            )}
        >
            {/* Accent line */}
            <div
                aria-hidden="true"
                className={cn(
                    "absolute inset-x-0 top-0 h-1",
                    status.dotClassName
                )}
            />

            <div className="p-5 sm:p-6 lg:p-7">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <StatusBadge
                                status={
                                    enquiry.status
                                }
                            />

                            {enquiry.bookingReference && (
                                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                    {
                                        enquiry.bookingReference
                                    }
                                </span>
                            )}
                        </div>

                        <h2 className="line-clamp-2 text-lg font-bold tracking-tight sm:text-xl">
                            {enquiry.tourName}
                        </h2>

                        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-coral" />

                            {
                                status.description
                            }
                        </p>
                    </div>

                    <div className="shrink-0 text-left sm:text-right">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            Enquiry
                        </p>

                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                            #
                            {enquiry.id
                                .slice(0, 8)
                                .toUpperCase()}
                        </p>
                    </div>
                </div>

                {/* Trip details */}
                <div className="mt-6 grid gap-4 border-y border-border/60 py-5 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailItem
                        icon={CalendarDays}
                        label="Travel dates"
                        value={travelDate}
                    />

                    <DetailItem
                        icon={Users}
                        label="Travellers"
                        value={
                            travellers
                                ? `${travellers} ${
                                    travellers ===
                                    1
                                        ? "traveller"
                                        : "travellers"
                                }`
                                : "To be confirmed"
                        }
                    />

                    <DetailItem
                        icon={MapPin}
                        label="Planning"
                        value={
                            enquiry.flexibleDates
                                ? "Flexible itinerary"
                                : "Preferred dates"
                        }
                    />
                </div>

                {/* Requirements */}
                {enquiry.requirements && (
                    <div className="mt-5 rounded-2xl bg-muted/45 p-4">
                        <div className="flex items-start gap-3">
                            <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-foreground">
                                    Your request
                                </p>

                                <p className="mt-1 line-clamp-3 text-sm leading-6 text-muted-foreground">
                                    {
                                        enquiry.requirements
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quote */}
                {latestQuote && (
                    <QuotePreview
                        quote={latestQuote}
                        onOpen={() =>
                            onQuote(
                                enquiry,
                                latestQuote
                            )
                        }
                        onDownload={() =>
                            onDownloadQuote(
                                enquiry,
                                latestQuote
                            )
                        }
                        downloading={
                            downloadingQuoteId ===
                            latestQuote.id
                        }
                    />
                )}

                {/* Footer */}
                <div className="mt-5 flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <span>
                        Submitted{" "}
                        {enquiry.createdDate
                            ? formatDate(
                                enquiry.createdDate
                            )
                            : "recently"}
                    </span>

                    {enquiry.lastModifiedDate && (
                        <span>
                            Updated{" "}
                            {formatDate(
                                enquiry.lastModifiedDate
                            )}
                        </span>
                    )}
                </div>
            </div>
        </motion.article>
    );
}

// -----------------------------------------------------------------------------
// Empty state
// -----------------------------------------------------------------------------

function EmptyState() {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 10,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center sm:px-10"
        >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-coral/10 text-coral">
                <Inbox className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-xl font-bold tracking-tight">
                No enquiries yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Your personalised trip requests
                will appear here. Once you send
                an enquiry, you can follow its
                progress and review quotes from
                one place.
            </p>
        </motion.div>
    );
}

// -----------------------------------------------------------------------------
// Loading state
// -----------------------------------------------------------------------------

function EnquirySkeleton() {
    return (
        <div className="overflow-hidden rounded-3xl border bg-card p-6">
            <div className="animate-pulse space-y-6">
                <div className="flex justify-between gap-4">
                    <div className="space-y-3">
                        <div className="h-6 w-24 rounded-full bg-muted" />

                        <div className="h-6 w-72 max-w-full rounded-lg bg-muted" />

                        <div className="h-4 w-56 rounded bg-muted" />
                    </div>

                    <div className="hidden h-8 w-24 rounded bg-muted sm:block" />
                </div>

                <div className="grid gap-4 border-y py-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="h-12 rounded-xl bg-muted" />

                    <div className="h-12 rounded-xl bg-muted" />

                    <div className="h-12 rounded-xl bg-muted" />
                </div>

                <div className="h-24 rounded-2xl bg-muted" />
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function EnquiriesPage() {
    const shouldReduceMotion =
        useReducedMotion();

    const [enquiries, setEnquiries] =
        useState<Enquiry[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [
        downloadingQuoteId,
        setDownloadingQuoteId,
    ] = useState<string | null>(null);

    // -------------------------------------------------------------------------
    // Load enquiries
    // -------------------------------------------------------------------------

    const loadEnquiries = useCallback(
        async (silent = false) => {
            try {
                setError(null);

                if (silent) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                const response =
                    await enquiryApi.myEnquiries(
                        undefined,
                        0,
                        50
                    );

                /*
                 * Supports:
                 *
                 * response.content
                 * response.data.content
                 * response.data
                 *
                 * This remains defensive so the page works
                 * with slightly different API wrapper shapes.
                 */
                const data =
                    (
                        response as {
                            content?: Enquiry[];
                            data?:
                                | Enquiry[]
                                | {
                                content?: Enquiry[];
                            };
                        }
                    )?.content ??
                    (
                        response as {
                            data?: {
                                content?: Enquiry[];
                            };
                        }
                    )?.data?.content ??
                    (
                        response as {
                            data?: Enquiry[];
                        }
                    )?.data ??
                    [];

                setEnquiries(
                    Array.isArray(data)
                        ? data
                        : []
                );
            } catch (err) {
                const message =
                    getApiErrorMessage(
                        err,
                        "We couldn't load your enquiries right now."
                    );

                setError(message);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );

    useEffect(() => {
        void loadEnquiries();
    }, [loadEnquiries]);

    // -------------------------------------------------------------------------
    // Quote statistics
    // -------------------------------------------------------------------------

    const actionableQuotes =
        useMemo(() => {
            return enquiries.reduce(
                (count, enquiry) => {
                    const quote =
                        getLatestQuote(
                            enquiry
                        );

                    if (
                        quote &&
                        quote.status?.toUpperCase() ===
                        "SENT" &&
                        (!quote.validUntil ||
                            new Date(
                                quote.validUntil
                            ).getTime() >
                            Date.now())
                    ) {
                        return count + 1;
                    }

                    return count;
                },
                0
            );
        }, [enquiries]);

    // -------------------------------------------------------------------------
    // View quote
    // -------------------------------------------------------------------------

    const handleQuote = (
        _enquiry: Enquiry,
        quote: Quote
    ) => {
        /*
         * Replace this with your quote sheet/dialog when ready.
         *
         * Your acceptance request can remain:
         *
         * await enquiryApi.acceptQuote(
         *     quote.enquiryId,
         *     quote.id,
         *     { termsAccepted: true }
         * );
         */

        toast.info("Quote details", {
            description: `Your quote totals ${formatMoney(
                quote.totalPrice,
                quote.currency
            )}.`,
        });
    };

    // -------------------------------------------------------------------------
    // Download quote PDF
    // -------------------------------------------------------------------------

    const handleDownloadQuotePdf =
        useCallback(
            async (
                enquiry: Enquiry,
                quote: Quote
            ) => {
                if (downloadingQuoteId) {
                    return;
                }

                const enquiryId =
                    quote.enquiryId ||
                    enquiry.id;

                if (!enquiryId) {
                    toast.error(
                        "Unable to download quote",
                        {
                            description:
                                "The enquiry reference is missing.",
                        }
                    );

                    return;
                }

                let objectUrl:
                    | string
                    | null = null;

                try {
                    setDownloadingQuoteId(
                        quote.id
                    );

                    const response =
                        await enquiryApi.downloadQuotePdf(
                            enquiryId,
                            quote.id,
                            true
                        );

                    /*
                     * Expected contract:
                     *
                     * downloadQuotePdf(...) => Blob
                     *
                     * This also tolerates Axios-style:
                     *
                     * { data: Blob }
                     */
                    const possibleResponse =
                        response as
                            | Blob
                            | {
                            data?: Blob;
                        };

                    const blob =
                        possibleResponse instanceof
                        Blob
                            ? possibleResponse
                            : possibleResponse?.data;

                    if (
                        !(blob instanceof Blob)
                    ) {
                        throw new Error(
                            "The server did not return a valid PDF file."
                        );
                    }

                    if (blob.size === 0) {
                        throw new Error(
                            "The generated PDF is empty."
                        );
                    }

                    const pdfBlob =
                        blob.type ===
                        "application/pdf"
                            ? blob
                            : new Blob(
                                [blob],
                                {
                                    type: "application/pdf",
                                }
                            );

                    objectUrl =
                        window.URL.createObjectURL(
                            pdfBlob
                        );

                    const link =
                        document.createElement(
                            "a"
                        );

                    link.href =
                        objectUrl;

                    link.download =
                        buildQuoteFileName(
                            quote.id,
                            enquiry.tourName
                        );

                    link.style.display =
                        "none";

                    document.body.appendChild(
                        link
                    );

                    link.click();

                    document.body.removeChild(
                        link
                    );

                    toast.success(
                        "Quote downloaded",
                        {
                            description:
                                "Your quote PDF has been saved to your device.",
                        }
                    );
                } catch (err) {
                    toast.error(
                        "Couldn't download quote",
                        {
                            description:
                                getApiErrorMessage(
                                    err,
                                    "We couldn't download your quote PDF. Please try again."
                                ),
                        }
                    );
                } finally {
                    /*
                     * Revoke on the next event-loop cycle.
                     *
                     * Revoking immediately after link.click()
                     * can interfere with downloads in some browsers.
                     */
                    if (objectUrl) {
                        const url =
                            objectUrl;

                        window.setTimeout(
                            () => {
                                window.URL.revokeObjectURL(
                                    url
                                );
                            },
                            1000
                        );
                    }

                    setDownloadingQuoteId(
                        null
                    );
                }
            },
            [downloadingQuoteId]
        );

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
        <div className="mx-auto w-full max-w-5xl">
            {/* Hero */}
            <motion.header
                initial={
                    shouldReduceMotion
                        ? false
                        : {
                            opacity: 0,
                            y: 12,
                        }
                }
                animate={
                    shouldReduceMotion
                        ? undefined
                        : {
                            opacity: 1,
                            y: 0,
                        }
                }
                transition={{
                    duration: 0.4,
                    ease: [
                        0.22,
                        1,
                        0.36,
                        1,
                    ],
                }}
                className="relative mb-8 overflow-hidden rounded-3xl border bg-card"
            >
                {/* Decorative glow */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-coral/10 blur-3xl"
                />

                <div className="relative p-6 sm:p-8 lg:p-10">
                    <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
                        <div className="max-w-2xl">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-coral/10 px-3 py-1.5 text-xs font-semibold text-coral">
                                <Sparkles className="h-3.5 w-3.5" />

                                Your travel
                                requests
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Enquiries
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                                Follow your
                                personalised trip
                                requests, review
                                quotes, download
                                your travel
                                documents, and
                                keep everything
                                for your next
                                adventure in one
                                place.
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            {actionableQuotes >
                                0 && (
                                    <div className="rounded-2xl border border-coral/20 bg-coral/[0.06] px-4 py-3">
                                        <div className="flex items-center gap-2">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-coral text-xs font-bold text-white">
                                            {
                                                actionableQuotes
                                            }
                                        </span>

                                            <div>
                                                <p className="text-xs font-semibold">
                                                    Quote
                                                    {actionableQuotes >
                                                    1
                                                        ? "s"
                                                        : ""}{" "}
                                                    ready
                                                </p>

                                                <p className="text-[11px] text-muted-foreground">
                                                    Needs
                                                    your
                                                    review
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            <button
                                type="button"
                                onClick={() =>
                                    void loadEnquiries(
                                        true
                                    )
                                }
                                disabled={
                                    loading ||
                                    refreshing
                                }
                                aria-label="Refresh enquiries"
                                className={cn(
                                    "flex h-11 w-11 items-center justify-center rounded-xl border bg-background",
                                    "text-muted-foreground transition-all",
                                    "hover:border-foreground/20 hover:text-foreground",
                                    "focus-visible:outline-none focus-visible:ring-2",
                                    "focus-visible:ring-coral/50",
                                    "disabled:pointer-events-none disabled:opacity-50"
                                )}
                            >
                                <RefreshCw
                                    className={cn(
                                        "h-4 w-4",
                                        refreshing &&
                                        "animate-spin"
                                    )}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Error */}
            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            height: 0,
                            y: -8,
                        }}
                        animate={{
                            opacity: 1,
                            height: "auto",
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            height: 0,
                            y: -8,
                        }}
                        className="mb-6 overflow-hidden"
                    >
                        <div
                            role="alert"
                            className="flex flex-col gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />

                                <div>
                                    <p className="font-semibold text-destructive">
                                        Couldn't
                                        load
                                        enquiries
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {error}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    void loadEnquiries()
                                }
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-foreground px-3 text-sm font-medium text-background transition hover:opacity-90"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />

                                Try again
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading */}
            {loading && (
                <div
                    className="space-y-5"
                    aria-busy="true"
                >
                    <EnquirySkeleton />

                    <EnquirySkeleton />
                </div>
            )}

            {/* Empty */}
            {!loading &&
                !error &&
                enquiries.length === 0 && (
                    <EmptyState />
                )}

            {/* Enquiries */}
            {!loading &&
                enquiries.length > 0 && (
                    <motion.div
                        layout
                        className="space-y-5"
                        aria-live="polite"
                    >
                        <AnimatePresence mode="popLayout">
                            {enquiries.map(
                                (enquiry) => (
                                    <EnquiryCard
                                        key={
                                            enquiry.id
                                        }
                                        enquiry={
                                            enquiry
                                        }
                                        onQuote={
                                            handleQuote
                                        }
                                        onDownloadQuote={(
                                            currentEnquiry,
                                            quote
                                        ) =>
                                            void handleDownloadQuotePdf(
                                                currentEnquiry,
                                                quote
                                            )
                                        }
                                        downloadingQuoteId={
                                            downloadingQuoteId
                                        }
                                    />
                                )
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

            {/* Bottom reassurance */}
            {!loading &&
                enquiries.length > 0 && (
                    <motion.div
                        initial={
                            shouldReduceMotion
                                ? false
                                : {
                                    opacity: 0,
                                }
                        }
                        animate={
                            shouldReduceMotion
                                ? undefined
                                : {
                                    opacity: 1,
                                }
                        }
                        transition={{
                            delay: 0.2,
                        }}
                        className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />

                        Your enquiry
                        information is
                        securely associated
                        with your account.
                    </motion.div>
                )}
        </div>
    );
}