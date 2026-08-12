"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * SkillChip — displays a skill tag with proficiency color indicator.
 * Reusable across profile pages, cards, and editors.
 */

const proficiencyColors: Record<string, string> = {
  beginner: "bg-emerald-500",
  intermediate: "bg-blue-500",
  advanced: "bg-violet-500",
  expert: "bg-amber-500",
};

const proficiencyLabels: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

interface SkillChipProps {
  name: string;
  proficiency?: string;
  onRemove?: () => void;
  size?: "sm" | "md";
  className?: string;
}

export function SkillChip({
  name,
  proficiency,
  onRemove,
  size = "sm",
  className,
}: SkillChipProps) {
  const chip = (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1.5 font-medium transition-all hover:bg-secondary/80",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
        onRemove && "pr-1.5 cursor-default",
        className
      )}
    >
      {proficiency && (
        <span
          className={cn(
            "h-2 w-2 rounded-full shrink-0",
            proficiencyColors[proficiency] || "bg-muted-foreground"
          )}
          aria-hidden="true"
        />
      )}
      {name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive transition-colors"
          aria-label={`Remove ${name}`}
          type="button"
        >
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </button>
      )}
    </Badge>
  );

  if (proficiency) {
    return (
      <Tooltip>
        <TooltipTrigger className="cursor-default">{chip}</TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{proficiencyLabels[proficiency] || proficiency}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return chip;
}
