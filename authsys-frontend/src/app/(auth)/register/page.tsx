"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
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
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations/auth";
import { authApi } from "@/lib/auth-api";
import type { ApiError } from "@/types/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true);

    try {
      const { confirmPassword, ...payload } = values;

      const response = await authApi.register(payload);

      toast.success("Request submitted");

      router.push(
        `/registration-submitted?email=${encodeURIComponent(
        values.email
)}`
      );
    } catch (err) {
      const apiError = err as ApiError;

      toast.error(
        apiError.message ||
          "Registration failed. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07090a] text-white">
      {/* =================================================================
          BACKGROUND
      ================================================================= */}

      <div className="pointer-events-none absolute inset-0">
        {/* atmospheric gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,107,87,.13),transparent_32%),radial-gradient(circle_at_90%_85%,rgba(245,132,31,.10),transparent_30%),linear-gradient(135deg,#07090a_0%,#0d0e10_48%,#070809_100%)]" />

        {/* subtle grid */}
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

        {/* coral light */}
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
            animate-[registerFloat_13s_ease-in-out_infinite]
          "
        />

        {/* orange light */}
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
            animate-[registerFloatReverse_16s_ease-in-out_infinite]
          "
        />
      </div>

      {/* =================================================================
          CONTENT
      ================================================================= */}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1500px] items-center px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
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
            {/* decorative rings */}
            <div className="absolute -left-28 top-24 h-80 w-80 rounded-full border border-white/[0.045]" />
            <div className="absolute -left-16 top-36 h-60 w-60 rounded-full border border-coral/[0.07]" />
            <div className="absolute -bottom-36 -right-28 h-[430px] w-[430px] rounded-full border border-white/[0.04]" />

            {/* ambient glow */}
            <div className="absolute left-1/4 top-1/3 h-60 w-60 rounded-full bg-coral/[0.05] blur-[90px]" />

            <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">

              {/* =========================================================
                  BRAND
              ========================================================= */}

              <div className="animate-[registerFadeDown_.7s_ease-out_both]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-coral/20 bg-coral/[0.08] shadow-[0_10px_35px_-12px_rgba(255,107,87,.5)]">
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

              <div className="max-w-[500px] animate-[registerHero_.9s_cubic-bezier(.16,1,.3,1)_both]">

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-coral/15 bg-coral/[0.05] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-coral">
                  <Sparkles className="h-3 w-3" />

                  Join the expedition
                </div>

                <h1 className="font-display text-4xl font-medium leading-[1.08] tracking-[-0.04em] text-white xl:text-5xl">
                  Your next
                  <span className="block text-white/45">
                    adventure starts
                  </span>
                  at Damuchi Safaris.
                </h1>

                <p className="mt-6 max-w-[450px] text-sm leading-7 text-white/40">
                  Request access to the Damuchi Safaris
                  operations platform and become part of
                  the team behind unforgettable journeys.
                </p>

                {/* =======================================================
                    PROCESS
                ======================================================= */}

                <div className="mt-10 space-y-3">
                  <RegistrationStep
                    number="01"
                    title="Submit your details"
                    description="Tell us a little about yourself."
                    active
                  />

                  <RegistrationStep
                    number="02"
                    title="Admin review"
                    description="Your request is securely reviewed."
                  />

                  <RegistrationStep
                    number="03"
                    title="Get approved"
                    description="Once approved, you're ready to go."
                  />
                </div>

                {/* mini stats */}
                <div className="mt-9 grid max-w-[430px] grid-cols-3 gap-3">
                  <FeatureStat
                    icon={<ShieldCheck className="h-4 w-4" />}
                    value="Secure"
                    label="Access"
                  />

                  <FeatureStat
                    icon={<Users className="h-4 w-4" />}
                    value="Trusted"
                    label="Team"
                  />

                  <FeatureStat
                    icon={<Globe2 className="h-4 w-4" />}
                    value="Global"
                    label="Operations"
                  />
                </div>
              </div>

              {/* footer */}
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-6 text-[10px] text-white/25">
                <span>
                  © {new Date().getFullYear()} Damuchi Safaris
                </span>

                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,.6)]" />

                  Applications open
                </div>
              </div>
            </div>
          </section>

          {/* =============================================================
              RIGHT FORM
          ============================================================= */}

          <section className="relative flex min-h-[760px] items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
            {/* glow */}
            <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-80 -translate-x-1/2 rounded-full bg-coral/[0.045] blur-[80px]" />

            <div className="relative w-full max-w-[460px] animate-[registerCard_.8s_cubic-bezier(.16,1,.3,1)_both]">

              {/* =========================================================
                  MOBILE BRAND
              ========================================================= */}

              <div className="mb-9 flex items-center justify-center lg:hidden">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-coral/20 bg-coral/[0.08]">
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
                  HEADING
              ========================================================= */}

              <div className="mb-7 text-center lg:text-left">
                <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-coral">
                  <UserPlus className="h-3.5 w-3.5" />

                  Join the team
                </div>

                <h2 className="font-display text-3xl font-medium tracking-[-0.04em] text-white sm:text-[34px]">
                  Request access
                </h2>

                <p className="mt-2 max-w-[420px] text-sm leading-6 text-white/35">
                  Complete the form below. An administrator
                  will review your request before activation.
                </p>
              </div>

              {/* =========================================================
                  REVIEW NOTICE
              ========================================================= */}

              <div className="mb-6 rounded-2xl border border-coral/[0.10] bg-coral/[0.035] p-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-coral/[0.08]">
                    <ShieldCheck className="h-4 w-4 text-coral/80" />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-white/70">
                      Verify your email & Admin-reviewed access
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-white/30">
                      Every new account is reviewed before
                      it can access the operations platform.
                    </p>
                  </div>
                </div>
              </div>

              {/* =========================================================
                  FORM
              ========================================================= */}

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* -----------------------------------------------------
                      NAME
                  ----------------------------------------------------- */}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-white/65">
                            First name
                          </FormLabel>

                          <FormControl>
                            <Input
                              placeholder="Asha"
                              autoComplete="given-name"
                              hasError={
                                !!form.formState.errors.firstName
                              }
                              className={inputClass}
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-white/65">
                            Last name
                          </FormLabel>

                          <FormControl>
                            <Input
                              placeholder="Mwangi"
                              autoComplete="family-name"
                              hasError={
                                !!form.formState.errors.lastName
                              }
                              className={inputClass}
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* -----------------------------------------------------
                      EMAIL
                  ----------------------------------------------------- */}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-white/65">
                          Email address
                        </FormLabel>

                        <FormControl>
                          <div className="relative">
                            <Mail className={fieldIconClass} />

                            <Input
                              type="email"
                              placeholder="you@company.com"
                              autoComplete="email"
                              hasError={
                                !!form.formState.errors.email
                              }
                              className={`${inputClass} pl-10`}
                              {...field}
                            />
                          </div>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* -----------------------------------------------------
                      PHONE
                  ----------------------------------------------------- */}

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-white/65">
                          Phone number
                        </FormLabel>

                        <FormControl>
                          <div className="relative">
                            <Phone className={fieldIconClass} />

                            <Input
                              type="tel"
                              placeholder="+254 712 345 678"
                              autoComplete="tel"
                              hasError={
                                !!form.formState.errors.phoneNumber
                              }
                              className={`${inputClass} pl-10`}
                              {...field}
                            />
                          </div>
                        </FormControl>

                        <FormDescription className="text-[10px] text-white/25">
                          Used for OTP verification.
                        </FormDescription>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* -----------------------------------------------------
                      PASSWORD
                  ----------------------------------------------------- */}

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-white/65">
                          Password
                        </FormLabel>

                        <FormControl>
                          <div className="relative">
                            <KeyRound className={fieldIconClass} />

                            <Input
                              type={
                                showPassword
                                  ? "text"
                                  : "password"
                              }
                              placeholder="••••••••••"
                              autoComplete="new-password"
                              hasError={
                                !!form.formState.errors.password
                              }
                              className={`${inputClass} pl-10 pr-12`}
                              {...field}
                            />

                            <PasswordToggle
                              visible={showPassword}
                              onClick={() =>
                                setShowPassword(
                                  (value) => !value
                                )
                              }
                            />
                          </div>
                        </FormControl>

                        <FormDescription className="text-[10px] leading-4 text-white/25">
                          At least 10 characters with a mix of
                          cases, numbers, and symbols.
                        </FormDescription>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* -----------------------------------------------------
                      CONFIRM PASSWORD
                  ----------------------------------------------------- */}

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-white/65">
                          Confirm password
                        </FormLabel>

                        <FormControl>
                          <div className="relative">
                            <LockKeyhole className={fieldIconClass} />

                            <Input
                              type={
                                showConfirmPassword
                                  ? "text"
                                  : "password"
                              }
                              placeholder="••••••••••"
                              autoComplete="new-password"
                              hasError={
                                !!form.formState.errors
                                  .confirmPassword
                              }
                              className={`${inputClass} pl-10 pr-12`}
                              {...field}
                            />

                            <PasswordToggle
                              visible={
                                showConfirmPassword
                              }
                              onClick={() =>
                                setShowConfirmPassword(
                                  (value) => !value
                                )
                              }
                            />
                          </div>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* =====================================================
                      SUBMIT
                  ===================================================== */}

                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    className="
                      group
                      relative
                      mt-3
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
                      <UserPlus className="h-4 w-4" />
                    )}

                    <span>
                      {isSubmitting
                        ? "Submitting request..."
                        : "Submit request"}
                    </span>

                    {!isSubmitting && (
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    )}
                  </Button>
                </form>
              </Form>

              {/* =========================================================
                  LOGIN
              ========================================================= */}

              <p className="mt-7 text-center text-xs text-white/30">
                Already have access?{" "}
                <Link
                  href="/login"
                  className="font-medium text-coral transition-colors hover:text-coral/80"
                >
                  Sign in
                </Link>
              </p>

              {/* security */}
              <div className="mt-7 flex items-center justify-center gap-2 text-[10px] text-white/20">
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
@keyframes registerFloat {
    0%,
    100% {
        transform: translate3d(0, 0, 0) scale(1);
}

    50% {
        transform: translate3d(60px, 45px, 0) scale(1.08);
}
}

@keyframes registerFloatReverse {
    0%,
    100% {
        transform: translate3d(0, 0, 0) scale(1);
}

    50% {
        transform: translate3d(-50px, -45px, 0) scale(1.08);
}
}

@keyframes registerFadeDown {
    from {
        opacity: 0;
        transform: translateY(-12px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes registerHero {
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

@keyframes registerCard {
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

const fieldIconClass = `
pointer-events-none
absolute
left-3
top-1/2
z-10
h-4
w-4
-translate-y-1/2
text-white/25
    `;

/* =========================================================================
   PASSWORD TOGGLE
========================================================================= */

function PasswordToggle({
  visible,
  onClick,
}: {
  visible: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        absolute
        right-2
        top-1/2
        z-10
        flex
        h-8
        w-8
        -translate-y-1/2
        items-center
        justify-center
        rounded-lg
        text-white/30
        transition-all
        hover:bg-white/[0.06]
        hover:text-white/70
      "
      aria-label={
        visible
          ? "Hide password"
          : "Show password"
      }
    >
      {visible ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </button>
  );
}

/* =========================================================================
   REGISTRATION STEP
========================================================================= */

function RegistrationStep({
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
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.055] bg-white/[0.02] p-3.5">
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
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3.5 backdrop-blur-sm">
      <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] text-coral">
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
