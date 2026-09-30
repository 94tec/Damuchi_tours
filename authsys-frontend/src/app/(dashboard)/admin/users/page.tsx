"use client";

import { useCallback, useEffect, useState } from "react";
import { Users, Lock, Unlock, RefreshCw, Search, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { adminApi } from "@/lib/admin-api";
import type { ApiError, User } from "@/types/auth";

const STATUS_BADGE: Record<string, "success" | "warning" | "destructive" | "outline"> = {
  ACTIVE: "success",
  PENDING_APPROVAL: "warning",
  REJECTED: "destructive",
  LOCKED: "destructive",
  DISABLED: "outline",
};

/* Deterministic accent color per person, derived from their id —
   keeps avatars visually distinct across a long list instead of
   every fallback rendering as the same flat gray circle. */
const AVATAR_TONES = [
  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
];

function avatarTone(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAllUsers(0, 50);
      setUsers(Array.isArray(data) ? data : (data?.content ?? []));
    } catch (err) {
      toast.error((err as ApiError).message || "Couldn't load team members.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleLockToggle(user: User) {
    setProcessingId(user.id);
    try {
      if (user.status === "LOCKED") {
        await adminApi.unlockUser(user.id);
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: "ACTIVE" } : u));
        toast.success(`${user.firstName} unlocked`);
      } else {
        await adminApi.lockUser(user.id);
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: "LOCKED" } : u));
        toast.success(`${user.firstName} locked`);
      }
    } catch (err) {
      toast.error((err as ApiError).message || "Action failed.");
    } finally {
      setProcessingId(null);
    }
  }

  const filtered = users.filter(
      (u) =>
          search === "" ||
          `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = users.filter((u) => u.status === "ACTIVE").length;
  const lockedCount = users.filter((u) => u.status === "LOCKED").length;
  const pendingCount = users.filter((u) => u.status === "PENDING_APPROVAL").length;

  return (
      <div className="space-y-7">
        <PageHeader
            eyebrow="Admin"
            title="Team members"
            subtitle={`${users.length} total accounts`}
            action={
              <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            }
        />

        {/* Summary strip */}
        {!isLoading && users.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:max-w-md">
              <Card className="shadow-sm">
                <CardContent className="p-3.5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Active</p>
                  <p className="mt-1 font-display text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                    {activeCount}
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-3.5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Pending</p>
                  <p className="mt-1 font-display text-xl font-semibold text-amber-600 dark:text-amber-400">
                    {pendingCount}
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-3.5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Locked</p>
                  <p className="mt-1 font-display text-xl font-semibold text-destructive">
                    {lockedCount}
                  </p>
                </CardContent>
              </Card>
            </div>
        )}

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
              placeholder="Search by name or email…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
        ) : filtered.length === 0 ? (
            <EmptyState icon={Users} title="No team members found" description="Try adjusting your search." />
        ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Member</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((user) => {
                    const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
                    const isLocked = user.status === "LOCKED";
                    return (
                        <TableRow key={user.id} className="transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 ring-2 ring-border">
                                <AvatarFallback className={`text-xs font-semibold ${avatarTone(user.id)}`}>
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium leading-tight">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.roles.map((r) => (
                                  <Badge key={r} variant="secondary" className="rounded-full text-[10px] font-medium">
                                    {r}
                                  </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                                variant={STATUS_BADGE[user.status] ?? "outline"}
                                className="gap-1 rounded-full text-[10px] font-medium"
                            >
                              {user.status === "ACTIVE" && <UserCheck className="h-2.5 w-2.5" />}
                              {user.status.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                    variant={isLocked ? "outline" : "ghost"}
                                    size="sm"
                                    disabled={processingId === user.id}
                                >
                                  {isLocked ? (
                                      <><Unlock className="h-3.5 w-3.5" /> Unlock</>
                                  ) : (
                                      <><Lock className="h-3.5 w-3.5" /> Lock</>
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {isLocked ? "Unlock" : "Lock"} this account?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {isLocked
                                        ? `${user.firstName} will regain access immediately.`
                                        : `${user.firstName} will be signed out and unable to log in until unlocked.`}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                      onClick={() => handleLockToggle(user)}
                                      className={isLocked ? "" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
                                  >
                                    {isLocked ? "Unlock" : "Lock"} account
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
        )}
      </div>
  );
}