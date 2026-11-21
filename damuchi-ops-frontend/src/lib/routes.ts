// lib/routes.ts
// One place that decides the URLs. Change TOUR_BASE here if your detail
// pages live under /tours/[slug] instead of /tour/[slug].

const TOUR_BASE = "/tour";

export const routes = {
    /** Listing page. */
    tours: TOUR_BASE,

    /** Detail page. Slug is encoded; a missing slug falls back to the listing. */
    tour: (slug?: string | null) =>
        slug ? `${TOUR_BASE}/${encodeURIComponent(slug)}` : TOUR_BASE,
} as const;