"use client";

import { Flame, Star, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DailyCheckinCardProps {
  starCount: number;
  currentStreak: number;
  longestStreak: number;
  hasCheckedInToday: boolean;
  isCheckingIn: boolean;
  onCheckIn: () => Promise<void>;
  className?: string;
}

export function DailyCheckinCard({
  starCount,
  currentStreak,
  longestStreak,
  hasCheckedInToday,
  isCheckingIn,
  onCheckIn,
  className,
}: DailyCheckinCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all",
        className
      )}
    >
      {/* Background ambient gradient glow */}
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-violet-500/10 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Daily Check-in</h3>
            <p className="text-[11px] text-muted-foreground">Earn +1 star every day</p>
          </div>
        </div>

        {/* Current Star Balance Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-600 dark:text-amber-400 font-semibold text-xs shadow-xs">
          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
          <span id="dashboard-star-balance">{starCount} {starCount === 1 ? "Star" : "Stars"}</span>
        </div>
      </div>

      {/* Body: Streak and Status */}
      <div className="my-4 grid grid-cols-2 gap-3">
        {/* Current streak */}
        <div className="flex flex-col p-3 rounded-lg bg-muted/40 border border-border/40">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500/30" />
            <span>Login Streak</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span id="dashboard-current-streak" className="text-xl font-bold text-foreground">
              {currentStreak}
            </span>
            <span className="text-xs text-muted-foreground">
              {currentStreak === 1 ? "day" : "days"}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5">
            🔥 {currentStreak > 0 ? "Active streak" : "Check in to start"}
          </span>
        </div>

        {/* Longest streak */}
        <div className="flex flex-col p-3 rounded-lg bg-muted/40 border border-border/40">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            <span>Longest Streak</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span id="dashboard-longest-streak" className="text-xl font-bold text-foreground">
              {longestStreak}
            </span>
            <span className="text-xs text-muted-foreground">
              {longestStreak === 1 ? "day" : "days"}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5">
            🏆 Personal record
          </span>
        </div>
      </div>

      {/* Action Button & Status message */}
      <div className="space-y-2">
        {hasCheckedInToday ? (
          <Button
            id="daily-checkin-btn"
            disabled
            variant="outline"
            className="w-full bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-not-allowed font-medium text-xs h-9"
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-500" />
            Already checked in today
          </Button>
        ) : (
          <Button
            id="daily-checkin-btn"
            onClick={onCheckIn}
            disabled={isCheckingIn}
            className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-xs h-9 shadow-md shadow-amber-500/20 active:scale-[0.98] transition-transform"
          >
            {isCheckingIn ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Checking in...
              </>
            ) : (
              <>
                <Star className="h-3.5 w-3.5 mr-1.5 fill-white text-white" />
                Daily Check-in (+1 Star)
              </>
            )}
          </Button>
        )}

        <p className="text-[11px] text-center text-muted-foreground">
          {hasCheckedInToday
            ? "Great job! Next check-in eligible tomorrow."
            : "Click to claim today's star and light up your heatmap!"}
        </p>
      </div>
    </div>
  );
}
