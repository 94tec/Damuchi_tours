import Link from "next/link";
import { Check } from "lucide-react";

import type { FooterSocial } from "./footer-config";

interface FooterBrandProps {
    name: string;
    accent: string;
    description: string;
    highlights: readonly string[];
    socials: FooterSocial[];
}

export function FooterBrand({
                                name,
                                accent,
                                description,
                                highlights,
                                socials,
                            }: FooterBrandProps) {
    return (
        <div>
            <Link
                href="/"
                className="group inline-flex items-center rounded-md font-display text-xl font-semibold tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            >
                {name}
                <span className="ml-1.5 text-coral transition-colors group-hover:text-white">
                    {accent}
                </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-7 text-white/60">
                {description}
            </p>

            <ul className="mt-5 space-y-2.5">
                {highlights.map((item) => (
                    <li
                        key={item}
                        className="flex items-start gap-2.5 text-[13px] leading-5 text-white/60"
                    >
                        <Check
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-coral"
                            aria-hidden="true"
                        />
                        {item}
                    </li>
                ))}
            </ul>

            <ul className="mt-6 flex items-center gap-2.5" aria-label="Social media">
                {socials.map(({ href, icon: Icon, label }) => (
                    <li key={label}>
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={label}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/65 transition-all duration-300 hover:-translate-y-0.5 hover:border-coral hover:bg-coral hover:text-[#0B1F1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                        >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}