"use client";

import { useMemo } from "react";

import {
    CATEGORY_EMOJI,
    CATEGORY_LABELS,
    DIFFICULTY_LABELS,
} from "@/types/tour";
import { refineTours } from "@/hooks/tours-config";
import { ToursFilterBar } from "@/components/tours/tours-filter-bar";
import { ToursResults, type ActiveFilter } from "./tours-results";
import { useTourFilters } from "@/hooks/use-tour-filters";
import { useToursQuery } from "@/components/tours/use-tours-query";

/** Client part of the tours page: filters, data, results. */
export function ToursView() {
    const {
        filters,
        debouncedQ,
        hasActive,
        setQuery,
        setCategory,
        setDifficulty,
        setSort,
        clearAll,
    } = useTourFilters();

    const { tours: fetched, isLoading, isFetching, error, retry } = useToursQuery({
        q: debouncedQ,
        category: filters.category,
    });

    const tours = useMemo(
        () => refineTours(fetched, filters.difficulty, filters.sort),
        [fetched, filters.difficulty, filters.sort],
    );

    const activeFilters = useMemo<ActiveFilter[]>(() => {
        const list: ActiveFilter[] = [];
        const q = filters.q.trim();

        if (q) {
            list.push({ key: "q", label: `\u201C${q}\u201D`, onRemove: () => setQuery("") });
        }
        if (filters.category) {
            list.push({
                key: "category",
                label: `${CATEGORY_EMOJI[filters.category]} ${CATEGORY_LABELS[filters.category]}`,
                onRemove: () => setCategory(""),
            });
        }
        if (filters.difficulty) {
            list.push({
                key: "difficulty",
                label: DIFFICULTY_LABELS[filters.difficulty],
                onRemove: () => setDifficulty(""),
            });
        }

        return list;
    }, [filters.q, filters.category, filters.difficulty, setQuery, setCategory, setDifficulty]);

    return (
        <>
            <ToursFilterBar
                search={filters.q}
                onSearchChange={setQuery}
                category={filters.category}
                onCategoryChange={setCategory}
                difficulty={filters.difficulty}
                onDifficultyChange={setDifficulty}
                sort={filters.sort}
                onSortChange={setSort}
            />

            <ToursResults
                tours={tours}
                isLoading={isLoading}
                isFetching={isFetching}
                error={error}
                hasFilters={hasActive}
                activeFilters={activeFilters}
                onRetry={retry}
                onClearAll={clearAll}
            />
        </>
    );
}