/**
 * Date and Timezone Utilities for Nexora
 * Ensures consistent calendar-date calculation across backend aggregation,
 * daily check-ins, login streaks, and heatmap data.
 */

/**
 * Validates and resolves an IANA timezone identifier.
 * Falls back to "UTC" if undefined, null, invalid, or unsupported.
 */
export function resolveTimezone(timeZone?: string | null): string {
  if (!timeZone || typeof timeZone !== "string") {
    return "UTC";
  }
  const trimmed = timeZone.trim();
  if (!trimmed) {
    return "UTC";
  }
  try {
    // Validate by attempting to format with the timezone
    new Intl.DateTimeFormat(undefined, { timeZone: trimmed });
    return trimmed;
  } catch {
    return "UTC";
  }
}

/**
 * Converts a Date (or timestamp / date string) into a calendar date string (YYYY-MM-DD)
 * in the specified timezone.
 *
 * Defaults to current timestamp and "UTC" timezone.
 */
export function getCalendarDate(
  dateInput: Date | string | number = new Date(),
  timeZone: string = "UTC"
): string {
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split("T")[0]!;
    }
    const resolvedTz = resolveTimezone(timeZone);
    // Use en-CA locale which outputs YYYY-MM-DD format
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: resolvedTz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date);
  } catch {
    const fallbackDate = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return fallbackDate.toISOString().split("T")[0]!;
  }
}

/**
 * Calculates the integer difference in calendar days between two YYYY-MM-DD date strings.
 * Result = (dateStr2 - dateStr1) in calendar days.
 *
 * Example:
 * getDayDifference("2026-10-15", "2026-10-16") === 1  (consecutive next day)
 * getDayDifference("2026-10-16", "2026-10-16") === 0  (same day)
 * getDayDifference("2026-10-14", "2026-10-16") === 2  (missed a day)
 */
export function getDayDifference(dateStr1: string, dateStr2: string): number {
  const [y1, m1, d1] = dateStr1.split("-").map(Number);
  const [y2, m2, d2] = dateStr2.split("-").map(Number);

  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) {
    throw new Error(`Invalid date string provided: ${dateStr1} or ${dateStr2}`);
  }

  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  const msPerDay = 24 * 60 * 60 * 1000;

  return Math.round((utc2 - utc1) / msPerDay);
}

/**
 * Returns the calendar date string (YYYY-MM-DD) for the day before the given date string.
 */
export function getPreviousDate(dateStr: string): string {
  const parts = dateStr.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (y === undefined || m === undefined || d === undefined || isNaN(y) || isNaN(m) || isNaN(d)) {
    throw new Error(`Invalid date string: ${dateStr}`);
  }
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().split("T")[0]!;
}

/**
 * Returns the calendar date string (YYYY-MM-DD) for the day after the given date string.
 */
export function getNextDate(dateStr: string): string {
  const parts = dateStr.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (y === undefined || m === undefined || d === undefined || isNaN(y) || isNaN(m) || isNaN(d)) {
    throw new Error(`Invalid date string: ${dateStr}`);
  }
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().split("T")[0]!;
}
