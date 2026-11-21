// app/tours/page.tsx  (server component)
import type { Metadata } from "next";
import { Suspense } from "react";

import { TourCardSkeleton } from "@/components/tours/tour-card-skeleton"; // adjust path if different
import { ToursHero } from "@/components/tours/tours-hero";
import { ToursView } from "@/components/tours/tours-view";

export const metadata: Metadata = {
  title: "Safaris & Tours",
  description:
      "Browse curated safaris, beach escapes, mountain treks and cultural journeys across Kenya, Tanzania, Uganda and Rwanda.",
  openGraph: {
    title: "Safaris & Tours",
    description:
        "Curated safaris led by guides who know the land. Find your wild place.",
  },
};

export default function ToursPage() {
  return (
      <div className="min-h-dvh bg-background">
        <ToursHero />

        {/* useSearchParams (URL-synced filters) requires a Suspense boundary */}
        <Suspense fallback={<ToursFallback />}>
          <ToursView />
        </Suspense>
      </div>
  );
}

function ToursFallback() {
  return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10" aria-busy="true">
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
              <TourCardSkeleton key={i} />
          ))}
        </div>
      </div>
  );
}