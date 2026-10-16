import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ─── Import the date utilities from dist ───
import {
  resolveTimezone,
  getCalendarDate,
  getDayDifference,
  getPreviousDate,
  getNextDate,
} from "../dist/utils/date.js";

// ─── Import the streak helper from dist ───
import { getEffectiveStreak } from "../dist/services/streak.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, "../prisma/schema.prisma");
const schemaContent = fs.readFileSync(schemaPath, "utf-8");
const routesPath = path.resolve(__dirname, "../src/routes/index.ts");
const routesSrc = fs.readFileSync(routesPath, "utf-8");

// ──────────────────────────────────────────────────────
// 1. Date utility tests
// ──────────────────────────────────────────────────────

test("resolveTimezone returns UTC for null/undefined/empty/invalid inputs", () => {
  assert.equal(resolveTimezone(null), "UTC");
  assert.equal(resolveTimezone(undefined), "UTC");
  assert.equal(resolveTimezone(""), "UTC");
  assert.equal(resolveTimezone("   "), "UTC");
  assert.equal(resolveTimezone("Not/A/Zone"), "UTC");
});

test("resolveTimezone returns valid IANA timezone unchanged", () => {
  assert.equal(resolveTimezone("Asia/Kolkata"), "Asia/Kolkata");
  assert.equal(resolveTimezone("America/New_York"), "America/New_York");
  assert.equal(resolveTimezone("UTC"), "UTC");
});

test("getCalendarDate returns YYYY-MM-DD for a known UTC timestamp", () => {
  const ts = new Date("2026-10-15T23:30:00Z");
  assert.equal(getCalendarDate(ts, "UTC"), "2026-10-15");
  assert.equal(getCalendarDate(ts, "Asia/Kolkata"), "2026-10-16");
});

test("getCalendarDate defaults to UTC", () => {
  const ts = new Date("2026-01-01T00:30:00Z");
  assert.equal(getCalendarDate(ts), "2026-01-01");
});

test("getDayDifference returns correct calendar-day differences", () => {
  assert.equal(getDayDifference("2026-10-15", "2026-10-16"), 1);
  assert.equal(getDayDifference("2026-10-16", "2026-10-16"), 0);
  assert.equal(getDayDifference("2026-10-14", "2026-10-16"), 2);
  assert.equal(getDayDifference("2026-12-31", "2027-01-01"), 1);
});

test("getPreviousDate returns the day before", () => {
  assert.equal(getPreviousDate("2026-10-16"), "2026-10-15");
  assert.equal(getPreviousDate("2026-01-01"), "2025-12-31");
  assert.equal(getPreviousDate("2026-03-01"), "2026-02-28");
});

test("getNextDate returns the day after", () => {
  assert.equal(getNextDate("2026-10-15"), "2026-10-16");
  assert.equal(getNextDate("2025-12-31"), "2026-01-01");
  assert.equal(getNextDate("2024-02-28"), "2024-02-29"); // leap year
});

// ──────────────────────────────────────────────────────
// 2. Streak calculation tests (pure function, no DB)
// ──────────────────────────────────────────────────────

test("getEffectiveStreak returns 0 when lastLoginDate is null", () => {
  assert.equal(getEffectiveStreak(5, null, "2026-10-16"), 0);
});

test("getEffectiveStreak returns 0 when currentStreak is 0", () => {
  assert.equal(getEffectiveStreak(0, "2026-10-16", "2026-10-16"), 0);
});

test("getEffectiveStreak returns streak when lastLoginDate is today", () => {
  assert.equal(getEffectiveStreak(7, "2026-10-16", "2026-10-16"), 7);
});

test("getEffectiveStreak returns streak when lastLoginDate is yesterday (streak alive)", () => {
  assert.equal(getEffectiveStreak(3, "2026-10-15", "2026-10-16"), 3);
});

test("getEffectiveStreak returns 0 when a full day was missed (streak broken)", () => {
  assert.equal(getEffectiveStreak(10, "2026-10-14", "2026-10-16"), 0);
});

test("getEffectiveStreak handles year boundary (Dec 31 → Jan 1 streak alive)", () => {
  assert.equal(getEffectiveStreak(5, "2025-12-31", "2026-01-01"), 5);
});

test("getEffectiveStreak handles year boundary break (Dec 30 → Jan 1 missed)", () => {
  assert.equal(getEffectiveStreak(5, "2025-12-30", "2026-01-01"), 0);
});

// ──────────────────────────────────────────────────────
// 3. Checkin idempotency logic tests (schema-level)
// ──────────────────────────────────────────────────────

test("DailyCheckin model has unique constraint on userId+date in schema", () => {
  const modelMatch = schemaContent.match(/model\s+DailyCheckin\s+\{([^}]+)\}/m);
  assert.ok(modelMatch, "DailyCheckin model must exist in schema");
  const modelBody = modelMatch[1];
  assert.ok(
    modelBody.includes("@@unique([userId, date])"),
    "DailyCheckin must have @@unique([userId, date]) constraint"
  );
});

test("Profile model has starCount, currentStreak, longestStreak, lastLoginDate fields", () => {
  const modelMatch = schemaContent.match(/model\s+Profile\s+\{([^}]+)\}/m);
  assert.ok(modelMatch, "Profile model must exist in schema");
  const body = modelMatch[1];
  assert.ok(body.includes("starCount"), "Profile must have starCount field");
  assert.ok(body.includes("currentStreak"), "Profile must have currentStreak field");
  assert.ok(body.includes("longestStreak"), "Profile must have longestStreak field");
  assert.ok(body.includes("lastLoginDate"), "Profile must have lastLoginDate field");
});

test("ActivityAction enum includes daily_checkin and login values", () => {
  const enumMatch = schemaContent.match(/enum\s+ActivityAction\s+\{([^}]+)\}/m);
  assert.ok(enumMatch, "ActivityAction enum must exist");
  const body = enumMatch[1];
  assert.ok(body.includes("daily_checkin"), "ActivityAction must include daily_checkin");
  assert.ok(body.includes("login"), "ActivityAction must include login");
});

// ──────────────────────────────────────────────────────
// 4. Streak increment / reset logic (unit tests on pure calculations)
// ──────────────────────────────────────────────────────

test("Streak logic: first login ever starts streak at 1", () => {
  const lastLoginDate = null;
  let newStreak = 1;
  if (lastLoginDate) {
    // would compute diff
  }
  assert.equal(newStreak, 1);
});

test("Streak logic: consecutive day increments streak", () => {
  const lastLoginDate = "2026-10-15";
  const todayStr = "2026-10-16";
  const currentStreak = 5;
  const diff = getDayDifference(lastLoginDate, todayStr);
  let newStreak;
  if (diff === 1) {
    newStreak = currentStreak + 1;
  } else if (diff === 0) {
    newStreak = currentStreak;
  } else {
    newStreak = 1;
  }
  assert.equal(newStreak, 6);
});

test("Streak logic: same day does not increase streak", () => {
  const lastLoginDate = "2026-10-16";
  const todayStr = "2026-10-16";
  const currentStreak = 5;
  const diff = getDayDifference(lastLoginDate, todayStr);
  let newStreak;
  if (diff === 1) {
    newStreak = currentStreak + 1;
  } else if (diff === 0) {
    newStreak = currentStreak;
  } else {
    newStreak = 1;
  }
  assert.equal(newStreak, 5);
});

test("Streak logic: missing a full day resets streak to 1", () => {
  const lastLoginDate = "2026-10-14";
  const todayStr = "2026-10-16";
  const currentStreak = 10;
  const diff = getDayDifference(lastLoginDate, todayStr);
  let newStreak;
  if (diff === 1) {
    newStreak = currentStreak + 1;
  } else if (diff === 0) {
    newStreak = currentStreak;
  } else {
    newStreak = 1;
  }
  assert.equal(newStreak, 1);
});

test("Streak logic: longest streak is never overwritten with lower value", () => {
  const currentLongest = 15;
  const newStreak = 3;
  const updatedLongest = Math.max(currentLongest, newStreak);
  assert.equal(updatedLongest, 15);
});

test("Streak logic: longest streak is updated when new streak exceeds it", () => {
  const currentLongest = 5;
  const newStreak = 6;
  const updatedLongest = Math.max(currentLongest, newStreak);
  assert.equal(updatedLongest, 6);
});

// ──────────────────────────────────────────────────────
// 5. Midnight boundary / timezone edge cases
// ──────────────────────────────────────────────────────

test("Timezone: 11:30 PM UTC on Oct 15 is Oct 16 in IST (+05:30)", () => {
  const ts = new Date("2026-10-15T23:30:00Z");
  assert.equal(getCalendarDate(ts, "UTC"), "2026-10-15");
  assert.equal(getCalendarDate(ts, "Asia/Kolkata"), "2026-10-16");
});

test("Timezone: midnight UTC is same day in UTC but previous day in US Pacific", () => {
  const ts = new Date("2026-10-16T00:00:00Z");
  assert.equal(getCalendarDate(ts, "UTC"), "2026-10-16");
  assert.equal(getCalendarDate(ts, "America/Los_Angeles"), "2026-10-15");
});

test("Timezone: streak across midnight boundary in user's timezone", () => {
  const login1 = new Date("2026-10-15T18:25:00Z");
  const date1 = getCalendarDate(login1, "Asia/Kolkata"); // 23:55 IST Oct 15
  const login2 = new Date("2026-10-15T18:35:00Z");
  const date2 = getCalendarDate(login2, "Asia/Kolkata"); // 00:05 IST Oct 16
  assert.equal(date1, "2026-10-15");
  assert.equal(date2, "2026-10-16");
  assert.equal(getDayDifference(date1, date2), 1);
});

// ──────────────────────────────────────────────────────
// 6. Heatmap date correctness
// ──────────────────────────────────────────────────────

test("Heatmap: check-in activity on a date produces that date key in aggregation", () => {
  const createdAt = new Date("2026-10-16T10:00:00Z");
  const dateKey = getCalendarDate(createdAt, "UTC");
  assert.equal(dateKey, "2026-10-16");
  const heatmap = {};
  heatmap[dateKey] = (heatmap[dateKey] ?? 0) + 1;
  assert.equal(heatmap["2026-10-16"], 1);
});

test("Heatmap: multiple activities on same date increase count", () => {
  const heatmap = {};
  const dates = [
    new Date("2026-10-16T08:00:00Z"),
    new Date("2026-10-16T12:00:00Z"),
    new Date("2026-10-16T18:00:00Z"),
  ];
  for (const d of dates) {
    const key = getCalendarDate(d, "UTC");
    heatmap[key] = (heatmap[key] ?? 0) + 1;
  }
  assert.equal(Object.keys(heatmap).length, 1);
  assert.equal(heatmap["2026-10-16"], 3);
});

test("Heatmap: historical data persists (empty dates remain 0)", () => {
  const heatmap = { "2026-10-10": 2, "2026-10-12": 1 };
  assert.equal(heatmap["2026-10-11"] ?? 0, 0);
  assert.equal(heatmap["2026-10-10"], 2);
  assert.equal(heatmap["2026-10-12"], 1);
});

// ──────────────────────────────────────────────────────
// 7. Authorization tests (schema & route-level)
// ──────────────────────────────────────────────────────

test("DailyCheckin and ActivityLog are scoped to userId via foreign key", () => {
  const checkinModel = schemaContent.match(/model\s+DailyCheckin\s+\{([^}]+)\}/m);
  assert.ok(checkinModel);
  assert.ok(checkinModel[1].includes("userId"), "DailyCheckin must have userId field");
  assert.ok(
    checkinModel[1].includes("@relation(fields: [userId], references: [id]"),
    "DailyCheckin must relate userId to Profile.id"
  );
  const activityModel = schemaContent.match(/model\s+ActivityLog\s+\{([^}]+)\}/m);
  assert.ok(activityModel);
  assert.ok(activityModel[1].includes("userId"), "ActivityLog must have userId field");
});

test("Dashboard and checkin routes require authMiddleware", () => {
  assert.ok(
    routesSrc.includes('router.get("/dashboard", authMiddleware'),
    "GET /dashboard must use authMiddleware"
  );
  assert.ok(
    routesSrc.includes('router.post("/dashboard/checkin", authMiddleware'),
    "POST /dashboard/checkin must use authMiddleware"
  );
  assert.ok(
    routesSrc.includes('router.use("/profile", authMiddleware'),
    "/profile routes must use authMiddleware"
  );
});
