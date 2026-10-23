import { Suspense, type ReactNode } from "react";

export function AuthSuspense({ children }: { children: ReactNode }) {
    return <Suspense fallback={<AuthSuspenseFallback />}>{children}</Suspense>;
}

function AuthSuspenseFallback() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#07090a]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,107,87,.12),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(245,132,31,.09),transparent_30%),linear-gradient(135deg,#07090a_0%,#0d0e10_50%,#08090a_100%)]" />

            <div className="relative z-10 flex min-h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-coral" />

                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/30">
                        Loading
                    </p>
                </div>
            </div>
        </div>
    );
}