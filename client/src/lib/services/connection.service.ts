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

export interface ConnectionUser {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
  department: string;
  year: number;
}

export interface ConnectionListItem {
  id: string;
  status: string;
  createdAt: string;
  user: ConnectionUser;
}

export interface AllConnectionsResponse {
  connections: ConnectionListItem[];
  incomingRequests: ConnectionListItem[];
  outgoingRequests: ConnectionListItem[];
}

export const connectionService = {
  /**
   * GET /api/v1/connections
   */
  async getAllConnections(): Promise<AllConnectionsResponse> {
    const response = await api.get("/connections");
    return response.data.data;
  },

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
