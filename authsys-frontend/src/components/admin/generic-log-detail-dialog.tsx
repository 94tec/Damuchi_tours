"use client";

import { format, isValid } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { GenericLog } from "@/types/auth";

export function GenericLogDetailDialog({ log, open, onOpenChange }: {
    log: GenericLog | null; open: boolean; onOpenChange: (open: boolean) => void;
}) {
    if (!log) return null;
    const ts = log.timestamp ? new Date(log.timestamp) : null;
    const entries = Object.entries(log.fields ?? {}).filter(([, v]) => v !== null && v !== undefined);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-mono text-base">{log.label}</DialogTitle>
                    <DialogDescription>
                        {ts && isValid(ts) ? format(ts, "EEEE, dd MMM yyyy · HH:mm:ss") : "Timestamp unavailable"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Severity</span>
                        <Badge variant="outline" className="text-[10px]">{log.severity}</Badge>
                    </div>

                    {entries.length > 0 && (
                        <dl className="space-y-2 rounded-lg bg-muted/40 p-3">
                            {entries.map(([key, value]) => (
                                <div key={key} className="flex items-baseline justify-between gap-3 text-sm">
                                    <dt className="shrink-0 text-xs text-muted-foreground">{key}</dt>
                                    <dd className="truncate text-right font-mono text-xs">
                                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}