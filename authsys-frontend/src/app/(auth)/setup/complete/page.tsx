"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
];

const REDIRECT_SECONDS = 5;

/* =========================================================
   Page
   ========================================================= */

type SetupStatus = "loading" | "success" | "error";

export default function SetupCompletePage() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);

  const [status, setStatus] = useState<SetupStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  const [hasHydrated, setHasHydrated] = useState(
    useAuthStore.persist.hasHydrated()
  );

  /* =======================================================
     Zustand hydration
     ======================================================= */

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    setHasHydrated(useAuthStore.persist.hasHydrated());

    return unsubscribe;
  }, []);

  /* =======================================================
     Complete account setup
     ======================================================= */

  useEffect(() => {
    if (!hasHydrated) return;

    const verificationToken = sessionStorage.getItem(
      "ftl_verification_token"
    );

    if (!verificationToken) {
      setStatus("error");
      setErrorMessage(
        "Your verification session is missing. Please restart the setup process."
      );
      return;
    }

    let isMounted = true;

    authApi
      .completeSetup(verificationToken)
      .then(() => {
        if (!isMounted) return;

        /*
         * Do NOT automatically authenticate the user using any
         * tokens returned from setup completion.
         *
         * Clear:
         * - local auth state
         * - persisted tokens
         * - auth session cookie state
         * - verification token
         *
         * The user must authenticate fresh from /login.
         */
        clearSession();

        sessionStorage.removeItem("ftl_verification_token");

        setStatus("success");
        setCountdown(REDIRECT_SECONDS);

        toast.success("Account activated");
      })
      .catch((err) => {
        if (!isMounted) return;

        const apiError = err as ApiError;

        setStatus("error");
        setErrorMessage(
          apiError.message ||
            "We couldn't complete your account setup. Please try again."
        );
      });

    return () => {
      isMounted = false;
    };
  }, [clearSession, hasHydrated]);

  /* =======================================================
     Success countdown
     ======================================================= */

  useEffect(() => {
    if (status !== "success") return;

    if (countdown <= 0) {
      router.push("/login");
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [status, countdown, router]);

  /* =======================================================
     Render
     ======================================================= */

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

        <div className="setupFloat absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#ff6b4a]/10 blur-[110px]" />

        <div className="setupFloatReverse absolute -right-24 bottom-12 h-80 w-80 rounded-full bg-[#ff9b5a]/10 blur-[120px]" />

        <div className="setupFloat absolute left-[42%] top-[12%] h-32 w-32 rounded-full bg-[#ff7657]/[0.06] blur-[70px]" />
      </div>

      {/* =====================================================
          Main shell
          ===================================================== */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1180px]">
          <div className="setupCard overflow-hidden rounded-[30px] border border-white/[0.08] bg-white/[0.025] shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:grid lg:grid-cols-[0.9fr_1.1fr]">
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

                <div className="setupFadeDown flex items-center gap-3">
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
                  <div className="setupHero">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ff7657]/15 bg-[#ff7657]/[0.06] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#ff9a83]">
                      <Sparkles className="h-3.5 w-3.5" />
                      Final step
                    </div>

                    <h1 className="max-w-[500px] font-display text-4xl font-medium leading-[1.05] tracking-[-0.035em] text-white xl:text-[48px]">
                      Your account is ready.
                      <br />
                      <span className="text-white/45">
                        Welcome to Damuchi.
                      </span>
                    </h1>

                    <p className="mt-6 max-w-[470px] text-sm leading-7 text-white/45">
                      We’re finishing your account activation now. Once
                      complete, you’ll be ready to sign in and start using the
                      Damuchi Safaris platform.
                    </p>
                  </div>

                  {/* Setup progress */}

                  <div className="mt-12 space-y-6">
                    {SETUP_STEPS.map((step, index) => (
                      <SetupStep
                        key={step.number}
                        number={step.number}
                        title={step.label}
                        description={step.description}
                        active={index === 2}
                        complete={index < 2}
                      />
                    ))}
                  </div>
                </div>

                {/* Bottom stats */}

                <div className="mt-auto pt-12">
                  <div className="grid grid-cols-3 gap-3">
                    <FeatureStat value="Secure" label="Setup" />

                    <FeatureStat value="3/3" label="Complete" />

                    <FeatureStat value="Ready" label="Account" />
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

                {status === "loading" && <LoadingState />}

                {status === "success" && (
                  <SuccessState
                    countdown={countdown}
                    onLogin={() => router.push("/login")}
                  />
                )}

                {status === "error" && (
                  <ErrorState
                    message={errorMessage}
                    onLogin={() => router.push("/login")}
                  />
                )}

                {/* Security footer */}

                <div className="mt-8 flex items-center justify-center gap-2 text-center text-[11px] leading-5 text-white/25">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400/60" />
                  Your account is protected by secure authentication.
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
@keyframes setupFloat {
    0%,
    100% {
        transform: translate3d(0, 0, 0) scale(1);
}

    50% {
        transform: translate3d(18px, -16px, 0) scale(1.04);
}
}

@keyframes setupFloatReverse {
    0%,
    100% {
        transform: translate3d(0, 0, 0) scale(1);
}

    50% {
        transform: translate3d(-20px, 14px, 0) scale(1.05);
}
}

@keyframes setupFadeDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes setupHero {
    from {
        opacity: 0;
        transform: translateY(18px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes setupCard {
    from {
        opacity: 0;
        transform: translateY(14px) scale(0.99);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes setupSuccess {
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

@keyframes setupPing {
    0% {
        opacity: 0.55;
        transform: scale(0.85);
    }

    100% {
        opacity: 0;
        transform: scale(1.55);
    }
}

.setupFloat {
    animation: setupFloat 12s ease-in-out infinite;
}

.setupFloatReverse {
    animation: setupFloatReverse 14s ease-in-out infinite;
}

.setupFadeDown {
    animation: setupFadeDown 0.65s ease-out both;
}

.setupHero {
    animation: setupHero 0.8s 0.08s ease-out both;
}

.setupCard {
    animation: setupCard 0.7s ease-out both;
}

.setupSuccess {
    animation: setupSuccess 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.setupPing {
    animation: setupPing 1.5s ease-out infinite;
}

@media (prefers-reduced-motion: reduce) {
.setupFloat,
.setupFloatReverse,
.setupFadeDown,
.setupHero,
.setupCard,
.setupSuccess,
.setupPing {
        animation: none !important;
    }
}
`}</style>
    </main>
  );
}

/* =========================================================
   Loading state
   ========================================================= */

function LoadingState() {
  return (
    <div className="text-center">
      <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-2xl border border-[#ff7657]/10 bg-[#ff7657]/[0.04]" />

        <Loader2 className="relative h-7 w-7 animate-spin text-[#ff876c]" />
      </div>

      <div className="mt-7">
        <div className="mb-3 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#ff947b]">
          <Sparkles className="h-3.5 w-3.5" />
          Finalizing setup
        </div>

        <h2 className="font-display text-3xl font-medium tracking-[-0.025em] text-white">
          Activating your account.
        </h2>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/40">
          We’re securely completing your account setup. This should only take
          a moment.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-sm rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3.5">
        <div className="flex items-center gap-3 text-left">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ff7657]/[0.08] text-[#ff927a]">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>

          <div>
            <p className="text-xs font-medium text-white/55">
              Please keep this window open
            </p>

            <p className="mt-0.5 text-[11px] text-white/25">
              Your verification is being finalized.
            </p>
          </div>
        </div>
      </div>
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
    <div className="setupSuccess text-center">
      <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
        <div className="setupPing absolute inset-0 rounded-2xl border border-emerald-400/20" />

        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.07] text-emerald-400">
          <CheckCircle2 className="h-7 w-7" />
        </div>
      </div>

      <div className="mt-7">
        <div className="mb-3 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300/70">
          <Check className="h-3.5 w-3.5" />
          Setup complete
        </div>

        <h2 className="font-display text-3xl font-medium tracking-[-0.025em] text-white">
          Account activated.
        </h2>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/40">
          You’re all set. Your account is active and ready to use.
        </p>
      </div>

      <Button
        variant="accent"
        size="lg"
        className="mt-8 h-12 w-full rounded-xl bg-[#ff7657] text-white shadow-[0_12px_30px_rgba(255,118,87,0.18)] hover:bg-[#ff8469]"
        onClick={onLogin}
      >
        Go to sign in
        <ArrowRight className="ml-auto h-4 w-4 opacity-50" />
      </Button>

      <p className="mt-4 text-[11px] text-white/25">
        Redirecting automatically in {countdown}s…
      </p>
    </div>
  );
}

/* =========================================================
   Error state
   ========================================================= */

function ErrorState({
  message,
  onLogin,
}: {
  message: string;
  onLogin: () => void;
}) {
  return (
    <div className="setupSuccess text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/10 bg-red-400/[0.06] text-red-400/80">
        <TriangleAlert className="h-7 w-7" />
      </div>

      <div className="mt-7">
        <div className="mb-3 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-red-300/70">
          <TriangleAlert className="h-3.5 w-3.5" />
          Setup interrupted
        </div>

        <h2 className="font-display text-3xl font-medium tracking-[-0.025em] text-white">
          Setup couldn’t finish.
        </h2>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/40">
          {message}
        </p>
      </div>

      <Button
        variant="outline"
        size="lg"
        className="mt-8 h-12 w-full rounded-xl border-white/[0.10] bg-white/[0.025] text-white/70 hover:bg-white/[0.05] hover:text-white"
        onClick={onLogin}
      >
        Back to sign in
        <ArrowRight className="ml-auto h-4 w-4 opacity-40" />
      </Button>

      <p className="mt-4 text-[11px] leading-5 text-white/25">
        If you continue seeing this message, restart the account setup process.
      </p>
    </div>
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
  complete = false,
}: {
  number: string;
  title: string;
  description: string;
  active?: boolean;
  complete?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-[10px] font-semibold tracking-wider",
          active
            ? "border-[#ff7657]/20 bg-[#ff7657]/10 text-[#ff927a]"
            : complete
              ? "border-emerald-400/10 bg-emerald-400/[0.06] text-emerald-400/70"
              : "border-white/[0.07] bg-white/[0.025] text-white/30",
        ].join(" ")}
      >
        {complete ? <Check className="h-3.5 w-3.5" /> : number}
      </div>

      <div className="pt-0.5">
        <h3
          className={[
            "text-sm font-medium",
            active ? "text-white/80" : "text-white/55",
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
