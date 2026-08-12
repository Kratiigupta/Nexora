"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * ProfileSkeleton — loading skeleton matching the profile page layout.
 */

export function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6 animate-in fade-in duration-300", className)}>
      {/* Header skeleton */}
      <div className="rounded-2xl border border-border/50 overflow-hidden">
        <Skeleton className="h-32 sm:h-40 w-full" />
        <div className="px-6 pb-6 bg-card">
          <div className="flex items-end gap-4 -mt-12">
            <Skeleton className="h-24 w-24 rounded-full border-4 border-card shrink-0" />
            <div className="flex-1 space-y-2 pt-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="mt-4 h-12 w-full max-w-lg" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Skills */}
          <div className="rounded-xl border border-border/50 bg-card/80 p-6">
            <Skeleton className="h-5 w-20 mb-4" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-20 rounded-full" />
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="rounded-xl border border-border/50 bg-card/80 p-6">
            <Skeleton className="h-5 w-16 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Portfolio */}
          <div className="rounded-xl border border-border/50 bg-card/80 p-6">
            <Skeleton className="h-5 w-24 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>

          {/* Completion */}
          <div className="rounded-xl border border-border/50 bg-card/80 p-6">
            <Skeleton className="h-20 w-20 rounded-full mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto mt-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * DashboardSkeleton — loading skeleton matching the dashboard layout.
 */
export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6 animate-in fade-in duration-300", className)}>
      {/* Welcome banner */}
      <Skeleton className="h-32 w-full rounded-2xl" />

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
