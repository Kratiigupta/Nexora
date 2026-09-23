import { Router } from "express";
import { validate } from "../middleware/validate";
import {
  createSessionSchema,
  updateScheduleSchema,
  ratingSchema,
  sessionIdParamSchema,
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
router.get("/:id", validate({ params: sessionIdParamSchema }), asyncHandler(getSessionById));

router.post("/:id/accept", validate({ params: sessionIdParamSchema }), asyncHandler(acceptSession));
router.post("/:id/reject", validate({ params: sessionIdParamSchema }), asyncHandler(rejectSession));
router.post("/:id/cancel", validate({ params: sessionIdParamSchema }), asyncHandler(cancelSession));
router.post("/:id/complete", validate({ params: sessionIdParamSchema }), asyncHandler(completeSession));

router.patch("/:id/schedule", validate({ params: sessionIdParamSchema, body: updateScheduleSchema }), asyncHandler(updateSchedule));
router.post("/:id/rating", validate({ params: sessionIdParamSchema, body: ratingSchema }), asyncHandler(submitRating));

export default router;

