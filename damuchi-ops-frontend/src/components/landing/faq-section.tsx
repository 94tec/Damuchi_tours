import { StructuredData } from "./structured-data";

/**
 * Server component, zero JS: native <details> gives keyboard + screen-reader
 * support for free, and the +/- icon rotates with CSS only.
 * EDIT THE ANSWERS so they match your real policies before launch.
 */
const FAQS = [
    {
        q: "How does an enquiry work?",
        a: "Pick a tour, send an enquiry with your dates and group size, and a local guide replies, usually within hours. Nothing is charged when you enquire.",
    },
    {
        q: "When is the best time to visit?",
        a: "It depends on the experience. Wildlife migrations, gorilla trekking seasons and beach weather all peak at different times, so tell us what you want to see and we will suggest the right months.",
    },
    {
        q: "Can I change a tour to fit my plans?",
        a: "Yes. Tours are starting points. Add days, swap destinations or adjust the pace, and your guide will confirm what is possible.",
    },
    {
        q: "How do payments and deposits work?",
        a: "Your guide shares the payment terms with your confirmed itinerary, before you commit to anything.",
    },
    {
        q: "Which countries do you cover?",
        a: "Kenya, Tanzania, Uganda and Rwanda, including multi-country trips.",
    },
];

export function FaqSection() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
    };

    return (
        <section aria-labelledby="faq-heading" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
            <StructuredData data={jsonLd} />
            <h2 id="faq-heading" className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Questions before you enquire
            </h2>
            <div className="mt-8 divide-y divide-border border-y border-border">
                {FAQS.map((f) => (
                    <details key={f.q} className="group py-1">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-medium text-foreground [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                            {f.q}
                            <span aria-hidden className="relative h-4 w-4 shrink-0">
                                <span className="absolute left-0 top-1/2 h-0.5 w-4 -translate-y-1/2 bg-accent" />
                                <span className="absolute left-1/2 top-0 h-4 w-0.5 -translate-x-1/2 bg-accent transition-transform duration-200 group-open:rotate-90 motion-reduce:transition-none" />
                            </span>
                        </summary>
                        <p className="pb-5 pr-8 leading-relaxed text-muted-foreground">{f.a}</p>
                    </details>
                ))}
            </div>
        </section>
    );
}