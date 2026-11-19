import Link from "next/link";
import { MapPin } from "lucide-react";

import type { FooterLink } from "./footer-config";

interface FooterBottomBarProps {
    legalName: string;
    location: string;
    links: FooterLink[];
}

export function FooterBottomBar({
                                    legalName,
                                    location,
                                    links,
                                }: FooterBottomBarProps) {
    return (
        <div className="flex flex-col items-center gap-4 border-t border-white/10 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-xs text-white/45 md:flex-row md:justify-between md:text-left">
            <p className="order-3 md:order-1">
                © {new Date().getFullYear()} {legalName}. All rights reserved.
            </p>

            <nav
                aria-label="Legal"
                className="order-1 flex items-center gap-x-1 md:order-2"
            >
                {links.map((link, index) => (
                    <span key={link.href} className="flex items-center gap-x-1">
                        {index > 0 && <span aria-hidden="true">·</span>}
                        <Link
                            href={link.href}
                            className="rounded-sm px-2 py-1.5 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                        >
                            {link.label}
                        </Link>
                    </span>
                ))}
            </nav>

            <p className="order-2 inline-flex items-center gap-2 md:order-3">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-coral" aria-hidden="true" />
                {location}
            </p>
        </div>
    );
}