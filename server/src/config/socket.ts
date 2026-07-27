import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { env } from "./env";
import { supabaseAdmin } from "./supabase";

let io: Server;

/**
 * Initialize Socket.IO server attached to the HTTP server.
 * Handles authentication via Supabase JWT on connection.
 */
export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authenticate socket connections using Supabase JWT
  io.use(async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const {
        data: { user },
        error,
      } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        return next(new Error("Invalid authentication token"));
      }

      // Attach user data to socket for downstream handlers
      (socket as any).userId = user.id;
      (socket as any).userEmail = user.email;

      next();
    } catch {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`🔌 User connected: ${userId} (socket: ${socket.id})`);

    // Join user's personal room for direct notifications
    socket.join(`user:${userId}`);

    // Handle joining conversation rooms
    socket.on("join_room", (roomId: string) => {
      socket.join(roomId);
      console.log(`📥 ${userId} joined room: ${roomId}`);
    });

    // Handle leaving conversation rooms
    socket.on("leave_room", (roomId: string) => {
      socket.leave(roomId);
      console.log(`📤 ${userId} left room: ${roomId}`);
    });

    // Handle disconnect
    socket.on("disconnect", (reason: string) => {
      console.log(`🔌 User disconnected: ${userId} (reason: ${reason})`);
      io.emit("user_offline", { userId });
    });

    // Broadcast that user is online
    io.emit("user_online", { userId });
  });

  console.log("✅ Socket.IO initialized");
  return io;
};

/**
 * Get the Socket.IO server instance.
 * Use this to emit events from services/controllers.
 */
export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.IO not initialized. Call initializeSocket first.");
  }
  return io;
};
