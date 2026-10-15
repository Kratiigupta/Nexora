import test from "node:test";
import assert from "node:assert/strict";

// Import compiled Zod schemas from dist
import {
  createProjectSchema,
  updateProjectSchema,
  createTaskSchema,
  projectIdParamSchema,
} from "../dist/schemas/project.schema.js";

import {
  createTeamSchema,
  teamIdParamSchema,
} from "../dist/schemas/team.schema.js";

test("createProjectSchema validates required title length and optional fields", () => {
  const valid = createProjectSchema.safeParse({
    title: "Nexora Platform",
    description: "Student collaboration system",
    status: "in_progress",
    repoUrl: "https://github.com/example/nexora",
  });
  assert.equal(valid.success, true);

  const shortTitle = createProjectSchema.safeParse({
    title: "A",
  });
  assert.equal(shortTitle.success, false);
  assert.ok(shortTitle.error.issues.some((i) => i.path.includes("title")));

  const invalidUrl = createProjectSchema.safeParse({
    title: "Valid Title",
    repoUrl: "not-a-url",
  });
  assert.equal(invalidUrl.success, false);
});

test("projectIdParamSchema enforces valid UUIDs", () => {
  const validUuid = projectIdParamSchema.safeParse({
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  });
  assert.equal(validUuid.success, true);

  const invalidUuid = projectIdParamSchema.safeParse({
    id: "123-invalid-id",
  });
  assert.equal(invalidUuid.success, false);
});

test("createTaskSchema validates task attributes and statuses", () => {
  const validTask = createTaskSchema.safeParse({
    title: "Implement real-time notifications",
    status: "todo",
    priority: "high",
  });
  assert.equal(validTask.success, true);

  const invalidStatus = createTaskSchema.safeParse({
    title: "Valid title",
    status: "unknown_status",
  });
  assert.equal(invalidStatus.success, false);
});

test("createTeamSchema enforces team types and constraints", () => {
  const validTeam = createTeamSchema.safeParse({
    name: "AI Hackers",
    type: "hackathon",
    maxMembers: 4,
  });
  assert.equal(validTeam.success, true);

  const invalidType = createTeamSchema.safeParse({
    name: "AI Hackers",
    type: "invalid_type",
  });
  assert.equal(invalidType.success, false);
});
