// components/enquiry/enquiry-form.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
    CalendarDays,
    Check,
    CircleUserRound,
    Mail,
    MessageCircle,
    Phone,
    ShieldCheck,
    Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { enquiryApi } from "@/lib/enquiry-api";
import { formatCurrency } from "@/lib/utils";
import {
    enquirySchema,
    type EnquiryFormValues,
    PREFERRED_CONTACT_OPTIONS,
    PREFERRED_CONTACT_LABELS,
} from "@/lib/validations/enquiry";
import type { ApiError } from "@/types/index-types";

import {
    CheckboxField,
    FormSection,
    SelectField,
    StepperField,
    TextAreaField,
    TextField,
} from "./enquiry-form-fields";

interface EnquiryFormProps {
    /** Required: enquiry endpoint requires a tour. */
    tourId: string;

    /** Display-only tour context. */
    tourName?: string;

    /** Listed per-person price of the selected tour. */
    pricePerPerson?: number;
    currency?: string;

    availabilityId?: string;

    /** Where the enquiry originated. */
    source?: string;

    /** Hide the "Enquiring about" card (e.g. when a header already shows the tour). */
    hideTourContext?: boolean;

    /** Hide the trust line under the submit button. */
    hideTrustNote?: boolean;

    onSuccess?: () => void;
}

const PREFERRED_CONTACT_SELECT_OPTIONS = PREFERRED_CONTACT_OPTIONS.map((value) => ({
    value,
    label: PREFERRED_CONTACT_LABELS[value],
}));

/** Local (not UTC) YYYY-MM-DD, used as the earliest selectable date. */
function todayLocalISO() {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
}

export function EnquiryForm({
                                tourId,
                                tourName,
                                pricePerPerson,
                                currency = "KES",
                                availabilityId,
                                source,
                                hideTourContext = false,
                                hideTrustNote = false,
                                onSuccess,
                            }: EnquiryFormProps) {
    const today = useMemo(todayLocalISO, []);

    const baseDefaults = useMemo<Partial<EnquiryFormValues>>(
        () => ({
            fullName: "",
            email: "",
            phone: "",
            tourId,
            availabilityId,
            groupSizeAdults: 2,
            groupSizeChildren: 0,
            flexibleDates: false,
            consent: false,
            source,
        }),
        [tourId, availabilityId, source],
    );

    const form = useForm<EnquiryFormValues>({
        resolver: zodResolver(enquirySchema),
        defaultValues: baseDefaults as EnquiryFormValues,
    });

    // Keep hidden values in sync if the form is reused for another tour
    useEffect(() => {
        form.setValue("tourId", tourId);
        form.setValue("availabilityId", availabilityId);
        form.setValue("source", source);
    }, [form, tourId, availabilityId, source]);

    const adults = form.watch("groupSizeAdults");

    async function onSubmit(values: EnquiryFormValues) {
        try {
            // availabilityId is intentionally not sent in the payload (as before)
            const { tourId: id, availabilityId: _availabilityId, ...payload } = values;
            await enquiryApi.createEnquiry(id, payload);

            toast.success("Enquiry sent. We'll reply within 2 hours.");
            form.reset(baseDefaults as EnquiryFormValues);
            onSuccess?.();
        } catch (err) {
            toast.error(
                (err as ApiError)?.message ||
                "Couldn't send your enquiry. Please try again.",
            );
        }
    }

    const hasAdults = typeof adults === "number" && adults > 0;

    return (
        <div className="w-full">
            {/* Tour context */}
            {tourName && !hideTourContext && (
                <div className="mb-5 rounded-2xl border border-coral/15 bg-coral/[0.06] p-3.5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-coral/10 text-coral">
                            <MessageCircle className="h-4 w-4" aria-hidden="true" />
                        </span>

                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-coral/80">
                                Enquiring about
                            </p>
                            <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                                {tourName}
                            </p>
                        </div>

                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-coral/10 text-coral">
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                    </div>
                </div>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-7">
                    {/* ───────────── Contact ───────────── */}
                    <FormSection
                        icon={CircleUserRound}
                        title="Your details"
                        description="How should we get in touch?"
                    >
                        <TextField
                            control={form.control}
                            name="fullName"
                            label="Full name"
                            icon={CircleUserRound}
                            placeholder="e.g. Aisha Mwangi"
                            autoComplete="name"
                            autoCapitalize="words"
                        />

                        <TextField
                            control={form.control}
                            name="email"
                            type="email"
                            label="Email address"
                            icon={Mail}
                            placeholder="you@example.com"
                            autoComplete="email"
                            autoCapitalize="none"
                            spellCheck={false}
                        />

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <TextField
                                control={form.control}
                                name="phone"
                                type="tel"
                                label="Phone"
                                optional
                                icon={Phone}
                                placeholder="+254 7xx xxx xxx"
                                autoComplete="tel"
                                inputMode="tel"
                            />

                            <SelectField
                                control={form.control}
                                name="preferredContact"
                                label="Contact via"
                                emptyLabel="No preference"
                                options={PREFERRED_CONTACT_SELECT_OPTIONS}
                            />
                        </div>
                    </FormSection>

                    {/* ───────────── Trip details ───────────── */}
                    <FormSection
                        icon={CalendarDays}
                        title="Trip details"
                        description="Help us understand your plans"
                    >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <StepperField
                                control={form.control}
                                name="groupSizeAdults"
                                label="Adults"
                                min={1}
                            />

                            <StepperField
                                control={form.control}
                                name="groupSizeChildren"
                                label="Children"
                                optional
                                min={0}
                            />
                        </div>

                        <TextField
                            control={form.control}
                            name="preferredDate"
                            type="date"
                            label="Preferred date"
                            optional
                            icon={CalendarDays}
                            min={today}
                        />

                        <CheckboxField
                            control={form.control}
                            name="flexibleDates"
                            title="My dates are flexible"
                            description="We can suggest dates with better availability."
                        />
                    </FormSection>

                    {/* ───────────── Preferences ───────────── */}
                    <FormSection
                        icon={Wallet}
                        title="Preferences"
                        description="Optional details help us tailor the trip."
                    >
                        <TextField
                            control={form.control}
                            name="budgetRange"
                            label="Budget range"
                            optional
                            placeholder={`e.g. ${currency} 150,000 per person`}
                            hint={
                                pricePerPerson != null ? (
                                    <>
                                        Listed price:{" "}
                                        {formatCurrency(pricePerPerson, currency)} per person
                                        {hasAdults && (
                                            <>
                                                {" "}
                                                · about{" "}
                                                {formatCurrency(pricePerPerson * adults, currency)}{" "}
                                                for {adults} adult{adults === 1 ? "" : "s"}
                                            </>
                                        )}
                                        . Children&apos;s rates may differ.
                                    </>
                                ) : undefined
                            }
                        />

                        <TextAreaField
                            control={form.control}
                            name="requirements"
                            label="Anything else we should know?"
                            optional
                            placeholder="Dietary needs, accessibility, special occasions, interests…"
                        />
                    </FormSection>

                    {/* ───────────── Consent + submit ───────────── */}
                    <div className="space-y-4">
                        <CheckboxField
                            control={form.control}
                            name="consent"
                            description="I agree to be contacted about this enquiry and understand my details will be handled according to the privacy policy."
                        />

                        <Button
                            type="submit"
                            variant="accent"
                            size="lg"
                            className="h-12 w-full rounded-xl text-sm font-semibold shadow-lg shadow-coral/10 transition-all hover:shadow-xl hover:shadow-coral/15"
                            loading={form.formState.isSubmitting}
                        >
                            Send enquiry
                        </Button>

                        {!hideTrustNote && (
                            <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground/80">
                                <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                Your details are encrypted and never shared with third parties.
                            </p>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    );
}