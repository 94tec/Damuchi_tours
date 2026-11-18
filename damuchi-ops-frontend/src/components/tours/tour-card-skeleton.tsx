import { Skeleton } from "@/components/ui/skeleton";

export function TourCardSkeleton() {
    return (
        <article
            aria-hidden="true"
            className="
                flex h-full min-w-0 flex-col overflow-hidden rounded-2xl
                border border-border/70 bg-card shadow-sm sm:rounded-3xl
            "
        >
            {/* Image */}
            <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[16/9]">
                <Skeleton className="h-full w-full rounded-none" />

                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3 sm:p-4">
                    <Skeleton className="h-6 w-24 rounded-full bg-white/20 sm:h-7" />
                    <Skeleton className="h-6 w-14 shrink-0 rounded-full bg-white/20 sm:h-7 sm:w-16" />
                </div>
            </div>

            {/* Body */}
            <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6">
                {/* Destination */}
                <Skeleton className="h-3.5 w-32 max-w-full" />

                {/* Title — same reserved height as the real card */}
                <div className="mt-2 min-h-[3rem] space-y-2 sm:mt-2.5 sm:min-h-[3.5rem]">
                    <Skeleton className="h-5 w-[92%]" />
                    <Skeleton className="h-5 w-[68%]" />
                </div>

                {/* Description */}
                <div className="mt-2 min-h-[3rem] space-y-2 sm:mt-2.5">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-[82%]" />
                </div>

                {/* Metadata */}
                <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>

                <div className="my-4 h-px bg-border/60 sm:my-5" />

                {/* Footer — wraps exactly like the real card */}
                <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-3">
                    <div className="min-w-0 space-y-2">
                        <Skeleton className="h-2.5 w-10" />
                        <Skeleton className="h-6 w-28 sm:h-7 sm:w-32" />
                        <Skeleton className="h-2.5 w-20" />
                    </div>

                    <div className="flex grow basis-36 items-center justify-end gap-2">
                        <Skeleton className="h-9 w-20 rounded-full" />
                        <Skeleton className="h-9 w-9 shrink-0 rounded-full sm:w-24" />
                    </div>
                </div>
            </div>
        </article>
    );
}