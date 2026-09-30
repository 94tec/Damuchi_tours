"use client";

import { useCallback, useEffect, useState } from "react";
import { HardDriveDownload, RefreshCw, ShieldAlert, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuthStore } from "@/store/auth-store";
import { adminApi } from "@/lib/admin-api";
import type { ApiError } from "@/types/auth";
import type { BackupJob, BackupStatus } from "@/types/admin-control";

const STATUS_BADGE: Record<BackupStatus, "success" | "warning" | "destructive" | "secondary"> = {
  COMPLETED: "success",
  RUNNING: "warning",
  QUEUED: "secondary",
  FAILED: "destructive",
};

function formatBytes(bytes?: number | null): string {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

export default function DisasterRecoveryPage() {
  const { isSuperAdmin } = useAuthStore();
  const superAdmin = isSuperAdmin();

  const [backups, setBackups] = useState<BackupJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.listBackups();
      setBackups(data);
    } catch (err) {
      toast.error((err as ApiError).message || "Couldn't load backup history.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Poll while any backup is QUEUED/RUNNING, so status updates without a manual refresh.
  useEffect(() => {
    const hasActive = backups.some((b) => b.status === "QUEUED" || b.status === "RUNNING");
    if (!hasActive) return;
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [backups, load]);

  async function handleTrigger() {
    setIsTriggering(true);
    try {
      const job = await adminApi.triggerBackup();
      setBackups((prev) => [job, ...prev]);
      toast.success("Backup started — this can take a few minutes for large databases.");
    } catch (err) {
      toast.error((err as ApiError).message || "Couldn't start backup.");
    } finally {
      setIsTriggering(false);
    }
  }

  if (!superAdmin) {
    return (
        <EmptyState
            icon={ShieldAlert}
            title="SUPER_ADMIN access required"
            description="This page is restricted to platform owners."
        />
    );
  }

  return (
      <div className="space-y-7">
        <PageHeader
            eyebrow="Admin · Disaster recovery"
            title="Database backups"
            subtitle="On-demand pg_dump snapshots — a supplement to your hosting provider's automated backups, not a replacement."
            action={
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="accent" size="sm" disabled={isTriggering}>
                      <HardDriveDownload className="h-3.5 w-3.5" />
                      Trigger backup
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Start a manual backup?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Runs pg_dump against the live database. Large databases can take several
                        minutes and add load to the DB during the dump — avoid triggering this during
                        peak traffic.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleTrigger}>Start backup</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            }
        />

        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Backups are written to local disk on the app host. If the host is lost, these are lost
              with it — rely on your hosting provider's off-box automated backups as the real safety
              net. Use this for "back this up right now before a risky migration" moments.
            </p>
          </CardContent>
        </Card>

        {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
            </div>
        ) : backups.length === 0 ? (
            <EmptyState
                icon={HardDriveDownload}
                title="No backups yet"
                description="Trigger your first manual backup above."
            />
        ) : (
            <div className="rounded-xl border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Triggered by</TableHead>
                    <TableHead>Started</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-mono text-xs">
                          {job.fileName ?? <span className="text-muted-foreground">pending…</span>}
                          {job.status === "FAILED" && job.errorMessage && (
                              <p className="mt-0.5 max-w-xs truncate text-[10px] text-destructive" title={job.errorMessage}>
                                {job.errorMessage}
                              </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_BADGE[job.status]} className="text-[10px]">
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {formatBytes(job.fileSizeBytes)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{job.triggeredBy}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {job.startedAt
                              ? formatDistanceToNow(new Date(job.startedAt), { addSuffix: true })
                              : "—"}
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
        )}
      </div>
  );
}