// ─────────────────────────────────────────────────────────────────
// Maps to: AdminController, AdminAuthController,
//          AdminRolePermissionController, AuditLogController
// Roles with admin access: SUPER_ADMIN(27 perms), ADMIN(27 perms)
// ─────────────────────────────────────────────────────────────────
import { apiClient } from "@/lib/api-client";
import type {
    AuditLog, GenericLog, LogCollectionMeta,
    Page,
    PendingUser,
    Role,
    RolePermissions,
    User,
    UserPermissions, UserProfile,
} from "@/types/auth";

import type {
    BackupJob,
    BootstrapCriticalFailure,
    BootstrapEmailFailure,
    BootstrapRollbackEvent,
    BootstrapStatus,
    ConnectionPoolStats,
    DatabaseInfo,
    IncidentSeverity,
    IncidentSummary, MigrationStatus,
    Page as ControlPage,
    SecurityIncident,
    TableRowCounts,
    DashboardStats
} from "@/types/admin-control";

import type { SystemStatusResponse, RoleCount } from "@/types/system";

// ─────────────────────────────────────────────────────────────────
// ApiResponse wrapper — your backend wraps every response in:
// { success: boolean, message: string, data: T, timestamp: string }
// We unwrap it here so callers always get T directly.
// ─────────────────────────────────────────────────────────────────
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp?: string;
    error?: string;
}

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
    const { data: wrapper } = await promise;
    // If backend returned an error wrapper, throw it so catch blocks handle it
    if (!wrapper.success && wrapper.error) {
        throw {
            status: 400,
            error: wrapper.error,
            message: wrapper.message,
            timestamp: wrapper.timestamp ?? new Date().toISOString(),
        };
    }
    return wrapper.data;
}

export const adminApi = {
    // ── SecurityIncidentController: /api/admin/security/incidents ──
    getSecurityIncidents: async (
        page = 0,
        size = 25,
        severity?: IncidentSeverity
    ): Promise<ControlPage<SecurityIncident>> =>
        (
            await apiClient.get<ControlPage<SecurityIncident>>(
                "/admin/security/incidents",
                { params: { page, size, severity } }
            )
        ).data,

    getSecurityIncidentSummary: async (): Promise<IncidentSummary> =>
        (
            await apiClient.get<IncidentSummary>("/admin/security/incidents/summary")
        ).data,

    resolveSecurityIncident: async (
        incidentId: string,
        notes: string
    ): Promise<SecurityIncident> =>
        (
            await apiClient.post<SecurityIncident>(
                `/admin/security/incidents/${incidentId}/resolve`,
                null,
                { params: { notes } }
            )
        ).data,

    // ── DatabaseAdminController: /api/admin/database ────────────────
    getConnectionPoolStats: async (): Promise<ConnectionPoolStats> =>
        (await apiClient.get<ConnectionPoolStats>("/admin/database/pool")).data,

    getDatabaseInfo: async (): Promise<DatabaseInfo> =>
        (await apiClient.get<DatabaseInfo>("/admin/database/info")).data,

    getTableRowCounts: async (): Promise<TableRowCounts> =>
        (await apiClient.get<TableRowCounts>("/admin/database/table-counts")).data,

    // ── DisasterRecoveryController: /api/admin/disaster-recovery ────
    triggerBackup: async (): Promise<BackupJob> =>
        (await apiClient.post<BackupJob>("/admin/disaster-recovery/backups")).data,

    listBackups: async (): Promise<BackupJob[]> =>
        (await apiClient.get<BackupJob[]>("/admin/disaster-recovery/backups")).data,

    getBackupStatus: async (jobId: string): Promise<BackupJob> =>
        (
            await apiClient.get<BackupJob>(`/admin/disaster-recovery/backups/${jobId}`)
        ).data,

    getMigrationStatus: async (): Promise<MigrationStatus> =>
        (
            await apiClient.get<MigrationStatus> (
                "admin/database/migration-status"
            )
        ).data,
  // ── AdminController: user management ────────────────────────
  getAllUsers: async (page = 0, size = 20, status?: string): Promise<Page<User>> =>
    (await apiClient.get<Page<User>>(
        "/admin/users", { params:
                { page, size, status
                }
        })
    ).data,

  getUserById: async (userId: string): Promise<User> =>
      unwrap<User>(
          apiClient.get(`/admin/users/${userId}`)
      ),

    async getSystemStatus() {
        const response = await apiClient.get<SystemStatusResponse>("/admin/system/status");
        return response.data;
    },
    async getRoleCounts() {
        const response = await apiClient.get<RoleCount[]>("/admin/system/roles");
        return response.data;
    },
  // ── AdminController: pending approvals ──────────────────────
  getPendingUsers: async (page = 0, size = 20): Promise<Page<PendingUser>> =>
    (
      await apiClient.get<Page<PendingUser>>("/admin/users/pending", {
        params: { page, size },
      })
    ).data,

  approveUser: async (userId: string): Promise<User> =>
    (await apiClient.post<User>(`/admin/users/${userId}/approve`)).data,

  rejectUser: async (userId: string, reason?: string): Promise<User> =>
    (await apiClient.post<User>(`/admin/users/${userId}/reject`, { reason })).data,

  lockUser: async (userId: string): Promise<User> =>
    (await apiClient.post<User>(`/admin/users/${userId}/lock`)).data,

  unlockUser: async (userId: string): Promise<User> =>
    (await apiClient.post<User>(`/admin/users/${userId}/unlock`)).data,

  updateUserRoles: async (userId: string, roles: Role[]): Promise<User> =>
    (await apiClient.patch<User>(`/admin/users/${userId}/roles`, { roles })).data,

  forcePasswordReset: async (userId: string): Promise<{ message: string }> =>
    (
      await apiClient.post<{ message: string }>(
        `/admin/users/${userId}/force-password-reset`
      )
    ).data,

  // ── AdminRolePermissionController ───────────────────────────


  getAllRolePermissions: async (): Promise<{ role: string; permissions: unknown; permissionCount: any }[]> => {
      const { data } = await apiClient.get<{
          success: boolean;
          data: Record<string, string[]>;
          source: string;
          timestamp: string;
      }>("/admin/access/roles");

      return Object.entries(data.data).map(([role, permissions]) => ({
          role,
          permissions,
          permissionCount: permissions.length,
      }));
  },

  getRolePermissions: async (role: Role): Promise<RolePermissions> =>
    (await apiClient.get<RolePermissions>(`/admin/access/${role}/permissions`)).data,

  getUserPermissions: async (userId: string): Promise<UserPermissions> =>
    (await apiClient.get<UserPermissions>(`/admin/access/${userId}/permissions`)).data,

  updateRolePermissions: async (
    role: Role,
    permissions: string[]
  ): Promise<RolePermissions> =>
    (
      await apiClient.put<RolePermissions>(`/admin/access/${role}/permissions`, {
        permissions,
      })
    ).data,

    async getDashboardStats() {
        const response = await apiClient.get<DashboardStats>("/admin/stats");
        return response.data;
    },

  // ── AuditLogController ───────────────────────────────────────

    getAuditLogs: async (): Promise<AuditLog[]> =>
        (
            await apiClient.get<{ success: boolean; data: AuditLog[]; count: number; timestamp: string }>(
                "/admin/audit-logs"
            )
        ).data.data,

    getAuditLogsByUser: async (userId: string): Promise<AuditLog[]> =>
        (
            await apiClient.get<{ success: boolean; data: AuditLog[]; count: number; timestamp: string }>(
                `/admin/audit-logs/user/${userId}`
            )
        ).data.data,

    listLogCollections: async (): Promise<LogCollectionMeta[]> =>
        (await apiClient.get<{ success: boolean; data: LogCollectionMeta[] }>("/admin/audit-logs/collections")).data.data,

    async getCollectionLogsBatch(
        collectionKeys: readonly string[]
    ): Promise<GenericLog[]> {
        const response = await apiClient.post(
            "/admin/audit-logs/collections/batch", collectionKeys,

        );

        const data = response.data;

        // Backend returns an array
        if (Array.isArray(data)) {
            return data as GenericLog[];
        }

        // Backend returns an object grouped by collection
        //
        // {
        //   "security": [...],
        //   "password-change": [...]
        // }
        if (data && typeof data === "object") {
            return Object.values(data)
                .filter(Array.isArray)
                .flat() as GenericLog[];
        }

        return [];
    },

    // ── BootstrapDiagnosticController: /admin/bootstrap ─────────
    getBootstrapStatus: async (): Promise<BootstrapStatus> =>
        (await apiClient.get<BootstrapStatus>("/admin/bootstrap/status")).data,

    getBootstrapEmailFailures: async (): Promise<BootstrapEmailFailure[]> =>
        (
            await apiClient.get<{ success: boolean; data: BootstrapEmailFailure[]; timestamp: string }>(
                "/admin/bootstrap/email-failures"
            )
        ).data.data,

    resendBootstrapWelcomeEmail: async (email: string): Promise<{ status: string; message: string; sentAt: string }> =>
        (
            await apiClient.post<{ status: string; message: string; sentAt: string }>(
                "/admin/bootstrap/email/resend",
                null,
                { params: { email } }
            )
        ).data,

    forceReleaseBootstrapLock: async (): Promise<{ message: string; lockStatus: string; releasedAt: string }> =>
        (
            await apiClient.post<{ message: string; lockStatus: string; releasedAt: string }>(
                "/admin/bootstrap/lock/force-release"
            )
        ).data,

    resetBootstrapState: async (): Promise<{ status: string; message: string; resetAt: string }> =>
        (
            await apiClient.delete<{ status: string; message: string; resetAt: string }>(
                "/admin/bootstrap/reset"
            )
        ).data,

    getCriticalBootstrapFailures: async (): Promise<BootstrapCriticalFailure[]> =>
        (
            await apiClient.get<{ success: boolean; data: BootstrapCriticalFailure[]; timestamp: string }>(
                "/admin/bootstrap/failures/critical"
            )
        ).data.data,

    getRecentBootstrapRollbacks: async (hours = 24): Promise<BootstrapRollbackEvent[]> =>
        (
            await apiClient.get<{ success: boolean; data: BootstrapRollbackEvent[]; hours: number; timestamp: string }>(
                "/admin/bootstrap/rollbacks",
                { params: { hours } }
            )
        ).data.data,

    resolveBootstrapFailure: async (
        failureId: string,
        resolution: string
    ): Promise<{ status: string; message: string; failureId: string; resolution: string; resolvedAt: string }> =>
        (
            await apiClient.put<{ status: string; message: string; failureId: string; resolution: string; resolvedAt: string }>(
                `/admin/bootstrap/failures/${failureId}/resolve`,
                null,
                { params: { resolution } }
            )
        ).data,
};
