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
