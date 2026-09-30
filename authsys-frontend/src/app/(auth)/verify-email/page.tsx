"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Ban,
  Check,
  Clock3,
  Mail,
  MailCheck,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { authApi } from "@/lib/auth-api";
import type { ApiError } from "@/types/auth";

type Status = "loading" | "success" | "error";

type ErrorInfo = {
  code: string;
  message: string;
  retryable: boolean;
};

type ErrorIconKind = "clock" | "alert" | "ban" | "x";

const RESEND_COOLDOWN_SECONDS = 60;
const REDIRECT_DELAY_SECONDS = 5;

/**
 * Best-effort decode of a JWT payload.
 *
 * IMPORTANT:
 * - This does NOT verify the JWT signature.
 * - The decoded email is only used as a convenience for the resend field.
 * - It must never be trusted for authentication or authorization decisions.
 */
function decodeJwtEmail(token: string | null): string | null {
  if (!token) return null;

  try {
    const parts = token.split(".");
    const payload = parts[1];

    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    // JWT base64url payloads may omit "=" padding.
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

    const decoded = JSON.parse(atob(padded));

    return typeof decoded.email === "string" ? decoded.email : null;
  } catch {
    return null;
  }
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");

  if (!user || !domain) return email;

  const visible = user.slice(0, 2);
  const hiddenCount = Math.max(user.length - 2, 3);

  return `${visible}${"•".repeat(hiddenCount)}@${domain}`;
}

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const emailFromUrl = searchParams.get("email");

  /*
   * Decode only once for the current token.
   * The value is never used for authentication decisions.
   */
  const emailFromToken = useRef(decodeJwtEmail(token)).current;
  const knownEmail = emailFromUrl || emailFromToken;

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);

  const [emailInput, setEmailInput] = useState(knownEmail || "");
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [redirectIn, setRedirectIn] = useState(REDIRECT_DELAY_SECONDS);

  /*
   * ------------------------------------------------------------
   * Verify email token
   * ------------------------------------------------------------
   */
  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setStatus("error");
      setErrorInfo({
        code: "MISSING_TOKEN",
        message: "This verification link is missing its token.",
        retryable: false,
      });

      return;
    }

    setStatus("loading");
    setErrorInfo(null);

    authApi
      .verifyEmail(token)
      .then((result) => {
        if (cancelled) return;

        setStatus("success");
        setMessage(
          result?.message || "Your email has been verified successfully."
        );
        setRedirectIn(REDIRECT_DELAY_SECONDS);
      })
      .catch((error: ApiError) => {
        if (cancelled) return;

        setStatus("error");

        setErrorInfo({
          code: "UNEXPECTED_ERROR",
          message:
            error?.message ||
            "Verification failed. Please try again.",
          retryable: true,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  /*
   * ------------------------------------------------------------
   * Automatic redirect after successful verification
   * ------------------------------------------------------------
   */
  useEffect(() => {
    if (status !== "success") return;

    if (redirectIn <= 0) {
      router.push("/login");
      return;
    }

    const timer = setTimeout(() => {
      setRedirectIn((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [status, redirectIn, router]);

  /*
   * ------------------------------------------------------------
   * Resend cooldown
   * ------------------------------------------------------------
   */
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => {
      setCooldown((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  /*
   * ------------------------------------------------------------
   * Resend verification email
   * ------------------------------------------------------------
   */
  const handleResend = useCallback(async () => {
    const targetEmail = emailInput.trim();

    if (!targetEmail) {
      toast.error("Enter your email address to resend the link.");
      return;
    }

    if (cooldown > 0 || resending) return;

    setResending(true);

    try {
      const result = await authApi.resendVerification(targetEmail);

      toast.success(
        result.message || "Verification email sent successfully."
      );

      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(
        apiError?.message ||
          "Failed to resend the verification email."
      );
    } finally {
      setResending(false);
    }
  }, [emailInput, cooldown, resending]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07090a] text-white">
      {/* ============================================================
          BACKGROUND
          ============================================================ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Grid */}
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
            animation: "verifyEmailFloat 12s ease-in-out infinite",
          }}
        />

        {/* Orange glow */}
        <div
          className="absolute -right-40 bottom-[-20%] h-[600px] w-[600px] rounded-full bg-orange-500/[0.07] blur-[140px]"
          style={{
            animation: "verifyEmailFloatReverse 16s ease-in-out infinite",
          }}
        />

        {/* Center glow */}
        <div
          className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#ff7657]/[0.035] blur-[100px]"
          style={{
            animation:
              "verifyEmailFloat 18s ease-in-out infinite reverse",
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
                "verifyEmailCard 0.7s cubic-bezier(0.22,1,0.36,1) both",
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
                        "verifyEmailFadeDown 0.7s 0.08s ease-out both",
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
                        "verifyEmailHero 0.8s 0.15s cubic-bezier(0.22,1,0.36,1) both",
                    }}
                  >
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ff7657]/15 bg-[#ff7657]/[0.06] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#ff927a]">
                      <MailCheck className="h-3 w-3" />
                      Email verification
                    </div>

                    <h1 className="max-w-md font-display text-4xl font-medium leading-[1.05] tracking-[-0.035em] text-white xl:text-[46px]">
                      One quick step to secure your account.
                    </h1>

                    <p className="mt-5 max-w-md text-sm leading-6 text-white/40">
                      Email verification helps protect your account and
                      confirms that you have access to the address used during
                      registration.
                    </p>
                  </div>

                  {/* Verification benefits */}
                  <div className="mt-12 space-y-3">
                    <InfoStep
                      number="01"
                      icon={<MailCheck className="h-3.5 w-3.5" />}
                      label="Verify your email"
                      description="Confirm the address you registered with"
                    />

                    <InfoStep
                      number="02"
                      icon={<ShieldCheck className="h-3.5 w-3.5" />}
                      label="Protect your account"
                      description="Keep account recovery secure"
                    />

                    <InfoStep
                      number="03"
                      icon={<Check className="h-3.5 w-3.5" />}
                      label="Continue to sign in"
                      description="Access your account after activation"
                    />
                  </div>

                  {/* Stats */}
                  <div className="mt-10 grid grid-cols-3 gap-3">
                    <FeatureStat value="24H" label="Link validity" />
                    <FeatureStat value="EMAIL" label="Verification" />
                    <FeatureStat value="SECURE" label="Account" />
                  </div>

                  <p className="mt-8 text-[10px] uppercase tracking-[0.16em] text-white/20">
                    Secure identity verification
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

                  {status === "loading" && <LoadingState />}

                  {status === "success" && (
                    <SuccessState
                      message={message}
                      redirectIn={redirectIn}
                    />
                  )}

                  {status === "error" && errorInfo && (
                    <ErrorState
                      errorInfo={errorInfo}
                      knownEmail={knownEmail}
                      emailInput={emailInput}
                      setEmailInput={setEmailInput}
                      resending={resending}
                      cooldown={cooldown}
                      onResend={handleResend}
                    />
                  )}
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
@keyframes verifyEmailFloat {
    0%,
    100% {
        transform: translate3d(0, 0, 0) scale(1);
}

    50% {
        transform: translate3d(0, -24px, 0) scale(1.04);
}
}

@keyframes verifyEmailFloatReverse {
    0%,
    100% {
        transform: translate3d(0, 0, 0) scale(1);
}

    50% {
        transform: translate3d(20px, 18px, 0) scale(1.05);
}
}

@keyframes verifyEmailFadeDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes verifyEmailHero {
    from {
        opacity: 0;
        transform: translateY(18px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes verifyEmailCard {
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
   LOADING STATE
   ================================================================ */

function LoadingState() {
  return (
    <div
      className="flex flex-col items-center text-center"
      style={{
        animation: "verifyEmailFadeDown 0.7s 0.12s ease-out both",
      }}
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-2xl border border-[#ff7657]/15 bg-[#ff7657]/[0.05]" />

        <div className="absolute inset-1.5 animate-spin rounded-2xl border-2 border-transparent border-t-[#ff7657]/80" />

        <MailCheck className="relative h-7 w-7 text-[#ff927a]" />
      </div>

      <div className="mt-7">
        <div className="mb-4 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff927a]">
          <span className="h-px w-6 bg-[#ff7657]/50" />
          Please wait
          <span className="h-px w-6 bg-[#ff7657]/50" />
        </div>

        <h2 className="font-display text-3xl font-medium tracking-[-0.025em]">
          Verifying your email
        </h2>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/35">
          We&apos;re checking your verification link. This should only take a
          moment.
        </p>
      </div>

      <div className="mt-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/20">
        <ShieldCheck className="h-3 w-3" />
        Secure verification
      </div>
    </div>
  );
}

/* ================================================================
   SUCCESS STATE
   ================================================================ */

function SuccessState({
  message,
  redirectIn,
}: {
  message: string;
  redirectIn: number;
}) {
  return (
    <div
      className="flex flex-col items-center text-center"
      style={{
        animation:
          "verifyEmailHero 0.8s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      {/* Success icon */}
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] shadow-[0_0_50px_rgba(52,211,153,0.08)]" />

        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/[0.08]">
          <Check className="h-7 w-7 text-emerald-300" />
        </div>
      </div>

      <div className="mt-7">
        <div className="mb-4 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
          <span className="h-px w-6 bg-emerald-400/30" />
          Verification complete
          <span className="h-px w-6 bg-emerald-400/30" />
        </div>

        <h2 className="font-display text-3xl font-medium tracking-[-0.025em]">
          Email verified
        </h2>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/40">
          {message}
        </p>
      </div>

      {/* Confirmation */}
      <div className="mt-8 w-full rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.035] p-5 text-left">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/[0.08]">
            <ShieldCheck className="h-4 w-4 text-emerald-300/80" />
          </div>

          <div>
            <p className="text-xs font-medium text-white/65">
              Your email is now confirmed
            </p>

            <p className="mt-1 text-[11px] leading-5 text-white/30">
              Your account can now continue through the sign-in and activation
              flow.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-7 w-full">
        <Link
          href="/login"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff7657] px-6 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(255,118,87,0.16)] transition-all duration-200 hover:bg-[#ff8063] hover:shadow-[0_14px_35px_rgba(255,118,87,0.22)]"
        >
          Continue to sign in
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <p className="mt-4 text-[11px] text-white/25">
        Redirecting automatically in{" "}
        <span className="font-medium text-white/45">
          {redirectIn}s
        </span>
        …
      </p>
    </div>
  );
}

/* ================================================================
   ERROR COPY
   ================================================================ */

interface ErrorCopy {
  title: string;
  icon: ErrorIconKind;
  hint?: string;
}

const ERROR_COPY: Record<string, ErrorCopy> = {
  TOKEN_EXPIRED: {
    title: "Link expired",
    icon: "clock",
    hint: "Verification links expire after 24 hours. Request a new verification email below.",
  },

  INVALID_TOKEN: {
    title: "Invalid verification link",
    icon: "ban",
    hint: "This link may be malformed or may have already been used. Request a new verification email to continue.",
  },

  MISSING_TOKEN: {
    title: "Incomplete verification link",
    icon: "alert",
    hint: "This link is missing the information required to verify your email. Open the original email again or request a new link.",
  },

  TOKEN_VALIDATION_TIMEOUT: {
    title: "Verification timed out",
    icon: "alert",
    hint: "The verification service took too long to respond. Please try again or request a new link.",
  },

  EMAIL_ALREADY_EXISTS: {
    title: "Email already verified",
    icon: "ban",
    hint: "This email address is already associated with an active account. Try signing in instead.",
  },
};

/* ================================================================
   ERROR STATE
   ================================================================ */

function ErrorState({
  errorInfo,
  knownEmail,
  emailInput,
  setEmailInput,
  resending,
  cooldown,
  onResend,
}: {
  errorInfo: ErrorInfo;
  knownEmail: string | null;
  emailInput: string;
  setEmailInput: (value: string) => void;
  resending: boolean;
  cooldown: number;
  onResend: () => void;
}) {
  const copy = ERROR_COPY[errorInfo.code] ?? {
    title: "Verification failed",
    icon: "x" as const,
    hint: errorInfo.retryable
      ? "Something went wrong while verifying your email. Please try again or request a new verification link."
      : "This verification link cannot be used. Request a new verification email if necessary.",
  };

  const canResend = errorInfo.code !== "EMAIL_ALREADY_EXISTS";

  return (
    <div
      className="flex flex-col items-center text-center"
      style={{
        animation:
          "verifyEmailHero 0.8s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      {/* Error icon */}
      <ErrorIcon kind={copy.icon} />

      <div className="mt-7">
        <div className="mb-4 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff927a]">
          <span className="h-px w-6 bg-[#ff7657]/50" />
          Verification issue
          <span className="h-px w-6 bg-[#ff7657]/50" />
        </div>

        <h2 className="font-display text-3xl font-medium tracking-[-0.025em]">
          {copy.title}
        </h2>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/45">
          {errorInfo.message}
        </p>

        {copy.hint && (
          <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/25">
            {copy.hint}
          </p>
        )}
      </div>

      {/* Resend */}
      {canResend && (
        <div className="mt-8 w-full rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-left">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ff7657]/15 bg-[#ff7657]/[0.06]">
              <Mail className="h-4 w-4 text-[#ff927a]" />
            </div>

            <div>
              <p className="text-xs font-medium text-white/65">
                Request a new link
              </p>

              <p className="mt-0.5 text-[10px] text-white/25">
                We&apos;ll send a fresh verification email.
              </p>
            </div>
          </div>

          <label
            htmlFor="resend-email"
            className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30"
          >
            {knownEmail ? "Verification email" : "Email address"}
          </label>

          <div className="relative mt-2">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-white/25" />

            <input
              id="resend-email"
              type="email"
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20 hover:border-white/[0.14] focus:border-[#ff7657]/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-[#ff7657]/10"
            />
          </div>

          {knownEmail && (
            <p className="mt-2 text-[10px] text-white/20">
              Detected: {maskEmail(knownEmail)}
            </p>
          )}

          <button
            type="button"
            onClick={onResend}
            disabled={
              resending ||
              cooldown > 0 ||
              !emailInput.trim()
            }
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff7657] px-6 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(255,118,87,0.12)] transition-all duration-200 hover:bg-[#ff8063] hover:shadow-[0_14px_35px_rgba(255,118,87,0.18)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {resending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Sending new link…
              </>
            ) : cooldown > 0 ? (
              <>
                <Clock3 className="h-4 w-4" />
                Resend available in {cooldown}s
              </>
            ) : (
              <>
                <MailCheck className="h-4 w-4" />
                Resend verification email
              </>
            )}
          </button>
        </div>
      )}

      {/* Back to sign in */}
      <div className="mt-7 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-medium text-white/30 transition-colors hover:text-white/60"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/15">
        <ShieldCheck className="h-3 w-3" />
        Secure email verification
      </div>
    </div>
  );
}

/* ================================================================
   ERROR ICON
   ================================================================ */

function ErrorIcon({ kind }: { kind: ErrorIconKind }) {
  const config = {
    clock: {
      icon: Clock3,
      className: "text-amber-300",
      wrapper:
        "border-amber-400/15 bg-amber-400/[0.06]",
    },

    alert: {
      icon: AlertTriangle,
      className: "text-[#ff927a]",
      wrapper:
        "border-[#ff7657]/15 bg-[#ff7657]/[0.06]",
    },

    ban: {
      icon: Ban,
      className: "text-[#ff927a]",
      wrapper:
        "border-[#ff7657]/15 bg-[#ff7657]/[0.06]",
    },

    x: {
      icon: X,
      className: "text-[#ff927a]",
      wrapper:
        "border-[#ff7657]/15 bg-[#ff7657]/[0.06]",
    },
  }[kind];

  const Icon = config.icon;

  return (
    <div
      className={`relative flex h-20 w-20 items-center justify-center rounded-2xl border shadow-[0_0_45px_rgba(255,118,87,0.05)] ${config.wrapper}`}
    >
      <Icon className={`relative h-7 w-7 ${config.className}`} />
    </div>
  );
}

/* ================================================================
   INFO STEP
   ================================================================ */

function InfoStep({
  number,
  icon,
  label,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-transparent bg-white/[0.015] p-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-white/35">
        {icon}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-semibold tracking-[0.12em] text-white/15">
            {number}
          </span>

          <p className="text-xs font-medium text-white/60">
            {label}
          </p>
        </div>

        <p className="mt-0.5 text-[10px] text-white/20">
          {description}
        </p>
      </div>
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


