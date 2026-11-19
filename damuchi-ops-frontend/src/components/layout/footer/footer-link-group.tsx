import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { FooterLinkGroup as FooterLinkGroupData } from "./footer-config";

export function FooterLinkGroup({ title, links, action }: FooterLinkGroupData) {
    const ActionIcon = action?.icon;

    return (
        <nav aria-label={title} className="min-w-0">
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                {title}
            </h3>

            <ul className="mt-4 space-y-1 sm:mt-5">
                {links.map((link) => (
                    <li key={link.href}>
                        {/* py-1.5 → comfortable touch target without looking tall */}
                        <Link
                            href={link.href}
                            className="group inline-flex items-center gap-1 rounded-sm py-1.5 text-sm text-white/60 transition-colors duration-200 hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                        >
                            {link.label}
                            <ArrowUpRight
                                className="hidden h-3 w-3 -translate-x-0.5 translate-y-0.5 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 sm:block"
                                aria-hidden="true"
                            />
                        </Link>
                    </li>
                ))}
            </ul>

            {action && ActionIcon && (
                <Link
                    href={action.href}
                    className="mt-4 inline-flex items-center gap-2 rounded-sm py-1.5 text-xs font-semibold text-coral transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                >
                    <ActionIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {action.label}
                </Link>
            )}
        </nav>
    );
}