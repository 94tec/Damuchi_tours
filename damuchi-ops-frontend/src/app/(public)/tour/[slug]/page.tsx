// app/tour/[slug]/page.tsx
import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { tourApi } from "@/lib/tour-api";
import { TourDetailView } from "@/components/tours/tour-detail-view";

// Next 15+: params is a Promise. `await` is harmless on older versions.
type PageProps = { params: Promise<{ slug: string }> };

/** Handles every error shape an HTTP client might produce. */
function isNotFound(error: unknown) {
  const e = error as {
    statusCode?: number;
    status?: number;
    response?: { status?: number };
  } | null;

  return [e?.statusCode, e?.status, e?.response?.status].includes(404);
}

/**
 * cache() → generateMetadata and the page share ONE request per render.
 * The console.error is the important part: the browser only ever shows
 * a digest, so the real cause must be written to the server log.
 */
const loadTour = cache(async (slug: string) => {
  try {
    return await tourApi.getTourBySlug(slug);
  } catch (error) {
    if (isNotFound(error)) return null;

    console.error(`[tour-page] failed to load tour "${slug}"`, error);
    throw error; // → error.tsx
  }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tour = await loadTour(slug);

  if (!tour) return { title: "Tour not found | Kivana Trails & Safaris" };

  return {
    title: `${tour.name} | Kivana Trails & Safaris`,
    description: tour.tagline ?? undefined,
    openGraph: {
      title: tour.name,
      description: tour.tagline ?? undefined,
      images: tour.coverImageUrl ? [tour.coverImageUrl] : undefined,
    },
  };
}

export default async function TourPage({ params }: PageProps) {
  const { slug } = await params;
  const tour = await loadTour(slug);

  if (!tour) notFound();

  return <TourDetailView tour={tour} />;
}