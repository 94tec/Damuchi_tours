import { apiClient } from "@/lib/api-client";

export const ssoApi = {
    async createHandoffCode(): Promise<{ code: string; expiresInSeconds: number }> {
        const response = await apiClient.post<{ code: string; expiresInSeconds: string }>(
            "/auth/sso/handoff-code"
        );
        return {
            code: response.data.code,
            expiresInSeconds: Number(response.data.expiresInSeconds),
        };
    },
};