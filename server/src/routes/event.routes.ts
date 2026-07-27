import { Router } from "express";

const router = Router();

/**
 * Event Routes
 * GET    /api/v1/events         — List events
 * POST   /api/v1/events         — Create event (admin)
 * GET    /api/v1/events/:id     — Get event
 * POST   /api/v1/events/:id/bookmark — Bookmark event
 */

router.get("/", (_req, res) => {
  res.json({ success: true, data: { message: "Event routes — not yet implemented" } });
});

export default router;
