import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Booking, BookingStats, BookingStatus, CreateBookingRequest } from "@/types/index-types";

export const bookingApi = {
  // ── Customer ────────────────────────────────────────────────────────────────
  create: async (req: CreateBookingRequest): Promise<Booking> => {
    const res = await apiClient.post<ApiResponse<Booking>>("/bookings", req);
    return res.data.data;
  },

  myBookings: async (): Promise<Booking[]> => {
    const res = await apiClient.get<Booking[]>("/bookings/me");
    return res.data;
  },

  myActiveBookings: async (): Promise<Booking[]> => {
    const res = await apiClient.get<Booking[]>("/bookings/me/active");
    return res.data;
  },

  myBookingById: async (id: string): Promise<Booking> => {
    const res = await apiClient.get<Booking>(`/bookings/me/${id}`);
    return res.data;
  },

  cancelMyBooking: async (id: string, reason?: string): Promise<Booking> => {
    const res = await apiClient.post<Booking>(
      `/bookings/me/${id}/cancel`,
      null,
      { params: { reason: reason ?? "Customer requested cancellation" } }
    );
    return res.data;
  },

  // ── Staff ───────────────────────────────────────────────────────────────────
  all: async (status?: BookingStatus): Promise<Booking[]> => {
    const res = await apiClient.get<Booking[]>("/bookings", {
      params: status ? { status } : undefined,
    });
    return res.data;
  },

  byDate: async (date: string): Promise<Booking[]> => {
    const res = await apiClient.get<Booking[]>("/bookings/by-date", { params: { date } });
    return res.data;
  },

  byTour: async (tourId: string): Promise<Booking[]> => {
    const res = await apiClient.get<Booking[]>(
        `/bookings/by-enquire-button.tsx/${tourId}`
    );

    return res.data;
  },

  /**
   * Manually confirm a booking without recording payment.
   *
   * Backend:
   * POST /api/bookings/{bookingId}/confirm
   */
  manualConfirm: async (id: string): Promise<Booking> => {
    const res = await apiClient.post<ApiResponse<Booking>>(
        `/bookings/${id}/confirm`
    );

    return res.data.data;
  },
  /**
   * Record a manually reconciled payment.
   *
   * Backend:
   * POST /api/bookings/{bookingId}/payments
   * ?amount=...
   * &paymentReference=...
   *
   * A PENDING_PAYMENT booking is automatically confirmed
   * by Booking.recordPayment().
   */
  recordPayment: async (
      id: string,
      amount: number,
      paymentReference: string
  ): Promise<Booking> => {
    const res = await apiClient.post<ApiResponse<Booking>>(
        `/bookings/${id}/payments`,
        null,
        {
          params: {
            amount,
            paymentReference,
          },
        }
    );

    return res.data.data;
  },

  staffCancel: async (id: string, reason: string): Promise<Booking> => {
    const res = await apiClient.post<Booking>(
      `/bookings/${id}/cancel`,
      null,
      { params: { reason } }
    );
    return res.data;
  },

  complete: async (id: string): Promise<Booking> => {
    const res = await apiClient.post<ApiResponse<Booking>>(`/bookings/${id}/complete`);
    return res.data.data;
  },

  /**
   * Mark a CONFIRMED booking as NO_SHOW.
   *
   * Backend:
   * POST /api/bookings/{bookingId}/no-show
   */
  markNoShow: async (id: string): Promise<Booking> => {
    const res = await apiClient.post<ApiResponse<Booking>>(
        `/bookings/${id}/no-show`
    );

    return res.data.data;
  },

  refund: async (id: string, refundReference: string): Promise<Booking> => {
    const res = await apiClient.post<ApiResponse<Booking>>(
      `/bookings/${id}/refund`,
      null,
      { params: { refundReference } }
    );
    return res.data.data;
  },

  stats: async (): Promise<BookingStats> => {
    const res = await apiClient.get<BookingStats>("/bookings/stats");
    return res.data;
  },
};
