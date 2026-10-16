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
 * Respects UTC date-key format and handles user calendar dates cleanly.
 */
export function generateHeatmapGrid(
  data: HeatmapData,
  referenceDate: Date | string = new Date(),
  timeZone?: string
): HeatmapGridResult {
  let today: Date;

  if (typeof referenceDate === "string") {
    // String provided (e.g., YYYY-MM-DD from server or calendar calculation)
    const parts = referenceDate.split("-").map(Number);
    const y = parts[0] ?? 2026;
    const m = parts[1] ?? 1;
    const d = parts[2] ?? 1;
    today = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  } else if (timeZone) {
    try {
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const parts = formatter.format(referenceDate).split("-").map(Number);
      const y = parts[0] ?? 2026;
      const m = parts[1] ?? 1;
      const d = parts[2] ?? 1;
      today = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
    } catch {
      today = new Date(referenceDate);
      today.setUTCHours(0, 0, 0, 0);
    }
  } else {
    // Default UTC midnight calculation (preserves existing behavior)
    today = new Date(referenceDate);
    today.setUTCHours(0, 0, 0, 0);
  }

  const generatedWeeks: Date[][] = [];
  const startDate = new Date(today);
  startDate.setUTCDate(startDate.getUTCDate() - 364);
  startDate.setUTCDate(startDate.getUTCDate() - ((startDate.getUTCDay() + 6) % 7));

  const currentDate = new Date(startDate);
  let currentWeek: Date[] = [];

  while (currentDate <= today) {
    currentWeek.push(new Date(currentDate));
    if (currentWeek.length === 7) {
      generatedWeeks.push(currentWeek);
      currentWeek = [];
    }
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }
  if (currentWeek.length > 0) {
    generatedWeeks.push(currentWeek);
  }

  const total = Object.values(data).reduce((sum, count) => sum + count, 0);

  const labels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  generatedWeeks.forEach((week, weekIndex) => {
    const month = week[0].getUTCMonth();
    if (month !== lastMonth) {
      labels.push({ label: MONTHS[month], weekIndex });
      lastMonth = month;
    }
  });

  return { weeks: generatedWeeks, monthLabels: labels, totalActivities: total };
}
