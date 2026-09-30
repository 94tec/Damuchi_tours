import { redirect } from "next/navigation";

// Root → always send to public enquire-button.tsx listing.
// The middleware handles session-gating for authenticated routes.
export default function RootPage() {
    redirect("/login");
}
