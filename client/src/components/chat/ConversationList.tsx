import React from "react";
import { Conversation } from "@/types/chat";
import { useAuthStore } from "@/stores/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, activeId, onSelect }: ConversationListProps) {
  const { profile } = useAuthStore();
  const currentUserId = profile?.id;

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-center p-4 opacity-70">
        <p className="text-sm">No conversations yet.</p>
        <p className="text-xs mt-1">Start a new chat to begin messaging.</p>
      </div>
    );
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col overflow-y-auto w-full h-full">
      {conversations.map((conversation) => {
        let title = "Unknown Conversation";
        let avatarUrl: string | undefined = undefined;
        let isUnread = false;
        
        // Determine title and avatar based on type
        if (conversation.type === "direct") {
          const otherParticipant = conversation.participants?.find((p) => p.userId !== currentUserId);
          title = otherParticipant?.user?.fullName || "Unknown User";
          avatarUrl = otherParticipant?.user?.avatarUrl || undefined;
          
          // Check unread state if we track lastReadAt (Optional depending on exact DB behavior, we will infer from messages if needed)
          // The backend updates lastReadAt when we open.
        } else if (conversation.type === "team") {
          title = conversation.team?.name || "Team Chat";
          avatarUrl = conversation.team?.avatarUrl || undefined;
        } else if (conversation.type === "project") {
          title = conversation.project?.title || "Project Chat";
        }

        const lastMsg = conversation.messages?.[0] || conversation.lastMessage;
        
        // Simple unread check (if last message isn't ours and we haven't seen it recently - we'll just bold if it exists and isn't ours for now, assuming standard logic)
        // Since we don't have perfect lastReadAt exposed nicely on the root level here without finding our participant record:
        const myParticipant = conversation.participants?.find((p) => p.userId === currentUserId);
        if (lastMsg && myParticipant && myParticipant.lastReadAt) {
          isUnread = new Date(lastMsg.createdAt) > new Date(myParticipant.lastReadAt) && lastMsg.senderId !== currentUserId;
        } else if (lastMsg && lastMsg.senderId !== currentUserId) {
          isUnread = true; // Fallback if lastReadAt is missing
        }

        const isActive = activeId === conversation.id;

        return (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={cn(
              "flex items-start gap-3 p-3 w-full text-left transition-colors border-b",
              isActive ? "bg-muted" : "hover:bg-muted/50"
            )}
          >
            <Avatar className="h-10 w-10 border shrink-0">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-primary/5 text-primary">
                {title.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <span className={cn("font-medium truncate", isUnread && !isActive && "font-bold text-primary")}>
                  {title}
                </span>
                {lastMsg && (
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                    {formatTime(lastMsg.createdAt)}
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-center gap-2">
                <p className={cn("text-xs truncate", isUnread && !isActive ? "text-foreground font-medium" : "text-muted-foreground")}>
                  {lastMsg?.type === "system" ? (
                    <span className="italic">{lastMsg.content}</span>
                  ) : lastMsg?.type === "image" ? (
                    "📷 Image"
                  ) : lastMsg?.type === "file" ? (
                    "📎 File"
                  ) : (
                    lastMsg?.content || "No messages yet"
                  )}
                </p>
                {isUnread && !isActive && (
                  <span className="h-2 w-2 bg-primary rounded-full shrink-0" />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
