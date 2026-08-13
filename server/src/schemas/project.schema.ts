import { z } from "zod";

export const createProjectSchema = z.object({
  teamId: z.string().uuid("Invalid team ID").optional(),
  title: z.string().min(2, "Title must be at least 2 characters").max(200, "Title must be at most 200 characters"),
  description: z.string().optional(),
  status: z.enum(["planning", "in_progress", "completed", "on_hold"]).optional(),
  repoUrl: z.string().url("Invalid repository URL").optional().or(z.literal("")),
  liveUrl: z.string().url("Invalid live URL").optional().or(z.literal("")),
});

export const updateProjectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200, "Title must be at most 200 characters").optional(),
  description: z.string().optional(),
  status: z.enum(["planning", "in_progress", "completed", "on_hold"]).optional(),
  repoUrl: z.string().url("Invalid repository URL").optional().or(z.literal("")),
  liveUrl: z.string().url("Invalid live URL").optional().or(z.literal("")),
});

export const createTaskSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200, "Title must be at most 200 characters"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "in_review", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  assignedTo: z.string().uuid("Invalid assignee ID").optional().nullable(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200, "Title must be at most 200 characters").optional(),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "in_review", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  assignedTo: z.string().uuid("Invalid assignee ID").optional().nullable(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
});

export const projectIdParamSchema = z.object({
  id: z.string().uuid("Invalid project ID"),
});

export const projectAndTaskIdParamSchema = z.object({
  id: z.string().uuid("Invalid project ID"),
  taskId: z.string().uuid("Invalid task ID"),
});
