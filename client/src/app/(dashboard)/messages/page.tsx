"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { NewConversationDialog } from "@/components/chat/NewConversationDialog";
import { Button } from "@/components/ui/button";
import { chatService } from "@/lib/services/chat.service";
import { useSocket } from "@/hooks/useSocket";
import { useAuthStore } from "@/stores/authStore";
import { Conversation, Message } from "@/types/chat";
import { Loader2, MessageSquarePlus, MessageSquareOff } from "lucide-react";
import { toast } from "sonner";

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeConversationId = searchParams.get("conversation");
  
  const { profile } = useAuthStore();
  const { socket, connect, isConnected } = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  // Initialize Socket
  useEffect(() => {
    connect();
  }, [connect]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (error) {
      toast.error("Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profile?.id) {
      loadConversations();
    }
  }, [profile?.id, loadConversations]);

  // Handle global socket events (new messages for sidebar preview)
  useEffect(() => {
    if (!socket || !isConnected || !profile?.id) return;

    // The backend emits to user:{id} room
    const handleGlobalNewMessage = (message: Message) => {
      setConversations((prev) => {
        const convIndex = prev.findIndex((c) => c.id === message.conversationId);
        
        if (convIndex === -1) {
          // New conversation we don't have yet. Refetch list.
          loadConversations();
          return prev;
        }

        const newConversations = [...prev];
        const conv = { ...newConversations[convIndex] };
        
        // Update last message
        conv.lastMessage = message;
        
        // Move to top
        newConversations.splice(convIndex, 1);
        newConversations.unshift(conv);

        return newConversations;
      });
    };

    socket.on("new_message", handleGlobalNewMessage);

    return () => {
      socket.off("new_message", handleGlobalNewMessage);
    };
  }, [socket, isConnected, profile?.id, loadConversations]);

  const handleSelectConversation = (id: string) => {
    router.push(`/messages?conversation=${id}`);
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  // Derive active conversation title for header
  let activeTitle = "Chat";
  let activeAvatarUrl: string | undefined = undefined;
  if (activeConversation) {
    if (activeConversation.type === "direct") {
      const otherParticipant = activeConversation.participants?.find((p) => p.userId !== profile?.id);
      activeTitle = otherParticipant?.user?.fullName || "Unknown User";
      activeAvatarUrl = otherParticipant?.user?.avatarUrl || undefined;
    } else if (activeConversation.type === "team") {
      activeTitle = activeConversation.team?.name || "Team Chat";
      activeAvatarUrl = activeConversation.team?.avatarUrl || undefined;
    } else if (activeConversation.type === "project") {
      activeTitle = activeConversation.project?.title || "Project Chat";
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Left Sidebar - Conversations */}
      <div 
        className={`w-full md:w-80 lg:w-96 flex-col border-r bg-card shadow-sm z-10 ${
          activeConversationId ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b flex justify-between items-center bg-muted/30">
          <h1 className="font-semibold text-lg tracking-tight">Messages</h1>
          <Button size="icon" variant="ghost" onClick={() => setIsNewChatOpen(true)}>
            <MessageSquarePlus className="h-5 w-5 text-primary" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center mt-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ConversationList 
              conversations={conversations} 
              activeId={activeConversationId} 
              onSelect={handleSelectConversation}
            />
          )}
        </div>
      </div>

      {/* Right Content - Active Chat */}
      <div 
        className={`flex-1 flex-col h-full bg-muted/10 ${
          !activeConversationId ? "hidden md:flex" : "flex"
        }`}
      >
        {activeConversationId ? (
          activeConversation ? (
            <ChatWindow 
              key={activeConversation.id} // Force remount on switch to handle room joins correctly
              conversationId={activeConversation.id}
              conversationTitle={activeTitle}
              conversationAvatar={activeAvatarUrl}
              conversationType={activeConversation.type}
            />
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquareOff className="h-12 w-12 mb-3 opacity-50 text-destructive" />
              <p>Conversation not found or unauthorized.</p>
              <Button variant="link" onClick={() => router.push("/messages")} className="mt-2">
                Back to Messages
              </Button>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-70 px-4 text-center">
            <MessageSquareOff className="h-16 w-16 mb-4 opacity-50" />
            <h2 className="text-xl font-medium text-foreground">Your Messages</h2>
            <p className="mt-2 max-w-md">Select a conversation from the sidebar or start a new one to begin chatting with your team.</p>
            <Button className="mt-6" onClick={() => setIsNewChatOpen(true)}>
              Start a Conversation
            </Button>
          </div>
        )}
      </div>

      <NewConversationDialog 
        open={isNewChatOpen} 
        onOpenChange={setIsNewChatOpen} 
        onSuccess={(id) => {
          loadConversations();
          handleSelectConversation(id);
        }}
      />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
