"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

export interface StatusFilterOption<T extends string = string> {
    value: T;
    label: string;
    /** Tailwind bg class for the small status dot, e.g. "bg-amber-500" */
    dotClassName?: string;
}

interface StatusFilterProps<T extends string = string> {
    options: StatusFilterOption<T>[];
    value: T;
    onChange: (value: T) => void;
    /** Small caption on the mobile trigger. */
    label?: string;
    /** Accessible name for the whole control. */
    ariaLabel?: string;
    className?: string;
}

/* ============================================================
   COMPONENT

   < sm  : one compact row ("Status · Quote ready ⌄") that expands
           in place into a 2-column grid. No horizontal scrolling,
           never more than one row tall until opened.
   ≥ sm  : segmented control inside a soft container, wraps neatly.
============================================================ */

export function StatusFilter<T extends string = string>({
                                                            options,
                                                            value,
                                                            onChange,
                                                            label = "Status",
                                                            ariaLabel = "Filter by status",
                                                            className = "",
                                                        }: StatusFilterProps<T>) {
    const [open, setOpen] = useState(false);
    const panelId = useId();
    const rootRef = useRef<HTMLDivElement>(null);

    const active = options.find((o) => o.value === value) ?? options[0];

    // Close on outside tap/click and on Escape
    useEffect(() => {
        if (!open) return;

        const onPointerDown = (e: PointerEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };

        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    function select(next: T) {
        onChange(next);
        setOpen(false);
    }

    return (
        <div
            ref={rootRef}
            role="group"
            aria-label={ariaLabel}
            className={`rounded-2xl border border-border/70 bg-muted/40 p-1.5 ${className}`}
        >
            {/* ---------------- Mobile: compact trigger ---------------- */}
            <div className="sm:hidden">
                <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpen((v) => !v)}
                    className="
                        flex h-12 w-full items-center justify-between gap-3
                        rounded-xl border border-border/60 bg-background px-3.5
                        text-left shadow-sm transition-all active:scale-[0.99]
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral
                    "
                >
                    <span className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-coral/10 text-coral">
                            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                        </span>

                        <span className="min-w-0">
                            <span className="block text-[10px] font-semibold uppercase leading-none tracking-[0.14em] text-muted-foreground">
                                {label}
                            </span>
                            <span className="mt-1 flex items-center gap-1.5 text-sm font-semibold leading-none text-foreground">
                                {active.dotClassName && (
                                    <span
                                        aria-hidden="true"
                                        className={`h-2 w-2 shrink-0 rounded-full ${active.dotClassName}`}
                                    />
                                )}
                                <span className="truncate">{active.label}</span>
                            </span>
                        </span>
                    </span>

                    <ChevronDown
                        aria-hidden="true"
                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                            open ? "rotate-180" : ""
                        }`}
                    />
                </button>

                {open && (
                    <div
                        id={panelId}
                        className="
                            mt-1.5 grid grid-cols-2 gap-1.5
                            animate-in fade-in slide-in-from-top-1 duration-200
                            motion-reduce:animate-none
                        "
                    >
                        {options.map((option, index) => {
                            const selected = option.value === value;
                            // First option ("All") spans the full row
                            const span = index === 0 ? "col-span-2" : "";

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => select(option.value)}
                                    className={`
                                        ${span}
                                        flex h-11 min-w-0 items-center justify-between gap-2
                                        rounded-xl px-3 text-sm font-medium transition-all
                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral
                                        ${
                                        selected
                                            ? "bg-background font-semibold text-foreground shadow-sm ring-1 ring-coral/40"
                                            : "text-muted-foreground hover:bg-background/70 hover:text-foreground active:bg-background"
                                    }
                                    `}
                                >
                                    <span className="flex min-w-0 items-center gap-2">
                                        {option.dotClassName && (
                                            <span
                                                aria-hidden="true"
                                                className={`h-2 w-2 shrink-0 rounded-full ${option.dotClassName}`}
                                            />
                                        )}
                                        <span className="truncate">{option.label}</span>
                                    </span>

                                    {selected && (
                                        <Check
                                            className="h-4 w-4 shrink-0 text-coral"
                                            aria-hidden="true"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ---------------- ≥ sm: segmented control ---------------- */}
            <div className="hidden flex-wrap gap-1 sm:flex">
                {options.map((option) => {
                    const selected = option.value === value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => onChange(option.value)}
                            className={`
                                inline-flex h-9 items-center gap-2 rounded-xl px-3.5
                                text-xs font-semibold transition-all
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral
                                ${
                                selected
                                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/80"
                                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                            }
                            `}
                        >
                            {option.dotClassName && (
                                <span
                                    aria-hidden="true"
                                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${option.dotClassName}`}
                                />
                            )}
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}