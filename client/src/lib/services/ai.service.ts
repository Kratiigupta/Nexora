import api from "@/lib/api";
import type { AiMatchInsight } from "@/types/ai";

export const aiService = {
  /**
   * POST /api/v1/ai/match-insight/:candidateId
   * Fetches an AI-generated explanation of why a candidate might be a good teammate.
   */
  async getMatchInsight(candidateId: string): Promise<AiMatchInsight> {
    const response = await api.post(`/ai/match-insight/${candidateId}`);
    return response.data.data;
  },
};
