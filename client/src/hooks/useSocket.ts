"use client";

import { useEffect, useState, useCallback, useRef, createContext, useContext } from "react";
import { Socket } from "socket.io-client";
import { getSocket, disconnectSocket } from "@/lib/socket";

export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const SocketContext = createContext<SocketContextType | null>(null);

/**
 * Custom hook for Socket.IO connection management.
 * Returns the shared SocketContext from SocketProvider if present,
 * or safely initializes and connects the singleton socket if used outside.
 */
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context) {
    return context;
  }

  // Fallback for standalone usage outside SocketProvider:
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

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
    connect();
  }, [connect]);

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

  return {
    socket,
    isConnected,
    connect,
    disconnect,
  };
};
