import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { supabaseAdmin } from "../config/supabase";
import { AuthenticatedRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/helpers";
import { logger } from "../utils/logger";
import type { RegisterInput, UpdateProfileInput, OnboardingInput } from "../schemas/auth.schema";

/**
 * Generate a unique username from fullName or email.
 * Appends a random suffix if the base username is taken.
 */
const generateUsername = async (fullName: string, email: string): Promise<string> => {
  // Try from fullName first: "John Doe" → "johndoe"
  let base = fullName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 30);

  // Fallback to email prefix if name produces nothing usable
  if (base.length < 3) {
    base = (email.split("@")[0] || "user").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30);
  }

  if (base.length < 3) {
    base = "user";
  }

  // Check if base username is available
  const existing = await prisma.profile.findUnique({ where: { username: base } });
  if (!existing) return base;

  // Append random digits until unique
  for (let i = 0; i < 10; i++) {
    const suffix = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const candidate = `${base}${suffix}`;
    const taken = await prisma.profile.findUnique({ where: { username: candidate } });
    if (!taken) return candidate;
  }

  // Extremely unlikely fallback
  return `${base}${Date.now()}`;
};

/**
 * POST /api/v1/auth/register
 * Creates a profile in PostgreSQL after the user signs up via Supabase.
 */
export const register = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { supabaseId, email, fullName, department, year, college, avatarUrl } =
      req.body as RegisterInput;

    // Security Verification: Ensure the Supabase UUID represents a legitimate account in Supabase Auth
    // and matches the submitted email address to prevent unauthorized identity spoofing or fake profile creation.
    const { data: supabaseUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(supabaseId);
    if (authError || !supabaseUser || !supabaseUser.user || supabaseUser.user.email?.toLowerCase() !== email.toLowerCase()) {
      throw ApiError.unauthorized("Invalid Supabase credentials or account verification failed");
    }

    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { id: supabaseId },
      include: {
        skills: {
          include: { skill: true },
        },
      },
    });

    if (existingProfile) {
      // Return existing profile idempotently to handle race conditions between GET /me and POST /register
      sendSuccess(res, existingProfile, 200);
      return;
    }

    // Generate unique username
    const username = await generateUsername(fullName, email);
    const safeYear = Math.min(6, Math.max(1, Number(year) || 1));

    try {
      // Create the profile
      const profile = await prisma.profile.create({
        data: {
          id: supabaseId,
          fullName,
          username,
          department,
          year: safeYear,
          college: college || null,
          avatarUrl: avatarUrl || null,
          role: "student", // Always default to student
        },
        include: {
          skills: {
            include: { skill: true },
          },
        },
      });

      logger.info(`New profile created: ${username} (${supabaseId})`);

      sendSuccess(res, profile, 201);
    } catch (error: unknown) {
      // Gracefully handle concurrency race conditions if profile was inserted during our checks
      if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002") {
        const raceProfile = await prisma.profile.findUnique({
          where: { id: supabaseId },
          include: { skills: { include: { skill: true } } },
        });
        if (raceProfile) {
          sendSuccess(res, raceProfile, 200);
          return;
        }
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/me
 * Returns the authenticated user's profile.
 * Auto-creates a profile if one doesn't exist (using Supabase metadata).
 */
export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const email = req.user!.email;

    let profile = await prisma.profile.findUnique({
      where: { id: userId },
      include: {
        skills: {
          include: { skill: true },
        },
      },
    });

    // Auto-create profile if it doesn't exist
    if (!profile) {
      // Fetch user metadata from Supabase for defaults
      const { data: supabaseUser } = await supabaseAdmin.auth.admin.getUserById(userId);

      const fullName =
        supabaseUser?.user?.user_metadata?.full_name ||
        supabaseUser?.user?.user_metadata?.name ||
        email.split("@")[0] || "Student";

      const username = await generateUsername(fullName, email);
      const safeYear = Math.min(6, Math.max(1, Number(supabaseUser?.user?.user_metadata?.year) || 1));

      try {
        profile = await prisma.profile.create({
          data: {
            id: userId,
            fullName,
            username,
            department: supabaseUser?.user?.user_metadata?.department || "Undeclared",
            year: safeYear,
            college: supabaseUser?.user?.user_metadata?.college || null,
            avatarUrl: supabaseUser?.user?.user_metadata?.avatar_url || null,
            role: "student",
          },
          include: {
            skills: {
              include: { skill: true },
            },
          },
        });

        logger.info(`Auto-created profile for user: ${username} (${userId})`);
      } catch (error: unknown) {
        // Recover cleanly if another concurrent request created the profile first
        if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002") {
          profile = await prisma.profile.findUnique({
            where: { id: userId },
            include: { skills: { include: { skill: true } } },
          });
        } else {
          throw error;
        }
      }
    }

    sendSuccess(res, profile);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/auth/me
 * Updates the authenticated user's profile.
 */
export const updateMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const updates = req.body as UpdateProfileInput;

    // If username is being changed, check uniqueness
    if (updates.username) {
      const existing = await prisma.profile.findUnique({
        where: { username: updates.username },
      });

      if (existing && existing.id !== userId) {
        throw ApiError.conflict("Username is already taken");
      }
    }

    const profile = await prisma.profile.update({
      where: { id: userId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
      include: {
        skills: {
          include: { skill: true },
        },
      },
    });

    sendSuccess(res, profile);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/onboarding
 * Completes the user's profile during onboarding — adds bio, links, skills.
 */
export const completeOnboarding = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { bio, githubUrl, portfolioUrl, linkedinUrl, avatarUrl, isAvailable, skills } =
      req.body as OnboardingInput;

    // Execute onboarding updates sequentially
    // Note: Interactive transactions are not reliably supported by the PG driver adapter,
    // so we use sequential queries instead. The risk of partial updates is minimal here
    // since each operation is idempotent.

    // Update profile fields
    await prisma.profile.update({
      where: { id: userId },
      data: {
        bio: bio || null,
        githubUrl: githubUrl || null,
        portfolioUrl: portfolioUrl || null,
        linkedinUrl: linkedinUrl || null,
        avatarUrl: avatarUrl || null,
        isAvailable: isAvailable ?? true,
        updatedAt: new Date(),
      },
    });

    // Upsert skills if provided
    if (skills && skills.length > 0) {
      await prisma.userSkill.deleteMany({ where: { userId } });
      await prisma.userSkill.createMany({
        data: skills.map((s) => ({
          userId,
          skillId: s.skillId,
          proficiency: s.proficiency,
        })),
      });
    }

    // Return complete profile with included skill relations
    const completeProfile = await prisma.profile.findUnique({
      where: { id: userId },
      include: {
        skills: {
          include: { skill: true },
        },
      },
    });

    if (completeProfile) {
      logger.info(`Onboarding completed for user: ${completeProfile.username} (${userId})`);
    }

    sendSuccess(res, completeProfile);
  } catch (error) {
    next(error);
  }
};
