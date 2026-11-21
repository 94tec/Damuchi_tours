"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { TourCategory, TourDifficulty } from "@/types/tour";
import {
  DEFAULT_FILTERS,
  isCategory,
  isDifficulty,
  isSort,
  type TourFilters,
  type TourSort,
} from "./tours-config";

function parseFilters(params: { get(name: string): string | null }): TourFilters {
  const category = params.get("category");
  const difficulty = params.get("difficulty");
  const sort = params.get("sort");

  return {
    q: params.get("q") ?? "",
    category: isCategory(category) ? category : "",
    difficulty: isDifficulty(difficulty) ? difficulty : "",
    sort: isSort(sort) ? sort : DEFAULT_FILTERS.sort,
  };
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/**
 * Filter state that survives refresh, back/forward and sharing:
 * initialised from the URL, written back with router.replace
 * (no history spam, no scroll jump).
 */
export function useTourFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<TourFilters>(() =>
      parseFilters(searchParams),
  );

  const debouncedQ = useDebouncedValue(filters.q.trim(), 300);

  // State → URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedQ) params.set("q", debouncedQ);
    if (filters.category) params.set("category", filters.category);
    if (filters.difficulty) params.set("difficulty", filters.difficulty);
    if (filters.sort !== DEFAULT_FILTERS.sort) params.set("sort", filters.sort);

    const next = params.toString();
    if (next === searchParams.toString()) return;

    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [debouncedQ, filters.category, filters.difficulty, filters.sort, pathname, router, searchParams]);

  const setQuery = useCallback((q: string) => setFilters((f) => ({ ...f, q })), []);
  const setCategory = useCallback(
      (category: TourCategory | "") => setFilters((f) => ({ ...f, category })),
      [],
  );
  const setDifficulty = useCallback(
      (difficulty: TourDifficulty | "") => setFilters((f) => ({ ...f, difficulty })),
      [],
  );
  const setSort = useCallback((sort: TourSort) => setFilters((f) => ({ ...f, sort })), []);
  const clearAll = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const hasActive = Boolean(
      filters.q.trim() || filters.category || filters.difficulty,
  );

  return {
    filters,
    debouncedQ,
    hasActive,
    setQuery,
    setCategory,
    setDifficulty,
    setSort,
    clearAll,
  };
}