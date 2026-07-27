import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  registerSchema,
  updateProfileSchema,
  onboardingSchema,
} from "../schemas/auth.schema";
import {
  register,
  getMe,
  updateMe,
  completeOnboarding,
} from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

/**
 * Auth Routes
 * POST /api/v1/auth/register     — Create profile after Supabase signup (public)
 * GET  /api/v1/auth/me            — Get current user profile (auto-creates if missing)
 * PUT  /api/v1/auth/me            — Update current user profile
 * POST /api/v1/auth/onboarding   — Complete onboarding (bio, skills, links)
 */

// Public — called immediately after Supabase signup
router.post("/register", validate({ body: registerSchema.shape.body }), asyncHandler(register));

// Protected — requires valid JWT
router.get("/me", authMiddleware, asyncHandler(getMe));
router.put(
  "/me",
  authMiddleware,
  validate({ body: updateProfileSchema.shape.body }),
  asyncHandler(updateMe)
);
router.post(
  "/onboarding",
  authMiddleware,
  validate({ body: onboardingSchema.shape.body }),
  asyncHandler(completeOnboarding)
);

export default router;
