import { Router } from "express";

const router = Router();

/**
 * Admin Routes
 * GET    /api/v1/admin/stats           — Platform statistics
 * GET    /api/v1/admin/users           — All users (with filters)
 * PUT    /api/v1/admin/users/:id/role  — Change user role
 * PUT    /api/v1/admin/users/:id/ban   — Ban/unban user
 */

router.get("/stats", (_req, res) => {
  res.json({ success: true, data: { message: "Admin routes — not yet implemented" } });
});

export default router;
