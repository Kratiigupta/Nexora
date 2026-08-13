import { Router } from "express";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createEventSchema,
  updateEventSchema,
  eventIdParamSchema,
  getEventsQuerySchema
} from "../schemas/event.schema";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  bookmarkEvent,
  removeBookmark
} from "../controllers/event.controller";

const router = Router();

/**
 * Event Routes
 * Base: /api/v1/events
 */

// GET /api/v1/events
router.get(
  "/",
  validate({ query: getEventsQuerySchema }),
  asyncHandler(getEvents)
);

// POST /api/v1/events
router.post(
  "/",
  validate({ body: createEventSchema }),
  asyncHandler(createEvent)
);

// GET /api/v1/events/:id
router.get(
  "/:id",
  validate({ params: eventIdParamSchema }),
  asyncHandler(getEventById)
);

// PATCH /api/v1/events/:id
router.patch(
  "/:id",
  validate({ params: eventIdParamSchema, body: updateEventSchema }),
  asyncHandler(updateEvent)
);

// DELETE /api/v1/events/:id
router.delete(
  "/:id",
  validate({ params: eventIdParamSchema }),
  asyncHandler(deleteEvent)
);

// POST /api/v1/events/:id/bookmark
router.post(
  "/:id/bookmark",
  validate({ params: eventIdParamSchema }),
  asyncHandler(bookmarkEvent)
);

// DELETE /api/v1/events/:id/bookmark
router.delete(
  "/:id/bookmark",
  validate({ params: eventIdParamSchema }),
  asyncHandler(removeBookmark)
);

export default router;
