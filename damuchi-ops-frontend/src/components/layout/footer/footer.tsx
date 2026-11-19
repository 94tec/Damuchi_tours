import { FooterBottomBar } from "./footer-bottom-bar";
import { FooterBrand } from "./footer-brand";
import { FooterContact } from "./footer-contact";
import { FooterCta } from "./footer-cta";
import { FooterLinkGroup } from "./footer-link-group";
import {
    FOOTER_BRAND,
    FOOTER_CONTACT,
    FOOTER_CTA,
    FOOTER_LEGAL_LINKS,
    FOOTER_LINK_GROUPS,
    FOOTER_SOCIALS,
} from "./footer-config";

interface FooterProps {
    className?: string;
}

/**
 * Server component. Only <FooterCta /> is a client component
 * (it hosts the enquiry modal).
 *
 * Phones : CTA → brand → 2-column link grid → stacked contact panel → legal
 * Tablet : link groups go 3-up
 * Desktop: brand (4 cols) + link groups (8 cols), contact panel in 3 columns
 */
export function Footer({ className = "" }: FooterProps) {
    return (
        <footer
            className={`relative isolate overflow-hidden bg-[#0B1F1A] text-white/70 ${className}`}
        >
            {/* Top hairline */}
            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-coral/40 to-transparent"
            />

            {/* Ambient background */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-coral/10 blur-3xl sm:h-96 sm:w-96" />
                <div className="absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-emerald-500/[0.06] blur-3xl sm:h-[32rem] sm:w-[32rem]" />
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* CTA */}
                <div className="pb-10 pt-10 sm:pb-12 sm:pt-14 lg:pt-16">
                    <FooterCta {...FOOTER_CTA} />
                </div>

                {/* Brand + links */}
                <div className="grid gap-10 border-t border-white/10 py-10 sm:py-12 lg:grid-cols-12 lg:gap-8 lg:py-14">
                    <div className="lg:col-span-4">
                        <FooterBrand {...FOOTER_BRAND} socials={FOOTER_SOCIALS} />
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 lg:col-span-8 lg:gap-x-10 lg:pl-10">
                        {FOOTER_LINK_GROUPS.map((group) => (
                            <FooterLinkGroup key={group.title} {...group} />
                        ))}
                    </div>
                </div>

                {/* Contact */}
                <div className="pb-8 sm:pb-10">
                    <FooterContact items={FOOTER_CONTACT} />
                </div>

                {/* Legal */}
                <FooterBottomBar
                    legalName={FOOTER_BRAND.legalName}
                    location={FOOTER_BRAND.location}
                    links={FOOTER_LEGAL_LINKS}
                />
            </div>
        </footer>
    );
}