"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Trip finder on the hero's lower edge. It only builds a link, so set
 * TOURS_PATH and the query keys (category, month, guests) to whatever your
 * tours listing reads. ENQUIRY_PATH is the "not sure?" fallback.
 */
const TOURS_PATH = "/tour";
const ENQUIRY_PATH = "/enquiry";

type Icon = (p: { className?: string }) => ReactNode;
const svg = (d: ReactNode): Icon =>
    function I({ className }) {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
                 strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
                {d}
            </svg>
        );
    };

const SafariIcon   = svg(<><circle cx="12" cy="9" r="3.5" /><path d="M2 19h20M5 19c1.5-3 4-4.5 7-4.5s5.500 1.500 7 4.500" /></>);
const BeachIcon    = svg(<><path d="M2 15c2.500 0 2.500-2 5-2s2.500 2 5 2 2.500-2 5-2 2.500 2 5 2M2 20c2.500 0 2.500-2 5-2s2.500 2 5 2 2.500-2 5-2 2.500 2 5 2" /><circle cx="17" cy="6" r="2.500" /></>);
const GorillaIcon  = svg(<><path d="M12 21c-5-3-7-7-6-12 3 0 5 1 6 3 1-2 3-3 6-3 1 5-1 9-6 12Z" /><path d="M12 12v9" /></>);
const MountainIcon = svg(<path d="m3 20 6.500-12 4 7 2.500-4L21 20H3Z" />);
const CultureIcon  = svg(<><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.200" /><path d="M3 20c0-3.500 2.700-6 6-6s6 2.500 6 6M15.500 14.200c2.800.2 5.500 2 5.500 5.800" /></>);

const EXPERIENCES: {
    value: string; label: string; Icon: Icon; hint: string;
}[] = [
    { value: "safari",   label: "Safari",       Icon: SafariIcon,   hint: "Wildlife viewing is usually strongest in the dry months, roughly Jul–Oct." },
    { value: "beach",    label: "Beach",        Icon: BeachIcon,    hint: "Calmer, drier coast weather is typically Dec–Mar and Jul–Oct." },
    { value: "gorilla",  label: "Gorillas",     Icon: GorillaIcon,  hint: "Trails are easier in the drier months, roughly Jun–Sep and Dec–Feb." },
    { value: "mountain", label: "Mountain trek",Icon: MountainIcon, hint: "Clearer climbing windows are usually Jan–Mar and Jun–Oct." },
    { value: "culture",  label: "Culture",      Icon: CultureIcon,  hint: "Cultural tours run well all year, so pick the dates that suit you." },
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export function SafariFinder() {
    const [exp, setExp] = useState("");
    const [month, setMonth] = useState("");
    const [guests, setGuests] = useState(2);

    const selected = EXPERIENCES.find((e) => e.value === exp);
    const dirty = Boolean(exp || month || guests !== 2);

    const href = useMemo(() => {
        const p = new URLSearchParams();
        if (exp) p.set("category", exp);
        if (month) p.set("month", month);
        if (guests !== 2) p.set("guests", String(guests));
        const q = p.toString();
        return q ? `${TOURS_PATH}?${q}` : TOURS_PATH;
    }, [exp, month, guests]);

    const cta =
        exp || month
            ? `Show ${selected ? selected.label.toLowerCase() + " tours" : "tours"}${month ? ` for ${MONTHS[Number(month) - 1]}` : ""}`
            : "Browse all tours";

    return (
        <section aria-labelledby="finder-heading" className="relative z-10 mx-auto -mt-12 max-w-5xl px-4 sm:px-6">
            <div className="rounded-3xl border border-border/70 bg-card/95 p-5 shadow-[0_24px_60px_-20px_rgba(11,31,26,0.35)] backdrop-blur sm:p-7">
                <div className="flex items-baseline justify-between gap-4">
                    <h2 id="finder-heading" className="font-serif text-xl font-semibold text-foreground sm:text-2xl">
                        Where do you want to go?
                    </h2>
                    {dirty && (
                        <button
                            type="button"
                            onClick={() => { setExp(""); setMonth(""); setGuests(2); }}
                            className="rounded text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Experience tiles: scroll-snap row on mobile, 5-up grid on desktop */}
                <div
                    role="group"
                    aria-label="Experience type"
                    className="-mx-5 mt-4 flex snap-x gap-2.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
                >
                    {EXPERIENCES.map(({ value, label, Icon }) => {
                        const on = exp === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                aria-pressed={on}
                                onClick={() => setExp(on ? "" : value)}
                                className={cn(
                                    "group flex min-w-[7.5rem] shrink-0 snap-start flex-col items-start gap-3 rounded-2xl border p-4 text-left sm:min-w-0",
                                    "transition-all duration-200 ease-out motion-reduce:transition-none",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                                    on
                                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                                        : "border-border bg-background text-foreground hover:-translate-y-0.5 hover:border-accent hover:shadow-md",
                                )}
                            >
                                <Icon className={cn("h-6 w-6 transition-colors", on ? "text-primary-foreground" : "text-accent")} />
                                <span className="text-sm font-semibold leading-tight">{label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Season hint: answers "when should I go?" without leaving the page */}
                <p aria-live="polite" className="mt-3 min-h-[1.25rem] text-sm text-muted-foreground">
                    {selected ? selected.hint : "Pick an experience to see the usual best months."}
                </p>

                <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                    <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Travelling in</span>
                        <select
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="">Any month</option>
                            {MONTHS.map((m, i) => <option key={m} value={String(i + 1)}>{m}</option>)}
                        </select>
                    </label>

                    <div>
                        <span id="guests-label" className="mb-1.5 block text-xs font-medium text-muted-foreground">Travellers</span>
                        <div role="group" aria-labelledby="guests-label" className="flex h-11 items-center rounded-xl border border-border bg-background">
                            <button
                                type="button"
                                aria-label="Fewer travellers"
                                disabled={guests <= 1}
                                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                                className="grid h-full w-11 place-items-center rounded-l-xl text-lg text-foreground transition-colors hover:bg-muted disabled:opacity-30"
                            >
                                −
                            </button>
                            <output aria-live="polite" className="w-8 text-center text-sm font-semibold tabular-nums text-foreground">{guests}</output>
                            <button
                                type="button"
                                aria-label="More travellers"
                                disabled={guests >= 20}
                                onClick={() => setGuests((g) => Math.min(20, g + 1))}
                                className="grid h-full w-11 place-items-center rounded-r-xl text-lg text-foreground transition-colors hover:bg-muted disabled:opacity-30"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <Link
                        href={href}
                        className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                    >
                        {cta}
                        <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                    </Link>
                </div>

                <p className="mt-4 text-sm text-muted-foreground">
                    Not sure yet?{" "}
                    <Link href={ENQUIRY_PATH} className="font-medium text-foreground underline underline-offset-4 decoration-accent hover:decoration-2">
                        Tell a local guide what you have in mind
                    </Link>
                </p>
            </div>
        </section>
    );
}