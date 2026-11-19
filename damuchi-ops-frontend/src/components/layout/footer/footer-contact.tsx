import type { ContactTone, FooterContactItem } from "./footer-config";

const TONE: Record<ContactTone, { icon: string; hover: string }> = {
    coral: {
        icon: "bg-coral/10 text-coral",
        hover: "hover:bg-coral/[0.06]",
    },
    emerald: {
        icon: "bg-emerald-400/10 text-emerald-400",
        hover: "hover:bg-emerald-400/[0.06]",
    },
};

interface FooterContactProps {
    items: FooterContactItem[];
}

/**
 * One connected panel: stacked rows with dividers on phones,
 * three equal columns from lg up.
 */
export function FooterContact({ items }: FooterContactProps) {
    return (
        <ul className="grid divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {items.map(({ label, value, href, icon: Icon, tone, external }) => (
                <li key={label} className="min-w-0">
                    <a
                        href={href}
                        {...(external
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                        className={`group flex min-h-[4.25rem] items-center gap-3.5 p-4 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-coral sm:p-5 ${TONE[tone].hover}`}
                    >
                        <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONE[tone].icon}`}
                        >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>

                        <span className="min-w-0">
                            <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                                {label}
                            </span>
                            <span className="mt-0.5 block truncate text-sm font-medium tabular-nums text-white/80 transition-colors group-hover:text-white">
                                {value}
                            </span>
                        </span>
                    </a>
                </li>
            ))}
        </ul>
    );
}