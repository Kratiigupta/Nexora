import api from "@/lib/api";
import type { Team, TeamInvitation, TeamJoinRequest } from "@/types/team";

export const teamService = {
  async createTeam(data: {
    name: string;
    description?: string;
    type: string;
    maxMembers?: number;
    isPublic?: boolean;
  }): Promise<Team> {
    const response = await api.post("/teams", data);
    return response.data.data;
  },

  async getMyTeams(): Promise<Team[]> {
    const response = await api.get("/teams/my-teams");
    return response.data.data;
  },

  async getTeamById(id: string): Promise<Team> {
    const response = await api.get(`/teams/${id}`);
    return response.data.data;
  },

  async inviteToTeam(teamId: string, userId: string, message?: string): Promise<TeamJoinRequest> {
    const response = await api.post(`/teams/${teamId}/invite`, { userId, message });
    return response.data.data;
  },

  async respondToInvite(teamId: string, requestId: string, status: "accepted" | "rejected"): Promise<void> {
    await api.post(`/teams/${teamId}/requests/${requestId}/respond`, { status });
  },

  async leaveTeam(teamId: string): Promise<void> {
    await api.delete(`/teams/${teamId}/leave`);
  },

  async removeMember(teamId: string, userId: string): Promise<void> {
    await api.delete(`/teams/${teamId}/members/${userId}`);
  },

  async getMyInvitations(): Promise<TeamInvitation[]> {
    const response = await api.get("/teams/invitations");
    return response.data.data;
  },
};
