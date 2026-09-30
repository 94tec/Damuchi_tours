"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    Loader2,
    ShieldCheck,
    LogOut,
} from "lucide-react";

import { authApi } from "@/lib/auth-api";
import { useAuthStore } from "@/store/auth-store";

import {
    isSameOriginRedirect,
    isTrustedCrossOriginRedirect,
} from "@/lib/auth-redirect-utils";

const STATUS_MESSAGES = [
    "Signing you out...",
    "Clearing secure session...",
    "Redirecting...",
];

export default function LogoutPage() {
    const searchParams = useSearchParams();

    const [status, setStatus] = useState(
        STATUS_MESSAGES[0],
    );

    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;

        const runLogout = async () => {
            try {
                setStatus(STATUS_MESSAGES[0]);

                await authApi.logout();

                if (!mountedRef.current) return;

                setStatus(STATUS_MESSAGES[1]);
            } catch {
                // Never block logout UI on API failure
            }

            try {
                useAuthStore
                    .getState()
                    .clearSession();
            } catch {
                // Ignore local cleanup failures
            }

            if (!mountedRef.current) return;

            setStatus(STATUS_MESSAGES[2]);

            const rawNext =
                searchParams.get("next") || "/";

            let redirectTarget = "/";

            if (
                isSameOriginRedirect(rawNext)
            ) {
                redirectTarget = rawNext;
            } else if (
                isTrustedCrossOriginRedirect(rawNext)
            ) {
                redirectTarget = rawNext;
            }

            setTimeout(() => {
                window.location.replace(
                    redirectTarget,
                );
            }, 700);
        };

        void runLogout();

        return () => {
            mountedRef.current = false;
        };
    }, [searchParams]);

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
            {/* Background */}
            <div className="absolute inset-0">
                <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />

                <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-3xl" />

                <div className="absolute left-0 top-1/3 h-[300px] w-[300px] rounded-full bg-purple-500/10 blur-3xl" />
            </div>

            <motion.div
                initial={{
                    opacity: 0,
                    y: 20,
                    scale: 0.98,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                }}
                transition={{
                    duration: 0.4,
                }}
                className="
                    relative
                    z-10
                    w-full
                    max-w-md
                    px-6
                "
            >
                <div
                    className="
                        rounded-3xl
                        border
                        border-white/10
                        bg-white/5
                        p-8
                        shadow-2xl
                        backdrop-blur-xl
                    "
                >
                    {/* Icon */}
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10">
                        <LogOut className="h-8 w-8 text-orange-400" />
                    </div>

                    {/* Heading */}
                    <h1 className="mt-6 text-center text-2xl font-bold text-white">
                        Signing You Out
                    </h1>

                    <p className="mt-2 text-center text-sm text-white/60">
                        Ending your secure session and
                        clearing local credentials.
                    </p>

                    {/* Status */}
                    <div className="mt-8 flex items-center justify-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-orange-400" />

                        <span className="text-sm font-medium text-white/80">
                            {status}
                        </span>
                    </div>

                    {/* Security Notice */}
                    <div
                        className="
                            mt-8
                            rounded-2xl
                            border
                            border-white/10
                            bg-white/5
                            p-4
                        "
                    >
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-400" />

                            <div>
                                <p className="text-sm font-medium text-white">
                                    Secure Logout
                                </p>

                                <p className="mt-1 text-xs leading-relaxed text-white/60">
                                    Your authentication tokens,
                                    local session data, and
                                    active credentials are
                                    being cleared before
                                    redirecting.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-6">
                        <div className="h-1 overflow-hidden rounded-full bg-white/10">
                            <motion.div
                                initial={{
                                    width: "0%",
                                }}
                                animate={{
                                    width: "100%",
                                }}
                                transition={{
                                    duration: 1.2,
                                    ease: "easeOut",
                                }}
                                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </main>
    );
}