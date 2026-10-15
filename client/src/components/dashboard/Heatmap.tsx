"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { HeatmapData } from "@/types/dashboard";

/**
 * Heatmap — GitHub-style activity heatmap showing daily activity over the past year.
 * Optimized with a single shared tooltip and lightweight DOM rendering.
 */

import {
  DAYS,
  MONTHS,
  getColor,
  generateHeatmapGrid,
  type HeatmapGridResult,
} from "@/lib/heatmap";

export { DAYS, MONTHS, getColor, generateHeatmapGrid, type HeatmapGridResult };

interface HeatmapProps {
  data: HeatmapData;
  className?: string;
}

export function Heatmap({ data, className }: HeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    count: number;
    formattedDate: string;
    x: number;
    y: number;
  } | null>(null);

  // Memoize date grid and month labels — avoids recalculating ~365 dates on every hover
  const { weeks, monthLabels, totalActivities } = useMemo(() => {
    return generateHeatmapGrid(data);
  }, [data]);

  return (
    <div className={cn("space-y-2 relative", className)}>
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
                  const formattedDate = date.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={dateStr}
                      role="gridcell"
                      tabIndex={0}
                      aria-label={`${count} ${count === 1 ? "activity" : "activities"} on ${formattedDate}`}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredCell({
                          count,
                          formattedDate,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                      onFocus={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredCell({
                          count,
                          formattedDate,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }}
                      onBlur={() => setHoveredCell(null)}
                      title={`${count} ${count === 1 ? "activity" : "activities"} on ${formattedDate}`}
                      className={cn(
                        "h-[11px] w-[11px] rounded-[2px] transition-colors cursor-pointer hover:ring-1 hover:ring-foreground/50 focus-visible:ring-1 focus-visible:ring-primary focus:outline-none",
                        getColor(count)
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Single floating shared tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full mb-2 px-2.5 py-1 rounded bg-popover text-popover-foreground border shadow-md text-xs animate-in fade-in-50 zoom-in-95 duration-100"
          style={{
            left: `${hoveredCell.x}px`,
            top: `${hoveredCell.y - 6}px`,
          }}
        >
          <p className="font-semibold text-[11px] leading-tight">
            {hoveredCell.count} {hoveredCell.count === 1 ? "activity" : "activities"}
          </p>
          <p className="text-[10px] text-muted-foreground leading-tight">
            {hoveredCell.formattedDate}
          </p>
        </div>
      )}
    </div>
  );
}
