import { prisma } from "../config/prisma";
import { getCalendarDate, getDayDifference, getPreviousDate } from "../utils/date";
import { logger } from "../utils/logger";

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string;
  recordedNewActivity: boolean;
}

/**
 * Calculates the currently active consecutive streak for display purposes.
 * If the user's last login was today or yesterday, the streak is alive.
 * If a full calendar day was missed (last login is 2+ days ago) or never logged in,
 * the active streak is 0 until their next login resets it to 1.
 */
export function getEffectiveStreak(
  currentStreak: number,
  lastLoginDate: string | null,
  todayStr: string
): number {
  if (!lastLoginDate || currentStreak <= 0) {
    return 0;
  }
  if (lastLoginDate === todayStr) {
    return currentStreak;
  }
  const yesterday = getPreviousDate(todayStr);
  if (lastLoginDate === yesterday) {
    return currentStreak;
  }
  // Missed a full calendar day
  return 0;
}

/**
 * Registers daily login activity and updates consecutive-day streak.
 *
 * Rules:
 * - First successful login/check-in day starts a streak of 1.
 * - Login on the next consecutive calendar day increments the streak by 1.
 * - Multiple logins on the same day must NOT increase the streak.
 * - If a full calendar day is missed, reset active streak to 1.
 * - Longest streak is preserved and never overwritten with a lower value.
 * - Login records login activity for heatmap/timeline, but does NOT award stars.
 * - Thread-safe / race-condition safe: concurrent requests cannot create duplicate writes.
 */
export async function recordDailyLogin(
  userId: string,
  timeZone: string = "UTC"
): Promise<StreakResult> {
  const todayStr = getCalendarDate(new Date(), timeZone);

  // 1. Fetch current streak data
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastLoginDate: true,
    },
  });

  if (!profile) {
    throw new Error(`Profile not found for userId: ${userId}`);
  }

  // 2. If already registered login today, return idempotent result without writing duplicate activity
  if (profile.lastLoginDate === todayStr) {
    return {
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      lastLoginDate: todayStr,
      recordedNewActivity: false,
    };
  }

  // 3. Calculate new consecutive streak
  let newStreak = 1;
  if (profile.lastLoginDate) {
    const diff = getDayDifference(profile.lastLoginDate, todayStr);
    if (diff === 1) {
      // Consecutive calendar day!
      newStreak = profile.currentStreak + 1;
    } else if (diff === 0) {
      // Same day race check
      newStreak = profile.currentStreak;
    } else {
      // Missed at least 1 full day (or clock anomaly) -> reset streak to 1
      newStreak = 1;
    }
  }

  const newLongestStreak = Math.max(profile.longestStreak || 0, newStreak);

  // 4. Concurrency guard: update only if lastLoginDate is still not todayStr
  const updateResult = await prisma.profile.updateMany({
    where: {
      id: userId,
      OR: [
        { lastLoginDate: null },
        { lastLoginDate: { not: todayStr } },
      ],
    },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastLoginDate: todayStr,
    },
  });

  if (updateResult.count === 0) {
    // Another concurrent request handled it first
    const fresh = await prisma.profile.findUnique({
      where: { id: userId },
      select: { currentStreak: true, longestStreak: true, lastLoginDate: true },
    });
    return {
      currentStreak: fresh?.currentStreak ?? newStreak,
      longestStreak: fresh?.longestStreak ?? newLongestStreak,
      lastLoginDate: todayStr,
      recordedNewActivity: false,
    };
  }

  // 5. Successfully updated! Write login activity log for heatmap
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action: "login",
        description: `Logged in (Day ${newStreak} streak)`,
        metadata: { date: todayStr, streak: newStreak },
      },
    });
  } catch (err) {
    logger.error("Failed to write login activity log:", err);
  }

  return {
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    lastLoginDate: todayStr,
    recordedNewActivity: true,
  };
}
