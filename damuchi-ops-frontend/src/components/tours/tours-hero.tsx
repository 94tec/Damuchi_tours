interface ToursHeroProps {
    eyebrow?: string;
    title?: string;
    highlight?: string;
    description?: string;
}

/** Server component: the H1 is in the initial HTML for SEO. */
export function ToursHero({
                              eyebrow = "Our journeys",
                              title = "Find your",
                              highlight = "wild place.",
                              description = "From the Maasai Mara at dawn to the peaks of Mount Kenya: curated safaris led by guides who know the land.",
                          }: ToursHeroProps) {
    return (
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#123D32] via-[#0F3329] to-[#0B2A22] px-4 py-6 text-center sm:py-10">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                <div
                    className="absolute inset-0 opacity-[0.1]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
                        backgroundSize: "24px 24px",
                    }}
                />
                <div className="absolute -right-20 -top-24 h-48 w-48 rounded-full bg-coral/15 blur-3xl sm:h-64 sm:w-64" />
                <div className="absolute -bottom-24 -left-20 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl sm:h-60 sm:w-60" />
                <div className="absolute -right-12 -top-16 hidden h-40 w-40 rounded-full border border-white/10 sm:block" />
            </div>

            <div className="mx-auto max-w-3xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-coral sm:text-xs">
                    {eyebrow}
                </p>

                <h1 className="mt-1.5 text-balance font-display text-2xl font-bold leading-[1.15] tracking-tight text-white sm:mt-2 sm:text-4xl">
                    {title} <span className="text-coral">{highlight}</span>
                </h1>

                <p className="mx-auto mt-2 max-w-xl text-xs leading-6 text-white/70 sm:mt-3 sm:text-sm sm:leading-7">
                    {description}
                </p>
            </div>
        </section>
    );
}