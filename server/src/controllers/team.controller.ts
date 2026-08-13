import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/helpers";
import { TeamType, TeamMemberRole, JoinRequestStatus, NotificationType } from "@prisma/client";

/**
 * POST /api/v1/teams
 * Create a new team and assign the creator as the owner.
 */
export const createTeam = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, description, type, maxMembers, isPublic } = req.body;

    const team = await prisma.$transaction(async (tx) => {
      const newTeam = await tx.team.create({
        data: {
          name,
          description,
          type: type as TeamType,
          maxMembers: maxMembers || 5,
          isPublic: isPublic !== undefined ? isPublic : true,
          createdBy: userId,
        },
      });

      await tx.teamMember.create({
        data: {
          teamId: newTeam.id,
          userId,
          role: TeamMemberRole.owner,
        },
      });

      await tx.activityLog.create({
        data: {
          userId,
          action: "team_created",
          description: `Created team ${name}`,
          metadata: { teamId: newTeam.id, teamName: name },
        },
      });

      return newTeam;
    });

    sendSuccess(res, team, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/teams/my-teams
 * Get all teams the current user is a member of.
 */
export const getMyTeams = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const memberships = await prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            members: {
              include: { user: { select: { id: true, fullName: true, username: true, avatarUrl: true } } },
            },
          },
        },
      },
    });

    const teams = memberships.map((m) => ({
      ...m.team,
      myRole: m.role,
    }));

    sendSuccess(res, teams);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/teams/:id
 * Get a specific team and its members.
 */
export const getTeamById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teamId = req.params.id as string;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: { user: { select: { id: true, fullName: true, username: true, avatarUrl: true } } },
        },
        requiredSkills: { include: { skill: true } },
      },
    });

    if (!team) throw ApiError.notFound("Team");

    sendSuccess(res, team);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/teams/:id/invite
 * Invite a user to join a team. Only team owners/admins can invite.
 */
export const inviteToTeam = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teamId = req.params.id as string;
    const currentUserId = req.user!.id;
    const { userId, message } = req.body;

    if (currentUserId === userId) {
      throw ApiError.badRequest("You cannot invite yourself");
    }

    // Verify current user's role in the team
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: currentUserId } },
    });

    if (!membership || (membership.role !== TeamMemberRole.owner && membership.role !== TeamMemberRole.admin)) {
      throw ApiError.forbidden("Only team owners or admins can invite members");
    }

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw ApiError.notFound("Team");

    // Check if user is already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
    if (existingMember) {
      throw ApiError.conflict("User is already a member of this team");
    }

    // Check if invite already exists
    const existingInvite = await prisma.teamJoinRequest.findFirst({
      where: { teamId, userId, status: JoinRequestStatus.pending },
    });
    if (existingInvite) {
      throw ApiError.conflict("An invitation is already pending for this user");
    }

    const invite = await prisma.$transaction(async (tx) => {
      const newInvite = await tx.teamJoinRequest.create({
        data: {
          teamId,
          userId,
          message: message || "You have been invited to join the team",
        },
      });

      await tx.notification.create({
        data: {
          userId,
          type: NotificationType.team_invite,
          title: `Team Invitation: ${team.name}`,
          body: message || `You have been invited to join ${team.name}`,
          referenceType: "team",
          referenceId: teamId,
        },
      });

      return newInvite;
    });

    sendSuccess(res, invite);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/teams/:id/requests/:requestId/respond
 * Accept or reject a team invitation.
 */
export const respondToInvite = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teamId = req.params.id as string;
    const requestId = req.params.requestId as string;
    const { status } = req.body;
    const userId = req.user!.id;

    const request = await prisma.teamJoinRequest.findUnique({
      where: { id: requestId },
      include: { team: true },
    });

    if (!request) throw ApiError.notFound("Invitation");
    if (request.teamId !== teamId || request.userId !== userId) {
      throw ApiError.forbidden("You cannot respond to this invitation");
    }
    if (request.status !== JoinRequestStatus.pending) {
      throw ApiError.badRequest("This invitation has already been processed");
    }

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw ApiError.notFound("Team");

    await prisma.$transaction(async (tx) => {
      await tx.teamJoinRequest.update({
        where: { id: requestId },
        data: { status: status as JoinRequestStatus },
      });

      if (status === "accepted") {
        await tx.teamMember.create({
          data: {
            teamId,
            userId,
            role: TeamMemberRole.member,
          },
        });

        await tx.activityLog.create({
          data: {
            userId,
            action: "team_joined",
            description: `Joined team ${team.name}`,
            metadata: { teamId, teamName: team.name },
          },
        });
      }
    });

    sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/teams/:id/leave
 * Leave a team. An owner cannot leave unless they transfer ownership first (out of scope for part 1, so owner leave is blocked).
 */
export const leaveTeam = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teamId = req.params.id as string;
    const userId = req.user!.id;

    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });

    if (!membership) throw ApiError.notFound("Team membership");
    if (membership.role === TeamMemberRole.owner) {
      throw ApiError.badRequest("Team owners cannot leave the team. Transfer ownership or delete the team instead.");
    }

    await prisma.teamMember.delete({
      where: { teamId_userId: { teamId, userId } },
    });

    sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/teams/:id/members/:userId
 * Remove a member from a team. Only owners and admins can remove members. Admins cannot remove owners.
 */
export const removeMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teamId = req.params.id as string;
    const currentUserId = req.user!.id;
    const targetUserId = req.params.userId as string;

    if (currentUserId === targetUserId) {
      throw ApiError.badRequest("Use the leave endpoint to remove yourself");
    }

    const currentUserMembership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: currentUserId } },
    });

    if (!currentUserMembership || (currentUserMembership.role !== TeamMemberRole.owner && currentUserMembership.role !== TeamMemberRole.admin)) {
      throw ApiError.forbidden("Only team owners or admins can remove members");
    }

    const targetUserMembership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: targetUserId } },
    });

    if (!targetUserMembership) throw ApiError.notFound("Team member");

    if (targetUserMembership.role === TeamMemberRole.owner) {
      throw ApiError.forbidden("Team owners cannot be removed");
    }
    
    if (currentUserMembership.role === TeamMemberRole.admin && targetUserMembership.role === TeamMemberRole.admin) {
      throw ApiError.forbidden("Admins cannot remove other admins");
    }

    await prisma.teamMember.delete({
      where: { teamId_userId: { teamId, userId: targetUserId } },
    });

    sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/teams/invitations
 * Get pending team invitations for the current user.
 */
export const getMyInvitations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const invitations = await prisma.teamJoinRequest.findMany({
      where: { 
        userId,
        status: JoinRequestStatus.pending
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            description: true,
            avatarUrl: true,
            type: true,
            creator: {
              select: {
                id: true,
                fullName: true,
                username: true,
                avatarUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const formattedInvitations = invitations.map((inv) => ({
      requestId: inv.id,
      teamId: inv.teamId,
      teamName: inv.team.name,
      teamDescription: inv.team.description,
      teamAvatarUrl: inv.team.avatarUrl,
      teamType: inv.team.type,
      inviter: inv.team.creator,
      message: inv.message,
      createdAt: inv.createdAt,
    }));

    sendSuccess(res, formattedInvitations);
  } catch (error) {
    next(error);
  }
};
