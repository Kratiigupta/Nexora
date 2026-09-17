import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { env } from "./env";
import { supabaseAdmin } from "./supabase";
import { prisma } from "./prisma";

let io: Server;

const onlineUsersMap = new Map<string, number>();

/**
 * Get currently online user IDs.
 */
export const getOnlineUsers = (): string[] => {
  return Array.from(onlineUsersMap.keys());
};

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

    // Track presence
    const count = onlineUsersMap.get(userId) || 0;
    onlineUsersMap.set(userId, count + 1);
    if (count === 0) {
      io.emit("user_online", { userId });
    }

    // Join user's personal room for direct notifications
    socket.join(`user:${userId}`);

    // Provide initial online users state to this newly connected client
    socket.emit("presence_state", { onlineUsers: Array.from(onlineUsersMap.keys()) });

    // Handle joining conversation rooms safely
    socket.on("join_room", async (roomId: string) => {
      try {
        const conversation = await prisma.conversation.findUnique({
          where: { id: roomId },
          include: {
            participants: true,
            team: { include: { members: true } },
            project: { include: { team: { include: { members: true } } } },
          },
        });

        if (!conversation) {
          socket.emit("error", { message: "Conversation not found" });
          return;
        }

        let isAuthorized = false;

        if (conversation.type === "direct") {
          isAuthorized = conversation.participants.some((p) => p.userId === userId);
        } else if (conversation.type === "team") {
          isAuthorized = conversation.team?.members.some((m) => m.userId === userId) || false;
        } else if (conversation.type === "project") {
          isAuthorized =
            conversation.project?.createdBy === userId ||
            (conversation.project?.team?.members.some((m) => m.userId === userId) || false);
        }

        if (isAuthorized) {
          socket.join(roomId);
          console.log(`📥 ${userId} joined room: ${roomId}`);
        } else {
          socket.emit("error", { message: "Unauthorized to join this conversation" });
        }
      } catch (error) {
        console.error(`Socket join_room error:`, error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // Handle leaving conversation rooms
    socket.on("leave_room", (roomId: string) => {
      socket.leave(roomId);
      console.log(`📤 ${userId} left room: ${roomId}`);
    });

    // Handle typing events securely
    socket.on("typing_start", (conversationId: string) => {
      // Must be in the room to broadcast to it (join_room handled authorization)
      if (socket.rooms.has(conversationId)) {
        socket.to(conversationId).emit("typing_start", { conversationId, userId });
      }
    });

    socket.on("typing_stop", (conversationId: string) => {
      if (socket.rooms.has(conversationId)) {
        socket.to(conversationId).emit("typing_stop", { conversationId, userId });
      }
    });

    // Handle disconnect
    socket.on("disconnect", (reason: string) => {
      console.log(`🔌 User disconnected: ${userId} (reason: ${reason})`);
      const currentCount = onlineUsersMap.get(userId) || 0;
      if (currentCount > 0) {
        const newCount = currentCount - 1;
        if (newCount === 0) {
          onlineUsersMap.delete(userId);
          io.emit("user_offline", { userId });
        } else {
          onlineUsersMap.set(userId, newCount);
        }
      }
    });
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
