import { Router } from "express";
import { validate } from "../middleware/validate";
import { updateProfileBodySchema, usernameParamSchema, fileUrlBodySchema } from "../schemas/profile.schema";
import {
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
  uploadAvatar,
  uploadResume,
  dailyCheckin,
  getDailyCheckinStatus,
} from "../controllers/profile.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

/**
 * Profile & Dashboard Routes
 *
 * GET    /api/v1/profile            — Get authenticated user's profile
 * PUT    /api/v1/profile            — Update authenticated user's profile
 * POST   /api/v1/profile/checkin    — Daily check-in (+1 star)
 * GET    /api/v1/profile/checkin    — Check today's check-in status
 * GET    /api/v1/profile/:username  — Get public profile by username
 * POST   /api/v1/profile/avatar     — Update avatar URL after client upload
 * POST   /api/v1/profile/resume     — Update resume URL after client upload
 * GET    /api/v1/dashboard          — Get aggregated dashboard data
 *
 * All routes require authentication (applied at the router level in routes/index.ts).
 */

// Own profile
router.get("/", asyncHandler(getMyProfile));
router.put(
  "/",
  validate({ body: updateProfileBodySchema }),
  asyncHandler(updateMyProfile)
);

// Daily check-in
router.post("/checkin", asyncHandler(dailyCheckin));
router.get("/checkin", asyncHandler(getDailyCheckinStatus));

// File URL updates (client uploads to Supabase Storage, then sends URL here)
router.post("/avatar", validate({ body: fileUrlBodySchema }), asyncHandler(uploadAvatar));
router.post("/resume", validate({ body: fileUrlBodySchema }), asyncHandler(uploadResume));

// Public profile — must come after /avatar, /resume, /checkin to avoid param collision
router.get("/:username", validate({ params: usernameParamSchema }), asyncHandler(getPublicProfile));

export default router;
