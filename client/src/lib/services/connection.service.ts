import api from "@/lib/api";

export interface ConnectionStatusResponse {
  status: "connected" | "pending_sent" | "pending_received" | "none";
  connection?: {
    id: string;
    requesterId: string;
    receiverId: string;
    status: string;
  };
}

export const connectionService = {
  /**
   * GET /api/v1/connections/:userId/status
   */
  async getConnectionStatus(userId: string): Promise<ConnectionStatusResponse> {
    const response = await api.get(`/connections/${userId}/status`);
    return response.data.data;
  },

  /**
   * POST /api/v1/connections/:userId
   */
  async sendConnectionRequest(userId: string): Promise<ConnectionStatusResponse> {
    const response = await api.post(`/connections/${userId}`);
    return response.data.data;
  },

  /**
   * PUT /api/v1/connections/:userId
   */
  async updateConnectionStatus(
    userId: string,
    status: "accepted" | "rejected"
  ): Promise<ConnectionStatusResponse> {
    const response = await api.put(`/connections/${userId}`, { status });
    return response.data.data;
  },

  /**
   * DELETE /api/v1/connections/:userId
   */
  async removeConnection(userId: string): Promise<ConnectionStatusResponse> {
    const response = await api.delete(`/connections/${userId}`);
    return response.data.data;
  },
};
