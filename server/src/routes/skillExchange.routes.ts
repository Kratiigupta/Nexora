import { Router } from "express";

const router = Router();

/**
 * Skill Exchange Routes
 * GET    /api/v1/skill-exchange         — List sessions
 * POST   /api/v1/skill-exchange         — Request session
 * GET    /api/v1/skill-exchange/:id     — Get session
 * PUT    /api/v1/skill-exchange/:id     — Update session
 * POST   /api/v1/skill-exchange/:id/review — Submit review
 */

router.get("/", (_req, res) => {
  res.json({ success: true, data: { message: "Skill exchange routes — not yet implemented" } });
});

export default router;
