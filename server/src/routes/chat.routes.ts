import { Router } from "express";

const router = Router();

/**
 * Chat Routes
 * GET    /api/v1/chat/conversations          — List conversations
 * POST   /api/v1/chat/conversations          — Create conversation
 * GET    /api/v1/chat/conversations/:id       — Get conversation
 * GET    /api/v1/chat/conversations/:id/messages — Get messages (paginated)
 */

router.get("/conversations", (_req, res) => {
  res.json({ success: true, data: { message: "Chat routes — not yet implemented" } });
});

export default router;
