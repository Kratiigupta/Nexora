import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/helpers";
import { SkillExchangeStatus } from "@prisma/client";

/**
 * POST /api/v1/skill-exchange
 * Request a new skill exchange session.
 */
export const createSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const menteeId = req.user!.id;
    const { mentorId, skillId, description, scheduledAt } = req.body;

    if (menteeId === mentorId) {
      throw ApiError.badRequest("You cannot request a session with yourself");
    }

    // Verify mentor exists and has the skill
    const mentorSkill = await prisma.userSkill.findUnique({
      where: {
        userId_skillId: {
          userId: mentorId,
          skillId: skillId,
        },
      },
    });

    if (!mentorSkill) {
      throw ApiError.badRequest("The requested mentor does not possess this skill");
    }

    // Check for existing pending session
    const existingSession = await prisma.skillExchangeSession.findFirst({
      where: {
        menteeId,
        mentorId,
        skillId,
        status: SkillExchangeStatus.requested,
      },
    });

    if (existingSession) {
      throw ApiError.conflict("You already have a pending request with this mentor for this skill");
    }

    const session = await prisma.skillExchangeSession.create({
      data: {
        menteeId,
        mentorId,
        skillId,
        description,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    sendSuccess(res, session, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/skill-exchange
 * Get all sessions for the current user (as mentor or mentee).
 */
export const getSessions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    // Pagination (using standard convention)
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "20", 10);
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      prisma.skillExchangeSession.findMany({
        where: {
          OR: [{ mentorId: userId }, { menteeId: userId }],
        },
        include: {
          mentor: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
          mentee: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
          skill: { select: { id: true, name: true, category: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.skillExchangeSession.count({
        where: {
          OR: [{ mentorId: userId }, { menteeId: userId }],
        },
      }),
    ]);

    res.json({
      success: true,
      data: sessions,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + sessions.length < total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/skill-exchange/:id
 * Get details of a specific session.
 */
export const getSessionById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionId = req.params.id as string;
    const userId = req.user!.id;

    const session = await prisma.skillExchangeSession.findUnique({
      where: { id: sessionId },
      include: {
        mentor: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
        mentee: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
        skill: { select: { id: true, name: true, category: true } },
      },
    });

    if (!session) throw ApiError.notFound("Session");

    // Only participants can view
    if (session.mentorId !== userId && session.menteeId !== userId) {
      throw ApiError.forbidden("You do not have permission to view this session");
    }

    sendSuccess(res, session);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/skill-exchange/:id/accept
 * Mentor accepts a session request.
 */
export const acceptSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionId = req.params.id as string;
    const userId = req.user!.id;

    const session = await prisma.skillExchangeSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw ApiError.notFound("Session");
    if (session.mentorId !== userId) throw ApiError.forbidden("Only the mentor can accept this request");
    if (session.status !== SkillExchangeStatus.requested) throw ApiError.badRequest("Session is not in a requested state");

    const updated = await prisma.skillExchangeSession.update({
      where: { id: sessionId },
      data: { status: SkillExchangeStatus.accepted },
    });

    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/skill-exchange/:id/reject
 * Mentor rejects a session request.
 */
export const rejectSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionId = req.params.id as string;
    const userId = req.user!.id;

    const session = await prisma.skillExchangeSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw ApiError.notFound("Session");
    if (session.mentorId !== userId) throw ApiError.forbidden("Only the mentor can reject this request");
    if (session.status !== SkillExchangeStatus.requested) throw ApiError.badRequest("Session is not in a requested state");

    const updated = await prisma.skillExchangeSession.update({
      where: { id: sessionId },
      data: { status: SkillExchangeStatus.cancelled },
    });

    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/skill-exchange/:id/cancel
 * Requester cancels request, or either party cancels an active session.
 */
export const cancelSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionId = req.params.id as string;
    const userId = req.user!.id;

    const session = await prisma.skillExchangeSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw ApiError.notFound("Session");
    if (session.mentorId !== userId && session.menteeId !== userId) {
      throw ApiError.forbidden("You do not have permission to cancel this session");
    }

    if (session.status === SkillExchangeStatus.completed || session.status === SkillExchangeStatus.cancelled) {
      throw ApiError.badRequest(`Cannot cancel a session that is already ${session.status}`);
    }

    const updated = await prisma.skillExchangeSession.update({
      where: { id: sessionId },
      data: { status: SkillExchangeStatus.cancelled },
    });

    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/skill-exchange/:id/complete
 * Either party can mark an accepted/in_progress session as completed.
 */
export const completeSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionId = req.params.id as string;
    const userId = req.user!.id;

    const session = await prisma.skillExchangeSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw ApiError.notFound("Session");
    if (session.mentorId !== userId && session.menteeId !== userId) {
      throw ApiError.forbidden("You do not have permission to complete this session");
    }

    if (session.status !== SkillExchangeStatus.accepted && session.status !== SkillExchangeStatus.in_progress) {
      throw ApiError.badRequest("Only accepted or in_progress sessions can be completed");
    }

    const updated = await prisma.skillExchangeSession.update({
      where: { id: sessionId },
      data: { status: SkillExchangeStatus.completed },
    });

    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/skill-exchange/:id/schedule
 * Update the scheduled time for the session.
 */
export const updateSchedule = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionId = req.params.id as string;
    const userId = req.user!.id;
    const { scheduledAt } = req.body;

    const session = await prisma.skillExchangeSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw ApiError.notFound("Session");
    if (session.mentorId !== userId && session.menteeId !== userId) {
      throw ApiError.forbidden("You do not have permission to reschedule this session");
    }
    if (session.status === SkillExchangeStatus.completed || session.status === SkillExchangeStatus.cancelled) {
      throw ApiError.badRequest("Cannot reschedule a completed or cancelled session");
    }

    const updated = await prisma.skillExchangeSession.update({
      where: { id: sessionId },
      data: { scheduledAt: new Date(scheduledAt) },
    });

    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/skill-exchange/:id/rating
 * Mentee submits a rating/feedback after completion.
 */
export const submitRating = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionId = req.params.id as string;
    const userId = req.user!.id;
    const { rating, feedback } = req.body;

    const session = await prisma.skillExchangeSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw ApiError.notFound("Session");
    if (session.menteeId !== userId) {
      throw ApiError.forbidden("Only the mentee can submit a rating for the session");
    }
    if (session.status !== SkillExchangeStatus.completed) {
      throw ApiError.badRequest("Session must be completed before submitting a rating");
    }
    if (session.rating !== null) {
      throw ApiError.conflict("You have already submitted a rating for this session");
    }

    const updated = await prisma.skillExchangeSession.update({
      where: { id: sessionId },
      data: { rating, feedback },
    });

    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};
