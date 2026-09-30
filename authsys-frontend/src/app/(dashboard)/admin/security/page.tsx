"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldAlert, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import type {
  IncidentSeverity, IncidentSummary, SecurityIncident,
} from "@/types/admin-control";

const SEVERITY_BADGE: Record<IncidentSeverity, "destructive" | "warning" | "secondary" | "outline"> = {
  CRITICAL: "destructive",
  HIGH: "warning",
  MEDIUM: "secondary",
  LOW: "outline",
};

const SEVERITY_FILTERS: (IncidentSeverity | "ALL")[] = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

function ResolveButton({ incident, onResolved }: { incident: SecurityIncident; onResolved: () => void }) {
  const [notes, setNotes] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  async function resolve() {
    setIsResolving(true);
    try {
      await adminApi.resolveSecurityIncident(incident.id, notes || "Resolved via dashboard");
      toast.success("Incident resolved");
      onResolved();
    } catch (err) {
      toast.error((err as ApiError).message || "Couldn't resolve incident.");
    } finally {
      setIsResolving(false);
    }
  }

  return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Resolve
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resolve this incident?</AlertDialogTitle>
            <AlertDialogDescription>
              {incident.description} — occurred {incident.occurrenceCount}×.
              Add a short resolution note for the audit trail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
              placeholder="e.g. Confirmed false positive — known office IP"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resolve} disabled={isResolving}>
              Mark resolved
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
  );
}

export default function SecurityIncidentsPage() {
  const { isSuperAdmin } = useAuthStore();
  const superAdmin = isSuperAdmin();

  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [summary, setSummary] = useState<IncidentSummary | null>(null);
  const [severity, setSeverity] = useState<IncidentSeverity | "ALL">("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [incidentPage, summaryData] = await Promise.all([
        adminApi.getSecurityIncidents(0, 50, severity === "ALL" ? undefined : severity),
        adminApi.getSecurityIncidentSummary(),
      ]);
      setIncidents(incidentPage.content);
      setSummary(summaryData);
    } catch (err) {
      toast.error((err as ApiError).message || "Couldn't load security incidents.");
    } finally {
      setIsLoading(false);
    }
  }, [severity]);

  useEffect(() => { load(); }, [load]);

  if (!superAdmin) {
    return (
        <EmptyState
            icon={ShieldAlert}
            title="SUPER_ADMIN access required"
            description="This page is restricted to platform owners."
        />
    );
  }

  const summaryCards = summary
      ? [
        { label: "Critical", value: summary.critical, variant: "destructive" as const },
        { label: "High", value: summary.high, variant: "warning" as const },
        { label: "Medium", value: summary.medium, variant: "secondary" as const },
        { label: "Low", value: summary.low, variant: "outline" as const },
      ]
      : [];

  return (
      <div className="space-y-7">
        <PageHeader
            eyebrow="Admin · Security"
            title="Security incidents"
            subtitle="Brute-force attempts, unauthorized admin access, privilege escalation — powered by SecurityIncidentService."
            action={
              <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            }
        />

        {isLoading && !summary ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {summaryCards.map((c) => (
                  <Card key={c.label}>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">{c.label}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="font-display text-2xl font-medium">{c.value}</span>
                        <Badge variant={c.variant} className="text-[10px]">open</Badge>
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {SEVERITY_FILTERS.map((s) => (
              <Button
                  key={s}
                  size="sm"
                  variant={severity === s ? "accent" : "outline"}
                  onClick={() => setSeverity(s)}
              >
                {s}
              </Button>
          ))}
        </div>

        {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
            </div>
        ) : incidents.length === 0 ? (
            <EmptyState
                icon={ShieldAlert}
                title="No open incidents"
                description="Nothing needs your attention right now."
            />
        ) : (
            <div className="rounded-xl border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Occurrences</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Raised</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell className="font-mono text-xs">{incident.type.replace(/_/g, " ")}</TableCell>
                        <TableCell className="max-w-xs truncate text-sm">{incident.description}</TableCell>
                        <TableCell>
                          <Badge variant={SEVERITY_BADGE[incident.severity]} className="text-[10px]">
                            {incident.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{incident.occurrenceCount}×</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {incident.ipAddress ?? incident.userId?.slice(0, 12) ?? "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-right">
                          <ResolveButton incident={incident} onResolved={load} />
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