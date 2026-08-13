import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/project.controller";
import {
  createProjectSchema,
  updateProjectSchema,
  createTaskSchema,
  updateTaskSchema,
  projectIdParamSchema,
  projectAndTaskIdParamSchema,
} from "../schemas/project.schema";

const router = Router();

// Project Routes
router.post("/", validate({ body: createProjectSchema }), asyncHandler(createProject));
router.get("/", asyncHandler(getMyProjects));
router.get("/:id", validate({ params: projectIdParamSchema }), asyncHandler(getProjectById));
router.patch("/:id", validate({ params: projectIdParamSchema, body: updateProjectSchema }), asyncHandler(updateProject));
router.delete("/:id", validate({ params: projectIdParamSchema }), asyncHandler(deleteProject));

// Task Routes
router.post("/:id/tasks", validate({ params: projectIdParamSchema, body: createTaskSchema }), asyncHandler(createTask));
router.patch(
  "/:id/tasks/:taskId",
  validate({ params: projectAndTaskIdParamSchema, body: updateTaskSchema }),
  asyncHandler(updateTask)
);
router.delete("/:id/tasks/:taskId", validate({ params: projectAndTaskIdParamSchema }), asyncHandler(deleteTask));

export default router;
