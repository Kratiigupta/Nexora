import { Router } from "express";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createTeamSchema,
  inviteMemberSchema,
  respondInviteSchema,
  teamIdParamSchema,
  teamAndUserIdParamSchema,
  teamAndRequestIdParamSchema,
  updateRequiredSkillsSchema,
} from "../schemas/team.schema";
import {
  createTeam,
  getMyTeams,
  getTeamById,
  inviteToTeam,
  respondToInvite,
  leaveTeam,
  removeMember,
  getMyInvitations,
  updateRequiredSkills,
  getAllSkills,
} from "../controllers/team.controller";

const router = Router();

/**
 * Team Routes
 * All routes require authentication (applied at the router level in routes/index.ts).
 */

// POST /api/v1/teams — Create team
router.post(
  "/",
  validate({ body: createTeamSchema }),
  asyncHandler(createTeam)
);

// GET /api/v1/teams/my-teams — Get current user's teams
router.get("/my-teams", asyncHandler(getMyTeams));

// GET /api/v1/teams/invitations — Get current user's pending invitations
router.get("/invitations", asyncHandler(getMyInvitations));

// GET /api/v1/teams/skills — Get master skill catalog
router.get("/skills", asyncHandler(getAllSkills));

// GET /api/v1/teams/:id — Get team details
router.get(
  "/:id",
  validate({ params: teamIdParamSchema }),
  asyncHandler(getTeamById)
);

// POST /api/v1/teams/:id/invite — Request/Invite user to join
router.post(
  "/:id/invite",
  validate({ params: teamIdParamSchema, body: inviteMemberSchema }),
  asyncHandler(inviteToTeam)
);

// POST /api/v1/teams/:id/requests/:requestId/respond — Respond to an invite
router.post(
  "/:id/requests/:requestId/respond",
  validate({ params: teamAndRequestIdParamSchema, body: respondInviteSchema }),
  asyncHandler(respondToInvite)
);

// PUT /api/v1/teams/:id/required-skills — Update team required skills
router.put(
  "/:id/required-skills",
  validate({ params: teamIdParamSchema, body: updateRequiredSkillsSchema }),
  asyncHandler(updateRequiredSkills)
);

// DELETE /api/v1/teams/:id/leave — Leave team
router.delete(
  "/:id/leave",
  validate({ params: teamIdParamSchema }),
  asyncHandler(leaveTeam)
);

// DELETE /api/v1/teams/:id/members/:userId — Remove a member from the team
router.delete(
  "/:id/members/:userId",
  validate({ params: teamAndUserIdParamSchema }),
  asyncHandler(removeMember)
);

export default router;

