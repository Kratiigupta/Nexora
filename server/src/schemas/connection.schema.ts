import { z } from "zod";

export const userIdParamSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});

export const updateConnectionBodySchema = z.object({
  status: z.enum(["accepted", "rejected"]),
});
