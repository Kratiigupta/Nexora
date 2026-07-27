"use client";

import { useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { useNotificationStore } from "@/stores/notificationStore";
import { useChatStore } from "@/stores/chatStore";
import type { Message } from "@/types/chat";

/**
 * SocketProvider — establishes Socket.IO connection for authenticated users.
 * Listens for real-time notifications and chat messages.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { socket, connect, disconnect } = useSocket();
  const { addNotification } = useNotificationStore();
  const { addMessage } = useChatStore();

  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      // Don't disconnect on cleanup — let the auth state change handle it
    };
  }, [user, connect, disconnect]);

  // Set up event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for real-time notifications
    socket.on("notification", (notification) => {
      addNotification(notification);
    });

    // Listen for real-time messages
    socket.on("new_message", (message: Message) => {
      addMessage(message);
    });

    return () => {
      socket.off("notification");
      socket.off("new_message");
    };
  }, [socket, addNotification, addMessage]);

  return <>{children}</>;
}
