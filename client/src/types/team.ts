import { Profile } from "./user";

/**
 * Team types
 */

export interface Team {
  id: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  type: "project" | "hackathon" | "startup" | "research" | "competition";
  status: "recruiting" | "active" | "completed" | "archived";
  maxMembers: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members?: TeamMember[];
  requiredSkills?: TeamRequiredSkill[];
  creator?: Profile;
}

export interface TeamMember {
  teamId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
  user?: Profile;
}

export interface TeamJoinRequest {
  id: string;
  teamId: string;
  userId: string;
  message: string | null;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  user?: Profile;
}

export interface TeamRequiredSkill {
  teamId: string;
  skillId: string;
  skill?: { id: string; name: string; category: string };
}
