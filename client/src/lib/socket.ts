import type { Socket } from "socket.io-client";
import { createClient } from "@/lib/supabase/client";

let socket: Socket | null = null;
let ioModule: typeof import("socket.io-client") | null = null;

/**
 * Lazily import socket.io-client so it's not included in the initial bundle.
 * Unauthenticated visitors (landing page) never download the library.
 */
const getIo = async () => {
  if (!ioModule) {
    ioModule = await import("socket.io-client");
  }
  return ioModule.io;
};

/**
 * Get or create the Socket.IO client singleton.
 * Authenticates using the current Supabase session token.
 */
export const getSocket = async (): Promise<Socket> => {
  if (socket) {
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No active session for socket connection");
  }

  const io = await getIo();
  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
    "http://localhost:5000";

  const newSocket = io(socketUrl, {
    auth: {
      token: session.access_token,
    },
    transports: ["websocket"],
    upgrade: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
  });

  socket = newSocket;

  newSocket.on("connect", () => {
    if (newSocket.id) {
      console.log("🔌 Socket connected:", newSocket.id);
    }
  });

  newSocket.on("disconnect", (reason) => {
    console.log("🔌 Socket disconnected:", reason);
  });

  newSocket.on("connect_error", (error) => {
    console.error("🔌 Socket connection error:", error.message);
  });

  return newSocket;
};

/**
 * Disconnect the socket (e.g., on logout).
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
