import {
    Compass,
    Facebook,
    Instagram,
    Mail,
    MessageCircle,
    Phone,
    Youtube,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

export interface FooterLink {
    href: string;
    label: string;
}

export interface FooterLinkGroup {
    title: string;
    links: FooterLink[];
    /** Optional highlighted link shown under the list. */
    action?: { href: string; label: string; icon: LucideIcon };
}

export interface FooterSocial {
    href: string;
    label: string;
    icon: LucideIcon;
}

export type ContactTone = "coral" | "emerald";

export interface FooterContactItem {
    label: string;
    value: string;
    href: string;
    icon: LucideIcon;
    tone: ContactTone;
    external?: boolean;
}

/* ============================================================
   CONTENT — edit copy, links and contact details here only
============================================================ */

const WHATSAPP_NUMBER = "254185528874"; // international format, no "+"
const WHATSAPP_GREETING = encodeURIComponent(
    "Hello! I'd like help planning a safari.",
);

export const FOOTER_BRAND = {
    /** Rendered as: {name} <accent> */
    name: "Kivana Trails &",
    accent: "Safaris",
    legalName: "Kivana Trails & Safaris",
    description:
        "Curated journeys across Kenya, Tanzania, Uganda and Rwanda, with local expertise, flexible planning and a human team behind every enquiry.",
    highlights: [
        "Personalised travel planning",
        "Tailored quotes for your requirements",
        "Local East African expertise",
    ],
    location: "Based in Mombasa · Serving East Africa",
} as const;

export const FOOTER_CTA = {
    eyebrow: "Your journey starts here",
    title: "Have a trip in mind?",
    highlight: "Tell us about it.",
    description:
        "Share your dates, destinations, group size and interests. We'll turn your ideas into a tailored quote, automatically where possible or with help from our team.",
    steps: [
        "Send your enquiry",
        "Receive your quote",
        "Accept when ready",
        "Complete your booking",
    ],
    source: "footer-cta",
} as const;

export const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
    {
        title: "Explore",
        links: [
            { href: "/safaris", label: "Safaris" },
            { href: "/destinations", label: "Destinations" },
            { href: "/hotels", label: "Hotels" },
            { href: "/experiences", label: "Experiences" },
        ],
    },
    {
        title: "Plan your trip",
        links: [
            { href: "/plan-your-trip", label: "Plan Your Trip" },
            { href: "/travel-guide", label: "Travel Guide" },
            { href: "/best-time-to-visit", label: "Best Time to Visit" },
            { href: "/faq", label: "FAQs" },
        ],
        action: { href: "/enquiry", label: "Custom trip enquiry", icon: Compass },
    },
    {
        title: "Company",
        links: [
            { href: "/about", label: "Our Story" },
            { href: "/about/team", label: "Meet the Team" },
            { href: "/testimonials", label: "Guest Reviews" },
            { href: "/sustainability", label: "Sustainability" },
            { href: "/contact", label: "Contact Us" },
        ],
    },
];

// TODO: replace with the real profile URLs
export const FOOTER_SOCIALS: FooterSocial[] = [
    { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
    { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
    { href: "https://youtube.com", icon: Youtube, label: "YouTube" },
];

export const FOOTER_CONTACT: FooterContactItem[] = [
    {
        label: "Email",
        value: "info@kivanasafaris.com",
        href: "mailto:info@kivanasafaris.com",
        icon: Mail,
        tone: "coral",
    },
    {
        label: "Call us",
        value: "+254 185 528 874",
        href: "tel:+254185528874",
        icon: Phone,
        tone: "coral",
    },
    {
        label: "Preferred by many travellers",
        value: "Chat with us on WhatsApp",
        href: `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_GREETING}`,
        icon: MessageCircle,
        tone: "emerald",
        external: true,
    },
];

export const FOOTER_LEGAL_LINKS: FooterLink[] = [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/contact", label: "Support" },
];