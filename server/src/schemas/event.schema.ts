import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200, "Title must be at most 200 characters"),
  description: z.string().optional(),
  type: z.enum(["hackathon", "workshop", "competition", "meetup", "webinar"]),
  organizer: z.string().max(200).optional().nullable(),
  bannerUrl: z.string().url("Invalid banner URL").optional().nullable().or(z.literal("")),
  location: z.string().max(200).optional().nullable(),
  isOnline: z.boolean().optional(),
  registrationUrl: z.string().url("Invalid registration URL").optional().nullable().or(z.literal("")),
  startDate: z.string().datetime({ offset: true, message: "Invalid start date" }),
  endDate: z.string().datetime({ offset: true, message: "Invalid end date" }),
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) < new Date(data.endDate);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export const updateEventSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200, "Title must be at most 200 characters").optional(),
  description: z.string().optional(),
  type: z.enum(["hackathon", "workshop", "competition", "meetup", "webinar"]).optional(),
  organizer: z.string().max(200).optional().nullable(),
  bannerUrl: z.string().url("Invalid banner URL").optional().nullable().or(z.literal("")),
  location: z.string().max(200).optional().nullable(),
  isOnline: z.boolean().optional(),
  registrationUrl: z.string().url("Invalid registration URL").optional().nullable().or(z.literal("")),
  startDate: z.string().datetime({ offset: true, message: "Invalid start date" }).optional(),
  endDate: z.string().datetime({ offset: true, message: "Invalid end date" }).optional(),
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) < new Date(data.endDate);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export const eventIdParamSchema = z.object({
  id: z.string().uuid("Invalid event ID"),
});

export const getEventsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  type: z.enum(["hackathon", "workshop", "competition", "meetup", "webinar"]).optional(),
  search: z.string().optional(),
  upcoming: z.enum(["true", "false"]).optional(),
});
