"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    motion,
    useMotionTemplate,
    useMotionValue,
    useReducedMotion,
    useSpring,
    type Variants,
} from "framer-motion";
import { ArrowLeft, Compass, Home } from "lucide-react";

const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } },
};

const item: Variants = {
    hidden: { opacity: 0, y: 18 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
};

// left %, top %, size px, delay s, duration s — fixed values so server and client render the same
const DUST = [
    [8, 22, 3, 0, 9], [16, 64, 2, 1.2, 11], [27, 38, 4, 0.6, 13],
    [38, 78, 2, 2, 10], [47, 18, 3, 0.3, 12], [58, 70, 2, 1.6, 9],
    [66, 30, 4, 0.9, 14], [74, 58, 3, 2.4, 10], [83, 20, 2, 0.2, 11],
    [91, 48, 3, 1.4, 13], [12, 84, 3, 2.8, 12], [95, 76, 2, 0.7, 10],
] as const;

const TRAIL =
    "M-20 170 C 150 100, 280 200, 430 140 S 700 70, 840 140 S 1100 200, 1220 120";

function CompassZero({ reduced }: { reduced: boolean }) {
    return (
        <div className="relative h-28 w-28 shrink-0 sm:h-44 sm:w-44">
            <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-full bg-coral/20 blur-2xl"
            />
            <div className="relative h-full w-full rounded-full border border-white/15 bg-white/[0.06] p-2 text-white shadow-2xl backdrop-blur-xl">
                <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
                    <circle
                        cx="60" cy="60" r="56"
                        fill="none" stroke="currentColor"
                        strokeOpacity="0.25" strokeWidth="1.5"
                    />
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

                    <motion.g
                        style={{ originX: 0.5, originY: 0.5 }}
                        initial={false}
                        animate={
                            reduced
                                ? { rotate: 38 }
                                : { rotate: [-120, 400, 300, 352, 318, 336, 330] }
                        }
                        transition={{ duration: 4.5, ease: "easeInOut", delay: 0.4 }}
                    >
                        <polygon points="60,18 67,60 53,60" className="fill-coral" />
                        <polygon points="60,102 67,60 53,60" fill="rgba(255,255,255,0.7)" />
                    </motion.g>

                    <circle
                        cx="60" cy="60" r="4.5"
                        fill="#0b1f2a" stroke="white" strokeOpacity="0.8"
                    />
                </svg>
            </div>
        </div>
    );
}

export function NotFoundView() {
    const reduced = !!useReducedMotion();
    const router = useRouter();
    const pathname = usePathname();

    // Soft spotlight that follows the cursor
    const mx = useMotionValue(50);
    const my = useMotionValue(35);
    const sx = useSpring(mx, { stiffness: 50, damping: 18 });
    const sy = useSpring(my, { stiffness: 50, damping: 18 });
    const spotlight = useMotionTemplate`radial-gradient(520px circle at ${sx}% ${sy}%, rgba(255,127,80,0.16), transparent 65%)`;

    function handleMouseMove(e: React.MouseEvent) {
        if (reduced) return;
        mx.set((e.clientX / window.innerWidth) * 100);
        my.set((e.clientY / window.innerHeight) * 100);
    }

    function goBack() {
        if (window.history.length > 1) router.back();
        else router.push("/");
    }

    return (
        <main
            onMouseMove={handleMouseMove}
            className="relative isolate flex min-h-[100dvh] items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-[#102f3d] to-[#0b4657] px-4 py-16"
        >
            {/* Atmosphere */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-coral/15 blur-3xl" />
                <div className="absolute -bottom-48 -left-32 h-[26rem] w-[26rem] rounded-full bg-orange/10 blur-3xl" />
                <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:48px_48px]" />
                <motion.div className="absolute inset-0" style={{ background: spotlight }} />

                {!reduced &&
                    DUST.map(([left, top, size, delay, duration], i) => (
                        <motion.span
                            key={i}
                            className="absolute rounded-full bg-white/70"
                            style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}
                            animate={{ y: [0, -24, 0], opacity: [0.1, 0.55, 0.1] }}
                            transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
                        />
                    ))}
            </div>

            {/* Winding trail */}
            <svg
                aria-hidden="true"
                viewBox="0 0 1200 220"
                preserveAspectRatio="xMidYMax slice"
                className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 w-full sm:h-56"
            >
                <motion.path
                    d={TRAIL}
                    fill="none"
                    stroke="rgba(255,255,255,0.07)"
                    strokeWidth="18"
                    strokeLinecap="round"
                    initial={reduced ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2.6, ease: "easeInOut", delay: 0.3 }}
                />
                <motion.path
                    d={TRAIL}
                    fill="none"
                    className="stroke-coral"
                    strokeOpacity="0.8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="10 14"
                    initial={reduced ? false : { opacity: 0 }}
                    animate={
                        reduced
                            ? { opacity: 1 }
                            : { opacity: 1, strokeDashoffset: [0, -48] }
                    }
                    transition={{
                        opacity: { duration: 0.8, delay: 1.2 },
                        strokeDashoffset: { duration: 2, repeat: Infinity, ease: "linear" },
                    }}
                />
            </svg>

            {/* Content */}
            <motion.div
                variants={container}
                initial={reduced ? false : "hidden"}
                animate="show"
                className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center text-center"
            >
                <motion.div variants={item}>
                    <Link
                        href="/"
                        aria-label="Kivana Trails and Safaris home"
                        className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-xl ring-1 ring-white/20 transition-transform hover:scale-105"
                    >
                        <Image
                            src="/images/kivana-logo.png"
                            alt="Kivana Trails and Safaris logo"
                            width={56}
                            height={56}
                            priority
                            className="h-full w-full object-contain"
                        />
                    </Link>
                </motion.div>

                <motion.p
                    variants={item}
                    className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-coral"
                >
                    Off the trail
                </motion.p>

                <motion.div
                    variants={item}
                    className="mt-2 flex items-center justify-center gap-1 sm:gap-3"
                    role="img"
                    aria-label="404"
                >
                    <span className="bg-gradient-to-b from-white to-white/15 bg-clip-text font-display text-[7rem] font-bold leading-none tracking-tighter text-transparent sm:text-[11rem]">
                        4
                    </span>
                    <CompassZero reduced={reduced} />
                    <span className="bg-gradient-to-b from-white to-white/15 bg-clip-text font-display text-[7rem] font-bold leading-none tracking-tighter text-transparent sm:text-[11rem]">
                        4
                    </span>
                </motion.div>

                <motion.h1
                    variants={item}
                    className="mt-6 font-display text-2xl font-bold tracking-tight text-white sm:text-4xl"
                >
                    Looks like you&apos;ve wandered off the trail.
                </motion.h1>

                <motion.p
                    variants={item}
                    className="mt-4 max-w-md text-sm leading-7 text-white/60 sm:text-base"
                >
                    The page you&apos;re looking for has moved, been renamed, or never
                    existed. Let&apos;s get you back on the road to somewhere
                    unforgettable.
                </motion.p>

                {pathname && (
                    <motion.code
                        variants={item}
                        className="mt-5 max-w-[85vw] truncate rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 font-mono text-[11px] text-white/50"
                    >
                        {pathname}
                    </motion.code>
                )}

                <motion.div
                    variants={item}
                    className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
                >
                    <Link
                        href="/"
                        className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-coral px-7 text-sm font-semibold text-white shadow-lg shadow-coral/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-coral/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 sm:w-auto"
                    >
                        <Home className="h-4 w-4" />
                        Back to home
                    </Link>

                    <Link
                        href="/tours"
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-7 text-sm font-semibold text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/[0.12] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:w-auto"
                    >
                        <Compass className="h-4 w-4" />
                        Explore tours
                    </Link>
                </motion.div>

                <motion.button
                    variants={item}
                    type="button"
                    onClick={goBack}
                    className="group mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-white/45 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                >
                    <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                    Go back to the previous page
                </motion.button>
            </motion.div>
        </main>
    );
}