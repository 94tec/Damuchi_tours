import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { VisitorProvider } from "@/components/landing/visitor-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_TOUR_PORTAL_URL ?? "http://localhost:3001";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: "Kivana Trails & Safaris | East Africa Tours & Safaris",
        template: "%s | Kivana Trails & Safaris",
    },
    description:
        "Safaris across Kenya, Tanzania, Uganda & Rwanda — beach escapes, mountain treks, gorilla encounters, and cultural tours. Send an enquiry and hear back from a real local guide within hours.",
    keywords: [
        "Kenya safari", "Tanzania safari", "Uganda gorilla trekking", "Rwanda gorilla trekking",
        "East Africa tours", "Maasai Mara", "Serengeti", "Diani Beach", "Zanzibar",
    ],
    authors: [{ name: "Kivana Trails & Safaris" }],
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon-16x16.png",
        apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: SITE_URL,
        siteName: "Kivana Trails & Safaris",
        title: "Kivana Trails & Safaris | East Africa Tours & Safaris",
        description:
            "Savannahs, coastlines, volcanoes, and gorillas — enquire directly with local experts across East Africa.",
        images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Kivana Trails & Safaris — East Africa tours" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Kivana Trails & Safaris | East Africa Tours & Safaris",
        description: "Enquire about safaris across Kenya, Tanzania, Uganda & Rwanda with local guides.",
        images: ["/og-image.jpg"],
    },
};

export const viewport: Viewport = {
    // Match the current palette: sand (light) and deep forest (dark)
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#F5F1E8" },
        { media: "(prefers-color-scheme: dark)", color: "#0B1F1A" },
    ],
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover", // lets the floating buttons respect iPhone safe areas
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`}
        >
        <body className="min-h-screen bg-background font-sans antialiased">
        <VisitorProvider>{children}</VisitorProvider>
        <Toaster />
        </body>
        </html>
    );
}