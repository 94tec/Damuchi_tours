import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { BookingStatus, Role } from "@/types/index-types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "KES"): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric", month: "long", day: "numeric",
    ...options,
  }).format(d);
}

export function formatDateShort(date: string | Date): string {
  return formatDate(date, { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(d);
}

export function bookingStatusBadgeClass(status: BookingStatus): string {
  const map: Record<BookingStatus, string> = {
    PENDING_PAYMENT: "badge-pending",
    CONFIRMED:       "badge-confirmed",
    CANCELLED:       "badge-cancelled",
    COMPLETED:       "badge-completed",
    NO_SHOW:         "badge-no-show",
  };
  return map[status] ?? "badge";
}

export function bookingStatusLabel(status: BookingStatus): string {
  const map: Record<BookingStatus, string> = {
    PENDING_PAYMENT: "Pending Payment",
    CONFIRMED:       "Confirmed",
    CANCELLED:       "Cancelled",
    COMPLETED:       "Completed",
    NO_SHOW:         "No-show",
  };
  return map[status] ?? status;
}

export function isStaffRole(roles: Role[]): boolean {
  return roles.some((r) =>
    ["SUPER_ADMIN", "ADMIN", "MANAGER", "OPERATOR"].includes(r)
  );
}

export function isAdminRole(roles: Role[]): boolean {
  return roles.some((r) => ["SUPER_ADMIN", "ADMIN"].includes(r));
}

export function truncate(str: string, maxLength: number): string {
  return str.length > maxLength ? str.slice(0, maxLength) + "…" : str;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : (plural ?? singular + "s")}`;
}

export const getApiErrorMessage = (
    error: unknown,
    fallback: string
): string => {
  if (
      typeof error === "object" &&
      error !== null &&
      "response" in error
  ) {
    const response = (
        error as {
          response?: {
            data?: {
              message?: string;
              detail?: string;
              error?: string;
            };
          };
        }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }

    if (response?.data?.detail) {
      return response.data.detail;
    }

    if (response?.data?.error) {
      return response.data.error;
    }
  }

  if (
      error instanceof Error &&
      error.message
  ) {
    return error.message;
  }

  return fallback;
};