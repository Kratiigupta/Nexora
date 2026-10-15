import test from "node:test";
import assert from "node:assert/strict";

import {
  generateHeatmapGrid,
  getColor,
} from "../src/lib/heatmap.ts";

test("getColor() maps activity counts to correct Tailwind theme classes", () => {
  assert.equal(getColor(0), "bg-muted/50");
  assert.equal(getColor(1), "bg-emerald-500/30 dark:bg-emerald-500/20");
  assert.equal(getColor(2), "bg-emerald-500/30 dark:bg-emerald-500/20");
  assert.equal(getColor(3), "bg-emerald-500/50 dark:bg-emerald-500/40");
  assert.equal(getColor(4), "bg-emerald-500/50 dark:bg-emerald-500/40");
  assert.equal(getColor(5), "bg-emerald-500/70 dark:bg-emerald-500/60");
  assert.equal(getColor(6), "bg-emerald-500/70 dark:bg-emerald-500/60");
  assert.equal(getColor(7), "bg-emerald-500 dark:bg-emerald-500/80");
  assert.equal(getColor(100), "bg-emerald-500 dark:bg-emerald-500/80");
});

test("generateHeatmapGrid() produces ~53 weeks with correct week structures", () => {
  const refDate = new Date("2026-10-15T12:00:00Z");
  const data = {
    "2026-10-15": 3,
    "2026-10-14": 5,
    "2026-01-01": 2,
  };

  const result = generateHeatmapGrid(data, refDate);

  assert.ok(result.weeks.length >= 52 && result.weeks.length <= 54, "Should generate ~53 weeks");
  assert.equal(result.totalActivities, 10, "Total activity sum should match exactly");

  // Every week before the last week must have 7 days
  for (let i = 0; i < result.weeks.length - 1; i++) {
    assert.equal(result.weeks[i].length, 7, `Week ${i} should have 7 days`);
  }

  // Last week should have at least 1 day and at most 7 days
  const lastWeek = result.weeks[result.weeks.length - 1];
  assert.ok(lastWeek.length >= 1 && lastWeek.length <= 7);
});

test("generateHeatmapGrid() extracts distinct chronological month labels", () => {
  const refDate = new Date("2026-10-15T12:00:00Z");
  const result = generateHeatmapGrid({}, refDate);

  assert.ok(result.monthLabels.length >= 11, "Should have labels for all 12 rolling months");
  // Check that indices are strictly ascending
  for (let i = 1; i < result.monthLabels.length; i++) {
    assert.ok(
      result.monthLabels[i].weekIndex > result.monthLabels[i - 1].weekIndex,
      "Month label week indices must be strictly ascending"
    );
  }
});

test("generateHeatmapGrid() handles leap years without crashing", () => {
  // 2024 was a leap year
  const leapYearDate = new Date("2024-03-05T00:00:00Z");
  const result = generateHeatmapGrid({ "2024-02-29": 1 }, leapYearDate);

  assert.equal(result.totalActivities, 1);
  assert.ok(result.weeks.length >= 52);
});
