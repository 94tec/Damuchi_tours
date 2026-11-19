"use client";

import { MessageSquareText } from "lucide-react";

import { EnquiryModal } from "@/components/landing/enquiry/enquiry-modal";

interface FooterCtaProps {
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
    steps: readonly string[];
    /** Analytics source passed to the enquiry modal. */
    source: string;
}

export function FooterCta({
                              eyebrow,
                              title,
                              highlight,
                              description,
                              steps,
                              source,
                          }: FooterCtaProps) {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5 sm:p-8 lg:p-10">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-coral/15 blur-3xl"
            />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
                <div className="max-w-2xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-coral/25 bg-coral/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-coral sm:text-[11px]">
                        <MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />
                        {eyebrow}
                    </span>

                    <h2 className="mt-4 text-balance font-display text-2xl font-medium leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                        {title}{" "}
                        <span className="text-coral">{highlight}</span>
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/60 sm:text-base sm:leading-7">
                        {description}
                    </p>
                </div>

                {/* Full-width tap target on phones */}
                <div className="w-full shrink-0 lg:w-auto [&>button]:w-full lg:[&>button]:w-auto">
                    <EnquiryModal source={source} />
                </div>
            </div>

            {/* Journey steps */}
            <ol className="relative mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-white/10 pt-5 sm:mt-8 sm:pt-6 lg:grid-cols-4">
                {steps.map((step, index) => (
                    <li key={step} className="flex items-start gap-2.5">
                        <span className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06] font-mono text-[10px] text-coral ring-1 ring-inset ring-white/10">
                            {index + 1}
                        </span>
                        <span className="text-xs leading-5 text-white/60 sm:text-[13px]">
                            {step}
                        </span>
                    </li>
                ))}
            </ol>
        </div>
    );
}