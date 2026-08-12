import { z } from "zod";

// ──────────────────────────────────────────────────────
// Profile Validation Schemas
// ──────────────────────────────────────────────────────

/**
 * Schema for PUT /api/v1/profile — update own profile.
 * All fields optional. Username change enforced server-side (once only).
 */
export const updateProfileBodySchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .trim()
    .optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores"
    )
    .optional(),
  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .optional()
    .nullable(),
  department: z
    .string()
    .min(1)
    .max(100)
    .trim()
    .optional(),
  year: z.coerce.number().int().min(1).max(6).optional(),
  college: z.string().max(200).trim().optional().nullable(),
  githubUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  portfolioUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  linkedinUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  avatarUrl: z.string().url().optional().nullable(),
  resumeUrl: z.string().url().optional().nullable(),
  interests: z
    .array(z.string().max(50, "Each interest must be at most 50 characters"))
    .max(20, "You can have at most 20 interests")
    .optional(),
  availabilityStatus: z
    .enum(["available_for_team", "looking_for_project", "hiring", "not_available"])
    .optional(),
  skills: z
    .array(
      z.object({
        skillId: z.string().uuid("Invalid skill ID"),
        proficiency: z.enum(["beginner", "intermediate", "advanced", "expert"]),
      })
    )
    .max(30, "You can have at most 30 skills")
    .optional(),
});

/**
 * Schema for GET /api/v1/profile/:username — public profile lookup.
 */
export const usernameParamSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid username format"),
});

// Type exports
export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;
export type UsernameParam = z.infer<typeof usernameParamSchema>;
