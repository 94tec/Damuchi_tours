"use client";

import { useEffect, useRef } from "react";

/** Thin amber bar under the navbar that fills as the visitor scrolls. */
export function ScrollProgress() {
    const bar = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let raf = 0;
        const update = () => {
            const el = document.documentElement;
            const max = el.scrollHeight - el.clientHeight;
            const p = max > 0 ? el.scrollTop / max : 0;
            if (bar.current) bar.current.style.transform = `scaleX(${p})`;
            raf = 0;
        };
        const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
            <div
                ref={bar}
                className="h-full origin-left bg-accent will-change-transform"
                style={{ transform: "scaleX(0)" }}
            />
        </div>
    );
}