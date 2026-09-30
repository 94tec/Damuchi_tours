// ─────────────────────────────────────────────────────────────────
// Types for the SUPER_ADMIN control plane additions:
//   SecurityIncidentController, DatabaseAdminController,
//   DisasterRecoveryController
//
// Kept in a separate file from types/auth.ts on purpose — these map
// to new backend controllers, not the existing auth/user domain, and
// this avoids touching a file you already have working code depending on.
// ─────────────────────────────────────────────────────────────────

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IncidentType =
    | "BRUTE_FORCE_LOGIN"
    | "IMPOSSIBLE_TRAVEL"
    | "PRIVILEGE_ESCALATION_ATTEMPT"
    | "UNAUTHORIZED_ADMIN_ACCESS"
    | "API_KEY_ABUSE"
    | "SUSPICIOUS_TOKEN_REUSE"
    | "MFA_BYPASS_ATTEMPT"
    | "ACCOUNT_TAKEOVER_SUSPECTED"
    | "MASS_DATA_EXPORT"
    | "CONFIG_TAMPERING";

export interface SecurityIncident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  occurrenceCount: number;
  resolved: boolean;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  resolutionNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  totalOpen: number;
}

export type BackupStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";

export interface BackupJob {
  id: string;
  status: BackupStatus;
  fileName?: string | null;
  filePath?: string | null;
  fileSizeBytes?: number | null;
  triggeredBy: string;
  startedAt: string;
  completedAt?: string | null;
  errorMessage?: string | null;
}

// add to @/types/admin-control.ts

export interface BootstrapHealth {
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  emailDeliveryRate: number;
  lastBootstrapAt: string | null;
  lockAcquisitions: number;
  lockReleases: number;
}

export type BootstrapLockStatus = "AVAILABLE" | "ACQUIRED" | "EXPIRED";

export interface BootstrapStatus {
  bootstrapComplete: boolean;
  lockStatus: BootstrapLockStatus;
  health: BootstrapHealth;
  checkedAt: string;
}

export interface BootstrapCriticalFailure {
  id: string;
  timestamp: string;
  operation: string;
  originalError: string;
  rollbackError: string | null;
  failurePoint: string;
  context: Record<string, unknown>;
}

export interface BootstrapRollbackEvent {
  id: string;
  timestamp: string;
  operation: string;
  userId: string;
  error: string;
  cleaned: boolean;
}

export interface BootstrapEmailFailure {
  id: string;
  timestamp: string;
  email: string;
  error: string;
  actionRequired: string | null;
}

export interface ConnectionPoolStats {
  poolName?: string;
  activeConnections?: number;
  idleConnections?: number;
  totalConnections?: number;
  threadsAwaitingConnection?: number;
  maxPoolSize?: number;
  info?: string; // present instead of the above if not a HikariDataSource
}

export interface DatabaseInfo {
  productName: string;
  productVersion: string;
  driverVersion: string;
  url: string;
  readOnly: boolean;
}
export interface MigrationStatus {
  currentVersion: string;
  pendingCount: number;
  appliedCount: number;
}

export interface DashboardStats {
  pendingApprovals: number;
  totalUsers: number;
  totalTours: number;
  activeTours: number;
}

export type TableRowCounts = Record<string, number>;

// Re-use your existing Page<T> shape from types/auth if you'd rather import
// that one — duplicated here only so this file has zero dependency on your
// existing types module.
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}