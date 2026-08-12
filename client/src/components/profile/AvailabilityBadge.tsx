"use client";

import { cn } from "@/lib/utils";
import type { AvailabilityStatus } from "@/types/user";
import { CheckCircle2, Search, UserPlus, XCircle } from "lucide-react";

/**
 * AvailabilityBadge — displays user's availability status with icon and color.
 * Reusable across profile cards, headers, and public profiles.
 */

const statusConfig: Record<
  AvailabilityStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  available_for_team: {
    label: "Available for Team",
    icon: CheckCircle2,
    className:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  looking_for_project: {
    label: "Looking for Project",
    icon: Search,
    className:
      "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  hiring: {
    label: "Hiring",
    icon: UserPlus,
    className:
      "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20",
  },
  not_available: {
    label: "Not Available",
    icon: XCircle,
    className:
      "text-muted-foreground bg-muted/50 border-muted-foreground/20",
  },
};

interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
  size?: "sm" | "md";
  className?: string;
}

export function AvailabilityBadge({
  status,
  size = "sm",
  className,
}: AvailabilityBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
        config.className,
        className
      )}
    >
      <Icon className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      {config.label}
    </span>
  );
}
