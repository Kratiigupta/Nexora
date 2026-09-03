import { Router } from "express";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { userIdParamSchema, updateConnectionBodySchema } from "../schemas/connection.schema";
import {
  getConnectionStatus,
  sendConnectionRequest,
  updateConnectionStatus,
  removeConnection,
} from "../controllers/connection.controller";

const router = Router();

/**
 * Connection Routes
 * Base: /api/v1/connections (auth applied at index.ts level)
 */

router.get(
  "/:userId/status",
  validate({ params: userIdParamSchema }),
  asyncHandler(getConnectionStatus)
);

router.post(
  "/:userId",
  validate({ params: userIdParamSchema }),
  asyncHandler(sendConnectionRequest)
);

router.put(
  "/:userId",
  validate({ params: userIdParamSchema, body: updateConnectionBodySchema }),
  asyncHandler(updateConnectionStatus)
);

router.delete(
  "/:userId",
  validate({ params: userIdParamSchema }),
  asyncHandler(removeConnection)
);

export default router;
