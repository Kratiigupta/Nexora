import { Router } from "express";

const router = Router();

/**
 * Notification Routes
 * GET    /api/v1/notifications             — Get notifications
 * PUT    /api/v1/notifications/:id/read    — Mark as read
 * PUT    /api/v1/notifications/read-all    — Mark all as read
 */

router.get("/", (_req, res) => {
  res.json({ success: true, data: { message: "Notification routes — not yet implemented" } });
});

export default router;
