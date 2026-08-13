import { Profile, Skill } from "./user";

export type SkillExchangeStatus = "requested" | "accepted" | "in_progress" | "completed" | "cancelled";

export interface SkillExchangeSession {
  id: string;
  mentorId: string;
  menteeId: string;
  skillId: string;
  status: SkillExchangeStatus;
  description: string | null;
  scheduledAt: string | null;
  rating: number | null;
  feedback: string | null;
  createdAt: string;

  mentor?: Pick<Profile, "id" | "fullName" | "username" | "avatarUrl">;
  mentee?: Pick<Profile, "id" | "fullName" | "username" | "avatarUrl">;
  skill?: Pick<Skill, "id" | "name" | "category">;
}

export interface CreateSkillExchangePayload {
  mentorId: string;
  skillId: string;
  description?: string;
  scheduledAt?: string;
}

export interface ScheduleSkillExchangePayload {
  scheduledAt: string;
}

export interface RateSkillExchangePayload {
  rating: number;
  feedback?: string;
}

export interface SkillExchangeListResponse {
  success: boolean;
  data: SkillExchangeSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
