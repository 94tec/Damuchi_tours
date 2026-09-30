"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock3,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const STATUS_STEPS = [
  {
    label: "Account created",
    description: "Your account details are saved",
    state: "complete" as const,
  },
  {
    label: "Email activation",
    description: "Check your inbox to activate your account",
    state: "active" as const,
  },
  {
    label: "Ready to sign in",
    description: "Access your account securely",
    state: "upcoming" as const,
  },
];

export default function PendingApprovalPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07090a] text-white">
      {/* ============================================================
          BACKGROUND
          ============================================================ */}
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

        {/* Atmospheric glows */}
        <div
          className="absolute -left-32 top-[-18%] h-[520px] w-[520px] rounded-full bg-[#ff7657]/[0.10] blur-[120px]"
          style={{
            animation: "pendingFloat 12s ease-in-out infinite",
          }}
        />

        <div
          className="absolute -right-40 bottom-[-20%] h-[600px] w-[600px] rounded-full bg-orange-500/[0.07] blur-[140px]"
          style={{
            animation: "pendingFloatReverse 16s ease-in-out infinite",
          }}
        />

        <div
          className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#ff7657]/[0.035] blur-[100px]"
          style={{
            animation: "pendingFloat 18s ease-in-out infinite reverse",
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
                "pendingCard 0.7s cubic-bezier(0.22,1,0.36,1) both",
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
                        "pendingFadeDown 0.7s 0.08s ease-out both",
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

                  {/* Main message */}
                  <div
                    className="mt-auto"
                    style={{
                      animation:
                        "pendingHero 0.8s 0.15s cubic-bezier(0.22,1,0.36,1) both",
                    }}
                  >
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ff7657]/15 bg-[#ff7657]/[0.06] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#ff927a]">
                      <Sparkles className="h-3 w-3" />
                      Almost there
                    </div>

                    <h1 className="max-w-md font-display text-4xl font-medium leading-[1.05] tracking-[-0.035em] text-white xl:text-[46px]">
                      Your journey is almost ready to begin.
                    </h1>

                    <p className="mt-5 max-w-md text-sm leading-6 text-white/40">
                      Your account has been created successfully. Complete
                      the activation step and you&apos;ll be ready to sign in
                      securely.
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="mt-12 space-y-3">
                    {STATUS_STEPS.map((step, index) => (
                      <StatusStep
                        key={step.label}
                        number={`0${index + 1}`}
                        label={step.label}
                        description={step.description}
                        state={step.state}
                      />
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="mt-10 grid grid-cols-3 gap-3">
                    <FeatureStat value="02/03" label="Progress" />
                    <FeatureStat value="SECURE" label="Activation" />
                    <FeatureStat value="EMAIL" label="Next step" />
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
                    className="text-center"
                    style={{
                      animation:
                        "pendingFadeDown 0.7s 0.12s ease-out both",
                    }}
                  >
                    <div className="mb-6 flex items-center justify-center">
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff7657]/20 bg-[#ff7657]/[0.08] shadow-[0_0_45px_rgba(255,118,87,0.08)]">
                        <div className="absolute inset-0 rounded-2xl bg-[#ff7657]/[0.04] blur-xl" />
                        <Clock3 className="relative h-7 w-7 text-[#ff927a]" />
                      </div>
                    </div>

                    <div className="mb-4 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff927a]">
                      <span className="h-px w-6 bg-[#ff7657]/50" />
                      Activation pending
                      <span className="h-px w-6 bg-[#ff7657]/50" />
                    </div>

                    <h2 className="font-display text-3xl font-medium tracking-[-0.025em] text-white">
                      Almost ready.
                    </h2>

                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/35">
                      Your account is waiting for the final activation step.
                      Check your email for the next instructions.
                    </p>
                  </div>

                  {/* Status card */}
                  <div
                    className="mt-9 rounded-2xl border border-[#ff7657]/15 bg-[#ff7657]/[0.045] p-5"
                    style={{
                      animation:
                        "pendingFadeDown 0.7s 0.22s ease-out both",
                    }}
                  >
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#ff7657]/15 bg-[#ff7657]/[0.08]">
                        <Mail className="h-4.5 w-4.5 text-[#ff927a]" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-white/75">
                          Check your inbox
                        </p>

                        <p className="mt-1.5 text-xs leading-5 text-white/35">
                          Look for an activation email from Damuchi Safaris.
                          If you don&apos;t see it, check your spam or junk
                          folder.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress details */}
                  <div
                    className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
                    style={{
                      animation:
                        "pendingFadeDown 0.7s 0.28s ease-out both",
                    }}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-xs font-medium text-white/60">
                        Account setup
                      </p>

                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#ff927a]">
                        2 of 3
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full w-2/3 rounded-full bg-[#ff7657] shadow-[0_0_14px_rgba(255,118,87,0.35)]" />
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-[11px] text-white/30">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#ff927a]/70" />
                      Your account details are securely stored.
                    </div>
                  </div>

                  {/* CTA */}
                  <div
                    className="mt-7"
                    style={{
                      animation:
                        "pendingFadeDown 0.7s 0.34s ease-out both",
                    }}
                  >
                    <Button
                      asChild
                      variant="accent"
                      size="lg"
                      className="h-12 w-full rounded-xl"
                    >
                      <Link href="/login">
                        Back to sign in
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* Help */}
                  <div
                    className="mt-7 text-center"
                    style={{
                      animation:
                        "pendingFadeDown 0.7s 0.4s ease-out both",
                    }}
                  >
                    <p className="text-xs text-white/25">
                      Already completed activation?
                    </p>

                    <Link
                      href="/login"
                      className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-[#ff927a] transition-colors hover:text-[#ffad98] hover:underline"
                    >
                      Continue to sign in
                    </Link>
                  </div>

                  {/* Security footer */}
                  <div className="mt-9 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/15">
                    <ShieldCheck className="h-3 w-3" />
                    Secure account activation
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
@keyframes pendingFloat {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
}

  50% {
    transform: translate3d(0, -24px, 0) scale(1.04);
}
}

@keyframes pendingFloatReverse {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
}

  50% {
    transform: translate3d(20px, 18px, 0) scale(1.05);
}
}

@keyframes pendingFadeDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pendingHero {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pendingCard {
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
   STATUS STEP
   ================================================================ */

function StatusStep({
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

