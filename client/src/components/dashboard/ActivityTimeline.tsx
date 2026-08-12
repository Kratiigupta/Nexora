"use client";

import { cn } from "@/lib/utils";
import type { ActivityLogEntry } from "@/types/dashboard";
import { timeAgo } from "@/lib/utils";
import {
  Plus,
  Minus,
  Users,
  FolderKanban,
  CheckCircle2,
  Handshake,
  GraduationCap,
  Edit,
  Activity,
} from "lucide-react";

/**
 * ActivityTimeline — vertical timeline of recent user activities.
 */

const actionIcons: Record<string, typeof Activity> = {
  profile_updated: Edit,
  skill_added: Plus,
  skill_removed: Minus,
  team_joined: Users,
  team_created: Users,
  project_created: FolderKanban,
  project_updated: FolderKanban,
  task_completed: CheckCircle2,
  connection_made: Handshake,
  session_completed: GraduationCap,
};

const actionLabels: Record<string, string> = {
  profile_updated: "Updated profile",
  skill_added: "Added a skill",
  skill_removed: "Removed a skill",
  team_joined: "Joined a team",
  team_created: "Created a team",
  project_created: "Created a project",
  project_updated: "Updated a project",
  task_completed: "Completed a task",
  connection_made: "Made a connection",
  session_completed: "Completed a session",
};

interface ActivityTimelineProps {
  activities: ActivityLogEntry[];
  className?: string;
}

export function ActivityTimeline({
  activities,
  className,
}: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Activity className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No activity yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Your activity will appear here
        </p>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Timeline line */}
      <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = actionIcons[activity.action] || Activity;
          const label =
            activity.description ||
            actionLabels[activity.action] ||
            activity.action;

          return (
            <div key={activity.id} className="relative flex gap-3 pl-0">
              {/* Timeline dot */}
              <div
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 shrink-0",
                  index === 0
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>

              {/* Content */}
              <div className="flex-1 pb-1 pt-1">
                <p className="text-sm">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {timeAgo(activity.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
