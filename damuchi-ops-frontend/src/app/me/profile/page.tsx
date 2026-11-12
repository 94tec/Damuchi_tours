
"use client";

import {
    Mail,
    Shield,
    BadgeCheck,
    Sparkles,
    UserRound,
    ShieldCheck,
    LockKeyhole,
    ChevronRight,
    CheckCircle2,
    CircleHelp,
    Fingerprint,
    CalendarDays,
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

const STATUS_CONFIG: Record<
    string,
    {
        label: string;
        variant: "success" | "warning" | "destructive" | "outline";
        description: string;
    }
> = {
    ACTIVE: {
        label: "Active member",
        variant: "success",
        description: "Your account is active and ready to use.",
    },
    PENDING_APPROVAL: {
        label: "Pending approval",
        variant: "warning",
        description: "Your account is awaiting administrator approval.",
    },
    DISABLED: {
        label: "Account disabled",
        variant: "destructive",
        description: "Your account access is currently restricted.",
    },
};

function getInitials(name?: string | null) {
    if (!name?.trim()) return "DM";

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase();
}

function formatRole(role: string) {
    return role
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ProfileSkeleton() {
    return (
        <div className="mx-auto w-full max-w-6xl space-y-7">
            <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72 max-w-full" />
            </div>

            <Skeleton className="h-64 w-full rounded-3xl" />

            <div className="grid gap-6 lg:grid-cols-[1.5fr_0.85fr]">
                <Skeleton className="h-72 rounded-2xl" />
                <Skeleton className="h-72 rounded-2xl" />
            </div>
        </div>
    );
}

function DetailRow({
                       icon: Icon,
                       label,
                       value,
                       description,
                   }: {
    icon: React.ElementType;
    label: string;
    value: string;
    description?: string;
}) {
    return (
        <div className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30 sm:px-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground transition-colors group-hover:border-emerald-700/20 group-hover:bg-emerald-700/5 group-hover:text-emerald-800">
                <Icon className="h-[18px] w-[18px]" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">
                    {label}
                </p>

                <p className="mt-1 break-words text-sm font-semibold text-foreground">
                    {value}
                </p>

                {description && (
                    <p className="mt-1 text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const user = useAuthStore((state) => state.user);

    if (!user) {
        return <ProfileSkeleton />;
    }

    const roles = user.roles ?? [];
    const permissions = user.permissions ?? [];

    const displayName = user.displayName?.trim() || "Damuchi Member";
    const email = user.email?.trim() || "No email address available";

    const status = user.status ?? "UNKNOWN";

    const statusConfig = STATUS_CONFIG[status] ?? {
        label: formatRole(status),
        variant: "outline" as const,
        description: "Your account status is currently unavailable.",
    };

    return (
        <main className="mx-auto w-full max-w-6xl space-y-7 pb-12">

            {/* Page heading */}
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-800">
                            Your account
                        </p>
                    </div>

                    <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        My profile
                    </h1>

                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                        Your personal account information, membership status
                        and access details in one place.
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start rounded-full border border-border/60 bg-card px-3 py-2 sm:self-auto">
                    <ShieldCheck className="h-4 w-4 text-emerald-700" />
                    <span className="text-xs font-medium text-muted-foreground">
                        Account overview
                    </span>
                </div>
            </header>

            {/* Profile identity hero */}
            <section className="relative isolate overflow-hidden rounded-3xl bg-[#123D32] text-white shadow-xl shadow-emerald-950/10">

                {/* Decorative background */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-20"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)",
                        backgroundSize: "22px 22px",
                    }}
                    aria-hidden="true"
                />

                <div
                    className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border border-white/10"
                    aria-hidden="true"
                />

                <div
                    className="pointer-events-none absolute -right-8 -top-20 h-64 w-64 rounded-full border border-white/10"
                    aria-hidden="true"
                />

                <div className="relative grid gap-8 px-6 py-9 sm:px-9 sm:py-11 lg:grid-cols-[1fr_auto] lg:items-center">

                    <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">

                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <Avatar className="h-24 w-24 border-[5px] border-white/15 bg-white/10 shadow-2xl sm:h-28 sm:w-28">
                                {user.profilePhotoUrl && (
                                    <AvatarImage
                                        src={user.profilePhotoUrl}
                                        alt={displayName}
                                    />
                                )}

                                <AvatarFallback className="bg-[#E9B873] font-display text-3xl font-bold text-[#123D32]">
                                    {getInitials(user.displayName)}
                                </AvatarFallback>
                            </Avatar>

                            <span
                                className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-[3px] border-[#123D32] bg-emerald-400"
                                aria-label="Profile"
                            />
                        </div>

                        {/* Identity */}
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/70">
                                Welcome to Damuchi
                            </p>

                            <h2 className="mt-2 break-words font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                                {displayName}
                            </h2>

                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/65">
                                <Mail className="h-4 w-4 shrink-0" />
                                <span className="break-all">{email}</span>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <Badge
                                    variant={statusConfig.variant}
                                    className="rounded-full border-white/15 px-3 py-1"
                                >
                                    {statusConfig.label}
                                </Badge>

                                {roles.length > 0 && roles.slice(0, 3).map((role) => (
                                    <span
                                        key={role}
                                        className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/80"
                                    >
                                        {formatRole(role)}
                                    </span>
                                ))}

                                {roles.length > 3 && (
                                    <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] text-white/75">
                                        +{roles.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Account status panel */}
                    <div className="w-full rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-sm lg:w-64">
                        <div className="flex items-center gap-2 text-emerald-100/70">
                            <ShieldCheck className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                                Account status
                            </span>
                        </div>

                        <p className="mt-3 font-display text-xl font-semibold">
                            {statusConfig.label}
                        </p>

                        <p className="mt-2 text-xs leading-relaxed text-white/60">
                            {statusConfig.description}
                        </p>

                        <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4">
                            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                            <span className="text-[11px] font-medium text-white/75">
                                Membership information
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom accent */}
                <div className="relative h-1 w-full bg-gradient-to-r from-[#E9B873] via-[#FF6B35] to-transparent" />
            </section>

            {/* Information sections */}
            <div className="grid items-start gap-6 lg:grid-cols-[1.45fr_0.85fr]">

                {/* Account information */}
                <Card className="overflow-hidden rounded-2xl border-border/60 shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/60 px-5 py-5 sm:px-6">
                        <div>
                            <h3 className="font-display text-lg font-semibold text-foreground">
                                Account information
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Your registered identity and access details.
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700/5 text-emerald-800">
                            <UserRound className="h-5 w-5" />
                        </div>
                    </div>

                    <CardContent className="p-0">
                        <div className="divide-y divide-border/60">
                            <DetailRow
                                icon={UserRound}
                                label="Full name"
                                value={displayName}
                            />

                            <DetailRow
                                icon={Mail}
                                label="Email address"
                                value={email}
                            />

                            <DetailRow
                                icon={Shield}
                                label="Assigned roles"
                                value={
                                    roles.length
                                        ? roles.map(formatRole).join(", ")
                                        : "No roles assigned"
                                }
                                description="Your account access level."
                            />

                            <DetailRow
                                icon={BadgeCheck}
                                label="Permissions"
                                value={`${permissions.length} granted`}
                                description="Permissions resolved from your assigned role."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Security and support */}
                <div className="space-y-6">

                    <Card className="overflow-hidden rounded-2xl border-border/60 shadow-sm">
                        <div className="border-b border-border/60 px-5 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700/5 text-emerald-800">
                                    <LockKeyhole className="h-5 w-5" />
                                </div>

                                <div>
                                    <h3 className="font-display text-base font-semibold">
                                        Account security
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Your account protection
                                    </p>
                                </div>
                            </div>
                        </div>

                        <CardContent className="space-y-5 p-5">

                            <div className="flex gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-700/5 text-emerald-800">
                                    <Fingerprint className="h-4 w-4" />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold">
                                        Managed account access
                                    </p>
                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                        Your assigned roles and permissions
                                        determine which account features you can access.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-700/5 text-emerald-800">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold">
                                        Account protection
                                    </p>
                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                        Your account access is managed centrally
                                        to help protect your bookings and personal information.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-emerald-700/10 bg-emerald-700/[0.04] p-4">
                                <div className="flex items-start gap-2.5">
                                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-800" />
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        Keep your account information accurate
                                        and contact support if you notice anything unusual.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account support */}
                    <Card className="rounded-2xl border-border/60 shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF6B35]/10 text-[#E85B2A]">
                                    <CircleHelp className="h-5 w-5" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3 className="text-sm font-semibold">
                                        Need to update your details?
                                    </h3>

                                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                        Name, email and password changes are
                                        currently managed through your administrator.
                                        Contact support for assistance.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Account assistance
                                </span>

                                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-800">
                                    Contact administrator
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Permissions summary */}
            <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700/5 text-emerald-800">
                            <BadgeCheck className="h-5 w-5" />
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold">
                                Access overview
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Your current account access configuration.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="rounded-xl bg-muted/50 px-5 py-3 text-center">
                            <p className="font-display text-xl font-bold text-foreground">
                                {roles.length}
                            </p>
                            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Roles
                            </p>
                        </div>

                        <div className="rounded-xl bg-muted/50 px-5 py-3 text-center">
                            <p className="font-display text-xl font-bold text-foreground">
                                {permissions.length}
                            </p>
                            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Permissions
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
