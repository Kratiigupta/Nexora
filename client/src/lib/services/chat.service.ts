import api from "../api";
import type { 
  Conversation, 
  PaginatedMessages, 
  CreateConversationPayload, 
  SendMessagePayload 
} from "@/types/chat";

export const chatService = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get("/chat/conversations");
    return response.data.data;
  },

  createConversation: async (data: CreateConversationPayload): Promise<Conversation> => {
    const response = await api.post("/chat/conversations", data);
    return response.data.data;
  },

  getConversationById: async (id: string): Promise<Conversation> => {
    const response = await api.get(`/chat/conversations/${id}`);
    return response.data.data;
  },

  getMessages: async (id: string, page = 1, limit = 50): Promise<PaginatedMessages> => {
    const response = await api.get(`/chat/conversations/${id}/messages`, {
      params: { page, limit },
    });
    return response.data.data;
  },

  sendMessage: async (id: string, payload: SendMessagePayload): Promise<void> => {
    await api.post(`/chat/conversations/${id}/messages`, payload);
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.post(`/chat/conversations/${id}/read`);
  },
};
