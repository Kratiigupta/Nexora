import { z } from "zod";

/**
 * Client-side profile validation schemas.
 * Mirrors the server-side schemas for instant form feedback.
 */

export const profileFormSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .trim(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Only letters, numbers, hyphens, and underscores"
    ),
  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .optional()
    .nullable(),
  department: z.string().min(1, "Department is required").max(100).trim(),
  year: z.coerce.number().int().min(1, "Year must be 1–6").max(6, "Year must be 1–6"),
  college: z.string().max(200).trim().optional().nullable(),
  githubUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  portfolioUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  linkedinUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  interests: z
    .array(z.string().max(50))
    .max(20, "Maximum 20 interests")
    .optional(),
  availabilityStatus: z.enum([
    "available_for_team",
    "looking_for_project",
    "hiring",
    "not_available",
  ]),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
