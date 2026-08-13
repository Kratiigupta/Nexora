import { Router } from "express";
import {
  getConversations,
  createConversation,
  getConversationById,
  getMessages,
  sendMessage,
  markAsRead,
} from "../controllers/chat.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import {
  createConversationSchema,
  sendMessageSchema,
  paginationSchema,
  conversationIdParamSchema,
} from "../schemas/chat.schema";

const router = Router();

/**
 * Chat Routes
 * GET    /api/v1/chat/conversations          — List conversations
 * POST   /api/v1/chat/conversations          — Create conversation
 * GET    /api/v1/chat/conversations/:id       — Get conversation details
 * GET    /api/v1/chat/conversations/:id/messages — Get messages
 * POST   /api/v1/chat/conversations/:id/messages — Send a message
 * POST   /api/v1/chat/conversations/:id/read     — Mark conversation as read
 */

router.get("/conversations", asyncHandler(getConversations));

router.post(
  "/conversations",
  validate({ body: createConversationSchema }),
  asyncHandler(createConversation)
);

router.get(
  "/conversations/:id",
  validate({ params: conversationIdParamSchema }),
  asyncHandler(getConversationById)
);

router.get(
  "/conversations/:id/messages",
  validate({ params: conversationIdParamSchema, query: paginationSchema }),
  asyncHandler(getMessages)
);

router.post(
  "/conversations/:id/messages",
  validate({ params: conversationIdParamSchema, body: sendMessageSchema }),
  asyncHandler(sendMessage)
);

router.post(
  "/conversations/:id/read",
  validate({ params: conversationIdParamSchema }),
  asyncHandler(markAsRead)
);

export default router;
