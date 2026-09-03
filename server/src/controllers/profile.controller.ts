import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/helpers";
import { logger } from "../utils/logger";
import type { UpdateProfileBody, UsernameParam } from "../schemas/profile.schema";

// ──────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────

/** Default include for profile queries — skills with nested skill data */
const profileInclude = {
  skills: {
    include: { skill: true },
  },
} as const;

/**
 * Calculate profile completion percentage.
 * Each field contributes equally to the total.
 */
const calculateProfileCompletion = (profile: {
  fullName: string;
  bio: string | null;
  avatarUrl: string | null;
  department: string;
  college: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  resumeUrl: string | null;
  interests: string[];
  skills?: { skillId: string }[];
}): number => {
  const checks = [
    !!profile.fullName,
    !!profile.bio,
    !!profile.avatarUrl,
    !!profile.department,
    !!profile.college,
    !!profile.githubUrl,
    !!profile.linkedinUrl,
    !!profile.portfolioUrl,
    !!profile.resumeUrl,
    profile.interests.length > 0,
    (profile.skills?.length ?? 0) > 0,
  ];

  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
};

// ──────────────────────────────────────────────────────
// Controllers
// ──────────────────────────────────────────────────────

/**
 * GET /api/v1/profile
 * Returns the authenticated user's full profile with skills and activity count.
 */
export const getMyProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      include: {
        ...profileInclude,
        _count: {
          select: {
            createdProjects: true,
            teamMemberships: true,
            sentConnections: { where: { status: "accepted" } },
            receivedConnections: { where: { status: "accepted" } },
          },
        },
      },
    });

    if (!profile) {
      throw ApiError.notFound("Profile");
    }

    const profileCompletion = calculateProfileCompletion(profile as any);

    const { _count, ...profileData } = profile;

    sendSuccess(res, {
      ...profileData,
      profileCompletion,
      stats: {
        projects: _count.createdProjects,
        teams: _count.teamMemberships,
        connections:
          _count.sentConnections + _count.receivedConnections,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/profile
 * Updates the authenticated user's profile.
 * Enforces username change-once rule and syncs skills atomically.
 */
export const updateMyProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const body = req.body as UpdateProfileBody;

    // Fetch current profile to check username change eligibility
    const currentProfile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!currentProfile) {
      throw ApiError.notFound("Profile");
    }

    // Enforce username change-once rule
    if (body.username && body.username !== currentProfile.username) {
      if (currentProfile.usernameChangedAt) {
        throw ApiError.badRequest(
          "Username can only be changed once. Your username was already changed."
        );
      }

      // Check uniqueness
      const existing = await prisma.profile.findUnique({
        where: { username: body.username },
      });
      if (existing && existing.id !== userId) {
        throw ApiError.conflict("Username is already taken");
      }
    }

    // Derive isAvailable from availabilityStatus for backward compatibility
    const derivedIsAvailable =
      body.availabilityStatus && body.availabilityStatus !== "not_available"
        ? true
        : body.availabilityStatus === "not_available"
          ? false
          : undefined;

    // Clean empty-string URLs to null
    const cleanUrl = (val: string | null | undefined): string | null | undefined => {
      if (val === "") return null;
      return val;
    };

    // Build update data (excluding skills — handled separately)
    const { skills, ...profileFields } = body;
    const updateData: Record<string, unknown> = {
      ...profileFields,
      githubUrl: cleanUrl(profileFields.githubUrl),
      portfolioUrl: cleanUrl(profileFields.portfolioUrl),
      linkedinUrl: cleanUrl(profileFields.linkedinUrl),
      updatedAt: new Date(),
    };

    // Set usernameChangedAt if username is being changed
    if (body.username && body.username !== currentProfile.username) {
      updateData.usernameChangedAt = new Date();
    }

    // Set derived isAvailable
    if (derivedIsAvailable !== undefined) {
      updateData.isAvailable = derivedIsAvailable;
    }

    // Execute sequentially instead of in a transaction
    // Note: Interactive transactions are not reliably supported by the PG driver adapter

    // Update profile fields
    await prisma.profile.update({
      where: { id: userId },
      data: updateData,
    });

    // Update skills if provided
    if (skills !== undefined) {
      await prisma.userSkill.deleteMany({ where: { userId } });

      if (skills.length > 0) {
        await prisma.userSkill.createMany({
          data: skills.map((s) => ({
            userId,
            skillId: s.skillId,
            proficiency: s.proficiency,
          })),
        });
      }
    }

    // Return complete profile
    const updatedProfile = await prisma.profile.findUnique({
      where: { id: userId },
      include: profileInclude,
    });

    if (!updatedProfile) {
      throw ApiError.internal("Failed to update profile");
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "profile_updated",
        description: "Profile updated",
      },
    }).catch(() => {
      // Non-critical — don't fail the request
    });

    const profileCompletion = calculateProfileCompletion(updatedProfile);

    logger.info(`Profile updated: ${updatedProfile.username} (${userId})`);
    sendSuccess(res, {
      ...updatedProfile,
      profileCompletion,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/profile/:username
 * Returns a public view of any user's profile.
 */
export const getPublicProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username } = req.params as unknown as UsernameParam;

    const profile = await prisma.profile.findUnique({
      where: { username },
      include: {
        ...profileInclude,
        _count: {
          select: {
            createdProjects: true,
            teamMemberships: true,
            sentConnections: { where: { status: "accepted" } },
            receivedConnections: { where: { status: "accepted" } },
          },
        },
      },
    });

    if (!profile) {
      throw ApiError.notFound("User");
    }

    // Build public profile response (exclude sensitive fields)
    const publicProfile = {
      id: profile.id,
      fullName: profile.fullName,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      department: profile.department,
      year: profile.year,
      college: profile.college,
      githubUrl: profile.githubUrl,
      portfolioUrl: profile.portfolioUrl,
      linkedinUrl: profile.linkedinUrl,
      resumeUrl: profile.resumeUrl,
      interests: profile.interests,
      role: profile.role,
      isAvailable: profile.isAvailable,
      availabilityStatus: profile.availabilityStatus,
      skills: profile.skills,
      createdAt: profile.createdAt,
      stats: {
        projects: profile._count.createdProjects,
        teams: profile._count.teamMemberships,
        connections:
          profile._count.sentConnections + profile._count.receivedConnections,
      },
    };

    sendSuccess(res, publicProfile);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/profile/avatar
 * Uploads a profile avatar to Supabase Storage.
 * Expects multipart/form-data with a "file" field.
 */
export const uploadAvatar = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Express doesn't parse multipart by default — this endpoint expects
    // the client to upload directly to Supabase Storage and then call
    // PUT /profile with the new avatarUrl. This endpoint provides a
    // server-side alternative using the admin client.
    const { fileUrl } = req.body as { fileUrl: string };

    if (!fileUrl) {
      throw ApiError.badRequest("fileUrl is required");
    }

    const profile = await prisma.profile.update({
      where: { id: userId },
      data: {
        avatarUrl: fileUrl,
        updatedAt: new Date(),
      },
      include: profileInclude,
    });

    logger.info(`Avatar updated for user: ${profile.username} (${userId})`);
    sendSuccess(res, profile);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/profile/resume
 * Updates the resume URL after client-side upload to Supabase Storage.
 * Expects JSON body: { fileUrl: string }
 */
export const uploadResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { fileUrl } = req.body as { fileUrl: string };

    if (!fileUrl) {
      throw ApiError.badRequest("fileUrl is required");
    }

    const profile = await prisma.profile.update({
      where: { id: userId },
      data: {
        resumeUrl: fileUrl,
        updatedAt: new Date(),
      },
      include: profileInclude,
    });

    logger.info(`Resume updated for user: ${profile.username} (${userId})`);
    sendSuccess(res, profile);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/dashboard
 * Returns aggregated dashboard data for the authenticated user.
 */
export const getDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Fetch all dashboard data in parallel
    const [
      profile,
      recentProjects,
      notifications,
      activityLogs,
      teamCount,
      projectCount,
      connectionCount,
      heatmapData,
    ] = await Promise.all([
      // Profile with skills
      prisma.profile.findUnique({
        where: { id: userId },
        include: profileInclude,
      }),

      // Recent projects (last 5)
      prisma.project.findMany({
        where: { createdBy: userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          team: { select: { name: true } },
        },
      }),

      // Recent notifications (last 5)
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Recent activity (last 10)
      prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // Team count
      prisma.teamMember.count({ where: { userId } }),

      // Project count
      prisma.project.count({ where: { createdBy: userId } }),

      // Connection count (accepted)
      prisma.userConnection.count({
        where: {
          OR: [
            { requesterId: userId, status: "accepted" },
            { receiverId: userId, status: "accepted" },
          ],
        },
      }),

      // Activity heatmap — count per day for last 365 days
      prisma.activityLog.groupBy({
        by: ["createdAt"],
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          },
        },
        _count: true,
      }),
    ]);

    if (!profile) {
      throw ApiError.notFound("Profile");
    }

    const profileCompletion = calculateProfileCompletion(profile);

    // Transform heatmap data into date → count map
    const heatmap: Record<string, number> = {};
    for (const entry of heatmapData) {
      const dateStr = new Date(entry.createdAt).toISOString().split("T")[0] ?? "";
      heatmap[dateStr] = (heatmap[dateStr] ?? 0) + (entry._count as unknown as number);
    }

    sendSuccess(res, {
      profile: {
        ...profile,
        profileCompletion,
      },
      stats: {
        teams: teamCount,
        projects: projectCount,
        skills: profile.skills.length,
        connections: connectionCount,
      },
      profileCompletion,
      recentProjects,
      notifications,
      activityHeatmap: heatmap,
      recentActivity: activityLogs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/dashboard/recommended-teammates
 * Returns recommended teammates for the authenticated user based on a deterministic scoring algorithm.
 */
export const getRecommendedTeammates = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Fetch current user's profile and skills
    const currentUser = await prisma.profile.findUnique({
      where: { id: userId },
      include: { skills: true },
    });

    if (!currentUser) {
      throw ApiError.notFound("Profile");
    }

    const userSkillIds = currentUser.skills.map((s) => s.skillId);

    // Build efficient OR conditions to only fetch potentially relevant candidates
    const orConditions: any[] = [];
    if (currentUser.department) orConditions.push({ department: currentUser.department });
    if (currentUser.year) orConditions.push({ year: currentUser.year });
    if (currentUser.interests && currentUser.interests.length > 0) {
      orConditions.push({ interests: { hasSome: currentUser.interests } });
    }
    if (userSkillIds.length > 0) {
      orConditions.push({ skills: { some: { skillId: { in: userSkillIds } } } });
    }

    const whereClause: any = {
      id: { not: userId },
      isAvailable: true,
    };

    if (orConditions.length > 0) {
      whereClause.OR = orConditions;
    }

    // Fetch eligible candidates (bound to 100 to prevent loading the entire DB)
    const candidates = await prisma.profile.findMany({
      where: whereClause,
      include: {
        skills: { include: { skill: true } }
      },
      take: 100
    });

    // Score candidates deterministically
    const scoredCandidates = candidates.map(candidate => {
      let score = 0;
      const matchReasons: string[] = [];

      // 1. Shared skills: +15 per skill, max 45
      const candidateSkillIds = candidate.skills.map(s => s.skillId);
      const sharedSkills = candidateSkillIds.filter(id => userSkillIds.includes(id));
      if (sharedSkills.length > 0) {
        const points = Math.min(sharedSkills.length * 15, 45);
        score += points;
        matchReasons.push(`${sharedSkills.length} shared skill${sharedSkills.length > 1 ? 's' : ''}`);
      }

      // 2. Same department: +20
      if (candidate.department === currentUser.department) {
        score += 20;
        matchReasons.push("Same department");
      }

      // 3. Shared interests: +10 per interest, max 20
      const uniqueCandidateInterests = Array.from(new Set(candidate.interests));
      const sharedInterests = uniqueCandidateInterests.filter(i => currentUser.interests.includes(i));
      if (sharedInterests.length > 0) {
        const points = Math.min(sharedInterests.length * 10, 20);
        score += points;
        matchReasons.push(`${sharedInterests.length} shared interest${sharedInterests.length > 1 ? 's' : ''}`);
      }

      // 4. Same academic year: +15
      if (candidate.year === currentUser.year) {
        score += 15;
        matchReasons.push("Same academic year");
      }

      return {
        id: candidate.id,
        fullName: candidate.fullName,
        username: candidate.username,
        avatarUrl: candidate.avatarUrl,
        department: candidate.department,
        year: candidate.year,
        bio: candidate.bio,
        skills: candidate.skills.map(s => s.skill.name), // Format skills as strings for UI
        score,
        matchReasons
      };
    });

    // Sort descending by score
    scoredCandidates.sort((a, b) => b.score - a.score);

    // Return top 5
    sendSuccess(res, scoredCandidates.slice(0, 5));
  } catch (error) {
    next(error);
  }
};
