"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    ArrowLeft,
    ArrowRight,
    LayoutDashboard,
    LogIn,
    MapPin,
    Briefcase,
    ShieldCheck,
} from "lucide-react";

import { useAuthStore } from "@/store/auth-store";
import {
    getRoles,
    getDefaultDestination,
    navigateToDestination,
} from "@/lib/auth/destination";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"];

const primaryClass =
    "group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-coral px-6 text-sm font-semibold text-white shadow-[0_12px_35px_-12px_rgba(255,107,87,.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_-12px_rgba(255,107,87,.65)] active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0e10]";

export function NotFoundView() {
    const router = useRouter();
    const pathname = usePathname();

    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const accessToken = useAuthStore((s) => s.accessToken);
    const user = useAuthStore((s) => s.user);

    // The session lives in sessionStorage, so wait for hydration before deciding
    // which button to show (avoids a flash of "Sign in" for signed-in staff).
    const [ready, setReady] = useState(false);
    useEffect(() => {
        if (useAuthStore.persist.hasHydrated()) {
            setReady(true);
            return;
        }
        return useAuthStore.persist.onFinishHydration(() => setReady(true));
    }, []);

    const signedIn = ready && isAuthenticated && !!accessToken;
    const isAdmin =
        signedIn && getRoles(user, accessToken).some((r) => ADMIN_ROLES.includes(r));

    function goBack() {
        if (window.history.length > 1) router.back();
        else router.push(isAdmin ? "/dashboard" : "/login");
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07090a] px-4 py-10 text-white">
            {/* Atmosphere (same language as the login page) */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,107,87,.12),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(245,132,31,.09),transparent_30%),linear-gradient(135deg,#07090a_0%,#0d0e10_50%,#08090a_100%)]" />
                <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />
                <div className="absolute -left-48 -top-48 h-[500px] w-[500px] animate-[nfFloat_12s_ease-in-out_infinite] rounded-full bg-coral/[0.10] blur-[120px]" />
                <div className="absolute -bottom-48 -right-48 h-[560px] w-[560px] animate-[nfFloatReverse_15s_ease-in-out_infinite] rounded-full bg-orange/[0.08] blur-[130px]" />
            </div>

            <div className="relative z-10 w-full max-w-[520px]">
                {/* Brand */}
                <div className="mb-7 flex animate-[nfFadeDown_.7s_ease-out_both] items-center justify-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-coral/20 bg-coral/[0.08] shadow-[0_10px_35px_-12px_rgba(255,107,87,.5)]">
                        <MapPin className="h-5 w-5 text-coral" />
                    </div>
                    <div>
                        <p className="font-display text-lg font-semibold tracking-tight text-white">
                            Kivana Trails &amp; Safaris
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                            Operations Platform
                        </p>
                    </div>
                </div>

                {/* Card */}
                <div className="animate-[nfCard_.8s_cubic-bezier(.16,1,.3,1)_both] overflow-hidden rounded-[30px] border border-white/[0.08] bg-white/[0.025] shadow-[0_40px_120px_-35px_rgba(0,0,0,.8)] backdrop-blur-xl">
                    <div className="px-7 pb-9 pt-10 text-center sm:px-10">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-coral/15 bg-coral/[0.05] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-coral">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral" />
                            Error 404
                        </div>

                        {/* 4 [compass] 4 */}
                        <div
                            role="img"
                            aria-label="404"
                            className="flex items-center justify-center gap-1 sm:gap-2"
                        >
              <span className="bg-gradient-to-b from-white to-white/15 bg-clip-text font-display text-[5.5rem] font-bold leading-none tracking-tighter text-transparent sm:text-[7.5rem]">
                4
              </span>

                            <div className="relative h-20 w-20 shrink-0 sm:h-28 sm:w-28">
                                <div className="absolute -inset-3 rounded-full bg-coral/20 blur-2xl" />
                                <div className="relative h-full w-full rounded-full border border-white/15 bg-white/[0.06] p-1.5 shadow-2xl backdrop-blur-xl">
                                    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
                                        <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
                                        {Array.from({ length: 36 }).map((_, i) => (
                                            <line
                                                key={i}
                                                x1="60" y1="6" x2="60" y2={i % 9 === 0 ? 16 : 11}
                                                stroke="currentColor"
                                                strokeOpacity={i % 9 === 0 ? 0.8 : 0.3}
                                                strokeWidth={i % 9 === 0 ? 2 : 1}
                                                transform={`rotate(${i * 10} 60 60)`}
                                            />
                                        ))}
                                        <g className="nf-needle">
                                            <polygon points="60,18 67,60 53,60" className="fill-coral" />
                                            <polygon points="60,102 67,60 53,60" fill="rgba(255,255,255,0.7)" />
                                        </g>
                                        <circle cx="60" cy="60" r="4.5" fill="#0b1f2a" stroke="white" strokeOpacity="0.8" />
                                    </svg>
                                </div>
                            </div>

                            <span className="bg-gradient-to-b from-white to-white/15 bg-clip-text font-display text-[5.5rem] font-bold leading-none tracking-tighter text-transparent sm:text-[7.5rem]">
                4
              </span>
                        </div>

                        <h1 className="mt-6 font-display text-2xl font-medium tracking-[-0.03em] text-white sm:text-[30px]">
                            This route doesn&apos;t exist
                        </h1>

                        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/40">
                            The page may have moved, been renamed, or you may not have access to
                            it. Check the address, or head back to your workspace.
                        </p>

                        {pathname && (
                            <code className="mx-auto mt-5 block max-w-full truncate rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 font-mono text-[11px] text-white/45">
                                {pathname}
                            </code>
                        )}

                        {/* Actions */}
                        <div className="mt-8 flex flex-col gap-3">
                            {!ready ? (
                                <div className="h-12" aria-hidden="true" />
                            ) : isAdmin ? (
                                <Link href="/dashboard" className={primaryClass}>
                                    <LayoutDashboard className="h-4 w-4" />
                                    Back to dashboard
                                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </Link>
                            ) : signedIn ? (
                                <button
                                    type="button"
                                    onClick={() => void navigateToDestination(getDefaultDestination(user, accessToken))}
                                    className={primaryClass}
                                >
                                    <Briefcase className="h-4 w-4" />
                                    Go to my workspace
                                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </button>
                            ) : (
                                <Link href="/login" className={primaryClass}>
                                    <LogIn className="h-4 w-4" />
                                    Sign in
                                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </Link>
                            )}

                            <button
                                type="button"
                                onClick={goBack}
                                className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-medium text-white/40 transition-colors hover:bg-white/[0.03] hover:text-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                            >
                                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                                Go back to the previous page
                            </button>
                        </div>
                    </div>

                    {/* Footer strip */}
                    <div className="flex items-center justify-between gap-4 border-t border-white/[0.06] bg-white/[0.018] px-7 py-4 sm:px-10">
                        <div className="flex items-center gap-2 text-[11px] text-white/30">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400/70" />
                            Protected workspace
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-white/25">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            Route not found
                        </div>
                    </div>
                </div>

                <p className="mt-6 text-center text-[10px] text-white/20">
                    © {new Date().getFullYear()} Kivana Trails &amp; Safaris
                </p>
            </div>

            <style jsx global>{`
        @keyframes nfFloat {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(60px, 40px, 0) scale(1.08); }
        }
        @keyframes nfFloatReverse {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-50px, -40px, 0) scale(1.08); }
        }
        @keyframes nfFadeDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes nfCard {
          from { opacity: 0; transform: translateY(20px) scale(0.985); filter: blur(7px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        /* Needle swings, then settles off-course */
        @keyframes nfNeedle {
          0%   { transform: rotate(-120deg); }
          45%  { transform: rotate(400deg); }
          62%  { transform: rotate(300deg); }
          76%  { transform: rotate(352deg); }
          88%  { transform: rotate(318deg); }
          100% { transform: rotate(330deg); }
        }
        .nf-needle {
          transform-origin: 60px 60px;
          animation: nfNeedle 4.5s ease-in-out 0.4s both;
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          .nf-needle { transform: rotate(330deg); animation: none; }
        }
      `}</style>
        </main>
    );
}