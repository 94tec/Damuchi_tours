import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { tourApi } from "@/lib/tour-api";
import { TourDetailView } from "@/components/tours/tour-detail-view";

async function loadTour(slug: string) {
  try {
    return await tourApi.getTourBySlug(slug);
  } catch (e) {
    if ((e as { statusCode?: number }).statusCode === 404) return null;
    throw e; // anything else goes to error.tsx
  }
}

export async function generateMetadata({
                                         params,
                                       }: {
  params: { slug: string };
}): Promise<Metadata> {
  const tour = await loadTour(params.slug);
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

export default async function TourPage({ params }: { params: { slug: string } }) {
  const tour = await loadTour(params.slug);
  if (!tour) notFound(); // renders your new 404 page
  return <TourDetailView tour={tour} />;
}