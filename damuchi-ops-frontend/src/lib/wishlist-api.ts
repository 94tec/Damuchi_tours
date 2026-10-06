import { apiClient } from "@/lib/api-client";

export interface WishlistItem {
    id: string;
    tourId: string;
    createdDate: string;
}

const BASE_URL = "/api/me/wishlist";

export const wishlistApi = {
    async getWishlist(): Promise<WishlistItem[]> {
        const response = await apiClient.get<WishlistItem[]>(BASE_URL);
        return response.data;
    },

    async add(tourId: string): Promise<WishlistItem> {
        const response = await apiClient.post<WishlistItem>(
            `${BASE_URL}/${tourId}`
        );

        return response.data;
    },

    async remove(tourId: string): Promise<void> {
        await apiClient.delete(`${BASE_URL}/${tourId}`);
    },
};