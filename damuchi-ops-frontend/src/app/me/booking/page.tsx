// app/me/bookings/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, ChevronRight, MapPin, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import { bookingApi } from "@/lib/booking-api";
import { bookingStatusBadgeClass, bookingStatusLabel, formatCurrency, formatDateShort } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import type { ApiError, Booking } from "@/types/index-types";

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setBookings(await bookingApi.myBookings());
        } catch (err) {
            toast.error((err as ApiError).message || "Couldn't load your bookings.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="skeleton h-8 w-48" />
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-2xl font-bold">My bookings</h1>
                <p className="mt-1 text-sm text-stone">
                    {bookings.length === 0 ? "You have no bookings." : `${bookings.length} booking${bookings.length === 1 ? "" : "s"}`}
                </p>
            </div>

            {bookings.length === 0 ? (
                <EmptyState icon={Calendar} title="No bookings yet" description="You haven't booked any safaris yet." />
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <Link key={booking.id} href={`/me/bookings/${booking.id}`} className="card-hover flex items-center gap-4 p-5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-savanna/10 text-savanna">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="truncate font-semibold text-earth">{booking.tourName}</h3>
                                    <span className={bookingStatusBadgeClass(booking.status)}>{bookingStatusLabel(booking.status)}</span>
                                    {booking.balanceAmount > 0 && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                      <Wallet className="h-2.5 w-2.5" /> Balance due
                    </span>
                                    )}
                                </div>
                                <div className="mt-1 flex items-center gap-4 text-sm text-stone">
                                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDateShort(booking.tourDate)}</span>
                                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{booking.travelerCount}</span>
                                </div>
                            </div>
                            <div className="shrink-0 text-right">
                                <p className="font-mono font-semibold text-earth">{formatCurrency(booking.totalPrice, booking.currency)}</p>
                                {booking.balanceAmount > 0 && (
                                    <p className="text-xs font-medium text-amber-700">
                                        {formatCurrency(booking.balanceAmount, booking.currency)} due
                                    </p>
                                )}
                                <ChevronRight className="ml-auto mt-1 h-4 w-4 text-stone/50" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}