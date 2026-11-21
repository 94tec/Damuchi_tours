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
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#123D32] via-[#0F3329] to-[#0B2A22] px-4 py-14 text-center sm:py-24">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                <div
                    className="absolute inset-0 opacity-[0.1]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
                        backgroundSize: "24px 24px",
                    }}
                />
                <div className="absolute -right-24 -top-32 h-72 w-72 rounded-full bg-coral/15 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
                <div className="absolute -bottom-32 -left-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl sm:h-[26rem] sm:w-[26rem]" />
                <div className="absolute -right-16 -top-20 hidden h-56 w-56 rounded-full border border-white/10 sm:block" />
            </div>

            <div className="mx-auto max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-coral sm:text-xs">
                    {eyebrow}
                </p>

                <h1 className="mt-3 text-balance font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:mt-4 sm:text-6xl">
                    {title} <span className="text-coral">{highlight}</span>
                </h1>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/70 sm:mt-5 sm:text-base">
                    {description}
                </p>
            </div>
        </section>
    );
}