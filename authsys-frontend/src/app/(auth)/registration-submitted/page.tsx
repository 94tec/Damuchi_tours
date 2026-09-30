"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  Mail,
  MailCheck,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const ACTIVATION_STEPS = [
  {
    label: "Account created",
    description: "Your registration is complete",
    state: "complete" as const,
  },
  {
    label: "Verify email",
    description: "Confirm your email address",
    state: "active" as const,
  },
  {
    label: "Sign in",
    description: "Access your account securely",
    state: "upcoming" as const,
  },
];

export default function RegistrationSubmittedPage() {
  const params = useSearchParams();
  const email = params.get("email");

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

        {/* Coral atmospheric glow */}
        <div
          className="absolute -left-32 top-[-18%] h-[520px] w-[520px] rounded-full bg-[#ff7657]/[0.10] blur-[120px]"
          style={{
            animation: "registrationSubmittedFloat 12s ease-in-out infinite",
          }}
        />

        {/* Orange atmospheric glow */}
        <div
          className="absolute -right-40 bottom-[-20%] h-[600px] w-[600px] rounded-full bg-orange-500/[0.07] blur-[140px]"
          style={{
            animation:
              "registrationSubmittedFloatReverse 16s ease-in-out infinite",
          }}
        />

        {/* Center glow */}
        <div
          className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#ff7657]/[0.035] blur-[100px]"
          style={{
            animation:
              "registrationSubmittedFloat 18s ease-in-out infinite reverse",
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
                "registrationSubmittedCard 0.7s cubic-bezier(0.22,1,0.36,1) both",
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
                        "registrationSubmittedFadeDown 0.7s 0.08s ease-out both",
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
                        "registrationSubmittedHero 0.8s 0.15s cubic-bezier(0.22,1,0.36,1) both",
                    }}
                  >
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ff7657]/15 bg-[#ff7657]/[0.06] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#ff927a]">
                      <Sparkles className="h-3 w-3" />
                      Registration complete
                    </div>

                    <h1 className="max-w-md font-display text-4xl font-medium leading-[1.05] tracking-[-0.035em] text-white xl:text-[46px]">
                      Your account is almost ready.
                    </h1>

                    <p className="mt-5 max-w-md text-sm leading-6 text-white/40">
                      We&apos;ve created your account securely. One quick
                      email verification is all that stands between you and
                      signing in.
                    </p>
                  </div>

                  {/* Activation steps */}
                  <div className="mt-12 space-y-3">
                    {ACTIVATION_STEPS.map((step, index) => (
                      <ActivationStep
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
                    <FeatureStat value="01/03" label="Progress" />
                    <FeatureStat value="EMAIL" label="Verification" />
                    <FeatureStat value="SECURE" label="Account" />
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
                        "registrationSubmittedFadeDown 0.7s 0.12s ease-out both",
                    }}
                  >
                    <div className="mb-6 flex items-center justify-center">
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff7657]/20 bg-[#ff7657]/[0.08] shadow-[0_0_45px_rgba(255,118,87,0.08)]">
                        <div className="absolute inset-0 rounded-2xl bg-[#ff7657]/[0.04] blur-xl" />

                        <MailCheck className="relative h-7 w-7 text-[#ff927a]" />
                      </div>
                    </div>

                    <div className="mb-4 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff927a]">
                      <span className="h-px w-6 bg-[#ff7657]/50" />
                      Check your inbox
                      <span className="h-px w-6 bg-[#ff7657]/50" />
                    </div>

                    <h2 className="font-display text-3xl font-medium tracking-[-0.025em] text-white">
                      Verify your email
                    </h2>

                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/35">
                      We&apos;ve sent an activation link to your email
                      address. Verify it to finish setting up your account.
                    </p>
                  </div>

                  {/* Email destination */}
                  <div
                    className="mt-9 rounded-2xl border border-[#ff7657]/15 bg-[#ff7657]/[0.045] p-5"
                    style={{
                      animation:
                        "registrationSubmittedFadeDown 0.7s 0.22s ease-out both",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#ff7657]/15 bg-[#ff7657]/[0.08]">
                        <Mail className="h-4.5 w-4.5 text-[#ff927a]" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25">
                          Verification email sent to
                        </p>

                        <p className="mt-1 truncate text-sm font-medium text-white/75">
                          {email || "your email address"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Next steps */}
                  <div
                    className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
                    style={{
                      animation:
                        "registrationSubmittedFadeDown 0.7s 0.28s ease-out both",
                    }}
                  >
                    <p className="text-xs font-medium text-white/60">
                      What happens next?
                    </p>

                    <div className="mt-4 space-y-3.5">
                      <NextStep
                        number="01"
                        text="Open the verification email."
                      />

                      <NextStep
                        number="02"
                        text="Click the activation link."
                      />

                      <NextStep
                        number="03"
                        text="Return here and sign in."
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <div
                    className="mt-7"
                    style={{
                      animation:
                        "registrationSubmittedFadeDown 0.7s 0.34s ease-out both",
                    }}
                  >
                    <Button
                      asChild
                      variant="accent"
                      size="lg"
                      className="h-12 w-full rounded-xl"
                    >
                      <Link href="/login">
                        Go to sign in
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* Email reminder */}
                  <div
                    className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-white/25"
                    style={{
                      animation:
                        "registrationSubmittedFadeDown 0.7s 0.4s ease-out both",
                    }}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>
                      Can&apos;t find it? Check your spam or junk folder.
                    </span>
                  </div>

                  {/* Security footer */}
                  <div className="mt-8 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/15">
                    <ShieldCheck className="h-3 w-3" />
                    Secure email verification
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
@keyframes registrationSubmittedFloat {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
}

  50% {
    transform: translate3d(0, -24px, 0) scale(1.04);
}
}

@keyframes registrationSubmittedFloatReverse {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
}

  50% {
    transform: translate3d(20px, 18px, 0) scale(1.05);
}
}

@keyframes registrationSubmittedFadeDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes registrationSubmittedHero {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes registrationSubmittedCard {
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
   ACTIVATION STEP
   ================================================================ */

function ActivationStep({
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
        {isComplete ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          number
        )}
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
   NEXT STEP
   ================================================================ */

function NextStep({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-[9px] font-semibold tracking-wider text-white/30">
        {number}
      </div>

      <p className="text-xs text-white/40">{text}</p>
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

