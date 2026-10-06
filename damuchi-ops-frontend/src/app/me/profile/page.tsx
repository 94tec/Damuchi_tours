"use client";

import {
    BadgeCheck,
    CheckCircle2,
    KeyRound,
    Mail,
    Shield,
    Sparkles,
    UserRound,
} from "lucide-react";

import { useAuthStore } from "@/store/auth-store";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_BADGE: Record<
    string,
    "success" | "warning" | "destructive"
> = {
    ACTIVE: "success",
    PENDING_APPROVAL: "warning",
    DISABLED: "destructive",
};

const STATUS_LABEL: Record<string, string> = {
    ACTIVE: "Active member",
    PENDING_APPROVAL: "Pending approval",
    DISABLED: "Account disabled",
};

export default function ProfilePage() {
    const user = useAuthStore((s) => s.user);

    /*
     * Loading / hydration state
     */
    if (!user) {
        return (
            <div className="mx-auto w-full max-w-5xl space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-4 w-72 max-w-full" />
                </div>

                <Skeleton className="h-64 w-full rounded-3xl" />

                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <Card className="border-border/60">
                        <CardContent className="space-y-5 p-6">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4"
                                >
                                    <Skeleton className="h-10 w-10 rounded-xl" />

                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-3 w-24" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-border/60">
                        <CardContent className="space-y-4 p-6">
                            <Skeleton className="h-5 w-36" />
                            <Skeleton className="h-16 w-full rounded-xl" />
                            <Skeleton className="h-16 w-full rounded-xl" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    /*
     * Normalize optional user properties once.
     *
     * This prevents:
     * TS2538: Type undefined cannot be used as an index type
     * TS18048: user.roles.length is possibly undefined
     * TS18048: user.permissions.length is possibly undefined
     */
    const status = user.status ?? "ACTIVE";
    const roles = user.roles ?? [];
    const permissions = user.permissions ?? [];

    const displayName =
        user.displayName?.trim() || "Damuchi traveler";

    const email =
        user.email?.trim() || "No email address available";

    const statusVariant =
        STATUS_BADGE[status] ?? "warning";

    const statusLabel =
        STATUS_LABEL[status] ??
        status
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (letter) => letter.toUpperCase());

    const initials =
        displayName
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part.charAt(0))
            .slice(0, 2)
            .join("")
            .toUpperCase() || "D";

    const accessLabel =
        roles.length > 0
            ? roles.join(", ")
            : "Standard member";

    return (
        <main className="mx-auto w-full max-w-5xl">
            {/* -------------------------------------------------
             * Page heading
             * ------------------------------------------------- */}
            <header className="mb-7">
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-savanna/10 text-savanna">
                        <UserRound className="h-4 w-4" />
                    </div>

                    <div>
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-savanna">
                            Account
                        </p>

                        <h1 className="mt-0.5 font-display text-2xl font-semibold tracking-tight text-earth sm:text-3xl">
                            My profile
                        </h1>
                    </div>
                </div>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-stone">
                    Manage your account information, membership status, and
                    access details.
                </p>
            </header>

            {/* -------------------------------------------------
             * Profile hero
             * ------------------------------------------------- */}
            <section
                aria-labelledby="profile-heading"
                className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm"
            >
                {/* Background */}
                <div
                    className="absolute inset-0 bg-gradient-to-br from-savanna/20 via-savanna/5 to-earth/5"
                    aria-hidden="true"
                />

                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 20% 20%, white 0.5px, transparent 0.5px)",
                        backgroundSize: "16px 16px",
                    }}
                    aria-hidden="true"
                />

                <div
                    className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-savanna/10 blur-3xl"
                    aria-hidden="true"
                />

                <div
                    className="absolute -bottom-28 -left-28 h-64 w-64 rounded-full bg-earth/5 blur-3xl"
                    aria-hidden="true"
                />

                {/* Hero content */}
                <div className="relative px-5 py-8 sm:px-8 sm:py-10">
                    <div className="flex flex-col items-center text-center">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-xl ring-1 ring-border/50 sm:h-28 sm:w-28">
                            {user.profilePhotoUrl && (
                                <AvatarImage
                                    src={user.profilePhotoUrl}
                                    alt={`${displayName}'s profile photo`}
                                />
                            )}

                            <AvatarFallback className="bg-savanna/15 font-display text-2xl font-semibold text-savanna sm:text-3xl">
                                {initials}
                            </AvatarFallback>
                        </Avatar>

                        <div className="mt-5">
                            <h2
                                id="profile-heading"
                                className="font-display text-2xl font-semibold tracking-tight text-earth sm:text-3xl"
                            >
                                {displayName}
                            </h2>

                            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-stone">
                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                <span className="max-w-[280px] truncate">
                                    {email}
                                </span>
                            </div>
                        </div>

                        {/* Status */}
                        <Badge
                            variant={statusVariant}
                            className="mt-4 rounded-full px-3.5 py-1 text-xs"
                        >
                            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
                            {statusLabel}
                        </Badge>

                        {/* Roles */}
                        {roles.length > 0 && (
                            <div className="mt-5 flex max-w-xl flex-wrap justify-center gap-2">
                                {roles.map((role) => (
                                    <Badge
                                        key={role}
                                        variant="outline"
                                        className="rounded-full border-earth/10 bg-earth/5 px-3 py-1 text-[11px] font-medium text-earth"
                                    >
                                        {role}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* -------------------------------------------------
             * Main content
             * ------------------------------------------------- */}
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                {/* Account information */}
                <Card className="overflow-hidden border-border/60 shadow-sm">
                    <CardContent className="p-0">
                        <div className="border-b border-border/60 px-5 py-5 sm:px-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-savanna/10 text-savanna">
                                    <Shield className="h-4 w-4" />
                                </div>

                                <div>
                                    <h3 className="font-display text-base font-semibold text-earth">
                                        Account information
                                    </h3>

                                    <p className="mt-0.5 text-xs text-stone">
                                        Your current account and access details.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-border/60">
                            {/* Email */}
                            <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-savanna/10 text-savanna">
                                    <Mail className="h-4 w-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-stone">
                                        Email address
                                    </p>

                                    <p className="mt-1 truncate text-sm font-medium text-earth">
                                        {email}
                                    </p>
                                </div>

                                <CheckCircle2 className="h-4 w-4 shrink-0 text-savanna" />
                            </div>

                            {/* Access level */}
                            <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-savanna/10 text-savanna">
                                    <Shield className="h-4 w-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-stone">
                                        Access level
                                    </p>

                                    <p className="mt-1 truncate text-sm font-medium text-earth">
                                        {accessLabel}
                                    </p>
                                </div>
                            </div>

                            {/* Permissions */}
                            <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-savanna/10 text-savanna">
                                    <BadgeCheck className="h-4 w-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-stone">
                                        Permissions
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-earth">
                                        {permissions.length}{" "}
                                        {permissions.length === 1
                                            ? "permission"
                                            : "permissions"}{" "}
                                        granted
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-stone">
                                        Resolved from your assigned role
                                        {roles.length === 1 ? "" : "s"}.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <div className="space-y-6">
                    <Card className="border-border/60 shadow-sm">
                        <CardContent className="p-5 sm:p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-savanna/10 text-savanna">
                                    <KeyRound className="h-4 w-4" />
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-earth">
                                        Account security
                                    </h3>

                                    <p className="mt-1.5 text-xs leading-5 text-stone">
                                        Your account access is protected
                                        centrally to help keep your bookings
                                        and personal information secure.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 rounded-xl border border-border/60 bg-muted/30 p-4">
                                <div className="flex items-start gap-3">
                                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-savanna" />

                                    <div>
                                        <p className="text-xs font-semibold text-earth">
                                            Protected account
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-stone">
                                            Access permissions are resolved
                                            from your assigned roles.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Access summary */}
                    <Card className="overflow-hidden border-border/60 shadow-sm">
                        <CardContent className="p-0">
                            <div className="border-b border-border/60 px-5 py-4">
                                <h3 className="text-sm font-semibold text-earth">
                                    Access summary
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 divide-x divide-border/60">
                                <div className="px-5 py-5">
                                    <p className="text-2xl font-semibold tracking-tight text-earth">
                                        {roles.length}
                                    </p>

                                    <p className="mt-1 text-xs text-stone">
                                        {roles.length === 1
                                            ? "Assigned role"
                                            : "Assigned roles"}
                                    </p>
                                </div>

                                <div className="px-5 py-5">
                                    <p className="text-2xl font-semibold tracking-tight text-earth">
                                        {permissions.length}
                                    </p>

                                    <p className="mt-1 text-xs text-stone">
                                        {permissions.length === 1
                                            ? "Permission"
                                            : "Permissions"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Admin-managed notice */}
                    <div className="rounded-2xl border border-savanna/20 bg-savanna/5 px-5 py-4 sm:px-6">
                        <div className="flex items-start gap-3">
                            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-savanna" />

                            <p className="text-xs leading-5 text-stone">
                                Need to update your name, email, or password?
                                Reach out to your administrator. Account
                                details are managed centrally.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}