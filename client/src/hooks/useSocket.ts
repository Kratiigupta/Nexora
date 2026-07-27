"use client";

import { useEffect, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import { getSocket, disconnectSocket } from "@/lib/socket";

/**
 * Custom hook for Socket.IO connection management.
 * Handles connection lifecycle and provides the socket instance.
 */
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const connect = useCallback(async () => {
    try {
      const newSocket = await getSocket();
      setSocket(newSocket);

      newSocket.on("connect", () => setIsConnected(true));
      newSocket.on("disconnect", () => setIsConnected(false));

      setIsConnected(newSocket.connected);
    } catch (error) {
      console.error("Failed to connect socket:", error);
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setSocket(null);
    setIsConnected(false);
  }, []);

  useEffect(() => {
    return () => {
      // Clean up on unmount
    };
  }, []);

  return {
    socket,
    isConnected,
    connect,
    disconnect,
  };
};
