"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { AvailabilityBadge } from "@/components/profile/AvailabilityBadge";
import type { Profile } from "@/types/user";
import { Sparkles } from "lucide-react";

/**
 * WelcomeBanner — gradient hero banner with avatar, greeting, and profile stats.
 * Shown at the top of the dashboard.
 */

interface WelcomeBannerProps {
  profile: Profile;
  className?: string;
}

export function WelcomeBanner({ profile, className }: WelcomeBannerProps) {
  const firstName = profile.fullName.split(" ")[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50",
        "bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600",
        "p-6 sm:p-8",
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
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-white/30 shadow-xl shrink-0">
          <AvatarImage src={profile.avatarUrl || undefined} alt={profile.fullName} />
          <AvatarFallback className="bg-white/20 text-white text-xl sm:text-2xl font-bold">
            {getInitials(profile.fullName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl sm:text-2xl font-bold text-white tracking-tight"
          >
            {greeting}, {firstName}! 👋
          </motion.h1>
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
    </motion.div>
  );
}
