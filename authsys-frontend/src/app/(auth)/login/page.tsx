"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe2,
  LockKeyhole,
  LogIn,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/auth-layout";
import { GoogleButton } from "@/components/auth/google-button";
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
  loginSchema,
  type LoginFormValues,
} from "@/lib/validations/auth";
import { authApi } from "@/lib/auth-api";
import { ssoApi } from "@/lib/sso-api";
import { TOUR_PORTAL_URL } from "@/lib/portals";
import { useAuthStore } from "@/store/auth-store";
import type { ApiError } from "@/types/auth";
import {
  buildHandoffUrl,
  isSameOriginRedirect,
  isTrustedCrossOriginRedirect,
} from "@/lib/auth-redirect-utils";

/* =========================================================================
   Existing navigation helpers
========================================================================= */

function safeNavigate(path: string) {
  requestAnimationFrame(() => {
    setTimeout(() => {
      window.location.href = path;
    }, 50);
  });
}

interface Destination {
  crossOrigin: boolean;
  path: string;
  portalUrl?: string;
}

function getDefaultDestination(user: any): Destination {
  if (!user) {
    return {
      crossOrigin: false,
      path: "/dashboard",
    };
  }

  const roles: string[] = [];

  if (typeof user.role === "string") {
    roles.push(user.role);
  }

  if (Array.isArray(user.roles)) {
    for (const role of user.roles) {
      if (typeof role === "string") {
        roles.push(role);
      } else if (role?.name) {
        roles.push(role.name);
      } else if (role?.authority) {
        roles.push(role.authority);
      }
    }
  }

  if (Array.isArray(user.authorities)) {
    for (const authority of user.authorities) {
      if (typeof authority === "string") {
        roles.push(authority);
      } else if (authority?.authority) {
        roles.push(authority.authority);
      }
    }
  }

  const normalizedRoles = roles.map((role) =>
    role.replace(/^ROLE_/, "").toUpperCase()
  );

  if (normalizedRoles.includes("USER")) {
    return {
      crossOrigin: true,
      path: "/",
      portalUrl: TOUR_PORTAL_URL,
    };
  }

  return {
    crossOrigin: false,
    path: "/dashboard",
  };
}

async function navigateToDestination(destination: Destination) {
  if (!destination.crossOrigin) {
    safeNavigate(destination.path);
    return;
  }

  try {
    const { code } = await ssoApi.createHandoffCode();

    const url = new URL(
      `${destination.portalUrl}/auth-callback`
);

url.searchParams.set("code", code);
url.searchParams.set("next", destination.path);

window.location.href = url.toString();
} catch {
  toast.error(
      "Couldn't establish a secure session there — please sign in on that portal."
  );

  window.location.href = `${destination.portalUrl}${destination.path}`;
}
}

/* =========================================================================
   Login page
========================================================================= */

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    setTokens,
    setTempToken,
    setUser,
  } = useAuthStore();

  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectParam = searchParams.get("redirect");

  const isAuthenticated = useAuthStore(
      (state) => state.isAuthenticated
  );

  const accessToken = useAuthStore(
      (state) => state.accessToken
  );

  const authenticatedUser = useAuthStore(
      (state) => state.user
  );

  const [hasHydrated, setHasHydrated] = useState(
      () => useAuthStore.persist.hasHydrated()
  );

  /* -----------------------------------------------------------------------
     Hydration
  ----------------------------------------------------------------------- */

  useEffect(() => {
    const unsubscribe =
        useAuthStore.persist.onFinishHydration(() => {
          setHasHydrated(true);
        });

    setHasHydrated(
        useAuthStore.persist.hasHydrated()
    );

    return unsubscribe;
  }, []);

  /* -----------------------------------------------------------------------
     Already authenticated
  ----------------------------------------------------------------------- */

  useEffect(() => {
    if (!hasHydrated) return;

    if (isAuthenticated && accessToken) {
      const destination =
          getDefaultDestination(authenticatedUser);

      navigateToDestination(destination);
    }
  }, [
    hasHydrated,
    isAuthenticated,
    accessToken,
    authenticatedUser,
  ]);

  /* -----------------------------------------------------------------------
     Form
  ----------------------------------------------------------------------- */

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);

    try {
      const res = await authApi.login(values);

      if (res.rateLimited) {
        toast.warning(
            res.message ||
            "Too many attempts. Try again later."
        );

        setIsSubmitting(false);
        return;
      }

      /* First-time login */
      if (res.firstTimeLogin) {
        if (res.temporaryToken) {
          setTempToken(res.temporaryToken);
        }

        toast.info(
            "First-time setup required — set your permanent password."
        );

        router.push("/setup/password");
        return;
      }

      /* OTP */
      if (res.requiresOtp) {
        if (res.temporaryToken) {
          setTempToken(res.temporaryToken);
        }

        toast.info(
            "Verification code sent to your phone."
        );

        router.push("/login/verify");
        return;
      }

      /* Successful login */
      if (res.success && res.accessToken) {
        setTokens({
          accessToken: res.accessToken,
          refreshToken: res.refreshToken ?? "",
        });

        if (res.user) {
          setUser(res.user);
        }

        toast.success("Welcome back");

        /* Explicit redirect */
        if (redirectParam) {
          if (isSameOriginRedirect(redirectParam)) {
            safeNavigate(redirectParam);
            return;
          }

          if (
              isTrustedCrossOriginRedirect(
                  redirectParam
              )
          ) {
            const handoffUrl = buildHandoffUrl(
                redirectParam,
                res.accessToken,
                res.refreshToken ?? ""
            );

            window.location.href = handoffUrl;
            return;
          }
        }

        /* Role based destination */
        const destination =
            getDefaultDestination(res.user);

        await navigateToDestination(destination);
        return;
      }

      if (res.success && !res.accessToken) {
        toast.error(
            "Server returned success but no token. " +
            `Message: ${res.message}`
        );

        setIsSubmitting(false);
        return;
      }

      toast.error(
          res.message ||
          "Sign in failed. Contact your admin."
      );

      setIsSubmitting(false);
    } catch (err) {
      const e = err as ApiError;

      if (e.status === 0) {
        toast.error(
            "Can't reach the server. Make sure authSys is running on port 8001 and CORS allows http://localhost:3000."
        );
      } else {
        toast.error(
            e.message ||
            "Couldn't sign in. Check your details and try again."
        );
      }

      setIsSubmitting(false);
    }
  }

  return (
      <div className="relative min-h-screen overflow-hidden bg-[#07090a]">
        {/* =================================================================
          GLOBAL ATMOSPHERE
      ================================================================= */}

        <div className="pointer-events-none absolute inset-0">
          {/* Main gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,107,87,.12),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(245,132,31,.09),transparent_30%),linear-gradient(135deg,#07090a_0%,#0d0e10_50%,#08090a_100%)]" />

          {/* Grid */}
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

          {/* Coral orb */}
          <div
              className="
            absolute
            -left-48
            -top-48
            h-[500px]
            w-[500px]
            rounded-full
            bg-coral/[0.10]
            blur-[120px]
            animate-[loginFloat_12s_ease-in-out_infinite]
          "
          />

          {/* Orange orb */}
          <div
              className="
            absolute
            -bottom-48
            -right-48
            h-[560px]
            w-[560px]
            rounded-full
            bg-orange/[0.08]
            blur-[130px]
            animate-[loginFloatReverse_15s_ease-in-out_infinite]
          "
          />
        </div>

        {/* =================================================================
          MAIN
      ================================================================= */}

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1500px] items-center px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto grid w-full max-w-[1180px] overflow-hidden rounded-[30px] border border-white/[0.08] bg-white/[0.025] shadow-[0_40px_120px_-35px_rgba(0,0,0,.8)] backdrop-blur-xl lg:grid-cols-[1.05fr_.95fr]">

            {/* =============================================================
              LEFT / BRAND PANEL
          ============================================================= */}

            <section
                className="
              relative
              hidden
              min-h-[720px]
              overflow-hidden
              border-r
              border-white/[0.07]
              lg:flex
            "
            >
              {/* image-like atmosphere */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_35%,rgba(255,107,87,.16),transparent_35%),radial-gradient(circle_at_75%_75%,rgba(255,145,60,.10),transparent_35%)]" />

              {/* Decorative circles */}
              <div className="absolute -left-24 top-20 h-72 w-72 rounded-full border border-white/[0.045]" />
              <div className="absolute -left-16 top-28 h-56 w-56 rounded-full border border-coral/[0.08]" />
              <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full border border-white/[0.04]" />

              <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">

                {/* Brand */}
                <div className="animate-[loginFadeDown_.7s_ease-out_both]">
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

                {/* Hero */}
                <div className="relative max-w-[510px] animate-[loginHero_.9s_cubic-bezier(.16,1,.3,1)_both]">

                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-coral/15 bg-coral/[0.05] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-coral">
                    <Sparkles className="h-3 w-3" />

                    Staff workspace
                  </div>

                  <h1 className="font-display text-4xl font-medium leading-[1.08] tracking-[-0.04em] text-white xl:text-5xl">
                    Every great trail
                    <span className="block text-white/45">
                    starts with the
                  </span>
                    right credentials.
                  </h1>

                  <p className="mt-6 max-w-[450px] text-sm leading-7 text-white/40">
                    Manage tours, coordinate operations,
                    review approvals and keep every
                    expedition moving from one secure
                    workspace.
                  </p>

                  {/* Stats */}
                  <div className="mt-10 grid max-w-[430px] grid-cols-3 gap-3">
                    <FeatureStat
                        icon={<Globe2 className="h-4 w-4" />}
                        value="Global"
                        label="Operations"
                    />

                    <FeatureStat
                        icon={<Users className="h-4 w-4" />}
                        value="Secure"
                        label="Team access"
                    />

                    <FeatureStat
                        icon={<ShieldCheck className="h-4 w-4" />}
                        value="24/7"
                        label="Protection"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-6 text-[10px] text-white/25">
                <span>
                  © {new Date().getFullYear()} Damuchi Safaris
                </span>

                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,.6)]" />
                    Systems operational
                  </div>
                </div>
              </div>
            </section>

            {/* =============================================================
              RIGHT / LOGIN
          ============================================================= */}

            <section className="relative flex min-h-[620px] items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
              {/* subtle top glow */}
              <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-coral/[0.055] blur-[70px]" />

              <div className="relative w-full max-w-[400px] animate-[loginCard_.8s_cubic-bezier(.16,1,.3,1)_both]">

                {/* Mobile brand */}
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

                {/* Heading */}
                <div className="mb-7 text-center lg:text-left">
                  <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-coral">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral" />
                    Staff Portal
                  </div>

                  <h2 className="font-display text-3xl font-medium tracking-[-0.04em] text-white sm:text-[34px]">
                    Welcome back
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/35">
                    Sign in to continue to your secure workspace.
                  </p>
                </div>

                {/* Security badge */}
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/[0.08]">
                    <LockKeyhole className="h-3.5 w-3.5 text-emerald-400/80" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-white/65">
                      Secure sign in
                    </p>

                    <p className="truncate text-[10px] text-white/25">
                      Your session is encrypted and protected.
                    </p>
                  </div>

                  <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-emerald-400/60" />
                </div>

                {/* Google */}
                <div className="login-google">
                  <GoogleButton label="Continue with Google" />
                </div>

                {/* Divider */}
                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/[0.07]" />

                  <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                  or continue with email
                </span>

                  <div className="h-px flex-1 bg-white/[0.07]" />
                </div>

                {/* =========================================================
                  FORM
              ========================================================= */}

                <Form {...form}>
                  <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-5"
                  >
                    {/* Email */}
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
                                  <Input
                                      type="email"
                                      placeholder="you@company.com"
                                      autoComplete="email"
                                      hasError={
                                        !!form.formState.errors.email
                                      }
                                      className="
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
                              "
                                      {...field}
                                  />
                                </div>
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Password */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel className="text-xs font-medium text-white/65">
                                  Password
                                </FormLabel>

                                <Link
                                    href="/forgot-password"
                                    className="
                              text-[11px]
                              font-medium
                              text-coral
                              transition-colors
                              hover:text-coral/80
                            "
                                >
                                  Forgot password?
                                </Link>
                              </div>

                              <FormControl>
                                <div className="relative">
                                  <Input
                                      type={
                                        showPw
                                            ? "text"
                                            : "password"
                                      }
                                      placeholder="••••••••••"
                                      autoComplete="current-password"
                                      hasError={
                                        !!form.formState.errors.password
                                      }
                                      className="
                                h-12
                                rounded-xl
                                border-white/[0.09]
                                bg-white/[0.035]
                                px-4
                                pr-12
                                text-sm
                                text-white
                                placeholder:text-white/20
                                transition-all
                                duration-200
                                hover:border-white/[0.14]
                                focus:border-coral/40
                                focus:ring-2
                                focus:ring-coral/10
                              "
                                      {...field}
                                  />

                                  <button
                                      type="button"
                                      onClick={() =>
                                          setShowPw((value) => !value)
                                      }
                                      className="
                                absolute
                                right-2
                                top-1/2
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
                                        showPw
                                            ? "Hide password"
                                            : "Show password"
                                      }
                                  >
                                    {showPw ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Submit */}
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
                          <LogIn className="h-4 w-4" />
                      )}

                      <span>
                      {isSubmitting
                          ? "Authenticating..."
                          : "Sign in"}
                    </span>

                      {!isSubmitting && (
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      )}
                    </Button>
                  </form>
                </Form>

                {/* Register */}
                <p className="mt-7 text-center text-xs text-white/30">
                  New to the team?{" "}
                  <Link
                      href="/register"
                      className="font-medium text-coral transition-colors hover:text-coral/80"
                  >
                    Request access
                  </Link>
                </p>

                {/* Bottom security */}
                <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-white/20">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Protected by secure authentication
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* =================================================================
          ANIMATIONS
      ================================================================= */}

        <style jsx global>{`
        @keyframes loginFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(60px, 40px, 0) scale(1.08);
          }
        }

        @keyframes loginFloatReverse {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(-50px, -40px, 0) scale(1.08);
          }
        }

        @keyframes loginFadeDown {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes loginHero {
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

        @keyframes loginCard {
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
      </div>
  );
}

/* =========================================================================
   Feature stat
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
