import api from "../api";
import type {
  SkillExchangeSession,
  CreateSkillExchangePayload,
  ScheduleSkillExchangePayload,
  RateSkillExchangePayload,
  SkillExchangeListResponse,
} from "@/types/skillExchange";

export const skillExchangeService = {
  getSessions: async (page = 1, limit = 20): Promise<SkillExchangeListResponse> => {
    const response = await api.get(`/skill-exchange?page=${page}&limit=${limit}`);
    return response.data;
  },

  getSessionById: async (id: string): Promise<SkillExchangeSession> => {
    const response = await api.get(`/skill-exchange/${id}`);
    return response.data.data;
  },

  createSession: async (data: CreateSkillExchangePayload): Promise<SkillExchangeSession> => {
    const response = await api.post("/skill-exchange", data);
    return response.data.data;
  },

  acceptSession: async (id: string): Promise<SkillExchangeSession> => {
    const response = await api.post(`/skill-exchange/${id}/accept`);
    return response.data.data;
  },

  rejectSession: async (id: string): Promise<SkillExchangeSession> => {
    const response = await api.post(`/skill-exchange/${id}/reject`);
    return response.data.data;
  },

  cancelSession: async (id: string): Promise<SkillExchangeSession> => {
    const response = await api.post(`/skill-exchange/${id}/cancel`);
    return response.data.data;
  },

  completeSession: async (id: string): Promise<SkillExchangeSession> => {
    const response = await api.post(`/skill-exchange/${id}/complete`);
    return response.data.data;
  },

  scheduleSession: async (id: string, data: ScheduleSkillExchangePayload): Promise<SkillExchangeSession> => {
    const response = await api.patch(`/skill-exchange/${id}/schedule`, data);
    return response.data.data;
  },

  rateSession: async (id: string, data: RateSkillExchangePayload): Promise<SkillExchangeSession> => {
    const response = await api.post(`/skill-exchange/${id}/rating`, data);
    return response.data.data;
  },
};
