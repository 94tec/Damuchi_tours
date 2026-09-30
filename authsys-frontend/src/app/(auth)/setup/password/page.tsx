"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  MapPin,
  ShieldCheck,
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
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/lib/validations/auth";
import { authApi } from "@/lib/auth-api";
import { useAuthStore } from "@/store/auth-store";
import type { ApiError } from "@/types/auth";

/* =========================================================
   Constants
   ========================================================= */

const SETUP_STEPS = [
  {
    number: "01",
    label: "New password",
    description: "Set a secure password",
  },
  {
    number: "02",
    label: "Verify",
    description: "Confirm with OTP",
  },
  {
    number: "03",
    label: "Activate",
    description: "Account goes live",
  },
] as const;

const inputClass =
  "h-12 rounded-xl border-white/[0.08] bg-white/[0.035] pl-11 pr-11 text-sm text-white placeholder:text-white/25 shadow-none transition-all duration-200 hover:border-white/[0.14] focus:border-[#ff7657]/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-[#ff7657]/10";

const fieldIconClass =
  "pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-white/30";

/* =========================================================
   Page
   ========================================================= */

export default function SetupPasswordPage() {
  const router = useRouter();

  const tempToken = useAuthStore((state) => state.tempToken);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /*
   * Wait for Zustand persistence to hydrate before checking
   * whether a temporary first-time-login token exists.
   */
  const [hasHydrated, setHasHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated()
  );

  useEffect(() => {
    if (hasHydrated) return;

    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    return unsubscribe;
  }, [hasHydrated]);

  /*
   * Redirect users who do not have the temporary setup token.
   */
  useEffect(() => {
    if (!hasHydrated) return;

    if (!tempToken) {
      toast.error("Session expired. Please sign in again.");
      router.replace("/login");
    }
  }, [hasHydrated, tempToken, router]);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  /* =======================================================
     Submit
     ======================================================= */

  async function onSubmit(values: ChangePasswordFormValues) {
    if (!tempToken) {
      toast.error("Session expired. Please sign in again.");
      router.replace("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authApi.changePasswordFirstTime(tempToken, {
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      /*
       * Preserve backend rate-limit behavior.
       */
      if (result.rateLimited) {
        toast.warning(
          result.message || "Too many requests. Try again later."
        );
        return;
      }

      /*
       * Backend could not send the OTP.
       */
      if (!result.sent) {
        toast.error(
          result.message ||
            "Couldn't send verification code. Please try again."
        );
        return;
      }

      /*
       * Password was accepted and OTP was sent.
       */
      toast.success("Verification code sent to your phone");

      /*
       * IMPORTANT:
       * Use client-side navigation so the temporary token stored
       * in Zustand/sessionStorage remains available to /setup/verify.
       *
       * Do not replace this with window.location.href.
       */
      router.push("/setup/verify");
    } catch (err) {
      const apiError = err as ApiError;

      toast.error(
        apiError.message ||
          "Couldn't update your password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /*
   * Prevent a flash of the setup page before Zustand has
   * restored the temporary session.
   */
  if (!hasHydrated) {
    return null;
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

        <div className="setupPasswordFloat absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#ff6b4a]/10 blur-[110px]" />

        <div className="setupPasswordFloatReverse absolute -right-24 bottom-12 h-80 w-80 rounded-full bg-[#ff9b5a]/10 blur-[120px]" />

        <div className="setupPasswordFloat absolute left-[42%] top-[12%] h-32 w-32 rounded-full bg-[#ff7657]/[0.06] blur-[70px]" />
      </div>

      {/* =====================================================
          Main shell
          ===================================================== */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1180px]">
          <div className="setupPasswordCard overflow-hidden rounded-[30px] border border-white/[0.08] bg-white/[0.025] shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:grid lg:grid-cols-[0.9fr_1.1fr]">
            {/* =================================================
                LEFT PANEL
                ================================================= */}

            <aside className="relative hidden min-h-[760px] overflow-hidden border-r border-white/[0.07] lg:block">
              {/* Decorative rings */}

              <div className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full border border-white/[0.035]" />

              <div className="pointer-events-none absolute -left-20 -top-20 h-[300px] w-[300px] rounded-full border border-[#ff7657]/[0.08]" />

              <div className="pointer-events-none absolute right-[-150px] top-[38%] h-[340px] w-[340px] rounded-full border border-white/[0.025]" />

              <div className="pointer-events-none absolute bottom-[-100px] left-[15%] h-[260px] w-[260px] rounded-full bg-[#ff7657]/[0.035] blur-[80px]" />

              <div className="relative flex h-full min-h-[760px] flex-col p-10 xl:p-12">
                {/* Brand */}

                <div className="setupPasswordFadeDown flex items-center gap-3">
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
                  <div className="setupPasswordHero">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ff7657]/15 bg-[#ff7657]/[0.06] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#ff9a83]">
                      <Sparkles className="h-3.5 w-3.5" />
                      First-time setup
                    </div>

                    <h1 className="max-w-[500px] font-display text-4xl font-medium leading-[1.05] tracking-[-0.035em] text-white xl:text-[48px]">
                      Set a password
                      <br />
                      <span className="text-white/45">
                        only you know.
                      </span>
                    </h1>

                    <p className="mt-6 max-w-[470px] text-sm leading-7 text-white/45">
                      Replace your temporary password with a secure one that
                      belongs only to you. We’ll then verify your identity with
                      a one-time code.
                    </p>
                  </div>

                  {/* Setup steps */}

                  <div className="mt-12 space-y-6">
                    <SetupStep
                      number={SETUP_STEPS[0].number}
                      title={SETUP_STEPS[0].label}
                      description={SETUP_STEPS[0].description}
                      active
                    />

                    <SetupStep
                      number={SETUP_STEPS[1].number}
                      title={SETUP_STEPS[1].label}
                      description={SETUP_STEPS[1].description}
                    />

                    <SetupStep
                      number={SETUP_STEPS[2].number}
                      title={SETUP_STEPS[2].label}
                      description={SETUP_STEPS[2].description}
                    />
                  </div>
                </div>

                {/* Bottom stats */}

                <div className="mt-auto pt-12">
                  <div className="grid grid-cols-3 gap-3">
                    <FeatureStat value="01/03" label="Current step" />

                    <FeatureStat value="Secure" label="Password" />

                    <FeatureStat value="OTP" label="Next step" />
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-6">
                    <p className="text-[11px] text-white/25">
                      © {new Date().getFullYear()} Damuchi Safaris
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-emerald-400/75">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
                      Secure setup
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* =================================================
                RIGHT PANEL
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

                {/* Page heading */}

                <div className="mb-8">
                  <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#ff947b]">
                    <LockKeyhole className="h-3.5 w-3.5" />
                    Step 1 of 3
                  </div>

                  <h2 className="font-display text-3xl font-medium tracking-[-0.025em] text-white">
                    Choose your password.
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-white/40">
                    This replaces your temporary password. Make it strong and
                    memorable.
                  </p>
                </div>

                {/* Form */}

                <Form {...form}>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      form.handleSubmit(onSubmit)(event);
                    }}
                    className="space-y-5"
                  >
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
                                hasError={
                                  !!form.formState.errors.newPassword
                                }
                                className={inputClass}
                              />

                              <PasswordToggle
                                visible={showPassword}
                                onClick={() =>
                                  setShowPassword((current) => !current)
                                }
                                label={
                                  showPassword
                                    ? "Hide new password"
                                    : "Show new password"
                                }
                              />
                            </div>
                          </FormControl>

                          <FormDescription className="mt-1.5 text-[11px] leading-5 text-white/25">
                            At least 10 characters, mixing case, numbers, and
                            symbols.
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
                                type={
                                  showConfirmPassword ? "text" : "password"
                                }
                                placeholder="••••••••••"
                                autoComplete="new-password"
                                hasError={
                                  !!form.formState.errors.confirmPassword
                                }
                                className={inputClass}
                              />

                              <PasswordToggle
                                visible={showConfirmPassword}
                                onClick={() =>
                                  setShowConfirmPassword((current) => !current)
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
                      Continue to verification
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
                        Your temporary setup session remains active while we
                        verify your identity.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Back to sign in */}

                <Link
                  href="/login"
                  className="group mt-8 flex items-center justify-center gap-1.5 text-sm font-medium text-white/35 transition-colors hover:text-[#ff927a]"
                >
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                  Back to sign in
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* =====================================================
          Animations
          ===================================================== */}

      <style jsx global>{`
@keyframes setupPasswordFloat {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
}

  50% {
    transform: translate3d(18px, -16px, 0) scale(1.04);
}
}

@keyframes setupPasswordFloatReverse {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
}

  50% {
    transform: translate3d(-20px, 14px, 0) scale(1.05);
}
}

@keyframes setupPasswordFadeDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes setupPasswordHero {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes setupPasswordCard {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.99);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.setupPasswordFloat {
  animation: setupPasswordFloat 12s ease-in-out infinite;
}

.setupPasswordFloatReverse {
  animation: setupPasswordFloatReverse 14s ease-in-out infinite;
}

.setupPasswordFadeDown {
  animation: setupPasswordFadeDown 0.65s ease-out both;
}

.setupPasswordHero {
  animation: setupPasswordHero 0.8s 0.08s ease-out both;
}

.setupPasswordCard {
  animation: setupPasswordCard 0.7s ease-out both;
}

@media (prefers-reduced-motion: reduce) {
.setupPasswordFloat,
.setupPasswordFloatReverse,
.setupPasswordFadeDown,
.setupPasswordHero,
.setupPasswordCard {
    animation: none !important;
  }
}
`}</style>
    </main>
  );
}

/* =========================================================
   Setup step
   ========================================================= */

function SetupStep({
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
        <h3
          className={[
            "text-sm font-medium",
            active ? "text-white/80" : "text-white/50",
          ].join(" ")}
        >
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-white/30">
          {description}
        </p>
      </div>
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
