import type { Socket } from "socket.io-client";
import { createClient } from "@/lib/supabase/client";

let socket: Socket | null = null;
let ioModule: typeof import("socket.io-client") | null = null;
let isConnecting = false;

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
 * Fetch the current Supabase access token.
 * Used both for initial connection and token refresh on reconnect.
 */
const getAccessToken = async (): Promise<string> => {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No active session for socket connection");
  }

  return session.access_token;
};

/**
 * Get or create the Socket.IO client singleton.
 * Authenticates using the current Supabase session token.
 * Handles token refresh on authentication errors during reconnection.
 */
export const getSocket = async (): Promise<Socket> => {
  // Prevent duplicate concurrent connection attempts
  if (socket) {
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  if (isConnecting) {
    // Wait briefly for the in-progress connection
    return new Promise((resolve, reject) => {
      const check = setInterval(() => {
        if (socket) {
          clearInterval(check);
          resolve(socket);
        }
      }, 50);
      setTimeout(() => {
        clearInterval(check);
        if (socket) resolve(socket);
        else reject(new Error("Socket connection timed out"));
      }, 10000);
    });
  }

  isConnecting = true;

  try {
    const token = await getAccessToken();
    const io = await getIo();

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
      "http://localhost:5000";

    const newSocket = io(socketUrl, {
      auth: {
        token,
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

    // Handle authentication errors by refreshing the token and retrying
    newSocket.on("connect_error", async (error) => {
      console.error("🔌 Socket connection error:", error.message);

      if (
        error.message.includes("Authentication") ||
        error.message.includes("token") ||
        error.message.includes("Invalid")
      ) {
        try {
          // Attempt to get a fresh token
          const freshToken = await getAccessToken();
          newSocket.auth = { token: freshToken };
          // Socket.IO will retry automatically with the updated auth
        } catch {
          // Session truly expired — stop reconnection
          console.error("🔌 Session expired, stopping socket reconnection");
          newSocket.disconnect();
        }
      }
    });

    return newSocket;
  } finally {
    isConnecting = false;
  }
};

/**
 * Disconnect the socket (e.g., on logout).
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};
