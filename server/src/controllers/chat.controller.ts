import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/helpers";
import { getIO } from "../config/socket";
import { ConversationType, MessageType, TeamMemberRole, NotificationType } from "@prisma/client";

/**
 * Helper to check if a user can access a conversation.
 * Returns the conversation if authorized, throws ApiError if not.
 */
const getAuthorizedConversation = async (conversationId: string, userId: string) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: true,
      team: { include: { members: true } },
      project: { include: { team: { include: { members: true } } } },
    },
  });

  if (!conversation) throw ApiError.notFound("Conversation");

  let isAuthorized = false;

  if (conversation.type === "direct") {
    isAuthorized = conversation.participants.some((p) => p.userId === userId);
  } else if (conversation.type === "team") {
    isAuthorized = conversation.team?.members.some((m) => m.userId === userId) || false;
  } else if (conversation.type === "project") {
    isAuthorized =
      conversation.project?.createdBy === userId ||
      (conversation.project?.team?.members.some((m) => m.userId === userId) || false);
  }

  if (!isAuthorized) throw ApiError.forbidden("You do not have access to this conversation");

  return conversation;
};

/**
 * GET /api/v1/chat/conversations
 * Get all conversations the current user is authorized to access.
 */
export const getConversations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          // Direct conversations where user is a participant
          {
            type: "direct",
            participants: {
              some: { userId },
            },
          },
          // Team conversations where user is a member
          {
            type: "team",
            team: {
              members: {
                some: { userId },
              },
            },
          },
          // Project conversations where user has access
          {
            type: "project",
            OR: [
              { project: { createdBy: userId } },
              { project: { team: { members: { some: { userId } } } } },
            ],
          },
        ],
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
          },
        },
        team: { select: { id: true, name: true, avatarUrl: true } },
        project: { select: { id: true, title: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { sender: { select: { id: true, fullName: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    sendSuccess(res, conversations);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/chat/conversations
 * Create a new conversation (direct, team, or project).
 */
export const createConversation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { type, participantId, teamId, projectId } = req.body;

    if (type === "direct") {
      if (userId === participantId) {
        throw ApiError.badRequest("Cannot create a direct conversation with yourself");
      }

      // Check if direct conversation already exists
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: "direct",
          participants: {
            every: {
              userId: { in: [userId, participantId] },
            },
          },
        },
        include: {
          participants: {
            include: { user: { select: { id: true, fullName: true, username: true, avatarUrl: true } } },
          },
        },
      });

      // Also ensure it has exactly 2 participants
      if (existingConversation && existingConversation.participants.length === 2) {
        sendSuccess(res, existingConversation, 200);
        return;
      }

      // Verify participant exists
      const participant = await prisma.profile.findUnique({ where: { id: participantId } });
      if (!participant) throw ApiError.notFound("Participant user not found");

      const newConversation = await prisma.conversation.create({
        data: {
          type: "direct",
          participants: {
            create: [
              { userId },
              { userId: participantId },
            ],
          },
        },
        include: {
          participants: {
            include: { user: { select: { id: true, fullName: true, username: true, avatarUrl: true } } },
          },
        },
      });

      sendSuccess(res, newConversation, 201);
    } else if (type === "team") {
      // Check team membership
      const membership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId } },
      });
      if (!membership) throw ApiError.forbidden("You must be a member of the team to create a team conversation");

      // Check if team conversation already exists
      let teamConversation = await prisma.conversation.findFirst({
        where: { type: "team", teamId },
        include: { team: { select: { id: true, name: true, avatarUrl: true } } },
      });

      if (!teamConversation) {
        teamConversation = await prisma.conversation.create({
          data: { type: "team", teamId },
          include: { team: { select: { id: true, name: true, avatarUrl: true } } },
        });
      }

      sendSuccess(res, teamConversation, teamConversation.createdAt > new Date(Date.now() - 1000) ? 201 : 200);
    } else if (type === "project") {
      // Check project access
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { team: { include: { members: true } } },
      });

      if (!project) throw ApiError.notFound("Project not found");

      const isAuthorized =
        project.createdBy === userId || (project.team?.members.some((m) => m.userId === userId) || false);

      if (!isAuthorized) {
        throw ApiError.forbidden("You must have access to the project to create a project conversation");
      }

      // Check if project conversation already exists
      let projectConversation = await prisma.conversation.findFirst({
        where: { type: "project", projectId },
        include: { project: { select: { id: true, title: true } } },
      });

      if (!projectConversation) {
        projectConversation = await prisma.conversation.create({
          data: { type: "project", projectId },
          include: { project: { select: { id: true, title: true } } },
        });
      }

      sendSuccess(res, projectConversation, projectConversation.createdAt > new Date(Date.now() - 1000) ? 201 : 200);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/chat/conversations/:id
 * Get details for a specific conversation.
 */
export const getConversationById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const conversationId = req.params.id as string;

    const conversation = await getAuthorizedConversation(conversationId, userId);

    sendSuccess(res, conversation);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/chat/conversations/:id/messages
 * Get paginated messages for a conversation.
 */
export const getMessages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const conversationId = req.params.id as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    await getAuthorizedConversation(conversationId, userId);

    const skip = (page - 1) * limit;

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" }, // Newest first for API pagination
      skip,
      take: limit,
    });

    const total = await prisma.message.count({ where: { conversationId } });

    sendSuccess(res, {
      messages,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + messages.length < total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/chat/conversations/:id/messages
 * Send a message to a conversation.
 */
export const sendMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const conversationId = req.params.id as string;
    const { content, type, fileUrl } = req.body;

    const conversation = await getAuthorizedConversation(conversationId, userId);

    // Prevent non-admin/system from spoofing system messages if needed, but per prompt:
    // "system messages must NOT be freely spoofable by normal authenticated clients."
    if (type === "system") {
      throw ApiError.forbidden("Normal users cannot send system messages");
    }

    const message = await prisma.$transaction(async (tx) => {
      // Create message
      const newMessage = await tx.message.create({
        data: {
          conversationId,
          senderId: userId,
          content,
          type: type as MessageType,
          fileUrl: fileUrl || null,
        },
        include: {
          sender: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
        },
      });

      // Upsert conversation participant for sender to update lastReadAt
      await tx.conversationParticipant.upsert({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
        update: { lastReadAt: new Date() },
        create: {
          conversationId,
          userId,
          lastReadAt: new Date(),
        },
      });

      return newMessage;
    });

    // Determine all authorized participants to notify them
    const participantIds = new Set<string>();
    
    if (conversation.type === "direct") {
      conversation.participants.forEach((p) => participantIds.add(p.userId));
      
      // Since it's a direct message, it's good practice to send a notification if they are not the sender
      const receiverId = conversation.participants.find(p => p.userId !== userId)?.userId;
      if (receiverId) {
        // We'll trust Socket.IO to deliver real-time, but for direct messages
        // we can also fire a Notification as suggested by the schema.
        await prisma.notification.create({
          data: {
            userId: receiverId,
            type: NotificationType.message,
            title: `New message from ${message.sender.fullName}`,
            body: type === "text" ? content.substring(0, 50) : `Sent an ${type}`,
            referenceType: "conversation",
            referenceId: conversationId,
          }
        }).catch(err => console.error("Failed to create message notification:", err));
      }
    } else if (conversation.type === "team") {
      conversation.team?.members.forEach((m) => participantIds.add(m.userId));
    } else if (conversation.type === "project") {
      if (conversation.project?.createdBy) participantIds.add(conversation.project.createdBy);
      conversation.project?.team?.members.forEach((m) => participantIds.add(m.userId));
    }

    try {
      const io = getIO();
      // Emit to conversation room for active chat listeners
      io.to(conversationId).emit("new_message", message);

      // Emit to each participant's user room for global updates (offline/other pages)
      participantIds.forEach((pId) => {
        io.to(`user:${pId}`).emit("new_message", message);
      });
    } catch (e) {
      console.warn("Socket.IO not initialized or failed to emit", e);
    }

    sendSuccess(res, message, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/chat/conversations/:id/read
 * Mark a conversation as read for the authenticated user.
 */
export const markAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const conversationId = req.params.id as string;

    await getAuthorizedConversation(conversationId, userId);

    await prisma.conversationParticipant.upsert({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      update: { lastReadAt: new Date() },
      create: {
        conversationId,
        userId,
        lastReadAt: new Date(),
      },
    });

    sendSuccess(res, { success: true });
  } catch (error) {
    next(error);
  }
};
