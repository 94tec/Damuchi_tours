"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Globe2,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validations/auth";

import { authApi } from "@/lib/auth-api";

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsSubmitting(true);

    try {
      await authApi.forgotPassword(values);
    } catch {
      /*
       * Intentionally generic.
       *
       * Never reveal whether the supplied email exists.
       * The UI always proceeds to the same success state.
       */
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);

      toast.success("Recovery request submitted");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07090a] text-white">
      {/* =================================================================
          BACKGROUND
      ================================================================= */}

      <div className="pointer-events-none absolute inset-0">
        {/* Atmospheric gradient */}

        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_15%_15%,rgba(255,107,87,.13),transparent_32%),radial-gradient(circle_at_90%_85%,rgba(245,132,31,.10),transparent_30%),linear-gradient(135deg,#07090a_0%,#0d0e10_48%,#070809_100%)]
          "
        />

        {/* Subtle grid */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.035]
            [background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)]
            [background-size:60px_60px]
            [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]
          "
        />

        {/* Coral light */}

        <div
          className="
            absolute
            -left-48
            -top-48
            h-[520px]
            w-[520px]
            rounded-full
            bg-coral/[0.09]
            blur-[130px]
            animate-[forgotFloat_13s_ease-in-out_infinite]
          "
        />

        {/* Orange light */}

        <div
          className="
            absolute
            -bottom-48
            -right-48
            h-[580px]
            w-[580px]
            rounded-full
            bg-orange/[0.07]
            blur-[140px]
            animate-[forgotFloatReverse_16s_ease-in-out_infinite]
          "
        />
      </div>

      {/* =================================================================
          CONTENT
      ================================================================= */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-screen
          w-full
          max-w-[1500px]
          items-center
          px-4
          py-6
          sm:px-6
          lg:px-10
          lg:py-10
        "
      >
        <div
          className="
            mx-auto
            grid
            w-full
            max-w-[1180px]
            overflow-hidden
            rounded-[30px]
            border
            border-white/[0.08]
            bg-white/[0.025]
            shadow-[0_40px_120px_-35px_rgba(0,0,0,.85)]
            backdrop-blur-xl
            lg:grid-cols-[.9fr_1.1fr]
          "
        >
          {/* =============================================================
              LEFT PANEL
          ============================================================= */}

          <section
            className="
              relative
              hidden
              min-h-[760px]
              overflow-hidden
              border-r
              border-white/[0.07]
              lg:flex
            "
          >
            {/* Decorative rings */}

            <div
              className="
                absolute
                -left-28
                top-24
                h-80
                w-80
                rounded-full
                border
                border-white/[0.045]
              "
            />

            <div
              className="
                absolute
                -left-16
                top-36
                h-60
                w-60
                rounded-full
                border
                border-coral/[0.07]
              "
            />

            <div
              className="
                absolute
                -bottom-36
                -right-28
                h-[430px]
                w-[430px]
                rounded-full
                border
                border-white/[0.04]
              "
            />

            {/* Ambient glow */}

            <div
              className="
                absolute
                left-1/4
                top-1/3
                h-60
                w-60
                rounded-full
                bg-coral/[0.05]
                blur-[90px]
              "
            />

            <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">
              {/* =========================================================
                  BRAND
              ========================================================= */}

              <div className="animate-[forgotFadeDown_.7s_ease-out_both]">
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-coral/20
                      bg-coral/[0.08]
                      shadow-[0_10px_35px_-12px_rgba(255,107,87,.5)]
                    "
                  >
                    <MapPin className="h-5 w-5 text-coral" />
                  </div>

                  <div>
                    <p className="font-display text-lg font-semibold tracking-tight text-white">
                      Damuchi Safaris
                    </p>

                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                      Operations Platform
                    </p>
                  </div>
                </div>
              </div>

              {/* =========================================================
                  HERO COPY
              ========================================================= */}

              <div className="max-w-[500px] animate-[forgotHero_.9s_cubic-bezier(.16,1,.3,1)_both]">
                <div
                  className="
                    mb-5
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-coral/15
                    bg-coral/[0.05]
                    px-3
                    py-1.5
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-coral
                  "
                >
                  <ShieldCheck className="h-3 w-3" />

                  Secure account recovery
                </div>

                <h1
                  className="
                    font-display
                    text-4xl
                    font-medium
                    leading-[1.08]
                    tracking-[-0.04em]
                    text-white
                    xl:text-5xl
                  "
                >
                  Find your way
                  <span className="block text-white/45">
                    back to the journey.
                  </span>
                </h1>

                <p className="mt-6 max-w-[450px] text-sm leading-7 text-white/40">
                  Forgot your password? No problem. We'll help
                  you securely recover your account and get back
                  to the Damuchi Safaris platform.
                </p>

                {/* =======================================================
                    RECOVERY PROCESS
                ======================================================= */}

                <div className="mt-10 space-y-3">
                  <RecoveryStep
                    number="01"
                    title="Enter your email"
                    description="Tell us which account you're trying to recover."
                    active
                  />

                  <RecoveryStep
                    number="02"
                    title="Check your inbox"
                    description="We'll send a secure password reset link."
                  />

                  <RecoveryStep
                    number="03"
                    title="Create a new password"
                    description="Choose a strong password and get back in."
                  />
                </div>

                {/* =======================================================
                    MINI STATS
                ======================================================= */}

                <div className="mt-9 grid max-w-[430px] grid-cols-3 gap-3">
                  <FeatureStat
                    icon={<ShieldCheck className="h-4 w-4" />}
                    value="Secure"
                    label="Recovery"
                  />

                  <FeatureStat
                    icon={<Users className="h-4 w-4" />}
                    value="Private"
                    label="Account"
                  />

                  <FeatureStat
                    icon={<Globe2 className="h-4 w-4" />}
                    value="Always"
                    label="Available"
                  />
                </div>
              </div>

              {/* =========================================================
                  FOOTER
              ========================================================= */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-t
                  border-white/[0.06]
                  pt-6
                  text-[10px]
                  text-white/25
                "
              >
                <span>
                  © {new Date().getFullYear()} Damuchi Safaris
                </span>

                <div className="flex items-center gap-2">
                  <span
                    className="
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-emerald-400
                      shadow-[0_0_10px_rgba(74,222,128,.6)]
                    "
                  />

                  Secure recovery
                </div>
              </div>
            </div>
          </section>

          {/* =============================================================
              RIGHT PANEL
          ============================================================= */}

          <section
            className="
              relative
              flex
              min-h-[760px]
              items-center
              justify-center
              px-5
              py-10
              sm:px-8
              lg:px-12
              xl:px-16
            "
          >
            {/* Glow */}

            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-0
                h-48
                w-80
                -translate-x-1/2
                rounded-full
                bg-coral/[0.045]
                blur-[80px]
              "
            />

            <div
              className="
                relative
                w-full
                max-w-[460px]
                animate-[forgotCard_.8s_cubic-bezier(.16,1,.3,1)_both]
              "
            >
              {/* =========================================================
                  MOBILE BRAND
              ========================================================= */}

              <div className="mb-9 flex items-center justify-center lg:hidden">
                <div className="flex items-center gap-2.5">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-coral/20
                      bg-coral/[0.08]
                    "
                  >
                    <MapPin className="h-4.5 w-4.5 text-coral" />
                  </div>

                  <div>
                    <p className="font-display text-base font-semibold text-white">
                      Damuchi Safaris
                    </p>

                    <p className="text-[9px] uppercase tracking-[0.18em] text-white/30">
                      Operations Platform
                    </p>
                  </div>
                </div>
              </div>

              {/* =========================================================
                  FORM / SUCCESS STATE
              ========================================================= */}

              {!isSubmitted ? (
                <RecoveryForm
                  form={form}
                  isSubmitting={isSubmitting}
                  onSubmit={onSubmit}
                />
              ) : (
                <RecoverySuccess email={form.getValues("email")} />
              )}

              {/* =========================================================
                  BACK TO LOGIN
              ========================================================= */}

              <Link
                href="/login"
                className="
                  group
                  mt-7
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-xs
                  font-medium
                  text-white/30
                  transition-colors
                  duration-200
                  hover:text-coral
                "
              >
                <span
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/[0.08]
                    transition-all
                    duration-300
                    group-hover:-translate-x-0.5
                    group-hover:border-coral/30
                    group-hover:bg-coral/[0.08]
                  "
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </span>

                Back to sign in
              </Link>

              {/* Security */}

              <div
                className="
                  mt-7
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-[10px]
                  text-white/20
                "
              >
                <LockKeyhole className="h-3.5 w-3.5" />

                Your information is securely transmitted
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* =================================================================
          ANIMATIONS
      ================================================================= */}

      <style jsx global>{`
@keyframes forgotFloat {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
}

  50% {
    transform: translate3d(60px, 45px, 0) scale(1.08);
}
}

@keyframes forgotFloatReverse {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
}

  50% {
    transform: translate3d(-50px, -45px, 0) scale(1.08);
}
}

@keyframes forgotFadeDown {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes forgotHero {
  from {
    opacity: 0;
    transform: translateY(25px);
    filter: blur(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes forgotCard {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.985);
    filter: blur(7px);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
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

/* =========================================================================
   CONSTANTS
========================================================================= */

const inputClass = `
h-12
rounded-xl
border-white/[0.09]
bg-white/[0.035]
px-4
text-sm
text-white
placeholder:text-white/20
transition-all
duration-200
hover:border-white/[0.14]
focus:border-coral/40
focus:ring-2
focus:ring-coral/10
    `;

/* =========================================================================
   RECOVERY FORM
========================================================================= */

function RecoveryForm({
  form,
  isSubmitting,
  onSubmit,
}: {
  form: ReturnType<typeof useForm<ForgotPasswordFormValues>>;
  isSubmitting: boolean;
  onSubmit: (values: ForgotPasswordFormValues) => Promise<void>;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-right-2 duration-500">
      {/* ===============================================================
          HEADER
      =============================================================== */}

      <div className="mb-7 text-center lg:text-left">
        <div
          className="
            mb-3
            inline-flex
            items-center
            gap-2
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.18em]
            text-coral
          "
        >
          <ShieldCheck className="h-3.5 w-3.5" />

          Account recovery
        </div>

        <h2
          className="
            font-display
            text-3xl
            font-medium
            tracking-[-0.04em]
            text-white
            sm:text-[34px]
          "
        >
          Find your way back.
        </h2>

        <p className="mt-2 max-w-[420px] text-sm leading-6 text-white/35">
          Enter the email associated with your account and
          we'll send you a secure link to create a new password.
        </p>
      </div>

      {/* ===============================================================
          RECOVERY NOTICE
      =============================================================== */}

      <div
        className="
          mb-6
          rounded-2xl
          border
          border-coral/[0.10]
          bg-coral/[0.035]
          p-4
        "
      >
        <div className="flex gap-3">
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-coral/[0.08]
            "
          >
            <ShieldCheck className="h-4 w-4 text-coral/80" />
          </div>

          <div>
            <p className="text-[11px] font-semibold text-white/70">
              Your account stays protected
            </p>

            <p className="mt-1 text-[10px] leading-4 text-white/30">
              For security, we never reveal whether an email
              address is registered with us.
            </p>
          </div>
        </div>
      </div>

      {/* ===============================================================
          FORM
      =============================================================== */}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-white/65">
                  Email address
                </FormLabel>

                <FormControl>
                  <div className="group relative">
                    <Mail
                      aria-hidden="true"
                      className="
                        pointer-events-none
                        absolute
                        left-3.5
                        top-1/2
                        z-10
                        h-4
                        w-4
                        -translate-y-1/2
                        text-white/25
                        transition-colors
                        duration-200
                        group-focus-within:text-coral
                      "
                    />

                    <Input
                      {...field}
                      type="email"
                      placeholder="you@company.com"
                      autoComplete="email"
                      autoFocus
                      hasError={!!form.formState.errors.email}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* =============================================================
              CTA
          ============================================================= */}

          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="
              group
              relative
              mt-2
              h-12
              w-full
              overflow-hidden
              rounded-xl
              font-semibold
              shadow-[0_12px_35px_-12px_rgba(255,107,87,.55)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_18px_45px_-12px_rgba(255,107,87,.65)]
              active:translate-y-0
            "
            loading={isSubmitting}
          >
            {!isSubmitting && (
              <Mail
                className="
                  h-4
                  w-4
                  transition-transform
                  duration-300
                  group-hover:scale-110
                "
              />
            )}

            <span>
              {isSubmitting
                ? "Sending recovery link..."
                : "Send reset link"}
            </span>

            {!isSubmitting && (
              <ArrowRight
                className="
                  ml-auto
                  h-4
                  w-4
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

/* =========================================================================
   SUCCESS STATE
========================================================================= */

function RecoverySuccess({ email }: { email: string }) {
  return (
    <div
      className="
        animate-in
        fade-in
        slide-in-from-right-2
        duration-500
      "
    >
      <div className="flex flex-col items-center py-2 text-center">
        {/* ===============================================================
            SUCCESS ICON
        =============================================================== */}

        <div className="relative flex h-20 w-20 items-center justify-center">
          {/* Outer pulse */}

          <div
            className="
              absolute
              inset-0
              animate-ping
              rounded-full
              bg-coral/10
              [animation-duration:2.5s]
            "
          />

          {/* Ring */}

          <div
            className="
              absolute
              inset-2
              rounded-full
              border
              border-coral/20
              bg-coral/10
              shadow-[0_0_40px_rgba(255,107,87,0.12)]
            "
          />

          {/* Check */}

          <div
            className="
              relative
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-coral
              text-[#07090a]
              shadow-[0_0_25px_rgba(255,107,87,0.25)]
            "
          >
            <Check className="h-5 w-5" strokeWidth={3} />
          </div>
        </div>

        {/* ===============================================================
            EYEBROW
        =============================================================== */}

        <div
          className="
            mt-6
            flex
            items-center
            gap-1.5
            text-[11px]
            font-semibold
            uppercase
            tracking-[0.18em]
            text-coral
          "
        >
          <Sparkles className="h-3.5 w-3.5" />

          Recovery link sent
        </div>

        {/* ===============================================================
            TITLE
        =============================================================== */}

        <h2
          className="
            mt-3
            font-display
            text-2xl
            font-medium
            tracking-tight
            text-white
          "
        >
          Check your email
        </h2>

        {/* ===============================================================
            DESCRIPTION
        =============================================================== */}

        <p
          className="
            mt-2
            max-w-sm
            text-sm
            leading-6
            text-white/35
          "
        >
          If that email matches an account, we've sent a
          secure password reset link your way.
        </p>

        {/* ===============================================================
            EMAIL
        =============================================================== */}

        {email && (
          <div
            className="
              mt-5
              flex
              max-w-full
              items-center
              gap-2
              rounded-full
              border
              border-white/[0.08]
              bg-white/[0.03]
              px-4
              py-2
            "
          >
            <Mail className="h-3.5 w-3.5 shrink-0 text-coral" />

            <span
              className="
                max-w-[240px]
                truncate
                text-xs
                font-medium
                text-white/60
              "
            >
              {email}
            </span>
          </div>
        )}

        {/* ===============================================================
            TIP
        =============================================================== */}

        <div
          className="
            mt-6
            w-full
            rounded-2xl
            border
            border-white/[0.06]
            bg-white/[0.02]
            px-4
            py-3.5
            text-left
          "
        >
          <div className="flex gap-3">
            <div
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-coral/[0.08]
              "
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-coral" />
            </div>

            <div>
              <p className="text-xs font-medium text-white/70">
                Didn't see the email?
              </p>

              <p className="mt-1 text-[11px] leading-5 text-white/30">
                Check your spam or junk folder. If it's still
                missing, return to sign in and try the recovery
                process again.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   RECOVERY STEP
========================================================================= */

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
    <div
      className="
        flex
        items-center
        gap-3
        rounded-2xl
        border
        border-white/[0.055]
        bg-white/[0.02]
        p-3.5
      "
    >
      <div
        className={`
flex
h-9
w-9
shrink-0
items-center
justify-center
rounded-xl
border
text-[10px]
font-semibold
${
  active
      ? "border-coral/20 bg-coral/[0.08] text-coral"
      : "border-white/[0.07] bg-white/[0.025] text-white/30"
}
`}
      >
        {number}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-white/65">
          {title}
        </p>

        <p className="mt-0.5 text-[10px] text-white/25">
          {description}
        </p>
      </div>

      {active && (
        <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-coral/60" />
      )}
    </div>
  );
}

/* =========================================================================
   FEATURE STAT
========================================================================= */

function FeatureStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/[0.06]
        bg-white/[0.025]
        p-3.5
        backdrop-blur-sm
      "
    >
      <div
        className="
          mb-3
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-lg
          bg-white/[0.05]
          text-coral
        "
      >
        {icon}
      </div>

      <p className="text-xs font-semibold text-white/70">
        {value}
      </p>

      <p className="mt-0.5 text-[9px] text-white/25">
        {label}
      </p>
    </div>
  );
}

