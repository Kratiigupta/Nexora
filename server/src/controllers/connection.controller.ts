import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/helpers";
import { NotificationType } from "@prisma/client";
import { getIO } from "../config/socket";
import { logger } from "../utils/logger";

/**
 * GET /api/v1/connections/:userId/status
 * Get connection status with another user.
 */
export const getConnectionStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUserId = req.user!.id;
    const targetUserId = req.params.userId as string;

    if (currentUserId === targetUserId) {
      sendSuccess(res, { status: "none" });
      return;
    }

    const connection = await prisma.userConnection.findFirst({
      where: {
        OR: [
          { requesterId: currentUserId, receiverId: targetUserId },
          { requesterId: targetUserId, receiverId: currentUserId },
        ],
      },
    });

    if (!connection) {
      sendSuccess(res, { status: "none" });
      return;
    }

    if (connection.status === "accepted") {
      sendSuccess(res, { status: "connected" });
      return;
    }

    if (connection.status === "pending") {
      if (connection.requesterId === currentUserId) {
        sendSuccess(res, { status: "pending_sent" });
      } else {
        sendSuccess(res, { status: "pending_received" });
      }
      return;
    }

    sendSuccess(res, { status: "none" });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/connections/:userId
 * Send a connection request.
 */
export const sendConnectionRequest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUserId = req.user!.id;
    const targetUserId = req.params.userId as string;

    if (currentUserId === targetUserId) {
      throw ApiError.badRequest("You cannot connect with yourself");
    }

    const targetUser = await prisma.profile.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      throw ApiError.notFound("User");
    }

    // Check if connection already exists
    const existing = await prisma.userConnection.findFirst({
      where: {
        OR: [
          { requesterId: currentUserId, receiverId: targetUserId },
          { requesterId: targetUserId, receiverId: currentUserId },
        ],
      },
    });

    if (existing) {
      if (existing.status === "accepted") {
        throw ApiError.conflict("You are already connected");
      }
      if (existing.status === "pending") {
        throw ApiError.conflict("Connection request is already pending");
      }
    }

    const connection = await prisma.userConnection.create({
      data: {
        requesterId: currentUserId,
        receiverId: targetUserId,
        status: "pending",
      },
    });

    // Notify the target user
    const currentUser = await prisma.profile.findUnique({ where: { id: currentUserId } });
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: NotificationType.connection_request,
          title: "New Connection Request",
          body: `${currentUser?.fullName} wants to connect with you.`,
          referenceType: "profile",
          referenceId: currentUserId,
        },
      });
      getIO().to(`user:${targetUserId}`).emit("notification", notification);
    } catch (err) {
      logger.error("Failed to create/emit connection request notification", err);
    }

    sendSuccess(res, { status: "pending_sent", connection }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/connections/:userId
 * Accept or reject a connection request.
 */
export const updateConnectionStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUserId = req.user!.id;
    const targetUserId = req.params.userId as string;
    const { status } = req.body;

    const connection = await prisma.userConnection.findUnique({
      where: {
        requesterId_receiverId: {
          requesterId: targetUserId,
          receiverId: currentUserId,
        },
      },
    });

    if (!connection) {
      throw ApiError.notFound("Connection request");
    }

    if (connection.status !== "pending") {
      throw ApiError.badRequest("Connection request is not pending");
    }

    if (status === "rejected") {
      await prisma.userConnection.delete({
        where: { id: connection.id },
      });
      sendSuccess(res, { status: "none" });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const conn = await tx.userConnection.update({
        where: { id: connection.id },
        data: { status: "accepted" },
      });

      await tx.activityLog.create({
        data: {
          userId: currentUserId,
          action: "connection_made",
          description: "Made a new connection",
          metadata: { connectionId: conn.id, connectedTo: targetUserId },
        },
      });

      return conn;
    });

    // Notify the requester that they were accepted
    const currentUser = await prisma.profile.findUnique({ where: { id: currentUserId } });
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: NotificationType.system,
          title: "Connection Accepted",
          body: `${currentUser?.fullName} accepted your connection request.`,
          referenceType: "profile",
          referenceId: currentUserId,
        },
      });
      getIO().to(`user:${targetUserId}`).emit("notification", notification);
    } catch (err) {
      logger.error("Failed to create/emit connection accepted notification", err);
    }

    sendSuccess(res, { status: "connected", connection: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/connections/:userId
 * Cancel a pending outgoing request or remove an accepted connection.
 */
export const removeConnection = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUserId = req.user!.id;
    const targetUserId = req.params.userId as string;

    const connection = await prisma.userConnection.findFirst({
      where: {
        OR: [
          { requesterId: currentUserId, receiverId: targetUserId },
          { requesterId: targetUserId, receiverId: currentUserId },
        ],
      },
    });

    if (!connection) {
      throw ApiError.notFound("Connection not found");
    }

    await prisma.userConnection.delete({
      where: { id: connection.id },
    });

    sendSuccess(res, { status: "none" });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/connections
 * Get all connections for the authenticated user.
 * Returns categorized arrays: connections, incomingRequests, outgoingRequests.
 * Strictly scoped to req.user.id.
 */
export const getAllConnections = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUserId = req.user!.id;

    // Profile fields to include for the "other" user
    const profileSelect = {
      id: true,
      fullName: true,
      username: true,
      avatarUrl: true,
      department: true,
      year: true,
    };

    // Fetch all connections where the current user is either requester or receiver
    const allConnections = await prisma.userConnection.findMany({
      where: {
        OR: [
          { requesterId: currentUserId },
          { receiverId: currentUserId },
        ],
      },
      include: {
        requester: { select: profileSelect },
        receiver: { select: profileSelect },
      },
      orderBy: { createdAt: "desc" },
    });

    // Categorize and attach the "other" user's profile
    const connections = allConnections
      .filter((c) => c.status === "accepted")
      .map((c) => ({
        id: c.id,
        status: c.status,
        createdAt: c.createdAt,
        user: c.requesterId === currentUserId ? c.receiver : c.requester,
      }));

    const incomingRequests = allConnections
      .filter((c) => c.status === "pending" && c.receiverId === currentUserId)
      .map((c) => ({
        id: c.id,
        status: c.status,
        createdAt: c.createdAt,
        user: c.requester,
      }));

    const outgoingRequests = allConnections
      .filter((c) => c.status === "pending" && c.requesterId === currentUserId)
      .map((c) => ({
        id: c.id,
        status: c.status,
        createdAt: c.createdAt,
        user: c.receiver,
      }));

    sendSuccess(res, { connections, incomingRequests, outgoingRequests });
  } catch (error) {
    next(error);
  }
};
