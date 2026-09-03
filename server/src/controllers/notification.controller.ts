import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { sendSuccess, getPagination, buildPaginationMeta } from "../utils/helpers";

/**
 * GET /api/v1/notifications
 * Get paginated notifications for the authenticated user.
 * Returns notifications list + unread count.
 */
export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { page, limit, unread_only } = req.query;

    const { page: pageNum, limit: limitNum, offset } = getPagination(
      page as string | undefined,
      limit as string | undefined
    );

    // Build where clause — always scoped to the authenticated user
    const where: { userId: string; isRead?: boolean } = { userId };

    if (unread_only === "true") {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limitNum,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    sendSuccess(
      res,
      { notifications, unreadCount },
      200,
      buildPaginationMeta(pageNum, limitNum, total)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/notifications/:id/read
 * Mark a single notification as read.
 */
export const markAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id as string;

    // Verify the notification belongs to the current user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw ApiError.notFound("Notification");
    }

    if (notification.userId !== userId) {
      throw ApiError.forbidden("You can only mark your own notifications as read");
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/notifications/read-all
 * Mark all notifications as read for the authenticated user.
 */
export const markAllAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    sendSuccess(res, { updated: result.count });
  } catch (error) {
    next(error);
  }
};
