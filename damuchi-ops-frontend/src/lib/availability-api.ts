// lib/availability-api.ts
import { apiClient } from "@/lib/api-client";
import type { AvailabilityStatus } from "@/types/tour-admin";
import type {
    AvailabilitySummary
} from "@/types/tour-admin";

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

    async getUpcomingAvailability(tourId: string): Promise<AvailabilitySummary[]> {
        const response = await apiClient.get<AvailabilitySummary[]>(`/tours/${tourId}/availability`);
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