// app/tour/[slug]/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default function TourError({
                                      error,
                                      reset,
                                  }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </span>

            <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">
                We couldn&apos;t load this tour
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Something went wrong on our side. Please try again, or browse our other
                journeys.
            </p>

            <div className="mt-6 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
                <Button onClick={reset} variant="accent" className="h-11 rounded-full px-6">
                    <RefreshCw className="h-4 w-4" />
                    Try again
                </Button>

                <Button asChild variant="outline" className="h-11 rounded-full px-6">
                    <Link href={routes.tours}>
                        All tours
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>

            {error.digest && (
                <p className="mt-6 font-mono text-[11px] text-muted-foreground/70">
                    Reference: {error.digest}
                </p>
            )}
        </div>
    );
}