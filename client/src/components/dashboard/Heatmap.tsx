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
  referenceDate?: Date | string;
  timeZone?: string;
}

export function Heatmap({ data, className, referenceDate, timeZone }: HeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    count: number;
    formattedDate: string;
    x: number;
    y: number;
  } | null>(null);

  // Memoize date grid and month labels — avoids recalculating ~365 dates on every hover
  const { weeks, monthLabels, totalActivities } = useMemo(() => {
    return generateHeatmapGrid(data, referenceDate, timeZone);
  }, [data, referenceDate, timeZone]);

  // Filter month labels to avoid visual collisions when two months begin within 2 weeks of each other
  const visibleMonthLabels = useMemo(() => {
    return monthLabels.filter((item, index) => {
      const next = monthLabels[index + 1];
      if (next && next.weekIndex - item.weekIndex < 3) {
        return false;
      }
      if (weeks.length - item.weekIndex < 2) {
        return false;
      }
      return true;
    });
  }, [monthLabels, weeks.length]);

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

      <div className="overflow-x-auto pb-1">
        <div className="inline-flex flex-col gap-1 min-w-fit">
          {/* Month labels — absolute aligned above week columns (28px left margin matches day labels) */}
          <div className="relative h-4 ml-[28px] pointer-events-none select-none">
            {visibleMonthLabels.map(({ label, weekIndex }) => (
              <span
                key={`${label}-${weekIndex}`}
                className="absolute text-[10px] text-muted-foreground font-medium leading-none whitespace-nowrap"
                style={{
                  left: `${weekIndex * 12}px`,
                }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Grid: Day labels + Weeks */}
          <div className="flex">
            {/* Day labels (width: 24px + 4px margin = 28px) */}
            <div className="flex flex-col gap-px mr-1 pt-0 w-6 flex-shrink-0 select-none">
              {DAYS.map((day, i) => (
                <div key={i} className="h-[11px] text-[10px] text-muted-foreground leading-[11px] text-right pr-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex gap-px">
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
                      timeZone: "UTC",
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
                          "h-[11px] w-[11px] rounded-[2px] transition-all cursor-pointer hover:ring-1 hover:ring-foreground/50 hover:scale-125 hover:z-10 focus-visible:ring-1 focus-visible:ring-primary focus:outline-none",
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
