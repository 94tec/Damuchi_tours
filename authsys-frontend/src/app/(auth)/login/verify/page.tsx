"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Check,
  Clock3,
  KeyRound,
  MailCheck,
  MapPin,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { OtpField } from "@/components/ui/otp-field";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/auth-api";
import { useAuthStore } from "@/store/auth-store";
import type { ApiError } from "@/types/auth";

const RESEND_COOLDOWN_SECONDS = 45;

const LOGIN_STEPS = [
  {
    number: "01",
    label: "Credentials verified",
    description: "Your sign-in details were accepted",
    icon: <Check className="h-3.5 w-3.5" />,
  },
  {
    number: "02",
    label: "Verify your identity",
    description: "Confirm the one-time code sent to you",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
  },
  {
    number: "03",
    label: "Enter the dashboard",
    description: "Continue to your secure workspace",
    icon: <KeyRound className="h-3.5 w-3.5" />,
  },
];

export default function LoginVerifyPage() {
  const router = useRouter();

  const tempToken = useAuthStore((state) => state.tempToken);
  const setTokens = useAuthStore((state) => state.setTokens);

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (tempToken) return;

    toast.error("Your session expired. Please sign in again.");
    router.replace("/login");
  }, [tempToken, router]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleVerify(code: string) {
    if (!tempToken || code.length !== 6 || isSubmitting) return;

    setIsSubmitting(true);
    setHasError(false);

    try {
      const tokenPair = await authApi.verifyLoginOtp(tempToken, {
        otp: code,
      });

      setTokens(tokenPair);

      toast.success("Welcome back");
      router.push("/dashboard");
    } catch (err) {
      const apiError = err as ApiError;

      setHasError(true);
      setOtp("");

      toast.error(apiError.message || "Incorrect verification code.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!tempToken || cooldown > 0 || isResending) return;

    setIsResending(true);

    try {
      const result = await authApi.resendLoginOtp(tempToken);

      if (result.rateLimited) {
        toast.warning(result.message || "Too many requests. Try again later.");
        return;
      }

      toast.success("New verification code sent");

      setCooldown(RESEND_COOLDOWN_SECONDS);
      setOtp("");
      setHasError(false);
    } catch (err) {
      const apiError = err as ApiError;

      toast.error(
        apiError.message || "Couldn't resend the verification code."
      );
    } finally {
      setIsResending(false);
    }
  }

  function handleOtpChange(value: string) {
    setOtp(value);
    setHasError(false);

    if (value.length === 6 && !isSubmitting) {
      void handleVerify(value);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07090a] text-white">
      {/* ================================================================
          BACKGROUND
          ================================================================ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Subtle grid */}
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

        {/* Coral glow */}
        <div
          className="absolute -left-32 top-[-18%] h-[520px] w-[520px] rounded-full bg-[#ff7657]/[0.10] blur-[120px]"
          style={{
            animation: "loginVerifyFloat 12s ease-in-out infinite",
          }}
        />

        {/* Orange glow */}
        <div
          className="absolute -right-40 bottom-[-20%] h-[600px] w-[600px] rounded-full bg-orange-500/[0.07] blur-[140px]"
          style={{
            animation: "loginVerifyFloatReverse 16s ease-in-out infinite",
          }}
        />

        {/* Center glow */}
        <div
          className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#ff7657]/[0.035] blur-[100px]"
          style={{
            animation: "loginVerifyFloat 18s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* ================================================================
          SHELL
          ================================================================ */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1180px]">
          <div
            className="overflow-hidden rounded-[30px] border border-white/[0.08] bg-white/[0.025] shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
            style={{
              animation:
                "loginVerifyCard 0.7s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              {/* ==========================================================
                  LEFT PANEL
                  ========================================================== */}
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
                        "loginVerifyFadeDown 0.7s 0.08s ease-out both",
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
                        "loginVerifyHero 0.8s 0.15s cubic-bezier(0.22,1,0.36,1) both",
                    }}
                  >
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ff7657]/15 bg-[#ff7657]/[0.06] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#ff927a]">
                      <ShieldCheck className="h-3 w-3" />
                      Secure sign-in
                    </div>

                    <h1 className="max-w-md font-display text-4xl font-medium leading-[1.05] tracking-[-0.035em] text-white xl:text-[46px]">
                      One final check before you head out.
                    </h1>

                    <p className="mt-5 max-w-md text-sm leading-6 text-white/40">
                      Your credentials are verified. Enter the one-time code
                      to confirm your identity and securely continue to your
                      workspace.
                    </p>
                  </div>

                  {/* Steps */}
                  <div className="mt-12 space-y-3">
                    {LOGIN_STEPS.map((step) => (
                      <LoginStep
                        key={step.number}
                        number={step.number}
                        icon={step.icon}
                        label={step.label}
                        description={step.description}
                      />
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="mt-10 grid grid-cols-3 gap-3">
                    <FeatureStat value="OTP" label="Verification" />
                    <FeatureStat value="45S" label="Resend wait" />
                    <FeatureStat value="2FA" label="Protection" />
                  </div>

                  <p className="mt-8 text-[10px] uppercase tracking-[0.16em] text-white/20">
                    Secure identity verification
                  </p>
                </div>
              </aside>

              {/* ==========================================================
                  RIGHT PANEL
                  ========================================================== */}
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

                  {/* Main content */}
                  <div
                    style={{
                      animation:
                        "loginVerifyHero 0.8s 0.18s cubic-bezier(0.22,1,0.36,1) both",
                    }}
                  >
                    {/* Eyebrow */}
                    <div className="mb-5 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff927a]">
                      <span className="h-px w-6 bg-[#ff7657]/50" />
                      Verify it&apos;s you
                      <span className="h-px w-6 bg-[#ff7657]/50" />
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center">
                      <div className="relative flex h-20 w-20 items-center justify-center">
                        <div className="absolute inset-0 rounded-2xl border border-[#ff7657]/15 bg-[#ff7657]/[0.05] shadow-[0_0_50px_rgba(255,118,87,0.06)]" />

                        <div className="absolute inset-2 rounded-xl border border-[#ff7657]/10" />

                        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[#ff7657]/20 bg-[#ff7657]/[0.08]">
                          <ShieldCheck className="h-5.5 w-5.5 text-[#ff927a]" />
                        </div>
                      </div>
                    </div>

                    {/* Heading */}
                    <div className="mt-7 text-center">
                      <h2 className="font-display text-3xl font-medium tracking-[-0.025em] text-white sm:text-[34px]">
                        Enter your verification code
                      </h2>

                      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/35">
                        Check your phone for the 6-digit code we sent after
                        signing you in.
                      </p>
                    </div>

                    {/* OTP */}
                    <div className="mt-9">
                      <OtpField
                        value={otp}
                        onChange={handleOtpChange}
                        disabled={isSubmitting}
                        hasError={hasError}
                      />
                    </div>

                    {/* Security hint */}
                    <div className="mt-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/20">
                      <ShieldCheck className="h-3 w-3" />
                      One-time security code
                    </div>

                    {/* Verify button */}
                    <Button
                      type="button"
                      variant="accent"
                      size="lg"
                      className="mt-6 h-12 w-full rounded-xl shadow-[0_10px_30px_rgba(255,118,87,0.14)] transition-all duration-200 hover:shadow-[0_14px_35px_rgba(255,118,87,0.22)]"
                      loading={isSubmitting}
                      disabled={otp.length !== 6 || isSubmitting}
                      onClick={() => void handleVerify(otp)}
                    >
                      {!isSubmitting && (
                        <ShieldCheck className="h-4 w-4" />
                      )}
                      Verify and sign in
                    </Button>

                    {/* Resend */}
                    <button
                      type="button"
                      onClick={() => void handleResend()}
                      disabled={isResending || cooldown > 0}
                      className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-[#ff927a] transition-all duration-200 hover:bg-white/[0.025] hover:text-[#ffab96] disabled:cursor-not-allowed disabled:text-white/20"
                    >
                      {isResending ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Sending new code…
                        </>
                      ) : cooldown > 0 ? (
                        <>
                          <Clock3 className="h-4 w-4" />
                          Resend code in {cooldown}s
                        </>
                      ) : (
                        <>
                          <MailCheck className="h-4 w-4" />
                          Resend verification code
                        </>
                      )}
                    </button>

                    {/* Divider */}
                    <div className="my-7 flex items-center gap-4">
                      <div className="h-px flex-1 bg-white/[0.06]" />
                      <span className="text-[9px] uppercase tracking-[0.16em] text-white/15">
                        Secure access
                      </span>
                      <div className="h-px flex-1 bg-white/[0.06]" />
                    </div>

                    {/* Back */}
                    <div className="text-center">
                      <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-xs font-medium text-white/30 transition-colors hover:text-white/60"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to sign in
                      </Link>
                    </div>

                    {/* Footer note */}
                    <div className="mt-8 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/15">
                      <KeyRound className="h-3 w-3" />
                      Protected account access
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================
          ANIMATIONS
          ================================================================ */}
      <style jsx global>{`
@keyframes loginVerifyFloat {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
}

  50% {
    transform: translate3d(0, -24px, 0) scale(1.04);
}
}

@keyframes loginVerifyFloatReverse {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
}

  50% {
    transform: translate3d(20px, 18px, 0) scale(1.05);
}
}

@keyframes loginVerifyFadeDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes loginVerifyHero {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes loginVerifyCard {
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

/* ==========================================================================
   LEFT PANEL COMPONENTS
   ========================================================================== */

function LoginStep({
  number,
  icon,
  label,
  description,
}: {
  number: string;
  icon: ReactNode;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-transparent bg-white/[0.015] p-3.5 transition-colors duration-200 hover:border-white/[0.05] hover:bg-white/[0.025]">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-white/35">
        {icon}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-semibold tracking-[0.12em] text-white/15">
            {number}
          </span>

          <p className="text-xs font-medium text-white/60">{label}</p>
        </div>

        <p className="mt-0.5 text-[10px] text-white/20">
          {description}
        </p>
      </div>
    </div>
  );
}

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
