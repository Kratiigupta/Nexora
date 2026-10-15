import test from "node:test";
import assert from "node:assert/strict";

// Import pure utility functions
import {
  cn,
  formatDate,
  timeAgo,
  truncate,
  getInitials,
  debounce,
  DEBOUNCE_DELAY,
} from "../src/lib/utils.ts";

test("DEBOUNCE_DELAY is set to standard 300ms", () => {
  assert.equal(DEBOUNCE_DELAY, 300);
});

test("cn() correctly merges and dedupes classes", () => {
  assert.equal(cn("px-2 py-1", "bg-red-500"), "px-2 py-1 bg-red-500");
  // Tailwind conflicts resolved (last wins)
  assert.equal(cn("px-2", "px-4"), "px-4");
  // Falsy values ignored
  assert.equal(cn("block", false && "hidden", null, undefined, "text-sm"), "block text-sm");
});

test("truncate() handles strings properly", () => {
  assert.equal(truncate("hello", 10), "hello");
  assert.equal(truncate("hello world and universe", 11), "hello world...");
  assert.equal(truncate("", 5), "");
});

test("getInitials() extracts uppercase initials", () => {
  assert.equal(getInitials("John Doe"), "JD");
  assert.equal(getInitials("Alice Bob Charlie"), "AB");
  assert.equal(getInitials("Single"), "S");
  assert.equal(getInitials("krati gupta"), "KG");
});

test("timeAgo() formats relative intervals accurately", () => {
  const now = Date.now();
  assert.equal(timeAgo(new Date(now - 10 * 1000)), "just now");
  assert.equal(timeAgo(new Date(now - 120 * 1000)), "2 minutes ago");
  assert.equal(timeAgo(new Date(now - 3600 * 1000 * 3)), "3 hours ago");
  assert.equal(timeAgo(new Date(now - 86400 * 1000 * 2)), "2 days ago");
});

test("formatDate() formats standard date strings", () => {
  const formatted = formatDate("2026-05-15T10:00:00Z");
  assert.ok(formatted.includes("2026"));
  assert.ok(formatted.includes("May") || formatted.includes("15"));
});

test("debounce() delays function execution until wait elapsed", async () => {
  let callCount = 0;
  let lastArg = "";

  const fn = debounce((arg) => {
    callCount++;
    lastArg = arg;
  }, 50);

  fn("a");
  fn("b");
  fn("c");

  assert.equal(callCount, 0, "Should not be called synchronously");

  await new Promise((resolve) => setTimeout(resolve, 80));

  assert.equal(callCount, 1, "Should have been called exactly once");
  assert.equal(lastArg, "c", "Should receive the latest argument");
});

test("debounce.cancel() prevents scheduled invocation", async () => {
  let called = false;
  const fn = debounce(() => {
    called = true;
  }, 50);

  fn();
  fn.cancel();

  await new Promise((resolve) => setTimeout(resolve, 80));
  assert.equal(called, false, "Cancelled debounced function should not fire");
});
