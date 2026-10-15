import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read schema.prisma to parse model field definitions
const schemaPath = path.resolve(__dirname, "../prisma/schema.prisma");
const schemaContent = fs.readFileSync(schemaPath, "utf-8");

function getModelFields(modelName) {
  const modelRegex = new RegExp(`model\\s+${modelName}\\s+\\{([^}]+)\\}`, "m");
  const match = schemaContent.match(modelRegex);
  if (!match) throw new Error(`Model ${modelName} not found in schema.prisma`);

  const lines = match[1].split("\n");
  const fields = new Set();
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("@@")) continue;
    const fieldName = trimmed.split(/\s+/)[0];
    if (fieldName) fields.add(fieldName);
  }
  return fields;
}

test("Notification model contains all projected fields in getDashboard query", () => {
  const notificationFields = getModelFields("Notification");
  const dashboardNotificationSelect = [
    "id",
    "type",
    "title",
    "body",
    "referenceType",
    "referenceId",
    "isRead",
    "createdAt",
  ];

  for (const field of dashboardNotificationSelect) {
    assert.ok(
      notificationFields.has(field),
      `Notification schema missing expected field: ${field}`
    );
  }
});

test("ActivityLog model contains all projected fields in getDashboard query", () => {
  const activityLogFields = getModelFields("ActivityLog");
  const dashboardActivityLogSelect = [
    "id",
    "action",
    "description",
    "metadata",
    "createdAt",
  ];

  for (const field of dashboardActivityLogSelect) {
    assert.ok(
      activityLogFields.has(field),
      `ActivityLog schema missing expected field: ${field}`
    );
  }
});

test("Project relational queries match Team and TeamMember relation definitions", () => {
  const projectFields = getModelFields("Project");
  const teamFields = getModelFields("Team");
  const teamMemberFields = getModelFields("TeamMember");

  // getMyProjects uses: { createdBy: userId } OR { team: { members: { some: { userId } } } }
  assert.ok(projectFields.has("createdBy"), "Project must have createdBy field");
  assert.ok(projectFields.has("team"), "Project must have team relation");
  assert.ok(teamFields.has("members"), "Team must have members relation");
  assert.ok(teamMemberFields.has("userId"), "TeamMember must have userId field");
});
