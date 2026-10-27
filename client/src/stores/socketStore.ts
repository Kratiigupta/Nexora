import { create } from "zustand";
import type { Socket } from "socket.io-client";
import { getSocket, disconnectSocket } from "@/lib/socket";

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => Promise<Socket | null>;
  disconnect: () => void;
}

let isConnecting = false;

/**
 * Global Zustand store for Socket.IO connection.
 * Provides a stable singleton socket reference across all components
 * without React Context churn or re-render cascades.
 */
export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,

  connect: async () => {
    const current = get().socket;
    if (current?.connected) {
      return current;
    }
    if (isConnecting) {
      return get().socket;
    }

    isConnecting = true;
    try {
      const s = await getSocket();
      if (get().socket !== s) {
        set({ socket: s, isConnected: s.connected });
      }

      const onConnect = () => set({ isConnected: true });
      const onDisconnect = () => set({ isConnected: false });

      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.on("connect", onConnect);
      s.on("disconnect", onDisconnect);

      if (s.connected) {
        set({ isConnected: true });
      }

      return s;
    } catch (err) {
      console.error("Socket connect error:", err);
      return null;
    } finally {
      isConnecting = false;
    }
  },

  disconnect: () => {
    disconnectSocket();
    set({ socket: null, isConnected: false });
  },
}));
