"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { tourApi } from "@/lib/tour-api";
import { TourCard } from "@/components/tours/tour-card"; // adjust to where your card file lives
import {
  CATEGORY_EMOJI,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  type TourCategory,
  type TourDifficulty,
  type TourSummary,
} from "@/types/tour";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as TourCategory[];
const DIFFICULTIES = Object.keys(DIFFICULTY_LABELS) as TourDifficulty[];
const PAGE_STEP = 9;

type Sort = "recommended" | "price-asc" | "price-desc" | "rating";

const SORTS: { value: Sort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

function CardSkeleton() {
  return (
      <div className="overflow-hidden rounded-3xl border border-border/70 bg-card">
        <div className="aspect-[16/10] animate-pulse bg-muted" />
        <div className="space-y-3 p-6">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="mt-6 flex justify-between">
            <div className="h-8 w-28 animate-pulse rounded bg-muted" />
            <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>
  );
}

export default function ToursPage() {
  const [all, setAll] = useState<TourSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState<TourCategory | "">("");
  const [difficulty, setDifficulty] = useState<TourDifficulty | "">("");
  const [sort, setSort] = useState<Sort>("recommended");
  const [visible, setVisible] = useState(PAGE_STEP);

  // Debounce typing so we don't fire a request per keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Server filters: search text + category. Difficulty and sort happen client-side.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    tourApi
        .getTours({
          q: debounced || undefined,
          category: category || undefined,
          size: 100,
          signal: controller.signal,
        })
        .then((page) => {
          let items = page.content ?? [];
          // The search endpoint takes no category, so apply it here when searching
          if (debounced && category) items = items.filter((t) => t.category === category);
          setAll(items);
        })
        .catch((e) => {
          if (e?.name === "AbortError") return;
          setAll([]);
          setError(e?.message ?? "Couldn't load tours.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });

    return () => controller.abort();
  }, [debounced, category]);

  useEffect(() => setVisible(PAGE_STEP), [debounced, category, difficulty, sort]);

  const results = useMemo(() => {
    const list = difficulty ? all.filter((t) => t.difficulty === difficulty) : [...all];
    switch (sort) {
      case "price-asc":
        return list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      case "price-desc":
        return list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      case "rating":
        return list.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
      default:
        return list;
    }
  }, [all, difficulty, sort]);

  const hasFilters = !!(search || category || difficulty);

  function clearAll() {
    setSearch("");
    setCategory("");
    setDifficulty("");
    setSort("recommended");
  }

  return (
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-[#102f3d] to-[#0b4657] px-4 py-20 text-center sm:py-28">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-coral/15 blur-3xl" />
            <div className="absolute -bottom-48 -left-32 h-[26rem] w-[26rem] rounded-full bg-orange/10 blur-3xl" />
            <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:48px_48px]" />
          </div>
          <div className="relative mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral">
              Our journeys
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Find your <span className="text-coral">wild place.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
              From the Maasai Mara at dawn to the peaks of Mount Kenya: curated
              safaris led by guides who know the land.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="sticky top-[65px] z-30 border-b border-border bg-background/90 backdrop-blur-md">
          <div className="mx-auto max-w-7xl space-y-3 px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tours or destinations…"
                    aria-label="Search tours"
                    className="h-11 w-full rounded-xl border border-border/70 bg-card pl-10 pr-10 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-coral focus:ring-2 focus:ring-coral/15"
                />
                {search && (
                    <button
                        type="button"
                        onClick={() => setSearch("")}
                        aria-label="Clear search"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                )}
              </div>

              <div className="flex gap-2">
                <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as TourDifficulty | "")}
                    aria-label="Difficulty"
                    className="h-11 flex-1 rounded-xl border border-border/70 bg-card px-3 text-sm outline-none focus:border-coral sm:flex-none"
                >
                  <option value="">Any difficulty</option>
                  {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
                  ))}
                </select>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as Sort)}
                    aria-label="Sort"
                    className="h-11 flex-1 rounded-xl border border-border/70 bg-card px-3 text-sm outline-none focus:border-coral sm:flex-none"
                >
                  {SORTS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category chips */}
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none]">
              {[{ value: "" as const, label: "All" }, ...CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))].map(
                  ({ value, label }) => {
                    const active = category === value;
                    return (
                        <button
                            key={value || "all"}
                            type="button"
                            onClick={() => setCategory(value)}
                            aria-pressed={active}
                            className={[
                              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                              active
                                  ? "border-coral bg-coral text-white shadow-sm"
                                  : "border-border/70 bg-card text-muted-foreground hover:border-coral/40 hover:text-foreground",
                            ].join(" ")}
                        >
                          {value && <span aria-hidden="true">{CATEGORY_EMOJI[value]}</span>}
                          {label}
                        </button>
                    );
                  },
              )}
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          {!loading && !error && (
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{results.length}</span>{" "}
                  {results.length === 1 ? "journey" : "journeys"}
                </p>
                {hasFilters && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="text-xs font-medium text-coral hover:underline"
                    >
                      Clear filters
                    </button>
                )}
              </div>
          )}

          {error ? (
              <div className="py-24 text-center">
                <p className="text-lg font-medium">We couldn&apos;t load the tours</p>
                <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" className="mt-6 rounded-full" onClick={() => setDebounced((d) => d + " ")}>
                  Try again
                </Button>
              </div>
          ) : !loading && results.length === 0 ? (
              <div className="py-24 text-center">
                <SlidersHorizontal className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-4 text-lg font-medium">No tours match your filters</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try a different search, or clear the filters.
                </p>
                <Button variant="outline" className="mt-6 rounded-full" onClick={clearAll}>
                  Clear filters
                </Button>
              </div>
          ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {loading
                      ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
                      : results.slice(0, visible).map((tour) => (
                          <TourCard key={tour.id} tour={tour} />
                      ))}
                </div>

                {!loading && visible < results.length && (
                    <div className="mt-12 text-center">
                      <Button
                          variant="outline"
                          size="lg"
                          className="rounded-full px-8"
                          onClick={() => setVisible((v) => v + PAGE_STEP)}
                      >
                        Show more ({results.length - visible} left)
                      </Button>
                    </div>
                )}
              </>
          )}
        </section>
      </div>
  );
}