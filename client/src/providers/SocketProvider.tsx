"use client";

import { useEffect, ReactNode } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useSocketStore } from "@/stores/socketStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useChatStore } from "@/stores/chatStore";
import type { Message } from "@/types/chat";

/**
 * SocketProvider — establishes Socket.IO connection for authenticated users.
 * Attaches global notification, chat, and presence listeners without causing
 * child re-render cascades.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const socket = useSocketStore((s) => s.socket);
  const connect = useSocketStore((s) => s.connect);
  const disconnect = useSocketStore((s) => s.disconnect);

  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }
  }, [user, connect, disconnect]);

  // Global event listeners
  useEffect(() => {
    if (!socket) return;

    // Use getState() to avoid subscribing SocketProvider to store updates
    const handleNotification = (notification: unknown) => {
      useNotificationStore.getState().addNotification(notification as any);
    };

    const handleNewMessage = (message: Message) => {
      useChatStore.getState().addMessage(message);
    };

    const handlePresence = ({ onlineUsers }: { onlineUsers: string[] }) => {
      useChatStore.getState().setOnlineUsers(onlineUsers);
    };

    const handleUserOnline = ({ userId }: { userId: string }) => {
      useChatStore.getState().addOnlineUser(userId);
    };

    const handleUserOffline = ({ userId }: { userId: string }) => {
      useChatStore.getState().removeOnlineUser(userId);
    };

    socket.on("notification", handleNotification);
    socket.on("new_message", handleNewMessage);
    socket.on("presence_state", handlePresence);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);

    return () => {
      socket.off("notification", handleNotification);
      socket.off("new_message", handleNewMessage);
      socket.off("presence_state", handlePresence);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
    };
  }, [socket]);

  return <>{children}</>;
}
