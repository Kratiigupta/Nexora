import { z } from "zod";

export const createConversationSchema = z.object({
  type: z.enum(["direct", "team", "project"]),
  participantId: z.string().uuid("Invalid participant ID").optional(),
  teamId: z.string().uuid("Invalid team ID").optional(),
  projectId: z.string().uuid("Invalid project ID").optional(),
}).refine((data) => {
  if (data.type === "direct") return !!data.participantId;
  if (data.type === "team") return !!data.teamId && !data.projectId;
  if (data.type === "project") return !!data.projectId && !data.teamId;
  return false;
}, {
  message: "Invalid conversation parameters for the specified type",
  path: ["type"],
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message content is required").max(5000, "Message is too long"),
  type: z.enum(["text", "image", "file", "system"]).default("text"),
  fileUrl: z.string().url("Invalid file URL").optional().nullable(),
}).refine((data) => {
  if (data.type === "text" && !data.content.trim()) {
    return false;
  }
  return true;
}, {
  message: "Text messages must contain valid content",
  path: ["content"],
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const conversationIdParamSchema = z.object({
  id: z.string().uuid("Invalid conversation ID"),
});
