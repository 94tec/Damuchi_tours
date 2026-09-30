export interface ServiceStatus {
    label: string;
    detail: string;
    status: "up" | "down";
    latencyMs: number;
    error?: string;
}

export interface SystemStatusResponse {
    timestamp: string;
    checkDurationMs: number;
    services: ServiceStatus[];
}

export interface RoleCount {
    role: string;
    count: number;
}