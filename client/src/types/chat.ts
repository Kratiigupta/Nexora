import { Profile } from "./user";

/**
 * Chat and messaging types
 */

export interface Conversation {
  id: string;
  type: "direct" | "team" | "project";
  teamId: string | null;
  projectId: string | null;
  createdAt: string;
  participants?: ConversationParticipant[];
  team?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  project?: {
    id: string;
    title: string;
  };
  messages?: Message[]; // Used when fetching list of conversations (latest message)
  lastMessage?: Message;
}

export interface ConversationParticipant {
  conversationId: string;
  userId: string;
  joinedAt: string;
  lastReadAt: string | null;
  user?: Profile;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "image" | "file" | "system";
  fileUrl: string | null;
  isEdited: boolean;
  createdAt: string;
  sender?: Profile;
}

export interface PaginatedMessages {
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface SendMessagePayload {
  content: string;
  type?: "text" | "image" | "file" | "system";
  fileUrl?: string;
}

export interface CreateConversationPayload {
  type: "direct" | "team" | "project";
  participantId?: string;
  teamId?: string;
  projectId?: string;
}
