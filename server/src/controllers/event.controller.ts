import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/helpers";
import { EventType, Prisma } from "@prisma/client";

/**
 * POST /api/v1/events
 * Create a new event.
 */
export const createEvent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      title,
      description,
      type,
      organizer,
      bannerUrl,
      location,
      isOnline,
      registrationUrl,
      startDate,
      endDate,
    } = req.body;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        type: type as EventType,
        organizer: organizer || null,
        bannerUrl: bannerUrl || null,
        location: location || null,
        isOnline: isOnline ?? false,
        registrationUrl: registrationUrl || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        createdBy: userId,
      },
    });

    sendSuccess(res, event, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/events
 * Get list of events.
 */
export const getEvents = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { page, limit, type, search, upcoming } = req.query;
    
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.EventWhereInput = {};

    if (type) {
      where.type = type as EventType;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { organizer: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (upcoming === 'true') {
      where.startDate = { gte: new Date() };
    } else if (upcoming === 'false') {
      where.startDate = { lt: new Date() };
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          creator: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
          _count: { select: { bookmarks: true, registrations: true } },
          // Include current user's registration to determine RSVP status in bulk
          registrations: {
            where: { userId },
            select: { id: true, status: true },
          },
          // Include current user's bookmark status in bulk
          bookmarks: {
            where: { userId },
            select: { userId: true },
          },
        },
        orderBy: { startDate: "asc" },
        skip,
        take: limitNum,
      }),
      prisma.event.count({ where }),
    ]);

    const hasMore = skip + events.length < total;

    // Flatten registration/bookmark status into each event
    const enrichedEvents = events.map(({ registrations, bookmarks, ...event }) => ({
      ...event,
      isBookmarked: Boolean(bookmarks && bookmarks.length > 0),
      isRegistered: Boolean(registrations && registrations.length > 0 && registrations[0]?.status === "registered"),
    }));

    sendSuccess(res, { events: enrichedEvents, pagination: { page: pageNum, limit: limitNum, total, hasMore } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/events/:id
 * Get a specific event.
 */
export const getEventById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const eventId = req.params.id as string;
    const userId = req.user!.id;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        creator: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
        _count: { select: { bookmarks: true, registrations: true } },
        bookmarks: {
          where: { userId },
          select: { userId: true },
        },
        registrations: {
          where: { userId },
          select: { id: true, status: true },
        },
      },
    });

    if (!event) throw ApiError.notFound("Event");

    // Enhance response with user-specific flags
    const isBookmarked = Boolean(event.bookmarks && event.bookmarks.length > 0);
    const isRegistered = Boolean(event.registrations && event.registrations.length > 0 && event.registrations[0]?.status === "registered");
    
    // Remove the arrays to keep response clean
    const { bookmarks, registrations, ...eventData } = event;
    void bookmarks;
    void registrations;

    sendSuccess(res, { ...eventData, isBookmarked, isRegistered });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/events/:id
 * Update a specific event.
 */
export const updateEvent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const eventId = req.params.id as string;
    const userId = req.user!.id;
    const {
      title,
      description,
      type,
      organizer,
      bannerUrl,
      location,
      isOnline,
      registrationUrl,
      startDate,
      endDate,
    } = req.body;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) throw ApiError.notFound("Event");

    if (event.createdBy !== userId) {
      throw ApiError.forbidden("Only the event creator can update this event");
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type: type as EventType }),
        ...(organizer !== undefined && { organizer: organizer || null }),
        ...(bannerUrl !== undefined && { bannerUrl: bannerUrl || null }),
        ...(location !== undefined && { location: location || null }),
        ...(isOnline !== undefined && { isOnline }),
        ...(registrationUrl !== undefined && { registrationUrl: registrationUrl || null }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
      },
    });

    sendSuccess(res, updatedEvent);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/events/:id
 * Delete a specific event.
 */
export const deleteEvent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const eventId = req.params.id as string;
    const userId = req.user!.id;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) throw ApiError.notFound("Event");

    if (event.createdBy !== userId) {
      throw ApiError.forbidden("Only the event creator can delete this event");
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/events/:id/bookmark
 * Bookmark an event.
 */
export const bookmarkEvent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const eventId = req.params.id as string;
    const userId = req.user!.id;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) throw ApiError.notFound("Event");

    const existingBookmark = await prisma.eventBookmark.findUnique({
      where: {
        eventId_userId: { eventId, userId }
      }
    });

    if (existingBookmark) {
      throw ApiError.conflict("Event is already bookmarked");
    }

    await prisma.eventBookmark.create({
      data: {
        eventId,
        userId,
      }
    });

    sendSuccess(res, { bookmarked: true }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/events/:id/bookmark
 * Remove a bookmark from an event.
 */
export const removeBookmark = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const eventId = req.params.id as string;
    const userId = req.user!.id;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) throw ApiError.notFound("Event");

    const existingBookmark = await prisma.eventBookmark.findUnique({
      where: {
        eventId_userId: { eventId, userId }
      }
    });

    if (!existingBookmark) {
      throw ApiError.notFound("Bookmark not found");
    }

    await prisma.eventBookmark.delete({
      where: {
        eventId_userId: { eventId, userId }
      }
    });

    sendSuccess(res, { bookmarked: false });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/events/:id/register
 * RSVP / register for an event (internal Nexora registration).
 */
export const registerForEvent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const eventId = req.params.id as string;
    const userId = req.user!.id;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) throw ApiError.notFound("Event");

    // Check for existing registration
    const existing = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
    });

    if (existing) {
      if (existing.status === "registered") {
        throw ApiError.conflict("You are already registered for this event");
      }
      // Re-register if previously cancelled
      const updated = await prisma.eventRegistration.update({
        where: { id: existing.id },
        data: { status: "registered", updatedAt: new Date() },
      });
      sendSuccess(res, { registered: true, registration: updated });
      return;
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
        status: "registered",
      },
    });

    sendSuccess(res, { registered: true, registration }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/events/:id/register
 * Cancel RSVP / registration for an event.
 */
export const cancelRegistration = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const eventId = req.params.id as string;
    const userId = req.user!.id;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) throw ApiError.notFound("Event");

    const existing = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
    });

    if (!existing || existing.status !== "registered") {
      throw ApiError.notFound("Registration not found");
    }

    await prisma.eventRegistration.update({
      where: { id: existing.id },
      data: { status: "cancelled", updatedAt: new Date() },
    });

    sendSuccess(res, { registered: false });
  } catch (error) {
    next(error);
  }
};
