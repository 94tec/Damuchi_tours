"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, KeyRound, Shield, Mail, Phone, CircleCheck, UserPlus, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { authApi } from "@/lib/auth-api";
import { useAuthStore } from "@/store/auth-store";
import type { ApiError, UserProfile } from "@/types/auth";
import { passwordSchema } from "@/lib/validations/auth";

const profileSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  phoneNumber: z.string().min(7, "Enter a valid phone number"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
});

const pwSchema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: passwordSchema,
  confirm: z.string().min(1, "Required"),
}).refine((d) => d.newPassword === d.confirm, {
  message: "Passwords don't match",
  path: ["confirm"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PwForm = z.infer<typeof pwSchema>;

/* =========================
   Small reusable pieces — mirrors the icon-chip + tone
   pattern used on the bootstrap diagnostics page, so
   status/verification state reads consistently app-wide.
   ========================= */

function CardIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10">
      <Icon className="h-3.5 w-3.5 text-accent" />
    </span>
  );
}

function VerificationRow({
                           icon: Icon, label, verified,
                         }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  verified: boolean;
}) {
  return (
      <div className="flex items-center justify-between py-1.5">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
        <Badge
            variant={verified ? "success" : "warning"}
            className="gap-1 rounded-full px-2 text-[10px] font-medium"
        >
          {verified && <CircleCheck className="h-2.5 w-2.5" />}
          {verified ? "Verified" : "Pending"}
        </Badge>
      </div>
  );
}

/* =========================
   Profile setup / edit dialog — same form serves both
   "complete your profile" (first time) and "edit profile"
   (returning user) flows, keyed off `mode`.
   ========================= */

function ProfileFormDialog({
                             mode,
                             open,
                             onOpenChange,
                             defaultValues,
                             onSaved,
                             trigger,
                           }: {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues: Partial<ProfileForm>;
  onSaved: (profile: UserProfile) => void;
  trigger?: React.ReactNode;
}) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: defaultValues.firstName ?? "",
      lastName: defaultValues.lastName ?? "",
      phoneNumber: defaultValues.phoneNumber ?? "",
      bio: defaultValues.bio ?? "",
    },
  });

  // Re-sync form values whenever the dialog opens with fresh defaults
  // (e.g. opening "edit" after "create" already ran once this session).
  useEffect(() => {
    if (open) {
      form.reset({
        firstName: defaultValues.firstName ?? "",
        lastName: defaultValues.lastName ?? "",
        phoneNumber: defaultValues.phoneNumber ?? "",
        bio: defaultValues.bio ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(values: ProfileForm) {
    setIsSaving(true);
    try {
      const saved = await authApi.updateProfile(values);
      onSaved(saved);
      toast.success(mode === "create" ? "Profile set up" : "Profile updated");
      onOpenChange(false);
    } catch (err) {
      toast.error((err as ApiError).message || "Couldn't save profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <CardIcon icon={mode === "create" ? UserPlus : Pencil} />
              {mode === "create" ? "Complete your profile" : "Edit profile"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                  ? "A few details so your account is ready to go."
                  : "Update your personal details below."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label>First name</Label>
                <Input {...form.register("firstName")} className="mt-1.5" />
                {form.formState.errors.firstName && (
                    <p className="mt-1 text-xs text-destructive">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label>Last name</Label>
                <Input {...form.register("lastName")} className="mt-1.5" />
                {form.formState.errors.lastName && (
                    <p className="mt-1 text-xs text-destructive">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Phone number</Label>
              <Input {...form.register("phoneNumber")} className="mt-1.5" placeholder="+254…" />
              {form.formState.errors.phoneNumber && (
                  <p className="mt-1 text-xs text-destructive">{form.formState.errors.phoneNumber.message}</p>
              )}
            </div>

            <div>
              <Label>Bio <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea
                  {...form.register("bio")}
                  className="mt-1.5 resize-none"
                  rows={3}
                  placeholder="A short description about you"
              />
              {form.formState.errors.bio && (
                  <p className="mt-1 text-xs text-destructive">{form.formState.errors.bio.message}</p>
              )}
            </div>

            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
              <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => onOpenChange(false)}
                  disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" variant="accent" size="sm" className="w-full sm:w-auto" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {mode === "create" ? "Save & continue" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  );
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileMissing, setProfileMissing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("edit");

  const pwForm = useForm<PwForm>({
    resolver: zodResolver(pwSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirm: "" },
  });

  useEffect(() => {
    authApi.getCurrentUser()
        .then((u) => setUser(u))
        .catch((err: ApiError) => {
          console.error("Failed to refresh current user:", err);
        });

    authApi.getProfile()
        .then((p) => {
          setProfile(p);
          setProfileMissing(false);
        })
        .catch((err: ApiError) => {
          if (err.status === 404) {
            setProfileMissing(true);
          } else if (user) {
            setProfile(null);
          }
        })
        .finally(() => setIsLoadingProfile(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSaved(saved: UserProfile) {
    setProfile(saved);
    setProfileMissing(false);
    // No setUser call — `saved` is a UserProfile, store holds Partial<User>.
    // Session data (emailVerified, status, roles) is untouched by a profile save.
  }

  function openCreateDialog() {
    setDialogMode("create");
    setDialogOpen(true);
  }

  function openEditDialog() {
    setDialogMode("edit");
    setDialogOpen(true);
  }

  async function changePassword(values: PwForm) {
    setIsChangingPw(true);
    try {
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirm,
      });
      pwForm.reset();
      toast.success("Password changed successfully");
    } catch (err) {
      toast.error((err as ApiError).message || "Couldn't change password.");
    } finally {
      setIsChangingPw(false);
    }
  }

  const displayUser = profile ?? user;
  const initials = `${displayUser?.firstName?.[0] ?? ""}${displayUser?.lastName?.[0] ?? ""}`.toUpperCase();

  return (
      <div className="space-y-7">
        <PageHeader
            eyebrow="Account"
            title="My profile"
            subtitle="Manage your personal details and security settings."
            action={
              !isLoadingProfile && !profileMissing ? (
                  <Button variant="outline" size="sm" onClick={openEditDialog}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit profile
                  </Button>
              ) : undefined
            }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: identity + status */}
          <Card className="relative h-fit overflow-hidden shadow-sm">
            <span className="absolute inset-x-0 top-0 h-0.5 bg-accent/60" />
            <CardContent className="flex flex-col items-center p-6 text-center">
              <Avatar className="h-20 w-20 ring-4 ring-accent/10">
                <AvatarFallback className="bg-accent/10 text-2xl font-semibold text-accent">
                  {initials || "?"}
                </AvatarFallback>
              </Avatar>
              <p className="mt-3.5 font-display text-lg font-semibold tracking-tight">
                {displayUser?.firstName ? `${displayUser.firstName} ${displayUser.lastName ?? ""}` : "New account"}
              </p>
              <p className="text-sm text-muted-foreground">{displayUser?.email}</p>

              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {displayUser?.roles?.map((r) => (
                    <Badge key={r} variant="secondary" className="rounded-full text-[10px] font-medium">
                      {r}
                    </Badge>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="w-full space-y-0.5 text-left text-xs">
                <VerificationRow icon={Mail} label="Email" verified={!!user?.emailVerified} />
                <VerificationRow icon={Phone} label="Phone" verified={!!user?.phoneVerified} />
                <div className="flex items-center justify-between py-1.5">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />
                  Account status
                </span>
                  <Badge variant="success" className="rounded-full px-2 text-[10px] font-medium">
                    {user?.status ?? "—"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right: profile setup CTA (first time) or forms */}
          <div className="space-y-5 lg:col-span-2">
            {profileMissing && !isLoadingProfile ? (
                <Card className="shadow-sm">
                  <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                      <UserPlus className="h-6 w-6 text-accent" />
                    </span>
                    <div>
                      <p className="font-display text-base font-semibold tracking-tight">
                        Set up your profile
                      </p>
                      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                        Add your name and contact details so we can personalize your account.
                      </p>
                    </div>
                    <Button variant="accent" size="sm" className="mt-2" onClick={openCreateDialog}>
                      <UserPlus className="h-3.5 w-3.5" />
                      Complete profile
                    </Button>
                  </CardContent>
                </Card>
            ) : (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2.5 text-base font-semibold tracking-tight">
                      <CardIcon icon={Shield} />
                      Personal details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-muted-foreground">First name</dt>
                        <dd className="mt-0.5 text-sm font-medium">{displayUser?.firstName || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Last name</dt>
                        <dd className="mt-0.5 text-sm font-medium">{displayUser?.lastName || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Phone number</dt>
                        <dd className="mt-0.5 text-sm font-medium">{displayUser?.phoneNumber || "—"}</dd>
                      </div>
                      {profile?.bio && (
                          <div className="sm:col-span-2">
                            <dt className="text-xs text-muted-foreground">Bio</dt>
                            <dd className="mt-0.5 text-sm">{profile.bio}</dd>
                          </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>
            )}

            {/* Change password */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2.5 text-base font-semibold tracking-tight">
                  <CardIcon icon={KeyRound} />
                  Change password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={pwForm.handleSubmit(changePassword)} className="space-y-4">
                  <div>
                    <Label>Current password</Label>
                    <Input type="password" {...pwForm.register("currentPassword")} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>New password</Label>
                    <Input type="password" {...pwForm.register("newPassword")} className="mt-1.5" />
                    {pwForm.formState.errors.newPassword && (
                        <p className="mt-1 text-xs text-destructive">{pwForm.formState.errors.newPassword.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Confirm new password</Label>
                    <Input type="password" {...pwForm.register("confirm")} className="mt-1.5" />
                    {pwForm.formState.errors.confirm && (
                        <p className="mt-1 text-xs text-destructive">{pwForm.formState.errors.confirm.message}</p>
                    )}
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button type="submit" variant="accent" size="sm" loading={isChangingPw}>
                      {!isChangingPw && <KeyRound className="h-3.5 w-3.5" />}
                      Update password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        <ProfileFormDialog
            mode={dialogMode}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            defaultValues={{
              firstName: displayUser?.firstName ?? "",
              lastName: displayUser?.lastName ?? "",
              phoneNumber: displayUser?.phoneNumber ?? "",
              bio: profile?.bio ?? "",
            }}
            onSaved={handleSaved}
        />
      </div>
  );
}