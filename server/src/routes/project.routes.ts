import { Router } from "express";

const router = Router();

/**
 * Project Routes
 * GET    /api/v1/projects             — List projects
 * POST   /api/v1/projects             — Create project
 * GET    /api/v1/projects/:id         — Get project
 * PUT    /api/v1/projects/:id         — Update project
 * DELETE /api/v1/projects/:id         — Delete project
 * GET    /api/v1/projects/:id/tasks   — List tasks
 * POST   /api/v1/projects/:id/tasks   — Create task
 */

router.get("/", (_req, res) => {
  res.json({ success: true, data: { message: "Project routes — not yet implemented" } });
});

export default router;
