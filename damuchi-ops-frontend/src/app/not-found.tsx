import type { Metadata } from "next";
import { NotFoundView } from "@/components/errors/not-found-view";

export const metadata: Metadata = {
    title: "Page not found | Kivana Trails & Safaris",
};

export default function NotFound() {
    return <NotFoundView />;
}