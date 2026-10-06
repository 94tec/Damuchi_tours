// app/me/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Inbox, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { enquiryApi } from "@/lib/enquiry-api";
import { bookingApi } from "@/lib/booking-api";
import { formatCurrency } from "@/lib/utils";
import type { ApiError } from "@/types/index-types";

export default function MeOverviewPage() {
    const [needsAction, setNeedsAction] = useState<{ id: string; tourName: string; label: string }[]>([]);
    const [balanceDue, setBalanceDue] = useState<{ id: string; tourName: string; amount: number; currency: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [enquiries, bookings] = await Promise.all([
                    enquiryApi.myEnquiries(undefined, 0, 50),
                    bookingApi.myActiveBookings(),
                ]);

                setNeedsAction(
                    (enquiries.content ?? [])
                        .filter((e) => e.status === "QUOTED")
                        .map((e) => ({ id: e.id, tourName: e.tourName, label: "Quote ready — review & accept" }))
                );

                setBalanceDue(
                    bookings
                        .filter((b) => b.balanceAmount > 0)
                        .map((b) => ({ id: b.id, tourName: b.tourName, amount: b.balanceAmount, currency: b.currency }))
                );
            } catch (err) {
                toast.error((err as ApiError)?.message || "Couldn't load your overview.");
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
        );
    }

    const hasNothing = needsAction.length === 0 && balanceDue.length === 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight">Welcome back</h1>
                <p className="mt-1 text-sm text-muted-foreground">Here's what needs your attention.</p>
            </div>

            {hasNothing ? (
                <Card className="border-dashed">
                    <CardContent className="p-8 text-center text-sm text-muted-foreground">
                        Nothing needs your attention right now.{" "}
                        <Link href="/tours" className="font-medium text-coral hover:underline">Browse tours</Link> to start planning.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {needsAction.map((item) => (
                        <Link key={item.id} href={`/me/enquiries/${item.id}`}>
                            <Card className="border-coral/25 bg-coral/[0.04] transition-colors hover:border-coral/40">
                                <CardContent className="flex items-center justify-between gap-4 p-4">
                                    <div className="flex items-center gap-3">
                                        <Inbox className="h-4 w-4 text-coral" />
                                        <div>
                                            <p className="text-sm font-medium">{item.tourName}</p>
                                            <p className="text-xs text-muted-foreground">{item.label}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}

                    {balanceDue.map((item) => (
                        <Link key={item.id} href={`/me/bookings/${item.id}`}>
                            <Card className="border-amber-200 bg-amber-50 transition-colors hover:border-amber-300">
                                <CardContent className="flex items-center justify-between gap-4 p-4">
                                    <div className="flex items-center gap-3">
                                        <Wallet className="h-4 w-4 text-amber-700" />
                                        <div>
                                            <p className="text-sm font-medium">{item.tourName}</p>
                                            <p className="text-xs text-amber-800">
                                                Balance due: {formatCurrency(item.amount, item.currency)}
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-amber-700" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}