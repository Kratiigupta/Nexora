import { Router } from "express";

import { getMatchInsight } from "../controllers/ai.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

/**
 * AI Routes
 * POST   /api/v1/ai/match-insight/:candidateId   — AI Match Insight for Discover
 */

router.post("/match-insight/:candidateId", asyncHandler(getMatchInsight));

export default router;
