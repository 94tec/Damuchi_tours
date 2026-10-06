"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Plus, Lock, Unlock, AlertTriangle, Ban } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tourAdminApi } from "@/lib/tour-admin-api";
import { availabilityApi, type AvailabilityResponse } from "@/lib/availability-api";
import { formatDate } from "@/lib/utils";
import type { ApiError } from "@/types/index-types";
import type { TourAdminSummary } from "@/types/tour-admin";

const STATUS_BADGE: Record<AvailabilityResponse["status"], "success" | "warning" | "destructive" | "outline" | "secondary"> = {
  OPEN: "success",
  LIMITED: "warning",
  FULL: "secondary",
  CLOSED: "outline",
  CANCELLED: "destructive",
};

export default function StaffAvailabilityPage() {
  const [tours, setTours] = useState<TourAdminSummary[]>([]);
  const [selectedTour, setSelectedTour] = useState<string>("");
  const [toursLoading, setToursLoading] = useState(true);
  const [toursError, setToursError] = useState<string | null>(null);

  const [slots, setSlots] = useState<AvailabilityResponse[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [actioningId, setActioningId] = useState<string | null>(null);
  const [confirmingCloseId, setConfirmingCloseId] = useState<string | null>(null);

  const [newDate, setNewDate] = useState("");
  const [newMaxSlots, setNewMaxSlots] = useState(10);
  const [newDeadline, setNewDeadline] = useState("");
  const [newInternalNotes, setNewInternalNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    (async () => {
      setToursLoading(true);
      setToursError(null);
      try {
        const res = await tourAdminApi.listTours({ page: 0, size: 100 });
        setTours(res.content);
        if (res.content.length > 0) setSelectedTour(res.content[0].id);
      } catch (err) {
        const message = (err as ApiError).message || "Couldn't load tours.";
        setToursError(message);
        toast.error(message);
      } finally {
        setToursLoading(false);
      }
    })();
  }, []);

  const selectedTourData = tours.find((t) => t.id === selectedTour);

  const loadSlots = useCallback(async () => {
    if (!selectedTour) return;
    setSlotsLoading(true);
    setSlotsError(null);
    setConfirmingCloseId(null);
    try {
      const data = await availabilityApi.getAllForTour(selectedTour);
      setSlots(data.sort((a, b) => a.date.localeCompare(b.date)));
    } catch (err) {
      const message = (err as ApiError).message || "Couldn't load availability.";
      setSlotsError(message);
      setSlots([]);
      toast.error(message);
    } finally {
      setSlotsLoading(false);
    }
  }, [selectedTour]);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  async function handleAddSlot(e: React.FormEvent) {
    e.preventDefault();
    if (!newDate || !selectedTour) return;
    setIsAdding(true);
    try {
      // returnDate is NOT sent — AvailabilityService computes it from the
      // tour's durationDays. Sending it would be silently ignored, since
      // CreateAvailabilityRequest has no such field at all.
      const slot = await availabilityApi.createSlot({
        tourId: selectedTour,
        date: newDate,
        maxSlots: newMaxSlots,
        bookingDeadline: newDeadline || undefined,
        internalNotes: newInternalNotes.trim() || undefined,
      });
      setSlots((prev) => [...prev, slot].sort((a, b) => a.date.localeCompare(b.date)));
      setNewDate("");
      setNewMaxSlots(10);
      setNewDeadline("");
      setNewInternalNotes("");
      toast.success(`Departure added. Returns ${formatDate(slot.date, { month: "short", day: "numeric" })}` +
          (selectedTourData ? ` +${selectedTourData.durationDays - 1}d` : "") + ".");
    } catch (err) {
      toast.error((err as ApiError).message || "Couldn't add this departure date.");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleCloseClick(id: string) {
    if (confirmingCloseId !== id) {
      setConfirmingCloseId(id);
      return;
    }
    setActioningId(id);
    try {
      const updated = await availabilityApi.closeSlot(id);
      setSlots((prev) => prev.map((s) => (s.id === id ? updated : s)));
      toast.success("Date closed. It's hidden from customers.");
    } catch (err) {
      toast.error((err as ApiError).message || "Couldn't close this date.");
    } finally {
      setActioningId(null);
      setConfirmingCloseId(null);
    }
  }

  async function handleReopen(id: string) {
    setActioningId(id);
    try {
      const updated = await availabilityApi.reopenSlot(id);
      setSlots((prev) => prev.map((s) => (s.id === id ? updated : s)));
      toast.success("Date reopened.");
    } catch (err) {
      toast.error((err as ApiError).message || "Couldn't reopen this date.");
    } finally {
      setActioningId(null);
    }
  }

  const selectedTourName = selectedTourData?.name ?? "";

  return (
      <div className="space-y-7">
        <PageHeader
            eyebrow="Tour Operations"
            title="Availability"
            subtitle="Set departure dates and seat counts for each tour."
        />

        <Card>
          <CardContent className="p-5">
            <Label>Select tour</Label>
            {toursLoading ? (
                <Skeleton className="mt-1.5 h-10 w-full max-w-sm" />
            ) : toursError ? (
                <p className="mt-1.5 text-sm text-destructive">{toursError}</p>
            ) : (
                <Select value={selectedTour} onValueChange={setSelectedTour}>
                  <SelectTrigger className="mt-1.5 max-w-sm">
                    <SelectValue placeholder="Choose a tour" />
                  </SelectTrigger>
                  <SelectContent>
                    {tours.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="h-fit lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="h-4 w-4 text-accent" />
                Add departure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSlot} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Departure date</Label>
                  <Input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      required
                  />
                  {selectedTourData && newDate && (
                      <p className="text-[11px] text-muted-foreground">
                        Returns after {selectedTourData.durationDays} day{selectedTourData.durationDays !== 1 ? "s" : ""} —
                        calculated automatically, not editable here.
                      </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Seats</Label>
                  <Input
                      type="number"
                      value={newMaxSlots}
                      onChange={(e) => setNewMaxSlots(Number(e.target.value))}
                      min={1}
                      max={200}
                      required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>
                    Booking deadline <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                      type="datetime-local"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>
                    Internal notes <span className="font-normal text-muted-foreground">(staff only)</span>
                  </Label>
                  <Input
                      value={newInternalNotes}
                      onChange={(e) => setNewInternalNotes(e.target.value)}
                      placeholder="e.g. VIP clients only"
                      maxLength={500}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Date and seats can't be changed after creation — close this date and add a new one instead.
                </p>
                <Button type="submit" disabled={isAdding || !newDate || !selectedTour} className="w-full">
                  {isAdding ? "Adding…" : "Add departure"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="flex items-center gap-2 font-semibold">
                  <CalendarDays className="h-4 w-4 text-accent" />
                  {selectedTourName} — {slots.length} departure{slots.length !== 1 ? "s" : ""}
                </h2>
              </div>

              {slotsLoading ? (
                  <div className="divide-y divide-border">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-5 py-4">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="ml-auto h-4 w-16" />
                        </div>
                    ))}
                  </div>
              ) : slotsError ? (
                  <div className="p-5">
                    <EmptyState icon={AlertTriangle} title="Couldn't load availability" description={slotsError} />
                  </div>
              ) : slots.length === 0 ? (
                  <div className="p-5">
                    <EmptyState
                        icon={CalendarDays}
                        title="No departures set for this tour"
                        description="Add a date using the form on the left."
                    />
                  </div>
              ) : (
                  <div className="divide-y divide-border">
                    {slots.map((slot) => {
                      const isConfirming = confirmingCloseId === slot.id;
                      const isActioning = actioningId === slot.id;
                      return (
                          <div
                              key={slot.id}
                              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium">
                                {formatDate(slot.date, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                              </p>
                              {slot.bookingDeadline && (
                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                    Deadline: {formatDate(slot.bookingDeadline, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                  </p>
                              )}
                              {slot.internalNotes && (
                                  <p className="mt-0.5 text-xs italic text-muted-foreground">{slot.internalNotes}</p>
                              )}
                              {slot.priceOverride != null && (
                                  <p className="mt-0.5 text-xs text-accent">
                                    Price override: {slot.effectivePrice.toLocaleString()} (base {slot.tourBasePrice.toLocaleString()})
                                  </p>
                              )}
                            </div>
                            <div className="shrink-0 text-right text-sm">
                              <p className="font-mono">
                                <span className="font-semibold text-accent">{slot.availableSlots}</span>
                                <span className="text-muted-foreground"> / {slot.maxSlots}</span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {slot.bookedCount} booked · {slot.occupancyPercent.toFixed(0)}%
                              </p>
                            </div>
                            <Badge variant={STATUS_BADGE[slot.status]} className="shrink-0 rounded-full text-[10px] font-medium">
                              {slot.status}
                            </Badge>
                            {slot.status === "CLOSED" ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReopen(slot.id)}
                                    disabled={isActioning}
                                    className="shrink-0"
                                    title="Reopen this date"
                                >
                                  <Unlock className="h-3.5 w-3.5" />
                                  {isActioning ? "Reopening…" : "Reopen"}
                                </Button>
                            ) : slot.status === "CANCELLED" ? (
                                <Badge variant="outline" className="shrink-0 gap-1 rounded-full text-[10px]">
                                  <Ban className="h-3 w-3" /> Cancelled
                                </Badge>
                            ) : (
                                <Button
                                    variant={isConfirming ? "destructive" : "ghost"}
                                    size="sm"
                                    onClick={() => handleCloseClick(slot.id)}
                                    disabled={isActioning}
                                    className="shrink-0"
                                    title={isConfirming ? "Click again to confirm" : "Close this date"}
                                >
                                  <Lock className="h-3.5 w-3.5" />
                                  {isConfirming ? (isActioning ? "Closing…" : "Confirm") : "Close"}
                                </Button>
                            )}
                          </div>
                      );
                    })}
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}