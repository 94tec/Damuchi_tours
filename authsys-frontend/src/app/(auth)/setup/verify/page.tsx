"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { OtpField } from "@/components/ui/otp-field";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/auth-api";
import { useAuthStore } from "@/store/auth-store";
import type { ApiError } from "@/types/auth";

const SETUP_STEPS = [
  { label: "New password", description: "Set a secure password" },
  { label: "Verify", description: "Confirm with OTP" },
  { label: "Activate", description: "Account goes live" },
];

const RESEND_COOLDOWN = 45;

export default function SetupVerifyPage() {
  const router = useRouter();
  const tempToken = useAuthStore((s) => s.tempToken);

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(
    null
  );
  const [cooldown, setCooldown] = useState(0);

  const [hasHydrated, setHasHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated()
  );

  /*
   * ------------------------------------------------------------
   * Zustand hydration
   * ------------------------------------------------------------
   */
  useEffect(() => {
    if (hasHydrated) return;

    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    return unsubscribe;
  }, [hasHydrated]);

  /*
   * ------------------------------------------------------------
   * Validate temporary setup session
   * ------------------------------------------------------------
   */
  useEffect(() => {
    if (!hasHydrated) return;

    if (!tempToken) {
      toast.error("Session expired. Please sign in again.");
      router.replace("/login");
    }
  }, [hasHydrated, tempToken, router]);

  /*
   * ------------------------------------------------------------
   * Resend countdown
   * ------------------------------------------------------------
   */
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((current) => current - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  /*
   * ------------------------------------------------------------
   * Verify OTP
   * ------------------------------------------------------------
   */
  async function handleVerify(code: string) {
    if (!tempToken || code.length !== 6 || isSubmitting) return;

    setIsSubmitting(true);
    setHasError(false);

    try {
      const result = await authApi.verifyOtpFirstTime(tempToken, {
        otp: code,
      });

      if (!result.valid) {
        setHasError(true);
        setOtp("");

        if (result.expired) {
          toast.error("That code expired. Request a new one.");
        } else if (result.attemptsExceeded) {
          toast.error("Too many attempts. Request a new code.");
        } else {
          setRemainingAttempts(result.remainingAttempts);
          toast.error(result.message || "Incorrect code.");
        }

        return;
      }

      /*
       * The verification token is intentionally stored in sessionStorage.
       *
       * The next step (/setup/complete) consumes it to activate the
       * account. Client-side navigation is important here because the
       * setup flow is still gated by the temporary Zustand token.
       */
      if (result.verificationToken) {
        sessionStorage.setItem(
          "ftl_verification_token",
          result.verificationToken
        );
      }

      toast.success("Verified — activating your account");

      router.push("/setup/complete");
    } catch (err) {
      setHasError(true);
      setOtp("");

      toast.error(
        (err as ApiError).message || "Verification failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /*
   * ------------------------------------------------------------
   * Resend OTP
   * ------------------------------------------------------------
   */
  async function handleResend() {
    if (!tempToken || cooldown > 0 || isResending) return;

    setIsResending(true);

    try {
      const result = await authApi.resendSetupOtp(tempToken);

      if (result.rateLimited) {
        toast.warning(result.message || "Too many requests. Try again later.");
        return;
      }

      toast.success("New code sent");

      setCooldown(RESEND_COOLDOWN);
      setOtp("");
      setHasError(false);
      setRemainingAttempts(null);
    } catch (err) {
      toast.error(
        (err as ApiError).message || "Couldn't resend code. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  }

  if (!hasHydrated) {
    return null;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07090a] text-white">
      {/* ============================================================
          BACKGROUND
          ============================================================ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)
`,
            backgroundSize: "60px 60px",
          }}
        />

        <div
          className="absolute -left-32 top-[-18%] h-[520px] w-[520px] rounded-full bg-[#ff7657]/[0.10] blur-[120px]"
          style={{
            animation: "setupVerifyFloat 12s ease-in-out infinite",
          }}
        />

        <div
          className="absolute -right-40 bottom-[-20%] h-[600px] w-[600px] rounded-full bg-orange-500/[0.07] blur-[140px]"
          style={{
            animation: "setupVerifyFloatReverse 16s ease-in-out infinite",
          }}
        />

        <div
          className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#ff7657]/[0.035] blur-[100px]"
          style={{
            animation: "setupVerifyFloat 18s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* ============================================================
          PAGE SHELL
          ============================================================ */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1180px]">
          <div
            className="overflow-hidden rounded-[30px] border border-white/[0.08] bg-white/[0.025] shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
            style={{
              animation:
                "setupVerifyCard 0.7s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              {/* ======================================================
                  LEFT PANEL
                  ====================================================== */}
              <aside className="relative hidden min-h-[760px] overflow-hidden border-r border-white/[0.07] lg:block">
                {/* Decorative rings */}
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#ff7657]/10" />
                <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-[#ff7657]/[0.08]" />

                <div className="relative flex h-full flex-col p-10 xl:p-12">
                  {/* Brand */}
                  <div
                    className="flex items-center gap-3"
                    style={{
                      animation:
                        "setupVerifyFadeDown 0.7s 0.08s ease-out both",
                    }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ff7657]/20 bg-[#ff7657]/10">
                      <MapPin className="h-4.5 w-4.5 text-[#ff927a]" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold tracking-wide text-white">
                        Damuchi Safaris
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                        Operations Platform
                      </p>
                    </div>
                  </div>

                  {/* Hero */}
                  <div
                    className="mt-auto"
                    style={{
                      animation:
                        "setupVerifyHero 0.8s 0.15s cubic-bezier(0.22,1,0.36,1) both",
                    }}
                  >
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ff7657]/15 bg-[#ff7657]/[0.06] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#ff927a]">
                      <Sparkles className="h-3 w-3" />
                      First-time setup
                    </div>

                    <h1 className="max-w-md font-display text-4xl font-medium leading-[1.05] tracking-[-0.035em] text-white xl:text-[46px]">
                      One code stands between you and the trail.
                    </h1>

                    <p className="mt-5 max-w-md text-sm leading-6 text-white/40">
                      We sent a 6-digit verification code to the phone number
                      on file. Confirm your identity and continue activating
                      your account.
                    </p>
                  </div>

                  {/* Setup steps */}
                  <div className="mt-12 space-y-3">
                    {SETUP_STEPS.map((step, index) => (
                      <SetupStep
                        key={step.label}
                        number={`0${index + 1}`}
                        label={step.label}
                        description={step.description}
                        state={
                          index < 1
                            ? "complete"
                            : index === 1
                              ? "active"
                              : "upcoming"
                        }
                      />
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="mt-10 grid grid-cols-3 gap-3">
                    <FeatureStat value="02/03" label="Setup" />
                    <FeatureStat value="6-DIGIT" label="Verification" />
                    <FeatureStat value="45s" label="Resend wait" />
                  </div>

                  <p className="mt-8 text-[10px] uppercase tracking-[0.16em] text-white/20">
                    Secure account activation
                  </p>
                </div>
              </aside>

              {/* ======================================================
                  RIGHT PANEL
                  ====================================================== */}
              <section className="relative flex min-h-[760px] items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
                <div className="w-full max-w-[440px]">
                  {/* Mobile brand */}
                  <div className="mb-10 flex items-center gap-3 lg:hidden">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ff7657]/20 bg-[#ff7657]/10">
                      <MapPin className="h-4.5 w-4.5 text-[#ff927a]" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold tracking-wide">
                        Damuchi Safaris
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                        Operations Platform
                      </p>
                    </div>
                  </div>

                  {/* Header */}
                  <div
                    style={{
                      animation:
                        "setupVerifyFadeDown 0.7s 0.12s ease-out both",
                    }}
                  >
                    <div className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff927a]">
                      <span className="h-px w-6 bg-[#ff7657]/50" />
                      Step 2 of 3
                    </div>

                    <div className="mb-8 flex items-center justify-center">
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff7657]/20 bg-[#ff7657]/[0.08] shadow-[0_0_45px_rgba(255,118,87,0.08)]">
                        <div className="absolute inset-0 rounded-2xl bg-[#ff7657]/[0.04] blur-xl" />
                        <ShieldCheck className="relative h-7 w-7 text-[#ff927a]" />
                      </div>
                    </div>

                    <div className="text-center">
                      <h2 className="font-display text-3xl font-medium tracking-[-0.025em] text-white">
                        Enter verification code
                      </h2>

                      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/35">
                        Check your phone for the 6-digit code we just sent.
                      </p>
                    </div>
                  </div>

                  {/* OTP */}
                  <div
                    className="mt-9"
                    style={{
                      animation:
                        "setupVerifyFadeDown 0.7s 0.22s ease-out both",
                    }}
                  >
                    <OtpField
                      value={otp}
                      onChange={(value) => {
                        setOtp(value);
                        setHasError(false);

                        if (value.length === 6) {
                          handleVerify(value);
                        }
                      }}
                      disabled={isSubmitting}
                      hasError={hasError}
                    />

                    {remainingAttempts !== null &&
                      remainingAttempts > 0 && (
                        <p className="mt-4 text-center text-xs text-[#ff927a]">
                          {remainingAttempts} attempt
                          {remainingAttempts === 1 ? "" : "s"} remaining
                        </p>
                      )}

                    <Button
                      type="button"
                      variant="accent"
                      size="lg"
                      className="mt-6 h-12 w-full rounded-xl"
                      loading={isSubmitting}
                      disabled={otp.length !== 6 || isSubmitting}
                      onClick={() => handleVerify(otp)}
                    >
                      {!isSubmitting && (
                        <ArrowRight className="h-4 w-4" />
                      )}
                      Verify code
                    </Button>

                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isResending || cooldown > 0}
                      className="mt-5 w-full text-center text-sm font-medium text-[#ff927a] transition-colors hover:text-[#ffad98] hover:underline disabled:cursor-not-allowed disabled:text-white/25 disabled:no-underline"
                    >
                      {isResending
                        ? "Sending new code..."
                        : cooldown > 0
                          ? `Resend code in ${cooldown}s`
                          : "Didn't receive the code? Resend"}
                    </button>
                  </div>

                  {/* Security notice */}
                  <div
                    className="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
                    style={{
                      animation:
                        "setupVerifyFadeDown 0.7s 0.3s ease-out both",
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
                        <ShieldCheck className="h-4 w-4 text-white/45" />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-white/65">
                          Keep your verification code private
                        </p>
                        <p className="mt-1 text-[11px] leading-5 text-white/30">
                          Damuchi Safaris will never ask you to share your
                          one-time verification code.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Back */}
                  <div
                    className="mt-8 text-center"
                    style={{
                      animation:
                        "setupVerifyFadeDown 0.7s 0.38s ease-out both",
                    }}
                  >
                    <Link
                      href="/setup/password"
                      className="inline-flex items-center gap-2 text-xs font-medium text-white/30 transition-colors hover:text-white/60"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back to password setup
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          ANIMATIONS
          ============================================================ */}
      <style jsx global>{`
@keyframes setupVerifyFloat {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
}

  50% {
    transform: translate3d(0, -24px, 0) scale(1.04);
}
}

@keyframes setupVerifyFloatReverse {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
}

  50% {
    transform: translate3d(20px, 18px, 0) scale(1.05);
}
}

@keyframes setupVerifyFadeDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes setupVerifyHero {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes setupVerifyCard {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.985);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
*,
*::before,
*::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`}</style>
    </main>
  );
}

/* ================================================================
   SETUP STEP
   ================================================================ */

function SetupStep({
  number,
  label,
  description,
  state,
}: {
  number: string;
  label: string;
  description: string;
  state: "complete" | "active" | "upcoming";
}) {
  const isComplete = state === "complete";
  const isActive = state === "active";

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border p-3.5 transition-all ${
  isActive
      ? "border-[#ff7657]/20 bg-[#ff7657]/[0.055]"
      : "border-transparent bg-white/[0.015]"
}`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-[10px] font-semibold tracking-wider ${
  isComplete
      ? "border-[#ff7657]/20 bg-[#ff7657]/10 text-[#ff927a]"
      : isActive
          ? "border-[#ff7657]/30 bg-[#ff7657]/10 text-[#ff927a]"
          : "border-white/[0.07] bg-white/[0.025] text-white/20"
}`}
      >
        {isComplete ? <Check className="h-3.5 w-3.5" /> : number}
      </div>

      <div className="min-w-0">
        <p
          className={`text-xs font-medium ${
  isActive
      ? "text-white"
      : isComplete
          ? "text-white/60"
          : "text-white/25"
}`}
        >
          {label}
        </p>

        <p
          className={`mt-0.5 text-[10px] ${
  isActive ? "text-white/35" : "text-white/20"
}`}
        >
          {description}
        </p>
      </div>

      {isActive && (
        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#ff7657] shadow-[0_0_12px_rgba(255,118,87,0.65)]" />
      )}
    </div>
  );
}

/* ================================================================
   FEATURE STAT
   ================================================================ */

function FeatureStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.018] px-3 py-3">
      <p className="text-xs font-semibold tracking-wide text-white/60">
        {value}
      </p>

      <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/20">
        {label}
      </p>
    </div>
  );
}

