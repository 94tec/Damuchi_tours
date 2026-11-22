"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SECTIONS = [
    { id: "tours",        label: "Tours" },
    { id: "destinations", label: "Destinations" },
    { id: "how-it-works", label: "How it works" },
    { id: "reviews",      label: "Reviews" },
    { id: "faq",          label: "FAQ" },
] as const;

/**
 * Desktop jump-menu. Appears once the hero is scrolled past and highlights
 * the section currently in view. Sections must have matching element ids
 * (page.tsx wraps each one).
 */
export function SectionNav() {
    const [visible, setVisible] = useState(false);
    const [active, setActive] = useState<string>("");

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.7);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const io = new IntersectionObserver(
            (entries) => {
                const hit = entries.find((e) => e.isIntersecting);
                if (hit) setActive(hit.target.id);
            },
            { rootMargin: "-45% 0px -50% 0px" },
        );
        SECTIONS.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) io.observe(el);
        });
        return () => io.disconnect();
    }, []);

    return (
        <nav
            aria-label="Page sections"
            className={cn(
                "fixed left-1/2 top-[4.5rem] z-40 hidden -translate-x-1/2 md:block",
                "transition-all duration-300 motion-reduce:transition-none",
                visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
            )}
        >
            <ul className="flex items-center gap-1 rounded-full border border-border/60 bg-background/80 p-1 shadow-lg backdrop-blur-md">
                {SECTIONS.map(({ id, label }) => (
                    <li key={id}>
                        <a
                            href={`#${id}`}
                            aria-current={active === id ? "true" : undefined}
                            className={cn(
                                "block rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                                active === id
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            {label}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}