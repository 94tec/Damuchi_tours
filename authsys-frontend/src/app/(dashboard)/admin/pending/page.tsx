"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, RefreshCw, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { PendingUserCard } from "@/components/admin/pending-user-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/admin-api";
import type { PendingUser, ApiError } from "@/types/auth";

const PAGE_SIZE = 20;

export default function PendingApprovalsPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Reject dialog state — captures a reason instead of rejecting blind.
  const [rejectTarget, setRejectTarget] = useState<PendingUser | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(async (targetPage = page) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await adminApi.getPendingUsers(targetPage, PAGE_SIZE);
      setUsers(Array.isArray(data?.content) ? data.content : []);
      setTotalPages(data?.totalPages ?? 0);
      setTotalElements(data?.totalElements ?? 0);
      setPage(targetPage);
    } catch (err) {
      const e = err as ApiError;
      const message = e.message || "Couldn't load pending approvals.";
      setLoadError(message);
      setUsers([]);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(0); }, [load]);

  async function handleApprove(userId: string) {
    setProcessingId(userId);
    try {
      await adminApi.approveUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setTotalElements((prev) => Math.max(0, prev - 1));
      toast.success("User approved and notified by email");
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.message || "Couldn't approve user.");
    } finally {
      setProcessingId(null);
    }
  }

  function openRejectDialog(user: PendingUser) {
    setRejectTarget(user);
    setRejectReason("");
  }

  async function confirmReject() {
    if (!rejectTarget) return;
    const userId = rejectTarget.id;
    setProcessingId(userId);
    try {
      await adminApi.rejectUser(userId, rejectReason.trim() || undefined);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setTotalElements((prev) => Math.max(0, prev - 1));
      toast.success("Request rejected");
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.message || "Couldn't reject user.");
    } finally {
      setProcessingId(null);
      setRejectTarget(null);
      setRejectReason("");
    }
  }

  return (
      <div className="space-y-7">
        <PageHeader
            eyebrow="Admin"
            title="Pending approvals"
            subtitle={
              isLoading
                  ? "Loading…"
                  : loadError
                      ? "Unable to load requests"
                      : `${totalElements} request${totalElements !== 1 ? "s" : ""} awaiting review`
            }
            action={
              <Button variant="outline" size="sm" onClick={() => load(page)} disabled={isLoading}>
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            }
        />

        {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
        ) : loadError ? (
            // Distinct from "no pending approvals" — a 500 is not the same thing as an empty queue.
            <EmptyState
                icon={AlertTriangle}
                title="Couldn't load pending approvals"
                description={`${loadError} Try refreshing — if this keeps happening, the /admin/users/pending endpoint is erroring server-side.`}
            />
        ) : users.length === 0 ? (
            <EmptyState
                icon={ShieldCheck}
                title="All clear"
                description="No pending access requests right now. New registrations will appear here for your review."
            />
        ) : (
            <>
              <div className="space-y-3">
                {users.map((user) => (
                    <PendingUserCard
                        key={user.id}
                        user={user}
                        isProcessing={processingId === user.id}
                        onApprove={handleApprove}
                        onReject={() => openRejectDialog(user)}
                    />
                ))}
              </div>

              {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
                    <div className="flex gap-2">
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => load(page - 1)}
                          disabled={page === 0 || isLoading}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Previous
                      </Button>
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => load(page + 1)}
                          disabled={page + 1 >= totalPages || isLoading}
                      >
                        Next
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
              )}
            </>
        )}

        <AlertDialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Reject {rejectTarget?.firstName}'s request?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Optionally add a reason — it's included in the notification email and kept for audit purposes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Textarea
                placeholder="Reason (optional)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                  onClick={confirmReject}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Reject request
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
}