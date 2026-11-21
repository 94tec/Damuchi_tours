"use client";

import { useCallback, useEffect, useState } from "react";

import { tourApi } from "@/lib/tour-api";
import type { TourCategory, TourSummary } from "@/types/tour";

function isAbort(error: unknown) {
    const e = error as { name?: string; code?: string } | null;
    return (
        e?.name === "AbortError" ||
        e?.name === "CanceledError" ||
        e?.code === "ERR_CANCELED"
    );
}

/**
 * Server-side filters only (search text + category).
 * - isLoading: no response has settled yet (show skeletons)
 * - isFetching: any request in flight (keep old cards, dim them)
 */
export function useToursQuery({
                                  q,
                                  category,
                              }: {
    q: string;
    category: TourCategory | "";
}) {
    const [tours, setTours] = useState<TourSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        setIsFetching(true);
        setError(null);

        tourApi
            .getTours({
                q: q || undefined,
                category: category || undefined,
                size: 100,
                signal: controller.signal,
            })
            .then((page) => {
                if (controller.signal.aborted) return;

                let items = page.content ?? [];
                // The search endpoint takes no category, so apply it here when searching
                if (q && category) items = items.filter((t) => t.category === category);

                setTours(items);
            })
            .catch((e) => {
                if (isAbort(e) || controller.signal.aborted) return;

                setTours([]);
                setError(e?.message ?? "Couldn't load tours.");
            })
            .finally(() => {
                if (controller.signal.aborted) return;

                setIsFetching(false);
                setIsLoading(false);
            });

        return () => controller.abort();
    }, [q, category, attempt]);

    const retry = useCallback(() => setAttempt((n) => n + 1), []);

    return { tours, isLoading, isFetching, error, retry };
}