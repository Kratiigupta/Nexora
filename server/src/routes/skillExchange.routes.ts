import { Router } from "express";
import { validate } from "../middleware/validate";
import {
  createSessionSchema,
  updateScheduleSchema,
  ratingSchema,
} from "../schemas/skillExchange.schema";
import {
  createSession,
  getSessions,
  getSessionById,
  acceptSession,
  rejectSession,
  cancelSession,
  completeSession,
  updateSchedule,
  submitRating,
} from "../controllers/skillExchange.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

/**
 * Skill Exchange Routes
 * Protected by global authMiddleware in index.ts
 */

router.post("/", validate({ body: createSessionSchema }), asyncHandler(createSession));
router.get("/", asyncHandler(getSessions));
router.get("/:id", asyncHandler(getSessionById));

router.post("/:id/accept", asyncHandler(acceptSession));
router.post("/:id/reject", asyncHandler(rejectSession));
router.post("/:id/cancel", asyncHandler(cancelSession));
router.post("/:id/complete", asyncHandler(completeSession));

router.patch("/:id/schedule", validate({ body: updateScheduleSchema }), asyncHandler(updateSchedule));
router.post("/:id/rating", validate({ body: ratingSchema }), asyncHandler(submitRating));

export default router;
