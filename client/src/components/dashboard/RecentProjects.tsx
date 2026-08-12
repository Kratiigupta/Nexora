"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ProjectSummary } from "@/types/dashboard";
import { timeAgo } from "@/lib/utils";
import { FolderKanban, ArrowRight } from "lucide-react";

/**
 * RecentProjects — list of recent projects with status badges.
 */

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  planning: { label: "Planning", variant: "outline" },
  in_progress: { label: "In Progress", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  on_hold: { label: "On Hold", variant: "destructive" },
};

interface RecentProjectsProps {
  projects: ProjectSummary[];
  className?: string;
}

export function RecentProjects({ projects, className }: RecentProjectsProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FolderKanban className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No projects yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Create your first project to get started
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {projects.map((project) => {
        const config = statusConfig[project.status] || statusConfig.planning;

        return (
          <div
            key={project.id}
            className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <FolderKanban className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{project.title}</p>
                <Badge variant={config.variant} className="text-[10px] shrink-0">
                  {config.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {project.team?.name ? `${project.team.name} · ` : ""}
                {timeAgo(project.createdAt)}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        );
      })}
    </div>
  );
}
