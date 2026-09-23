import { Router } from "express";

import { getMatchInsight } from "../controllers/ai.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { candidateIdParamSchema } from "../schemas/ai.schema";

const router = Router();

/**
 * AI Routes
 * POST   /api/v1/ai/match-insight/:candidateId   — AI Match Insight for Discover
 */

router.post(
  "/match-insight/:candidateId",
  validate({ params: candidateIdParamSchema }),
  asyncHandler(getMatchInsight)
);

export default router;
