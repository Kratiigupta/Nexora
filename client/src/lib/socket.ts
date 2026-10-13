import { io, Socket } from "socket.io-client";
import { createClient } from "@/lib/supabase/client";

let socket: Socket | null = null;

/**
 * Get or create the Socket.IO client singleton.
 * Authenticates using the current Supabase session token.
 */
export const getSocket = async (): Promise<Socket> => {
  if (socket?.connected) {
    return socket;
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No active session for socket connection");
  }

  const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
    auth: {
      token: session.access_token,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    timeout: 30000,
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
