"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const FADE = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.18 },
};

export function ModalLoading({
                                 title,
                                 description = "Just a moment…",
                             }: {
    title: string;
    description?: string;
}) {
    return (
        <motion.div
            {...FADE}
            role="status"
            className="flex min-h-[320px] flex-col items-center justify-center gap-4 px-6"
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coral/10">
                <Loader2 className="h-5 w-5 animate-spin text-coral" aria-hidden="true" />
            </div>

            <div className="text-center">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            </div>
        </motion.div>
    );
}

/** Shared empty / error / no-results layout. */
export function ModalMessage({
                                 icon: Icon,
                                 title,
                                 description,
                                 action,
                                 tone = "neutral",
                                 compact = false,
                             }: {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
    tone?: "neutral" | "danger";
    compact?: boolean;
}) {
    return (
        <motion.div
            {...FADE}
            className={`flex flex-col items-center justify-center px-6 text-center ${
                compact ? "min-h-[240px]" : "min-h-[320px]"
            }`}
        >
            <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                    tone === "danger"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-coral/10 text-coral"
                }`}
            >
                <Icon className="h-6 w-6" aria-hidden="true" />
            </div>

            <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
                {title}
            </h3>

            <p className="mt-1.5 max-w-xs text-sm leading-6 text-muted-foreground">
                {description}
            </p>

            {action && <div className="mt-5">{action}</div>}
        </motion.div>
    );
}