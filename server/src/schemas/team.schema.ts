import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters"),
  description: z.string().optional(),
  type: z.enum(["project", "hackathon", "startup", "research", "competition"]),
  maxMembers: z.number().int().min(2).max(50).optional(),
  isPublic: z.boolean().optional(),
});

export const inviteMemberSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  message: z.string().max(500).optional(),
});

export const respondInviteSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
});

export const teamIdParamSchema = z.object({
  id: z.string().uuid("Invalid team ID"),
});

export const teamAndUserIdParamSchema = z.object({
  id: z.string().uuid("Invalid team ID"),
  userId: z.string().uuid("Invalid user ID"),
});

export const teamAndRequestIdParamSchema = z.object({
  id: z.string().uuid("Invalid team ID"),
  requestId: z.string().uuid("Invalid request ID"),
});
