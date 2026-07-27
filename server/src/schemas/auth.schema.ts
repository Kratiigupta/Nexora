import { z } from "zod";

/**
 * Schema for POST /auth/register
 * Username is auto-generated from fullName/email — not user-provided.
 * Role always defaults to "student" — admin users created manually.
 */
export const registerSchema = z.object({
  body: z.object({
    supabaseId: z.string().uuid("Invalid Supabase user ID"),
    email: z.string().email("Invalid email address"),
    fullName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters")
      .trim(),
    department: z
      .string()
      .min(1, "Department is required")
      .max(100, "Department must be at most 100 characters")
      .trim(),
    year: z.coerce
      .number()
      .int()
      .min(1, "Year must be between 1 and 6")
      .max(6, "Year must be between 1 and 6"),
    college: z
      .string()
      .max(200, "College must be at most 200 characters")
      .trim()
      .optional(),
    avatarUrl: z.string().url().optional().nullable(),
  }),
});

/**
 * Schema for PUT /auth/me — partial profile update.
 */
export const updateProfileSchema = z.object({
  body: z.object({
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
    bio: z.string().max(500, "Bio must be at most 500 characters").optional().nullable(),
    department: z
      .string()
      .min(1)
      .max(100)
      .trim()
      .optional(),
    year: z.coerce.number().int().min(1).max(6).optional(),
    college: z.string().max(200).trim().optional().nullable(),
    githubUrl: z.string().url().optional().nullable(),
    portfolioUrl: z.string().url().optional().nullable(),
    linkedinUrl: z.string().url().optional().nullable(),
    avatarUrl: z.string().url().optional().nullable(),
    isAvailable: z.boolean().optional(),
  }),
});

/**
 * Schema for onboarding — completing profile after first login.
 */
export const onboardingSchema = z.object({
  body: z.object({
    bio: z.string().max(500, "Bio must be at most 500 characters").optional().nullable(),
    githubUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
    portfolioUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
    linkedinUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
    avatarUrl: z.string().url().optional().nullable(),
    isAvailable: z.boolean().optional(),
    skills: z
      .array(
        z.object({
          skillId: z.string().uuid(),
          proficiency: z.enum(["beginner", "intermediate", "advanced", "expert"]),
        })
      )
      .optional(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
export type OnboardingInput = z.infer<typeof onboardingSchema>["body"];
