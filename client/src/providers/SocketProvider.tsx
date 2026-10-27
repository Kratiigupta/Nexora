"use client";

import { useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { Socket } from "socket.io-client";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { SocketContext } from "@/hooks/useSocket";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useChatStore } from "@/stores/chatStore";
import type { Message } from "@/types/chat";

/**
 * SocketProvider — establishes Socket.IO connection for authenticated users.
 * Provides the shared socket instance through SocketContext and listens for
 * real-time notifications and chat messages.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const { addNotification } = useNotificationStore();
  const { addMessage, setOnlineUsers, addOnlineUser, removeOnlineUser } = useChatStore();

  const connect = useCallback(async () => {
    try {
      const newSocket = await getSocket();
      if (socketRef.current !== newSocket) {
        socketRef.current = newSocket;
        setSocket(newSocket);
        setIsConnected(newSocket.connected);
      } else if (!newSocket.connected) {
        newSocket.connect();
      }
    } catch (error) {
      console.error("Failed to connect socket:", error);
    }
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current = null;
    disconnectSocket();
    setSocket(null);
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }
  }, [user, connect, disconnect]);

  // Connection state listeners
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    if (socket.connected) {
      setIsConnected(true);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  // Global event listeners
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

    // Listen for presence
    socket.on("presence_state", ({ onlineUsers }: { onlineUsers: string[] }) => {
      setOnlineUsers(onlineUsers);
    });

    socket.on("user_online", ({ userId }: { userId: string }) => {
      addOnlineUser(userId);
    });

    socket.on("user_offline", ({ userId }: { userId: string }) => {
      removeOnlineUser(userId);
    });

    return () => {
      socket.off("notification");
      socket.off("new_message");
      socket.off("presence_state");
      socket.off("user_online");
      socket.off("user_offline");
    };
  }, [socket, addNotification, addMessage, setOnlineUsers, addOnlineUser, removeOnlineUser]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
}
