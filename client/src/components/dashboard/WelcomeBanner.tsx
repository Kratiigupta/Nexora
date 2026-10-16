import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { AvailabilityBadge } from "@/components/profile/AvailabilityBadge";
import type { Profile } from "@/types/user";
import { Sparkles } from "lucide-react";

/**
 * WelcomeBanner — gradient hero banner with avatar, greeting, and profile stats.
 * Optimized with pure GPU-accelerated CSS animations.
 */

import { Star, Flame, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeBannerProps {
  profile: Profile;
  starCount?: number;
  currentStreak?: number;
  longestStreak?: number;
  hasCheckedInToday?: boolean;
  onCheckIn?: () => Promise<void>;
  isCheckingIn?: boolean;
  className?: string;
}

export function WelcomeBanner({
  profile,
  starCount = profile.starCount ?? 0,
  currentStreak = profile.currentStreak ?? 0,
  longestStreak = profile.longestStreak ?? 0,
  hasCheckedInToday = false,
  onCheckIn,
  isCheckingIn = false,
  className,
}: WelcomeBannerProps) {
  const firstName = profile.fullName.split(" ")[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50",
        "bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600",
        "p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-2 duration-500",
        className
      )}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
      <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/10 blur-[80px]" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="absolute top-4 right-8 opacity-20">
        <Sparkles className="h-24 w-24 text-white" />
      </div>

      {/* Content */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-5">
          <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-white/30 shadow-xl shrink-0">
            <AvatarImage src={profile.avatarUrl || undefined} alt={profile.fullName} />
            <AvatarFallback className="bg-white/20 text-white text-xl sm:text-2xl font-bold">
              {getInitials(profile.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight animate-in fade-in slide-in-from-left-2 duration-300">
              {greeting}, {firstName}! 👋
            </h1>
            <p className="text-sm text-white/70 mt-1">
              @{profile.username} · {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </p>
            <div className="mt-3">
              <AvailabilityBadge
                status={profile.availabilityStatus}
                className="bg-white/15 border-white/20 text-white"
              />
            </div>
          </div>
        </div>

        {/* Right side: Star Balance, Streak, and Check-in Action */}
        <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2.5 shrink-0 z-10">
          <div className="flex items-center gap-2">
            {/* Stars pill */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-white font-semibold text-xs shadow-sm"
              title="Your total accumulated stars"
            >
              <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
              <span>{starCount} {starCount === 1 ? "Star" : "Stars"}</span>
            </div>

            {/* Streak pill */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-white font-semibold text-xs shadow-sm"
              title={longestStreak > 0 ? `Current streak: ${currentStreak} days · Longest: ${longestStreak} days` : `Current streak: ${currentStreak} days`}
            >
              <Flame className="h-3.5 w-3.5 text-orange-300 fill-orange-300/40" />
              <span>{currentStreak}-day streak</span>
              {longestStreak > 0 && (
                <span className="text-[10px] text-white/70 font-normal ml-0.5">
                  (Best: {longestStreak}d)
                </span>
              )}
            </div>
          </div>

          {/* Daily check-in button on banner */}
          {onCheckIn && (
            <div className="w-full md:w-auto">
              {hasCheckedInToday ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                  <span>Already checked in today</span>
                </div>
              ) : (
                <Button
                  onClick={onCheckIn}
                  disabled={isCheckingIn}
                  size="sm"
                  className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-semibold text-xs h-8 px-3.5 rounded-xl shadow-lg shadow-black/10 active:scale-95 transition-all"
                >
                  {isCheckingIn ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Checking in...
                    </>
                  ) : (
                    <>
                      <Star className="h-3.5 w-3.5 mr-1.5 fill-amber-950 text-amber-950" />
                      Daily Check-in (+1 ⭐)
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
