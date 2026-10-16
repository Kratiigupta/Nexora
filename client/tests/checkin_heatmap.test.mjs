import test from "node:test";
import assert from "node:assert/strict";

import {
  generateHeatmapGrid,
  getColor,
} from "../src/lib/heatmap.ts";

// ──────────────────────────────────────────────────────
// 1. Heatmap with string referenceDate (server's todayDate)
// ──────────────────────────────────────────────────────

test("generateHeatmapGrid() accepts a string referenceDate (YYYY-MM-DD)", () => {
  const data = { "2026-10-16": 3 };
  const result = generateHeatmapGrid(data, "2026-10-16");

  assert.ok(result.weeks.length >= 52, "Should generate ~53 weeks");

  // Last cell should be Oct 16
  const lastWeek = result.weeks[result.weeks.length - 1];
  const lastDate = lastWeek[lastWeek.length - 1];
  const lastKey = lastDate.toISOString().split("T")[0];
  assert.equal(lastKey, "2026-10-16");
  assert.equal(result.totalActivities, 3);
});

test("generateHeatmapGrid() string referenceDate produces UTC midnight dates", () => {
  const result = generateHeatmapGrid({}, "2026-10-16");
  for (const week of result.weeks) {
    for (const date of week) {
      assert.equal(date.getUTCHours(), 0, "Grid dates must be at UTC midnight");
    }
  }
});

// ──────────────────────────────────────────────────────
// 2. Check-in turns today's heatmap cell green
// ──────────────────────────────────────────────────────

test("Check-in activity on a date produces non-zero count (green cell)", () => {
  const todayKey = "2026-10-16";
  const data = { [todayKey]: 1 };
  const result = generateHeatmapGrid(data, todayKey);

  // Find today's cell and verify its count is > 0
  const lastWeek = result.weeks[result.weeks.length - 1];
  const lastDate = lastWeek[lastWeek.length - 1];
  const dateStr = lastDate.toISOString().split("T")[0];
  assert.equal(dateStr, todayKey);
  assert.equal(data[dateStr], 1, "Today should have count of 1");
  // getColor(1) should return a green class, not the inactive bg-muted/50
  assert.notEqual(getColor(1), "bg-muted/50", "Active cell should not use inactive color");
  assert.ok(getColor(1).includes("emerald"), "Active cell should use emerald (green) color");
});

test("Empty/inactive dates remain inactive (bg-muted/50)", () => {
  assert.equal(getColor(0), "bg-muted/50");
});

// ──────────────────────────────────────────────────────
// 3. Multiple activities increase intensity, not create new dates
// ──────────────────────────────────────────────────────

test("Multiple activities on one date increase intensity level", () => {
  const data = { "2026-10-16": 5 };
  const color5 = getColor(5);
  const color1 = getColor(1);
  // Higher activity should produce higher intensity color
  assert.notEqual(color5, color1, "5 activities should have higher intensity than 1");
  // Both should be green/emerald
  assert.ok(color5.includes("emerald"));
  assert.ok(color1.includes("emerald"));
});

// ──────────────────────────────────────────────────────
// 4. Historical activity persists after reload
// ──────────────────────────────────────────────────────

test("Historical data is reflected in heatmap grid", () => {
  const data = {
    "2026-10-01": 2,
    "2026-10-05": 4,
    "2026-10-10": 1,
    "2026-10-16": 3,
  };
  const result = generateHeatmapGrid(data, "2026-10-16");
  assert.equal(result.totalActivities, 10, "All historical activities should be summed");
});

// ──────────────────────────────────────────────────────
// 5. Backward compatibility — Date referenceDate still works
// ──────────────────────────────────────────────────────

test("generateHeatmapGrid() still works with Date referenceDate (backward compat)", () => {
  const refDate = new Date("2026-10-16T12:00:00Z");
  const data = { "2026-10-16": 1 };
  const result = generateHeatmapGrid(data, refDate);

  assert.ok(result.weeks.length >= 52);
  assert.equal(result.totalActivities, 1);
});

test("generateHeatmapGrid() with no referenceDate defaults to today", () => {
  const result = generateHeatmapGrid({});
  assert.ok(result.weeks.length >= 52);
  assert.equal(result.totalActivities, 0);
});

// ──────────────────────────────────────────────────────
// 6. Dashboard type shape verification
// ──────────────────────────────────────────────────────

test("DashboardData type includes checkin and streak fields", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const typesPath = path.resolve(__dirname, "../src/types/dashboard.ts");
  const typesContent = fs.readFileSync(typesPath, "utf-8");

  assert.ok(typesContent.includes("hasCheckedInToday"), "DashboardData must have hasCheckedInToday");
  assert.ok(typesContent.includes("starCount"), "DashboardData must have starCount");
  assert.ok(typesContent.includes("currentStreak"), "DashboardData must have currentStreak");
  assert.ok(typesContent.includes("longestStreak"), "DashboardData must have longestStreak");
  assert.ok(typesContent.includes("todayDate"), "DashboardData must have todayDate");
});
