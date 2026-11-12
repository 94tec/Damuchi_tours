"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
    AlertTriangle,
    CalendarDays,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    Download,
    Landmark,
    RefreshCw,
    ShieldCheck,
    Smartphone,
    Sparkles,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { enquiryApi } from "@/lib/enquiry-api";
import { paymentApi } from "@/lib/payment-api";
import { PAYMENT_DETAILS, PAYMENT_TERMS } from "@/lib/payment-details";
import { formatCurrency } from "@/lib/utils";
import type { EnquiryDetailResponse, QuoteResponse } from "@/types/enquiry-types";
import type { PaymentChannel, PaymentSubmissionResponse } from "@/types/payment-types";
import type { ApiError } from "@/types/index-types";

/* ============================================================
   HELPERS
============================================================ */

const ENTER =
    "animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none";

function errMsg(err: unknown, fallback: string) {
    return (err as ApiError)?.message || fallback;
}

function shortDate(iso?: string) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function isExpired(validUntil: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(validUntil) < today;
}

async function copy(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        toast.success("Copied");
    } catch {
        toast.error("Couldn't copy");
    }
}

function HeroBackdrop() {
    return (
        <>
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.12]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
                    backgroundSize: "22px 22px",
                }}
                aria-hidden="true"
            />
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-5 -top-9 h-36 w-36 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 left-1/4 h-52 w-52 rounded-full bg-coral/15 blur-3xl" />
        </>
    );
}

function SectionHeading({
                            title,
                            hint,
                        }: {
    title: string;
    hint?: string;
}) {
    return (
        <div>
            <h2 className="flex items-center gap-2 text-sm font-bold tracking-tight">
                <span className="h-4 w-1 rounded-full bg-coral" aria-hidden="true" />
                {title}
            </h2>
            {hint && (
                <p className="mt-1 pl-3 text-xs text-muted-foreground">{hint}</p>
            )}
        </div>
    );
}

function CopyRow({ label, value }: { label: string; value: string }) {
    return (
        <button
            type="button"
            onClick={() => copy(value)}
            aria-label={`Copy ${label}`}
            className="group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
        >
            <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
            <span className="flex min-w-0 items-center gap-2 font-mono text-[13px] font-medium">
                <span className="truncate">{value}</span>
                <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-coral" />
            </span>
        </button>
    );
}

/* ============================================================
   STATUS BADGES
============================================================ */

function SubmissionBadge({
                             status,
                         }: {
    status: PaymentSubmissionResponse["status"];
}) {
    const map = {
        PENDING_VERIFICATION: {
            label: "Awaiting verification",
            cls: "border-amber-200 bg-amber-50 text-amber-700",
            icon: Clock,
        },
        VERIFIED: {
            label: "Verified",
            cls: "border-emerald-200 bg-emerald-50 text-emerald-700",
            icon: CheckCircle2,
        },
        REJECTED: {
            label: "Rejected",
            cls: "border-red-200 bg-red-50 text-red-700",
            icon: XCircle,
        },
    } as const;

    const { label, cls, icon: Icon } = map[status];

    return (
        <Badge
            variant="outline"
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${cls}`}
        >
            <Icon className="mr-1 h-3 w-3" />
            {label}
        </Badge>
    );
}

function quoteBadgeClass(label: string) {
    switch (label) {
        case "SENT":
            return "border-coral/30 bg-coral/10 text-coral";
        case "ACCEPTED":
            return "border-emerald-200 bg-emerald-50 text-emerald-700";
        case "EXPIRED":
        case "REJECTED":
            return "border-red-200 bg-red-50 text-red-700";
        default:
            return "";
    }
}

/* ============================================================
   JOURNEY STEPPER
============================================================ */

const JOURNEY_STEPS = ["Quote", "Accepted", "Payment", "Confirmed"];

function JourneyStepper({ done }: { done: boolean[] }) {
    const current = done.findIndex((d) => !d);
    const active = current === -1 ? done.length : current;

    return (
        <ol className="grid grid-cols-4 gap-1" aria-label="Booking progress">
            {JOURNEY_STEPS.map((label, i) => {
                const isDone = done[i];
                const isActive = i === active;

                return (
                    <li
                        key={label}
                        className="relative flex flex-col items-center gap-2 text-center"
                    >
                        {i > 0 && (
                            <span
                                className={`absolute right-1/2 top-[11px] h-0.5 w-full -translate-y-1/2 rounded-full ${
                                    done[i - 1] ? "bg-coral" : "bg-white/15"
                                }`}
                                aria-hidden="true"
                            />
                        )}

                        <span
                            className={`relative z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 ${
                                isDone
                                    ? "border-coral bg-coral text-white"
                                    : isActive
                                        ? "border-coral bg-forest-950 ring-4 ring-coral/20"
                                        : "border-white/20 bg-forest-950"
                            }`}
                        >
                            {isDone ? (
                                <Check className="h-3 w-3" />
                            ) : isActive ? (
                                <span className="h-1.5 w-1.5 rounded-full bg-coral" />
                            ) : null}
                        </span>

                        <span
                            className={`text-[10px] font-semibold sm:text-xs ${
                                isActive
                                    ? "text-white"
                                    : isDone
                                        ? "text-white/70"
                                        : "text-white/35"
                            }`}
                        >
                            {label}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}

/* ============================================================
   PAYMENT INSTRUCTIONS
============================================================ */

function PaymentInstructions({ quote }: { quote: QuoteResponse }) {
    return (
        <div className="space-y-4 rounded-3xl border border-coral/25 bg-gradient-to-br from-coral/[0.07] to-background p-5 sm:p-6">
            <div>
                <p className="text-sm font-bold">How to pay</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Pay through either channel, then submit your transaction
                    reference below so we can confirm your booking. Tap any
                    value to copy it.
                </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-background p-2">
                    <p className="inline-flex items-center gap-2 px-3 pb-1 pt-2 text-xs font-bold text-forest-900 dark:text-emerald-400">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600/10">
                            <Smartphone className="h-3.5 w-3.5" />
                        </span>
                        M-Pesa Paybill
                    </p>
                    <CopyRow label="Business no." value={PAYMENT_DETAILS.mpesa.paybill} />
                    <CopyRow label="Account no." value={PAYMENT_DETAILS.mpesa.account} />
                </div>

                <div className="rounded-2xl border border-border/60 bg-background p-2">
                    <p className="inline-flex items-center gap-2 px-3 pb-1 pt-2 text-xs font-bold text-forest-900 dark:text-emerald-400">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600/10">
                            <Landmark className="h-3.5 w-3.5" />
                        </span>
                        Bank transfer
                    </p>
                    <CopyRow label="Bank" value={PAYMENT_DETAILS.bank.name} />
                    <CopyRow label="Account name" value={PAYMENT_DETAILS.bank.accountName} />
                    <CopyRow label="Account no." value={PAYMENT_DETAILS.bank.accountNumber} />
                    <CopyRow label="Branch" value={PAYMENT_DETAILS.bank.branch} />
                    <CopyRow label="SWIFT/BIC" value={PAYMENT_DETAILS.bank.swift} />
                </div>
            </div>

            <p className="rounded-xl bg-muted/40 p-3 text-[11px] leading-5 text-muted-foreground">
                Quote reference:{" "}
                <button
                    type="button"
                    onClick={() => copy(quote.id)}
                    className="break-all font-mono text-foreground underline-offset-2 hover:underline"
                >
                    {quote.id}
                </button>
                . For bank transfers, put it in the payment description. For
                M-Pesa, keep the confirmation SMS. You'll need its transaction
                code.
            </p>
        </div>
    );
}

/* ============================================================
   PAYMENT SUBMISSION FORM
============================================================ */

function PaymentSubmissionForm({
                                   enquiryId,
                                   quote,
                                   onSubmitted,
                               }: {
    enquiryId: string;
    quote: QuoteResponse;
    onSubmitted: () => void;
}) {
    const deposit =
        Math.round(
            quote.totalPrice * (PAYMENT_DETAILS.depositPercent / 100) * 100,
        ) / 100;

    const [channel, setChannel] = useState<PaymentChannel>("MPESA");
    const [referenceCode, setReferenceCode] = useState("");
    const [amount, setAmount] = useState(String(deposit));
    const [payerName, setPayerName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit() {
        const ref = referenceCode.trim().toUpperCase();
        const amt = Number(amount);

        if (!/^[A-Z0-9-]{6,40}$/.test(ref)) {
            toast.error(
                "Enter the transaction reference exactly as shown in your M-Pesa SMS or bank receipt.",
            );
            return;
        }
        if (!(amt > 0)) {
            toast.error("Enter the amount you paid.");
            return;
        }
        if (amt > quote.totalPrice) {
            toast.error("The amount can't be more than the quote total.");
            return;
        }
        if (!payerName.trim()) {
            toast.error("Enter the name or phone number the payment was sent from.");
            return;
        }

        setIsSubmitting(true);
        try {
            await paymentApi.submitPayment(enquiryId, quote.id, {
                channel,
                referenceCode: ref,
                amountPaid: amt,
                payerName: payerName.trim(),
            });
            toast.success("Payment reference submitted. We'll confirm it shortly.");
            onSubmitted();
        } catch (err) {
            toast.error(errMsg(err, "Couldn't submit your payment reference."));
        } finally {
            setIsSubmitting(false);
        }
    }

    const chipClass =
        "rounded-full border border-border/70 bg-background px-3 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:border-coral/40 hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral";

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit();
            }}
            className="space-y-5 rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-6"
        >
            <div>
                <p className="text-sm font-bold">I've made a payment</p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Submit the details of the payment you just sent.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Paid via</Label>
                    <Select
                        value={channel}
                        onValueChange={(v) => setChannel(v as PaymentChannel)}
                    >
                        <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="MPESA">M-Pesa Paybill</SelectItem>
                            <SelectItem value="BANK_TRANSFER">Bank transfer</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="referenceCode" className="text-xs font-semibold">
                        Transaction reference
                    </Label>
                    <Input
                        id="referenceCode"
                        value={referenceCode}
                        onChange={(e) => setReferenceCode(e.target.value.toUpperCase())}
                        placeholder={channel === "MPESA" ? "e.g. SGH7K2L9XQ" : "Bank reference"}
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        className="h-11 rounded-xl font-mono"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="amountPaid" className="text-xs font-semibold">
                        Amount paid ({quote.currency})
                    </Label>
                    <Input
                        id="amountPaid"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="h-11 rounded-xl"
                    />
                    <div className="flex flex-wrap gap-2 pt-1">
                        <button
                            type="button"
                            className={chipClass}
                            onClick={() => setAmount(String(deposit))}
                        >
                            Deposit ({PAYMENT_DETAILS.depositPercent}%)
                        </button>
                        <button
                            type="button"
                            className={chipClass}
                            onClick={() => setAmount(String(quote.totalPrice))}
                        >
                            Full amount
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="payerName" className="text-xs font-semibold">
                        Name or phone number used to pay
                    </Label>
                    <Input
                        id="payerName"
                        value={payerName}
                        onChange={(e) => setPayerName(e.target.value)}
                        placeholder="e.g. 07XX XXX XXX or account holder"
                        className="h-11 rounded-xl"
                    />
                </div>
            </div>

            <Button
                type="submit"
                variant="accent"
                className="h-12 w-full rounded-xl text-sm font-semibold shadow-md"
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Submitting…
                    </>
                ) : (
                    "Submit payment reference"
                )}
            </Button>
        </form>
    );
}

/* ============================================================
   QUOTE CARD
============================================================ */

function QuoteCard({
                       quote,
                       onDownload,
                       onAccept,
                       isAccepting,
                   }: {
    quote: QuoteResponse;
    onDownload: () => void;
    onAccept: () => void;
    isAccepting: boolean;
}) {
    const [agreed, setAgreed] = useState(false);
    const [reviewing, setReviewing] = useState(false);
    const expired = isExpired(quote.validUntil);
    const statusLabel =
        expired && quote.status === "SENT" ? "EXPIRED" : quote.status;
    const isOpen = quote.status === "SENT" && !expired;

    return (
        <Card
            className={`relative overflow-hidden rounded-3xl shadow-sm ${
                isOpen
                    ? "border-coral/30 bg-gradient-to-br from-coral/[0.07] via-background to-background"
                    : "border-border/70"
            }`}
        >
            {isOpen && (
                <span
                    className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-coral to-coral/30"
                    aria-hidden="true"
                />
            )}

            <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                            {formatCurrency(quote.totalPrice, quote.currency)}
                        </p>
                        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                            {quote.adultCount} adult{quote.adultCount !== 1 ? "s" : ""} ×{" "}
                            {formatCurrency(quote.pricePerAdult, quote.currency)}
                            {quote.childCount > 0 && quote.pricePerChild != null
                                ? ` + ${quote.childCount} child${
                                    quote.childCount !== 1 ? "ren" : ""
                                } × ${formatCurrency(quote.pricePerChild, quote.currency)}`
                                : ""}
                        </p>
                    </div>

                    <Badge
                        variant="outline"
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${quoteBadgeClass(
                            statusLabel,
                        )}`}
                    >
                        {statusLabel}
                    </Badge>
                </div>

                <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Valid until{" "}
                    <span className="font-semibold text-foreground">
                        {shortDate(quote.validUntil)}
                    </span>
                </p>

                {quote.inclusionsNote && (
                    <div className="rounded-2xl bg-muted/40 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                            What's included
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-foreground/80">
                            {quote.inclusionsNote}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                    <Button
                        variant="outline"
                        className="h-11 rounded-xl bg-background/80"
                        onClick={onDownload}
                    >
                        <Download className="mr-1.5 h-4 w-4" />
                        Download quote (PDF)
                    </Button>

                    {isOpen && !reviewing && (
                        <Button
                            variant="accent"
                            className="h-11 rounded-xl shadow-sm"
                            onClick={() => setReviewing(true)}
                        >
                            Review terms &amp; accept
                        </Button>
                    )}
                </div>

                {quote.status === "SENT" && expired && (
                    <p className="rounded-xl bg-destructive/5 p-3 text-xs text-destructive">
                        This quote has expired. Please contact us for an updated
                        quote.
                    </p>
                )}

                {isOpen && reviewing && (
                    <div
                        className={`space-y-4 rounded-2xl border border-border/70 bg-background p-4 sm:p-5 ${ENTER}`}
                    >
                        <p className="inline-flex items-center gap-2 text-xs font-bold">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            Payment terms
                        </p>

                        <ul className="list-disc space-y-1.5 pl-4 text-xs leading-5 text-muted-foreground">
                            {PAYMENT_TERMS.map((term) => (
                                <li key={term}>{term}</li>
                            ))}
                        </ul>

                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 p-3 text-xs transition-colors hover:bg-muted/30">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-0.5 h-4 w-4 shrink-0 accent-[#FF6B35]"
                            />
                            <span>I have read and agree to the payment terms above.</span>
                        </label>

                        <Button
                            variant="accent"
                            className="h-12 w-full rounded-xl text-sm font-semibold"
                            onClick={onAccept}
                            disabled={!agreed || isAccepting}
                        >
                            {isAccepting ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    Accepting…
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    Accept quote
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/* ============================================================
   PAGE
============================================================ */

export default function MyEnquiryPage() {
    const { id } = useParams<{ id: string }>();

    const [detail, setDetail] = useState<EnquiryDetailResponse | null>(null);
    const [submissions, setSubmissions] = useState<PaymentSubmissionResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setDetail(await enquiryApi.myEnquiryDetail(id));
            setError(null);
        } catch (err) {
            setError(errMsg(err, "Couldn't load your enquiry."));
            setIsLoading(false);
            return;
        }
        try {
            setSubmissions(await paymentApi.listMine(id));
        } catch (err) {
            toast.error(errMsg(err, "Couldn't load your payment history."));
        }
        setIsLoading(false);
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    // Customers never see draft quotes.
    const quotes = useMemo(
        () => (detail?.quotes ?? []).filter((q) => q.status !== "DRAFT"),
        [detail],
    );
    const acceptedQuote = quotes.find((q) => q.status === "ACCEPTED");
    const quoteSubmissions = submissions.filter(
        (s) => s.quoteId === acceptedQuote?.id,
    );
    const hasPending = quoteSubmissions.some(
        (s) => s.status === "PENDING_VERIFICATION",
    );
    const hasVerified = quoteSubmissions.some((s) => s.status === "VERIFIED");

    async function handleDownload(quoteId: string) {
        try {
            const blob = await enquiryApi.downloadQuotePdf(id, quoteId, false);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `damuchi-quote-${quoteId.slice(0, 8)}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (err) {
            toast.error(errMsg(err, "Couldn't download the quote."));
        }
    }

    async function handleAccept(quoteId: string) {
        setAcceptingId(quoteId);
        try {
            await enquiryApi.acceptQuote(id, quoteId, { termsAccepted: true });
            toast.success("Quote accepted. Follow the payment steps below.");
            await load();
        } catch (err) {
            toast.error(errMsg(err, "Couldn't accept the quote."));
        } finally {
            setAcceptingId(null);
        }
    }

    if (isLoading) {
        return (
            <div className="mx-auto w-full max-w-3xl space-y-4">
                <Skeleton className="h-56 w-full rounded-3xl" />
                <Skeleton className="h-48 w-full rounded-3xl" />
                <Skeleton className="h-64 w-full rounded-3xl" />
            </div>
        );
    }

    if (error || !detail) {
        return (
            <div className="mx-auto w-full max-w-3xl space-y-4">
                <EmptyState
                    icon={AlertTriangle}
                    title="Couldn't load your enquiry"
                    description={error ?? "Please try again."}
                />
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        className="h-10 rounded-xl"
                        onClick={() => {
                            setIsLoading(true);
                            void load();
                        }}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try again
                    </Button>
                </div>
            </div>
        );
    }

    const journeyDone = [
        quotes.length > 0,
        !!acceptedQuote || !!detail.bookingReference,
        hasVerified || !!detail.bookingReference,
        !!detail.bookingReference,
    ];

    return (
        <div className={`mx-auto w-full max-w-3xl space-y-6 pb-16 ${ENTER}`}>
            {/* Hero */}
            <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-emerald-950 p-5 text-white shadow-xl shadow-forest-950/10 sm:p-8">
                <HeroBackdrop />

                <div className="relative">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/80 backdrop-blur-sm">
                        <Sparkles className="h-3 w-3 text-coral" />
                        Your enquiry
                    </span>

                    <h1 className="mt-4 max-w-xl text-balance font-display text-2xl font-semibold leading-tight tracking-tight sm:text-4xl">
                        {detail.tourName}
                    </h1>

                    <div className="mt-7 rounded-2xl border border-white/10 bg-black/10 p-4 backdrop-blur-sm sm:p-5">
                        <JourneyStepper done={journeyDone} />
                    </div>
                </div>
            </section>

            {/* Booking confirmed */}
            {detail.bookingReference && (
                <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-background p-5 sm:p-6 dark:border-emerald-900/60 dark:from-emerald-950/30">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="h-5 w-5" />
                        </span>

                        <div className="min-w-0 space-y-1.5">
                            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                                Booking confirmed
                            </p>

                            <button
                                type="button"
                                onClick={() => copy(detail.bookingReference!)}
                                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1 font-mono text-sm font-semibold text-emerald-900 transition-colors hover:bg-white dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                                aria-label="Copy booking reference"
                            >
                                {detail.bookingReference}
                                <Copy className="h-3 w-3" />
                            </button>

                            {detail.travelStartDate && (
                                <p className="inline-flex items-center gap-1.5 text-sm text-emerald-900 dark:text-emerald-200">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    {shortDate(detail.travelStartDate)} →{" "}
                                    {shortDate(detail.travelEndDate)}
                                </p>
                            )}

                            <p className="text-xs leading-5 text-emerald-800/90 dark:text-emerald-300/80">
                                We've emailed your itinerary and pickup details.
                                Any remaining balance is due 14 days before
                                travel.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Quotes */}
            <section className="space-y-3">
                <SectionHeading title="Quotes" />

                {quotes.length === 0 ? (
                    <EmptyState
                        icon={Clock}
                        title="No quote yet"
                        description="We'll email you as soon as your quote is ready."
                    />
                ) : (
                    quotes.map((q) => (
                        <QuoteCard
                            key={q.id}
                            quote={q}
                            onDownload={() => handleDownload(q.id)}
                            onAccept={() => handleAccept(q.id)}
                            isAccepting={acceptingId === q.id}
                        />
                    ))
                )}
            </section>

            {/* Payment */}
            {acceptedQuote && !detail.bookingReference && (
                <section className="space-y-4">
                    <SectionHeading
                        title="Payment"
                        hint="Secure your trip with a deposit or the full amount."
                    />

                    {hasVerified ? (
                        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                            Your payment is verified. We're preparing your
                            booking and will email you the details.
                        </div>
                    ) : hasPending ? (
                        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                            We've received your payment reference and are
                            checking it against our records. We'll email you
                            once it's confirmed.
                        </div>
                    ) : (
                        <>
                            <PaymentInstructions quote={acceptedQuote} />
                            <PaymentSubmissionForm
                                enquiryId={id}
                                quote={acceptedQuote}
                                onSubmitted={load}
                            />
                        </>
                    )}

                    {quoteSubmissions.length > 0 && (
                        <div className="space-y-2.5">
                            <p className="text-xs font-semibold text-muted-foreground">
                                Your payment submissions
                            </p>

                            {quoteSubmissions.map((s) => (
                                <Card key={s.id} className="rounded-2xl border-border/70">
                                    <CardContent className="space-y-1.5 p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="min-w-0 truncate font-mono text-sm font-semibold">
                                                {s.referenceCode}
                                            </p>
                                            <SubmissionBadge status={s.status} />
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                            {formatCurrency(s.amountPaid, s.currency)} ·{" "}
                                            {s.channel === "MPESA" ? "M-Pesa" : "Bank transfer"} ·{" "}
                                            {shortDate(s.createdDate)}
                                        </p>

                                        {s.status === "REJECTED" && s.rejectionReason && (
                                            <p className="rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-700 dark:bg-red-950/30 dark:text-red-300">
                                                {s.rejectionReason}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}