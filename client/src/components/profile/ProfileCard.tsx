"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { SkillChip } from "./SkillChip";
import type { Profile } from "@/types/user";
import { Building2, GraduationCap } from "lucide-react";

/**
 * ProfileCard — compact profile card for use in grids, lists, and recommendations.
 * Shows avatar, name, department, skills, and availability status.
 */

interface ProfileCardProps {
  profile: Pick<
    Profile,
    | "fullName"
    | "username"
    | "avatarUrl"
    | "department"
    | "year"
    | "bio"
    | "availabilityStatus"
    | "skills"
  >;
  onClick?: () => void;
  className?: string;
}

export function ProfileCard({ profile, onClick, className }: ProfileCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 border border-border/50 shrink-0">
          <AvatarImage src={profile.avatarUrl || undefined} alt={profile.fullName} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
            {getInitials(profile.fullName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{profile.fullName}</h3>
          <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{profile.department}</span>
            <span className="text-border">·</span>
            <GraduationCap className="h-3 w-3 shrink-0" />
            <span>Year {profile.year}</span>
          </div>
        </div>
      </div>

      {profile.bio && (
        <p className="mt-3 text-xs text-muted-foreground line-clamp-2">
          {profile.bio}
        </p>
      )}

      {profile.skills && profile.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {profile.skills.slice(0, 4).map((us) => (
            <SkillChip key={us.skillId} name={us.skill.name} proficiency={us.proficiency} />
          ))}
          {profile.skills.length > 4 && (
            <span className="inline-flex items-center px-2 py-1 text-xs text-muted-foreground">
              +{profile.skills.length - 4} more
            </span>
          )}
        </div>
      )}

      <div className="mt-3">
        <AvailabilityBadge status={profile.availabilityStatus} />
      </div>
    </motion.div>
  );
}
