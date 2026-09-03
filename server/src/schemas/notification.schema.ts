import { z } from "zod";

export const notificationIdParamSchema = z.object({
  id: z.string().uuid("Invalid notification ID"),
});

export const getNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  unread_only: z.enum(["true", "false"]).optional(),
});
