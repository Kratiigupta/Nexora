"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { HeatmapData } from "@/types/dashboard";

/**
 * Heatmap — GitHub-style activity heatmap showing daily activity over the past year.
 * Each cell represents one day, colored by activity count.
 */

interface HeatmapProps {
  data: HeatmapData;
  className?: string;
}

const DAYS = ["Mon", "", "Wed", "", "Fri", "", ""];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const getColor = (count: number): string => {
  if (count === 0) return "bg-muted/50";
  if (count <= 2) return "bg-emerald-500/30 dark:bg-emerald-500/20";
  if (count <= 4) return "bg-emerald-500/50 dark:bg-emerald-500/40";
  if (count <= 6) return "bg-emerald-500/70 dark:bg-emerald-500/60";
  return "bg-emerald-500 dark:bg-emerald-500/80";
};

export function Heatmap({ data, className }: HeatmapProps) {
  // Generate last 52 weeks of dates
  const today = new Date();
  const weeks: Date[][] = [];
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);
  // Align to Monday
  startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7));

  const currentDate = new Date(startDate);
  let currentWeek: Date[] = [];

  while (currentDate <= today) {
    currentWeek.push(new Date(currentDate));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Calculate total activities
  const totalActivities = Object.values(data).reduce((sum, count) => sum + count, 0);

  // Get month labels
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIndex) => {
    const month = week[0].getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ label: MONTHS[month], weekIndex });
      lastMonth = month;
    }
  });

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span>{totalActivities} activities in the last year</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          {[0, 1, 3, 5, 7].map((level) => (
            <div
              key={level}
              className={cn("h-2.5 w-2.5 rounded-[2px]", getColor(level))}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-0.5 min-w-fit">
          {/* Month labels */}
          <div className="flex ml-8 mb-1">
            {monthLabels.map(({ label, weekIndex }) => (
              <div
                key={`${label}-${weekIndex}`}
                className="text-[10px] text-muted-foreground"
                style={{
                  position: "relative",
                  left: `${weekIndex * 13}px`,
                  width: "26px",
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-px">
            {/* Day labels */}
            <div className="flex flex-col gap-px mr-1 pt-0">
              {DAYS.map((day, i) => (
                <div key={i} className="h-[11px] w-6 text-[10px] text-muted-foreground leading-[11px] text-right pr-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-px">
                {week.map((date) => {
                  const dateStr = date.toISOString().split("T")[0];
                  const count = data[dateStr] || 0;

                  return (
                    <Tooltip key={dateStr}>
                      <TooltipTrigger
                        className={cn(
                          "h-[11px] w-[11px] rounded-[2px] transition-colors",
                          getColor(count)
                        )}
                      />
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-medium">
                          {count} {count === 1 ? "activity" : "activities"}
                        </p>
                        <p className="text-muted-foreground">
                          {date.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
