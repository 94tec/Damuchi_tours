import {
    CATEGORY_LABELS,
    DIFFICULTY_LABELS,
    type TourCategory,
    type TourDifficulty,
    type TourSummary,
} from "@/types/tour";

/* ============================================================
   CONSTANTS
============================================================ */

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as TourCategory[];
export const DIFFICULTIES = Object.keys(DIFFICULTY_LABELS) as TourDifficulty[];

/** Cards revealed per "Show more" click. */
export const PAGE_STEP = 9;

export type TourSort = "recommended" | "price-asc" | "price-desc" | "rating";

export const SORTS: { value: TourSort; label: string }[] = [
    { value: "recommended", label: "Recommended" },
    { value: "price-asc", label: "Price: low to high" },
    { value: "price-desc", label: "Price: high to low" },
    { value: "rating", label: "Top rated" },
];

export interface TourFilters {
    q: string;
    category: TourCategory | "";
    difficulty: TourDifficulty | "";
    sort: TourSort;
}

export const DEFAULT_FILTERS: TourFilters = {
    q: "",
    category: "",
    difficulty: "",
    sort: "recommended",
};

/* ============================================================
   URL PARAM GUARDS (never trust the query string)
============================================================ */

export const isCategory = (v: string | null): v is TourCategory =>
    !!v && (CATEGORIES as string[]).includes(v);

export const isDifficulty = (v: string | null): v is TourDifficulty =>
    !!v && (DIFFICULTIES as string[]).includes(v);

export const isSort = (v: string | null): v is TourSort =>
    !!v && SORTS.some((s) => s.value === v);

/* ============================================================
   CLIENT-SIDE REFINEMENT (difficulty + sort)
   Tours without a price always sort last, in both directions.
============================================================ */

const compare = (a: number, b: number) => (a === b ? 0 : a < b ? -1 : 1);

export function refineTours(
    tours: TourSummary[],
    difficulty: TourDifficulty | "",
    sort: TourSort,
): TourSummary[] {
    const list = difficulty
        ? tours.filter((t) => t.difficulty === difficulty)
        : [...tours];

    switch (sort) {
        case "price-asc":
            return list.sort((a, b) =>
                compare(a.price ?? Infinity, b.price ?? Infinity),
            );
        case "price-desc":
            return list.sort((a, b) =>
                compare(b.price ?? -Infinity, a.price ?? -Infinity),
            );
        case "rating":
            return list.sort(
                (a, b) =>
                    (b.averageRating ?? 0) - (a.averageRating ?? 0) ||
                    (b.totalReviews ?? 0) - (a.totalReviews ?? 0),
            );
        default:
            return list;
    }
}