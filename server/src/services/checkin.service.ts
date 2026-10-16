import { prisma } from "../config/prisma";
import { getCalendarDate, getDayDifference } from "../utils/date";
import { logger } from "../utils/logger";

export interface CheckinResult {
  success: boolean;
  alreadyCheckedIn: boolean;
  starCount: number;
  message: string;
  date: string;
  currentStreak: number;
  longestStreak: number;
}

export interface CheckinStatus {
  hasCheckedInToday: boolean;
  starCount: number;
  currentStreak: number;
  longestStreak: number;
  date: string;
}

/**
 * Checks whether an error is a database unique constraint violation (Prisma P2002 or Postgres 23505).
 */
function isUniqueConstraintError(err: unknown): boolean {
  if (typeof err === "object" && err !== null) {
    const errorObj = err as { code?: string; message?: string };
    if (errorObj.code === "P2002" || errorObj.code === "23505") {
      return true;
    }
    if (errorObj.message?.includes("Unique constraint failed") || errorObj.message?.includes("duplicate key")) {
      return true;
    }
  }
  return false;
}

/**
 * Returns whether the user has already checked in on the given calendar date.
 */
export async function getCheckinStatus(
  userId: string,
  timeZone: string = "UTC"
): Promise<CheckinStatus> {
  const todayStr = getCalendarDate(new Date(), timeZone);

  const [existingCheckin, profile] = await Promise.all([
    prisma.dailyCheckin.findUnique({
      where: {
        userId_date: {
          userId,
          date: todayStr,
        },
      },
    }),
    prisma.profile.findUnique({
      where: { id: userId },
      select: {
        starCount: true,
        currentStreak: true,
        longestStreak: true,
      },
    }),
  ]);

  return {
    hasCheckedInToday: !!existingCheckin,
    starCount: profile?.starCount ?? 0,
    currentStreak: profile?.currentStreak ?? 0,
    longestStreak: profile?.longestStreak ?? 0,
    date: todayStr,
  };
}

/**
 * Performs atomic and idempotent daily check-in.
 *
 * Rules:
 * - Exactly +1 star is awarded on the first check-in of a calendar day.
 * - Idempotent: multiple clicks, parallel/concurrent requests, repeated logins on the same day
 *   never award another star.
 * - Enforces per-user, per-calendar-day constraint at database level via daily_checkins(userId, date).
 * - Never awards a star if the database write fails.
 * - First check-in starts a streak of at least 1 if user had no active streak.
 * - Writes activity log so today's heatmap cell turns green immediately.
 */
export async function performDailyCheckin(
  userId: string,
  timeZone: string = "UTC"
): Promise<CheckinResult> {
  const todayStr = getCalendarDate(new Date(), timeZone);

  // 1. Quick check: has the user already checked in today?
  const existingCheckin = await prisma.dailyCheckin.findUnique({
    where: {
      userId_date: {
        userId,
        date: todayStr,
      },
    },
  });

  if (existingCheckin) {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { starCount: true, currentStreak: true, longestStreak: true },
    });

    return {
      success: true,
      alreadyCheckedIn: true,
      starCount: profile?.starCount ?? 0,
      currentStreak: profile?.currentStreak ?? 0,
      longestStreak: profile?.longestStreak ?? 0,
      message: "Already checked in today",
      date: todayStr,
    };
  }

  // 2. Insert check-in record. The DB unique constraint (userId, date) guarantees
  // that only ONE concurrent request can succeed.
  try {
    await prisma.dailyCheckin.create({
      data: {
        userId,
        date: todayStr,
      },
    });
  } catch (err: unknown) {
    if (isUniqueConstraintError(err)) {
      // Race condition lost: another concurrent request already checked in!
      const profile = await prisma.profile.findUnique({
        where: { id: userId },
        select: { starCount: true, currentStreak: true, longestStreak: true },
      });
      return {
        success: true,
        alreadyCheckedIn: true,
        starCount: profile?.starCount ?? 0,
        currentStreak: profile?.currentStreak ?? 0,
        longestStreak: profile?.longestStreak ?? 0,
        message: "Already checked in today",
        date: todayStr,
      };
    }
    // Any other failure: rethrow! Never award a star when database write fails.
    logger.error("Failed to insert daily check-in:", err);
    throw err;
  }

  // 3. Database check-in record was successfully inserted!
  // Now award +1 star and update streak if this is also their first action today.
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: {
      starCount: true,
      currentStreak: true,
      longestStreak: true,
      lastLoginDate: true,
    },
  });

  if (!profile) {
    throw new Error(`Profile not found for userId: ${userId}`);
  }

  // If user hasn't registered today's activity, update streak as well
  let streakUpdates: {
    currentStreak?: number;
    longestStreak?: number;
    lastLoginDate?: string;
  } = {};

  if (profile.lastLoginDate !== todayStr) {
    let newStreak = 1;
    if (profile.lastLoginDate) {
      const diff = getDayDifference(profile.lastLoginDate, todayStr);
      if (diff === 1) {
        newStreak = profile.currentStreak + 1;
      } else {
        newStreak = 1;
      }
    }
    const newLongest = Math.max(profile.longestStreak || 0, newStreak);
    streakUpdates = {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastLoginDate: todayStr,
    };
  }

  const [updatedProfile] = await Promise.all([
    prisma.profile.update({
      where: { id: userId },
      data: {
        starCount: { increment: 1 },
        ...streakUpdates,
      },
      select: {
        starCount: true,
        currentStreak: true,
        longestStreak: true,
      },
    }),
    prisma.activityLog.create({
      data: {
        userId,
        action: "daily_checkin",
        description: "Completed daily check-in (+1 star ⭐)",
        metadata: { date: todayStr, starsAwarded: 1 },
      },
    }),
  ]);

  return {
    success: true,
    alreadyCheckedIn: false,
    starCount: updatedProfile.starCount,
    currentStreak: updatedProfile.currentStreak,
    longestStreak: updatedProfile.longestStreak,
    message: "Check-in successful! +1 star awarded ⭐",
    date: todayStr,
  };
}
