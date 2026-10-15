"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Socket } from "socket.io-client";
import { getSocket, disconnectSocket } from "@/lib/socket";

/**
 * Custom hook for Socket.IO connection management.
 * Handles connection lifecycle and provides the socket instance.
 *
 * Listeners for connect/disconnect are registered once per socket instance
 * and cleaned up properly to prevent accumulation.
 */
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(async () => {
    try {
      const newSocket = await getSocket();
      // Only update state if we got a new/different socket instance
      if (socketRef.current !== newSocket) {
        socketRef.current = newSocket;
        setSocket(newSocket);
        setIsConnected(newSocket.connected);
      } else if (!newSocket.connected) {
        // Same socket, just reconnect if disconnected
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

  // Register connect/disconnect listeners once per socket instance
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  return {
    socket,
    isConnected,
    connect,
    disconnect,
  };
};
