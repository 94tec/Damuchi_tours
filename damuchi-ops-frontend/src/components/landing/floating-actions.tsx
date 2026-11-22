"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * WhatsApp chat + back-to-top.
 * Set NEXT_PUBLIC_WHATSAPP_NUMBER in international format without "+"
 * (e.g. 2547XXXXXXXX). Renders nothing for WhatsApp if it is not set.
 * On mobile it sits above FloatingEnquiryCta so the two never overlap.
 */
const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

export function FloatingActions() {
    const [showTop, setShowTop] = useState(false);

    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 900);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const msg = encodeURIComponent("Hi Kivana Trails, I'd like to plan a trip.");

    return (
        <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
            <button
                type="button"
                aria-label="Back to top"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className={cn(
                    "grid h-11 w-11 place-items-center rounded-full border border-border bg-background/90 text-foreground shadow-lg backdrop-blur transition-all duration-300",
                    "hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
                )}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m18 15-6-6-6 6" /></svg>
            </button>

            {WA && (
                <a
                    href={`https://wa.me/${WA}?text=${msg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat with us on WhatsApp"
                    className="grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M20.5 3.5A11.8 11.8 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.5 4.1 1.6 5.9L0 24l6.4-1.7a11.9 11.9 0 0 0 5.6 1.4c6.600 0 11.900-5.300 11.900-11.900 0-3.200-1.200-6.200-3.400-8.300ZM12 21.700a9.800 9.800 0 0 1-5-1.400l-.4-.2-3.800 1 1-3.700-.2-.4a9.800 9.800 0 0 1-1.500-5.200C2.100 6.500 6.500 2.100 12 2.100c2.600 0 5.100 1 6.900 2.900a9.700 9.700 0 0 1 2.900 6.900c0 5.400-4.400 9.800-9.800 9.800Zm5.400-7.300c-.3-.1-1.700-.8-2-.9-.3-.1-.5-.1-.7.1l-.9 1.100c-.2.200-.3.200-.6.100a8 8 0 0 1-4-3.500c-.3-.5.300-.5.800-1.600.1-.2 0-.4 0-.5l-.9-2.200c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.100-.8.400-.3.300-1 1-1 2.500s1.100 2.900 1.200 3.100c.2.200 2.100 3.200 5.100 4.500 1.900.8 2.600.9 3.600.7.600-.1 1.700-.7 2-1.400.2-.7.200-1.300.2-1.400-.1-.1-.3-.2-.6-.3Z" /></svg>
                </a>
            )}
        </div>
    );
}