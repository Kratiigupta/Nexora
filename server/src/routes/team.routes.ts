import { Router } from "express";

const router = Router();

/**
 * Team Routes
 * GET    /api/v1/teams             — List/search teams
 * POST   /api/v1/teams             — Create team
 * GET    /api/v1/teams/:id         — Get team details
 * PUT    /api/v1/teams/:id         — Update team
 * DELETE /api/v1/teams/:id         — Delete team
 * POST   /api/v1/teams/:id/join    — Request to join
 * GET    /api/v1/teams/:id/members — List members
 */

router.get("/", (_req, res) => {
  res.json({ success: true, data: { message: "Team routes — not yet implemented" } });
});

export default router;
