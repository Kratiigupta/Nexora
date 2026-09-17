import React, { useEffect, useState, useRef, useCallback } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { Message } from "@/types/chat";
import { chatService } from "@/lib/services/chat.service";
import { useSocket } from "@/hooks/useSocket";
import { useAuthStore } from "@/stores/authStore";
import { Loader2, MessageSquareOff } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatWindowProps {
  conversationId: string;
  conversationTitle: string;
  conversationAvatar?: string;
  conversationType: string;
}

export function ChatWindow({
  conversationId,
  conversationTitle,
  conversationAvatar,
  conversationType,
}: ChatWindowProps) {
  const { profile } = useAuthStore();
  const { socket, isConnected } = useSocket();
  const currentUserId = profile?.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [readReceipts, setReadReceipts] = useState<Record<string, string>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchMessages = useCallback(async (pageNum = 1) => {
    try {
      if (pageNum === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      const data = await chatService.getMessages(conversationId, pageNum, 50);

      // Messages are returned newest first by backend, so we need to reverse them for UI
      const sortedMessages = data.messages.reverse();

      setMessages((prev) => {
        if (pageNum === 1) return sortedMessages;

        // Prepend older messages while deduplicating
        const newIds = new Set(sortedMessages.map(m => m.id));
        const filteredPrev = prev.filter(m => !newIds.has(m.id));
        return [...sortedMessages, ...filteredPrev];
      });

      setHasMore(data.pagination.hasMore);

      if (pageNum === 1) {
        setTimeout(scrollToBottom, 100);
      }
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [conversationId, scrollToBottom]);

  // Mark as read when active
  useEffect(() => {
    if (conversationId && currentUserId) {
      chatService.markAsRead(conversationId).catch(console.error);
    }
  }, [conversationId, currentUserId]);

  // Initial load
  useEffect(() => {
    void Promise.resolve().then(() => {
      setPage(1);
      fetchMessages(1);
    });
  }, [conversationId, fetchMessages]);

  // Socket setup
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join room
    socket.emit("join_room", conversationId);

    const handleNewMessage = (newMessage: Message) => {
      if (newMessage.conversationId !== conversationId) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev; // Deduplicate
        return [...prev, newMessage];
      });

      // Auto scroll if it's our message or if we are already at bottom
      const container = scrollContainerRef.current;
      if (
        newMessage.senderId === currentUserId ||
        (container && container.scrollHeight - container.scrollTop - container.clientHeight < 100)
      ) {
        setTimeout(scrollToBottom, 100);
      }

      // Mark read since we are actively viewing
      chatService.markAsRead(conversationId).catch(console.error);
    };

    socket.on("new_message", handleNewMessage);

    const handleTypingStart = ({ conversationId: cId, userId }: { conversationId: string, userId: string }) => {
      if (cId !== conversationId || userId === currentUserId) return;
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.add(userId);
        return next;
      });
    };

    const handleTypingStop = ({ conversationId: cId, userId }: { conversationId: string, userId: string }) => {
      if (cId !== conversationId) return;
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    const handleRead = ({ conversationId: cId, userId, readAt }: { conversationId: string, userId: string, readAt: string }) => {
      if (cId !== conversationId) return;
      setReadReceipts(prev => ({ ...prev, [userId]: readAt }));
    };

    socket.on("typing_start", handleTypingStart);
    socket.on("typing_stop", handleTypingStop);
    socket.on("conversation_read", handleRead);

    return () => {
      socket.emit("leave_room", conversationId);
      socket.off("new_message", handleNewMessage);
      socket.off("typing_start", handleTypingStart);
      socket.off("typing_stop", handleTypingStop);
      socket.off("conversation_read", handleRead);
    };
  }, [socket, isConnected, conversationId, currentUserId, scrollToBottom]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Load more when scrolled to top
    if (container.scrollTop === 0 && hasMore && !isLoadingMore) {
      const next = page + 1;
      setPage(next);
      fetchMessages(next);
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      await chatService.sendMessage(conversationId, {
        content,
        type: "text"
      });
      // The socket will deliver the message to us, triggering handleNewMessage
      // Typing stop is handled by ChatInput internally when sending
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to send message");
    }
  };

  const handleTypingStart = useCallback(() => {
    if (socket && isConnected) {
      socket.emit("typing_start", conversationId);
    }
  }, [socket, isConnected, conversationId]);

  const handleTypingStop = useCallback(() => {
    if (socket && isConnected) {
      socket.emit("typing_stop", conversationId);
    }
  }, [socket, isConnected, conversationId]);

  return (
    <div className="flex flex-col h-full bg-card rounded-r-lg shadow-sm border-l overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-muted/30">
        <Avatar className="h-10 w-10 border shadow-sm">
          <AvatarImage src={conversationAvatar} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {conversationTitle.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h2 className="font-semibold">{conversationTitle}</h2>
          <span className="text-xs text-muted-foreground capitalize">
            {conversationType} Chat
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 p-4 overflow-y-auto flex flex-col gap-1 relative bg-background"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-70">
            <MessageSquareOff className="h-12 w-12 mb-3" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {isLoadingMore && (
              <div className="flex justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}

            {messages.map((msg, index) => {
              const prevMsg = index > 0 ? messages[index - 1] : null;
              // Group avatars if same sender sent multiple in a row within 5 mins
              const isGrouped = prevMsg
                && prevMsg.senderId === msg.senderId
                && (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < 5 * 60000);

              const isRead = msg.senderId === currentUserId && Object.entries(readReceipts).some(([id, date]) =>
                id !== currentUserId && new Date(msg.createdAt) <= new Date(date)
              );

              return (
                <div key={msg.id} className={isGrouped ? "mt-0" : "mt-2"}>
                  <MessageBubble
                    message={msg}
                    isOwnMessage={msg.senderId === currentUserId}
                    showAvatar={!isGrouped}
                    isRead={isRead}
                  />
                </div>
              );
            })}
            {typingUsers.size > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 ml-2 italic">
                <Loader2 className="h-3 w-3 animate-spin" />
                {typingUsers.size === 1 ? "Someone is typing..." : "Several people are typing..."}
              </div>
            )}
            <div ref={messagesEndRef} className="h-px w-full" />
          </>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        disabled={isLoading}
      />
    </div>
  );
}
