"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { AvailabilityBadge } from "./AvailabilityBadge";
import type { Profile, PublicProfile } from "@/types/user";
import { Building2, GraduationCap, School, Calendar } from "lucide-react";

/**
 * ProfileHeader — full-width profile header with gradient cover, avatar, and stats.
 * Used on profile and public profile pages.
 */

interface ProfileHeaderProps {
  profile: Profile | PublicProfile;
  stats?: { projects: number; teams: number; connections: number };
  actions?: React.ReactNode;
  className?: string;
}

export function ProfileHeader({
  profile,
  stats,
  actions,
  className,
}: ProfileHeaderProps) {
  // Use stats from PublicProfile if available
  const displayStats =
    stats || ("stats" in profile ? (profile as PublicProfile).stats : undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("relative overflow-hidden rounded-2xl border border-border/50", className)}
    >
      {/* Gradient cover */}
      <div className="h-32 sm:h-40 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
        <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -top-4 -left-4 h-32 w-32 rounded-full bg-purple-400/20 blur-3xl" />
      </div>

      {/* Profile info */}
      <div className="relative px-6 pb-6 bg-card">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
          {/* Avatar */}
          <Avatar className="h-24 w-24 border-4 border-card shadow-xl shrink-0">
            <AvatarImage src={profile.avatarUrl || undefined} alt={profile.fullName} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {getInitials(profile.fullName)}
            </AvatarFallback>
          </Avatar>

          {/* Name & meta */}
          <div className="flex-1 min-w-0 pt-2 sm:pt-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                  {profile.fullName}
                </h1>
                <p className="text-sm text-muted-foreground">
                  @{profile.username} ·{" "}
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </p>
              </div>
              <div className="sm:ml-auto flex items-center gap-2 shrink-0">
                <AvailabilityBadge status={profile.availabilityStatus} size="md" />
              </div>
            </div>
          </div>
        </div>

        {/* Details row */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="h-4 w-4" />
            {profile.department}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4" />
            Year {profile.year}
          </span>
          {profile.college && (
            <span className="inline-flex items-center gap-1.5">
              <School className="h-4 w-4" />
              {profile.college}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </span>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-4 text-sm leading-relaxed max-w-2xl">
            {profile.bio}
          </p>
        )}

        {/* Stats + Actions */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {displayStats && (
            <div className="flex gap-6">
              <StatItem label="Projects" value={displayStats.projects} />
              <StatItem label="Teams" value={displayStats.teams} />
              <StatItem label="Connections" value={displayStats.connections} />
            </div>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </motion.div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
