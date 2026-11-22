"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Quick trip finder that sits on the hero's lower edge.
 * It only builds a link: adjust TOURS_PATH and the query keys to whatever
 * your tours listing page actually reads.
 */
const TOURS_PATH = "/tours";

const EXPERIENCES = [
    { value: "safari",  label: "Safari" },
    { value: "beach",   label: "Beach" },
    { value: "gorilla", label: "Gorilla trekking" },
    { value: "mountain",label: "Mountain trek" },
    { value: "culture", label: "Culture" },
] as const;

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function SafariFinder() {
    const [exp, setExp] = useState<string>("");
    const [month, setMonth] = useState<string>("");

    const params = new URLSearchParams();
    if (exp) params.set("category", exp);
    if (month) params.set("month", month);
    const href = params.size ? `${TOURS_PATH}?${params}` : TOURS_PATH;

    return (
        <section aria-label="Find a tour" className="relative z-10 mx-auto -mt-10 max-w-5xl px-4 sm:px-6">
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-xl sm:p-6">
                <p className="mb-3 font-serif text-lg font-semibold text-foreground">
                    What kind of trip are you after?
                </p>

                <div role="group" aria-label="Experience type" className="flex flex-wrap gap-2">
                    {EXPERIENCES.map((e) => (
                        <button
                            key={e.value}
                            type="button"
                            aria-pressed={exp === e.value}
                            onClick={() => setExp(exp === e.value ? "" : e.value)}
                            className={cn(
                                "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                exp === e.value
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-background text-foreground hover:border-primary/60",
                            )}
                        >
                            {e.label}
                        </button>
                    ))}
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label className="flex flex-1 items-center gap-3 text-sm text-muted-foreground">
                        <span className="shrink-0">Travelling in</span>
                        <select
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <option value="">Any month</option>
                            {MONTHS.map((m) => <option key={m} value={m.toLowerCase()}>{m}</option>)}
                        </select>
                    </label>

                    <Link
                        href={href}
                        className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                        Show matching tours
                    </Link>
                </div>
            </div>
        </section>
    );
}