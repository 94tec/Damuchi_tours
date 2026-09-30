"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validations/auth";
import { authApi } from "@/lib/auth-api";
import type { ApiError } from "@/types/auth";

/* =========================================================
   Constants
   ========================================================= */

const inputClass =
  "h-12 rounded-xl border-white/[0.08] bg-white/[0.035] pl-11 pr-11 text-sm text-white placeholder:text-white/25 shadow-none transition-all duration-200 hover:border-white/[0.14] focus:border-[#ff7657]/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-[#ff7657]/10";

const fieldIconClass =
  "pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-white/30";

const REDIRECT_SECONDS = 5;

/* =========================================================
   Page
   ========================================================= */

type PageState = "form" | "success";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  /*
   * No token means the link itself is incomplete.
   * We intentionally keep this generic so we don't expose
   * unnecessary information about account/reset state.
   */
  useEffect(() => {
    if (!token) {
      toast.error("This reset link is invalid or incomplete.");
    }
  }, [token]);

  /*
   * Automatically redirect after successful password reset.
   */
  useEffect(() => {
    if (!isComplete) return;

    if (countdown <= 0) {
      router.push("/login");
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [isComplete, countdown, router]);

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!token) return;

    setIsSubmitting(true);

    try {
      await authApi.resetPassword({
        token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      setIsComplete(true);
      setCountdown(REDIRECT_SECONDS);

      toast.success("Password reset successfully.");
    } catch (err) {
      const apiError = err as ApiError;

      toast.error(
        apiError.message ||
          "This reset link may have expired. Request a new one."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07090a] text-white">
      {/* =====================================================
          Atmospheric background
          ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,111,82,0.11),transparent_28%),radial-gradient(circle_at_88%_82%,rgba(255,145,80,0.08),transparent_30%),linear-gradient(135deg,#07090a_0%,#0a0d0e_48%,#080a0b_100%)]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="registerFloat absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#ff6b4a]/10 blur-[110px]" />

        <div className="registerFloatReverse absolute -right-24 bottom-12 h-80 w-80 rounded-full bg-[#ff9b5a]/10 blur-[120px]" />

        <div className="registerFloat absolute left-[42%] top-[12%] h-32 w-32 rounded-full bg-[#ff7657]/[0.06] blur-[70px]" />
      </div>

      {/* =====================================================
          Main shell
          ===================================================== */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1180px]">
          <div className="registerCard overflow-hidden rounded-[30px] border border-white/[0.08] bg-white/[0.025] shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:grid lg:grid-cols-[0.9fr_1.1fr]">
            {/* =================================================
                LEFT — Recovery story
                ================================================= */}

            <aside className="relative hidden min-h-[760px] overflow-hidden border-r border-white/[0.07] lg:block">
              {/* Decorative rings */}

              <div className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full border border-white/[0.035]" />

              <div className="pointer-events-none absolute -left-20 -top-20 h-[300px] w-[300px] rounded-full border border-[#ff7657]/[0.08]" />

              <div className="pointer-events-none absolute right-[-150px] top-[38%] h-[340px] w-[340px] rounded-full border border-white/[0.025]" />

              <div className="pointer-events-none absolute bottom-[-100px] left-[15%] h-[260px] w-[260px] rounded-full bg-[#ff7657]/[0.035] blur-[80px]" />

              <div className="relative flex h-full min-h-[760px] flex-col p-10 xl:p-12">
                {/* Brand */}

                <div className="registerFadeDown flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ff7657]/20 bg-[#ff7657]/10 text-[#ff876c]">
                    <MapPin className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold tracking-tight text-white">
                      Damuchi Safaris
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                      Operations Platform
                    </p>
                  </div>
                </div>

                {/* Hero */}

                <div className="mt-20">
                  <div className="registerHero">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ff7657]/15 bg-[#ff7657]/[0.06] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#ff9a83]">
                      <Sparkles className="h-3.5 w-3.5" />
                      Secure account recovery
                    </div>

                    <h1 className="max-w-[500px] font-display text-4xl font-medium leading-[1.05] tracking-[-0.035em] text-white xl:text-[48px]">
                      A secure reset.
                      <br />
                      <span className="text-white/45">A fresh start.</span>
                    </h1>

                    <p className="mt-6 max-w-[470px] text-sm leading-7 text-white/45">
                      Use your secure, time-limited reset link to create a new
                      password and get back to your Damuchi Safaris account.
                    </p>
                  </div>

                  {/* Recovery steps */}

                  <div className="mt-12 space-y-6">
                    <RecoveryStep
                      number="01"
                      title="Verify your reset link"
                      description="We confirm that the security link is valid before allowing a password change."
                      active
                    />

                    <RecoveryStep
                      number="02"
                      title="Create a new password"
                      description="Choose a strong password that you have not used on this account before."
                    />

                    <RecoveryStep
                      number="03"
                      title="Sign in securely"
                      description="Once updated, your new password is ready for your next sign-in."
                    />
                  </div>
                </div>

                {/* Stats */}

                <div className="mt-auto pt-12">
                  <div className="grid grid-cols-3 gap-3">
                    <FeatureStat
                      value="Secure"
                      label="Recovery"
                    />

                    <FeatureStat
                      value="1×"
                      label="Use per link"
                    />

                    <FeatureStat
                      value="Fast"
                      label="Reset flow"
                    />
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-6">
                    <p className="text-[11px] text-white/25">
                      © {new Date().getFullYear()} Damuchi Safaris
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-emerald-400/75">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
                      Secure recovery
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* =================================================
                RIGHT — Form / States
                ================================================= */}

            <section className="relative flex min-h-[760px] items-center justify-center">
              <div className="w-full max-w-[470px] px-6 py-12 sm:px-10 lg:px-12 xl:px-16">
                {/* Mobile brand */}

                <div className="mb-12 flex items-center gap-3 lg:hidden">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ff7657]/20 bg-[#ff7657]/10 text-[#ff876c]">
                    <MapPin className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold tracking-tight text-white">
                      Damuchi Safaris
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                      Operations Platform
                    </p>
                  </div>
                </div>

                {!token ? (
                  <InvalidResetState router={router} />
                ) : isComplete ? (
                  <SuccessState
                    countdown={countdown}
                    onLogin={() => router.push("/login")}
                  />
                ) : (
                  <ResetForm
                    form={form}
                    isSubmitting={isSubmitting}
                    showPassword={showPassword}
                    showConfirmPassword={showConfirmPassword}
                    setShowPassword={setShowPassword}
                    setShowConfirmPassword={setShowConfirmPassword}
                    onSubmit={onSubmit}
                  />
                )}

                {/* Back to sign in */}

                <Link
                  href="/login"
                  className="group mt-8 flex items-center justify-center gap-1.5 text-sm font-medium text-white/35 transition-colors hover:text-[#ff927a]"
                >
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                  Back to sign in
                </Link>

                {/* Security footer */}

                <div className="mt-8 flex items-center justify-center gap-2 text-center text-[11px] leading-5 text-white/25">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400/60" />
                  Your password is protected with secure account recovery.
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* =====================================================
          Animations
          ===================================================== */}

      <style jsx global>{`
@keyframes registerFloat {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
}

  50% {
    transform: translate3d(18px, -16px, 0) scale(1.04);
}
}

@keyframes registerFloatReverse {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
}

  50% {
    transform: translate3d(-20px, 14px, 0) scale(1.05);
}
}

@keyframes registerFadeDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes registerHero {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes registerCard {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.99);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes resetSuccess {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }

  70% {
    transform: scale(1.06);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes resetPing {
  0% {
    opacity: 0.55;
    transform: scale(0.85);
  }

  100% {
    opacity: 0;
    transform: scale(1.55);
  }
}

.registerFloat {
  animation: registerFloat 12s ease-in-out infinite;
}

.registerFloatReverse {
  animation: registerFloatReverse 14s ease-in-out infinite;
}

.registerFadeDown {
  animation: registerFadeDown 0.65s ease-out both;
}

.registerHero {
  animation: registerHero 0.8s 0.08s ease-out both;
}

.registerCard {
  animation: registerCard 0.7s ease-out both;
}

.resetSuccess {
  animation: resetSuccess 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.resetPing {
  animation: resetPing 1.5s ease-out infinite;
}

@media (prefers-reduced-motion: reduce) {
.registerFloat,
.registerFloatReverse,
.registerFadeDown,
.registerHero,
.registerCard,
.resetSuccess,
.resetPing {
    animation: none !important;
  }
}
`}</style>
    </main>
  );
}

/* =========================================================
   Reset form
   ========================================================= */

interface ResetFormProps {
  form: ReturnType<typeof useForm<ResetPasswordFormValues>>;
  isSubmitting: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  setShowPassword: (value: boolean) => void;
  setShowConfirmPassword: (value: boolean) => void;
  onSubmit: (values: ResetPasswordFormValues) => Promise<void>;
}

function ResetForm({
  form,
  isSubmitting,
  showPassword,
  showConfirmPassword,
  setShowPassword,
  setShowConfirmPassword,
  onSubmit,
}: ResetFormProps) {
  return (
    <div>
      <div className="mb-8">
        <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#ff947b]">
          <LockKeyhole className="h-3.5 w-3.5" />
          Account recovery
        </div>

        <h2 className="font-display text-3xl font-medium tracking-[-0.025em] text-white">
          Choose a new password.
        </h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-white/40">
          Create a strong password and make it different from your previous
          password.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* New password */}

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-white/65">
                  New password
                </FormLabel>

                <FormControl>
                  <div className="relative mt-1.5">
                    <LockKeyhole className={fieldIconClass} />

                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      autoComplete="new-password"
                      hasError={!!form.formState.errors.newPassword}
                      className={inputClass}
                    />

                    <PasswordToggle
                      visible={showPassword}
                      onClick={() => setShowPassword(!showPassword)}
                      label={
                        showPassword
                          ? "Hide new password"
                          : "Show new password"
                      }
                    />
                  </div>
                </FormControl>

                <FormDescription className="mt-1.5 text-[11px] leading-5 text-white/25">
                  At least 10 characters, mixing case, numbers, and symbols.
                </FormDescription>

                <FormMessage className="text-xs text-red-400" />
              </FormItem>
            )}
          />

          {/* Confirm password */}

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-white/65">
                  Confirm password
                </FormLabel>

                <FormControl>
                  <div className="relative mt-1.5">
                    <LockKeyhole className={fieldIconClass} />

                    <Input
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      autoComplete="new-password"
                      hasError={!!form.formState.errors.confirmPassword}
                      className={inputClass}
                    />

                    <PasswordToggle
                      visible={showConfirmPassword}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      label={
                        showConfirmPassword
                          ? "Hide password confirmation"
                          : "Show password confirmation"
                      }
                    />
                  </div>
                </FormControl>

                <FormMessage className="text-xs text-red-400" />
              </FormItem>
            )}
          />

          {/* CTA */}

          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="mt-2 h-12 w-full rounded-xl bg-[#ff7657] font-medium text-white shadow-[0_12px_30px_rgba(255,118,87,0.18)] transition-all duration-200 hover:bg-[#ff8469] hover:shadow-[0_14px_34px_rgba(255,118,87,0.24)]"
            loading={isSubmitting}
          >
            {!isSubmitting && <KeyRound className="h-4 w-4" />}
            Reset password
            {!isSubmitting && (
              <ArrowRight className="ml-auto h-4 w-4 opacity-50" />
            )}
          </Button>
        </form>
      </Form>

      {/* Security notice */}

      <div className="mt-7 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3.5">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-400/[0.08] text-emerald-400/70">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>

          <div>
            <p className="text-xs font-medium text-white/55">
              Your account stays protected
            </p>

            <p className="mt-0.5 text-[11px] leading-5 text-white/25">
              Your reset link is time-limited and can only be used once.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Invalid reset state
   ========================================================= */

function InvalidResetState({
  router,
}: {
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="resetSuccess text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/10 bg-red-400/[0.06] text-red-400/80">
        <ShieldAlert className="h-7 w-7" />
      </div>

      <div className="mt-7">
        <div className="mb-3 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-red-300/70">
          <ShieldAlert className="h-3.5 w-3.5" />
          Recovery link unavailable
        </div>

        <h2 className="font-display text-3xl font-medium tracking-[-0.025em] text-white">
          That link didn't make it.
        </h2>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/40">
          This reset link is missing, expired, or no longer valid. Request a
          new one to continue securely.
        </p>
      </div>

      <Button
        variant="accent"
        size="lg"
        className="mt-8 h-12 w-full rounded-xl"
        onClick={() => router.push("/forgot-password")}
      >
        Request a new link
        <ArrowRight className="ml-auto h-4 w-4 opacity-50" />
      </Button>
    </div>
  );
}

/* =========================================================
   Success state
   ========================================================= */

function SuccessState({
  countdown,
  onLogin,
}: {
  countdown: number;
  onLogin: () => void;
}) {
  return (
    <div className="resetSuccess text-center">
      <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
        <div className="resetPing absolute inset-0 rounded-2xl border border-emerald-400/20" />

        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.07] text-emerald-400">
          <CheckCircle2 className="h-7 w-7" />
        </div>
      </div>

      <div className="mt-7">
        <div className="mb-3 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300/70">
          <Check className="h-3.5 w-3.5" />
          Recovery complete
        </div>

        <h2 className="font-display text-3xl font-medium tracking-[-0.025em] text-white">
          Password reset.
        </h2>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/40">
          Your password has been changed successfully. You can now sign in
          securely with your new password.
        </p>
      </div>

      <Button
        variant="accent"
        size="lg"
        className="mt-8 h-12 w-full rounded-xl"
        onClick={onLogin}
      >
        Back to sign in
        <ArrowRight className="ml-auto h-4 w-4 opacity-50" />
      </Button>

      <p className="mt-4 text-[11px] text-white/25">
        Redirecting automatically in {countdown}s…
      </p>
    </div>
  );
}

/* =========================================================
   Password toggle
   ========================================================= */

function PasswordToggle({
  visible,
  onClick,
  label,
}: {
  visible: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/25 transition-colors hover:bg-white/[0.05] hover:text-white/60"
    >
      {visible ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </button>
  );
}

/* =========================================================
   Recovery step
   ========================================================= */

function RecoveryStep({
  number,
  title,
  description,
  active = false,
}: {
  number: string;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-[10px] font-semibold tracking-wider",
          active
            ? "border-[#ff7657]/20 bg-[#ff7657]/10 text-[#ff927a]"
            : "border-white/[0.07] bg-white/[0.025] text-white/30",
        ].join(" ")}
      >
        {number}
      </div>

      <div className="pt-0.5">
        <h3 className="text-sm font-medium text-white/75">{title}</h3>

        <p className="mt-1 text-xs leading-5 text-white/30">{description}</p>
      </div>
    </div>
  );
}

/* =========================================================
   Feature stat
   ========================================================= */

function FeatureStat({
  value,
  label,
}: {
  value: ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-3.5">
      <div className="text-sm font-semibold tracking-tight text-white/70">
        {value}
      </div>

      <div className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-white/25">
        {label}
      </div>
    </div>
  );
}

