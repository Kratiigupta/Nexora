import { Router } from "express";

const router = Router();

/**
 * User Routes
 * GET    /api/v1/users          — Search/filter users
 * GET    /api/v1/users/:id      — Get user profile
 * PUT    /api/v1/users/:id      — Update profile
 * GET    /api/v1/users/:id/skills  — Get user skills
 * PUT    /api/v1/users/:id/skills  — Update user skills
 */

router.get("/", (_req, res) => {
  res.json({ success: true, data: { message: "User routes — not yet implemented" } });
});

export default router;
