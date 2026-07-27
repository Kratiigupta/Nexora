import { Router } from "express";

const router = Router();

/**
 * Upload Routes
 * POST   /api/v1/upload/avatar  — Upload avatar
 * POST   /api/v1/upload/file    — Upload general file
 * DELETE /api/v1/upload/:fileId — Delete file
 */

router.post("/avatar", (_req, res) => {
  res.json({ success: true, data: { message: "Upload routes — not yet implemented" } });
});

export default router;
