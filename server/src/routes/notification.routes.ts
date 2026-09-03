import { Router } from "express";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import {
  notificationIdParamSchema,
  getNotificationsQuerySchema,
} from "../schemas/notification.schema";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller";

const router = Router();

/**
 * Notification Routes
 * Base: /api/v1/notifications (auth applied at index.ts level)
 *
 * GET    /api/v1/notifications             — Get paginated notifications + unread count
 * PUT    /api/v1/notifications/read-all    — Mark all as read
 * PUT    /api/v1/notifications/:id/read    — Mark a single notification as read
 */

// GET /api/v1/notifications
router.get(
  "/",
  validate({ query: getNotificationsQuerySchema }),
  asyncHandler(getNotifications)
);

// PUT /api/v1/notifications/read-all  (must be before /:id to avoid param clash)
router.put(
  "/read-all",
  asyncHandler(markAllAsRead)
);

// PUT /api/v1/notifications/:id/read
router.put(
  "/:id/read",
  validate({ params: notificationIdParamSchema }),
  asyncHandler(markAsRead)
);

export default router;
