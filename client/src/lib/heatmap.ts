import type { HeatmapData } from "@/types/dashboard";

export const DAYS = ["Mon", "", "Wed", "", "Fri", "", ""];
export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const getColor = (count: number): string => {
  if (count === 0) return "bg-muted/50";
  if (count <= 2) return "bg-emerald-500/30 dark:bg-emerald-500/20";
  if (count <= 4) return "bg-emerald-500/50 dark:bg-emerald-500/40";
  if (count <= 6) return "bg-emerald-500/70 dark:bg-emerald-500/60";
  return "bg-emerald-500 dark:bg-emerald-500/80";
};

export interface HeatmapGridResult {
  weeks: Date[][];
  monthLabels: { label: string; weekIndex: number }[];
  totalActivities: number;
}

/**
 * Pure function to calculate a 53-week rolling activity grid and month labels.
 */
export function generateHeatmapGrid(
  data: HeatmapData,
  referenceDate: Date = new Date()
): HeatmapGridResult {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const generatedWeeks: Date[][] = [];
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);
  startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7));

  const currentDate = new Date(startDate);
  let currentWeek: Date[] = [];

  while (currentDate <= today) {
    currentWeek.push(new Date(currentDate));
    if (currentWeek.length === 7) {
      generatedWeeks.push(currentWeek);
      currentWeek = [];
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  if (currentWeek.length > 0) {
    generatedWeeks.push(currentWeek);
  }

  const total = Object.values(data).reduce((sum, count) => sum + count, 0);

  const labels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  generatedWeeks.forEach((week, weekIndex) => {
    const month = week[0].getMonth();
    if (month !== lastMonth) {
      labels.push({ label: MONTHS[month], weekIndex });
      lastMonth = month;
    }
  });

  return { weeks: generatedWeeks, monthLabels: labels, totalActivities: total };
}
