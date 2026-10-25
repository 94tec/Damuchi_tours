// lib/availability-api.ts
import { apiClient } from "@/lib/api-client";
import type { AvailabilityStatus } from "@/types/index-types";

export interface AvailabilityResponse {
    id: string;
    tourId: string;
    tourName: string;
    tourSlug: string;
    date: string;
    maxSlots: number;
    availableSlots: number;
    bookedCount: number;
    occupancyPercent: number;
    status: AvailabilityStatus;
    statusDescription: string;
    tourBasePrice: number;
    priceOverride?: number;
    effectivePrice: number;
    bookingDeadline?: string;
    internalNotes?: string;
    createdDate?: string;
    lastModifiedDate?: string;
}

// Matches AvailabilitySummaryResponse exactly — the public, customer-facing
// endpoint returns only these 6 fields, not the full AvailabilityResponse.
export interface AvailabilitySummary {
    id: string;
    date: string;
    availableSlots: number;
    status: AvailabilityStatus;
    effectivePrice: number;
    bookingDeadline?: string;
}

export interface CreateAvailabilityRequest {
    tourId: string;
    date: string;
    maxSlots: number;
    availableSlots?: number;
    bookingDeadline?: string;
    priceOverride?: number;
    internalNotes?: string;
}

export interface UpdateAvailabilityRequest {
    availableSlots?: number;
    bookingDeadline?: string;
    priceOverride?: number;
    internalNotes?: string;
}

export const availabilityApi = {
    async getAllForTour(tourId: string): Promise<AvailabilityResponse[]> {
        const response = await apiClient.get<AvailabilityResponse[]>(`/availability/tour/${tourId}/all`);
        return response.data;
    },

    async getSlotById(id: string): Promise<AvailabilityResponse> {
        const response = await apiClient.get<AvailabilityResponse>(`/availability/${id}`);
        return response.data;
    },

    /**
     * Public, customer-facing. Returns only OPEN slots — the backend
     * filters out LIMITED, FULL, CLOSED, CANCELLED entirely for this
     * endpoint (see AvailabilityService.getUpcomingOpenSlots). For staff
     * tooling that needs to book against a nearly-full (LIMITED) slot,
     * use getAllForTour and filter client-side instead — don't use this.
     */
    async getUpcomingAvailability(tourId: string): Promise<AvailabilitySummary[]> {
        const response = await apiClient.get<AvailabilitySummary[]>(`/availability/tour/${tourId}`);
        return response.data;
    },

    async createSlot(req: CreateAvailabilityRequest): Promise<AvailabilityResponse> {
        const response = await apiClient.post<AvailabilityResponse>("/availability", req);
        return response.data;
    },

    async updateSlot(id: string, req: UpdateAvailabilityRequest): Promise<AvailabilityResponse> {
        const response = await apiClient.put<AvailabilityResponse>(`/availability/${id}`, req);
        return response.data;
    },

    async closeSlot(id: string): Promise<AvailabilityResponse> {
        const response = await apiClient.post<AvailabilityResponse>(`/availability/${id}/close`);
        return response.data;
    },

    async reopenSlot(id: string): Promise<AvailabilityResponse> {
        const response = await apiClient.post<AvailabilityResponse>(`/availability/${id}/reopen`);
        return response.data;
    },

    async deleteSlot(id: string): Promise<void> {
        await apiClient.delete(`/availability/${id}`);
    },
};