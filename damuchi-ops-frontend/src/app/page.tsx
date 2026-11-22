import { Navbar }              from "@/components/layout/navbar";
import { Footer }              from "@/components/layout/footer";
import { WelcomeBackBand }     from "@/components/landing/welcome-back-band";
import { Hero }                from "@/components/landing/hero/hero";
import { TourGrid }            from "@/components/tours/tour-grid";
import { DestinationsStrip }   from "@/components/landing/destinations-strip";
import { HowItWorks }          from "@/components/landing/how-it-works";
import { Testimonials }        from "@/components/landing/testimonials";
import { CtaBandGate }         from "@/components/landing/cta-band-gate";
import { FloatingEnquiryCta }  from "@/components/landing/floating-enquiry-cta";
// new
import { ScrollProgress }      from "@/components/landing/scroll-progress";
import { SectionNav }          from "@/components/landing/section-nav";
import { SafariFinder }        from "@/components/landing/safari-finder";
import { FaqSection }          from "@/components/landing/faq-section";
import { FloatingActions }     from "@/components/landing/floating-actions";
import { StructuredData }      from "@/components/landing/structured-data";
import type { Metadata }       from "next";

const SITE_URL = process.env.NEXT_PUBLIC_TOUR_PORTAL_URL;

export const metadata: Metadata = {
    // `absolute` stops the layout's "%s | Kivana…" template from repeating the brand name.
    title:       { absolute: "Kivana Trails & Safaris | East Africa's tours, real local guides" },
    description: "Safaris across Kenya, Tanzania, Uganda & Rwanda — beach escapes, mountain treks, gorilla encounters, and cultural tours. Send an enquiry and hear back from a real local guide within hours.",
    alternates:  { canonical: "/" },
    robots:      { index: true, follow: true },
    openGraph: {
        title:       "Kivana Trails & Safaris | East Africa's tours, real local guides",
        description: "Savannahs, coastlines, volcanoes, and gorillas — enquire directly with local experts across East Africa.",
        type:        "website",
    },
};

const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Kivana Trails & Safaris",
    url: SITE_URL,
    areaServed: ["Kenya", "Tanzania", "Uganda", "Rwanda"],
};

/**
 * Public landing page. VisitorProvider is already supplied by app/layout.tsx,
 * so it is NOT repeated here.
 *
 * Order: Navbar → WelcomeBackBand (customers) → Hero → SafariFinder →
 * TrustStats → Tours → Destinations → How it works → Reviews → FAQ →
 * CtaBandGate (guests) → Footer.
 */
export default function PublicLandingPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <StructuredData data={orgJsonLd} />
            <ScrollProgress />
            <Navbar />
            <SectionNav />
            <WelcomeBackBand />

            <main className="flex-1">
                <Hero />
                <SafariFinder />
                <div id="tours">        <TourGrid /></div>
                <div id="destinations"> <DestinationsStrip /></div>
                <div id="how-it-works"> <HowItWorks /></div>
                <div id="reviews">      <Testimonials /></div>
                <div id="faq"><FaqSection /></div>
                <CtaBandGate />
            </main>

            <Footer />
            <FloatingEnquiryCta />
            <FloatingActions />
        </div>
    );
}