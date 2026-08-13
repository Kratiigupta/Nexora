import { z } from "zod";

export const createSessionSchema = z.object({
  mentorId: z.string().uuid("Invalid mentor ID"),
  skillId: z.string().uuid("Invalid skill ID"),
  description: z.string().max(1000, "Description too long").optional(),
  scheduledAt: z.string().datetime("Invalid ISO date-time string").optional(),
});

export const updateScheduleSchema = z.object({
  scheduledAt: z.string().datetime("Invalid ISO date-time string"),
});

export const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5),
  feedback: z.string().max(1000, "Feedback too long").optional(),
});
