"use client";

import { useSocketStore } from "@/stores/socketStore";

export interface SocketContextType {
  socket: import("socket.io-client").Socket | null;
  isConnected: boolean;
  connect: () => Promise<import("socket.io-client").Socket | null>;
  disconnect: () => void;
}

/**
 * Custom hook for Socket.IO connection management.
 * Accesses the global Zustand socket store with stable references.
 */
export const useSocket = (): SocketContextType => {
  const socket = useSocketStore((s) => s.socket);
  const isConnected = useSocketStore((s) => s.isConnected);
  const connect = useSocketStore((s) => s.connect);
  const disconnect = useSocketStore((s) => s.disconnect);

  return {
    socket,
    isConnected,
    connect,
    disconnect,
  };
};
