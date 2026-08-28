import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { logger } from "../utils/logger.util";
import { Message } from "../../domain.layer/models/message";
import { Op } from "sequelize";

let io: Server;

async function hasConversation(userId: number, partnerId: number): Promise<boolean> {
  const count = await Message.count({
    where: {
      [Op.or]: [
        { sender_id: userId, receiver_id: partnerId },
        { sender_id: partnerId, receiver_id: userId },
      ],
    },
    limit: 1,
  });
  return count > 0;
}

interface AuthenticatedSocket {
  userId: number;
  email: string;
}

export function initializeWebSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.NODE_ENV === "production" ? env.FRONTEND_URL : "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token || typeof token !== "string") {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedSocket;
      (socket as any).userId = decoded.userId;
      (socket as any).email = decoded.email;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket as any).userId;
    logger.info("WebSocket", `User connected: ${userId}`, { socketId: socket.id });

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Handle joining a conversation room
    socket.on("join_conversation", async (partnerId: number) => {
      if (!partnerId || partnerId === userId) {
        socket.emit("error", { message: "Invalid partner" });
        return;
      }
      if (!(await hasConversation(userId, partnerId))) {
        socket.emit("error", { message: "No conversation with this user" });
        return;
      }
      const room = [userId, partnerId].sort().join(":");
      socket.join(`conversation:${room}`);
      logger.debug("WebSocket", `Joined conversation room`, { userId, partnerId, room });
    });

    // Handle leaving a conversation room
    socket.on("leave_conversation", (partnerId: number) => {
      const room = [userId, partnerId].sort().join(":");
      socket.leave(`conversation:${room}`);
    });

    // Handle sending message (alternative to HTTP)
    socket.on("send_message", async (data: { receiverId: number; content: string; orderId?: number; productId?: number }) => {
      if (!data.receiverId || data.receiverId === userId) {
        socket.emit("error", { message: "Invalid receiver" });
        return;
      }
      if (!data.content || typeof data.content !== "string" || data.content.trim().length === 0 || data.content.length > 5000) {
        socket.emit("error", { message: "Invalid message content" });
        return;
      }
      if (!(await hasConversation(userId, data.receiverId))) {
        socket.emit("error", { message: "No conversation with this user" });
        return;
      }
      // Message is still saved via HTTP API, WebSocket just notifies
      const room = [userId, data.receiverId].sort().join(":");
      io.to(`conversation:${room}`).emit("new_message", {
        senderId: userId,
        receiverId: data.receiverId,
        content: data.content,
        orderId: data.orderId,
        productId: data.productId,
        timestamp: new Date().toISOString(),
      });

      // Notify receiver's other tabs/devices
      io.to(`user:${data.receiverId}`).emit("message_notification", {
        senderId: userId,
        content: data.content.substring(0, 100),
      });
    });

    // Handle typing indicator
    socket.on("typing_start", async (partnerId: number) => {
      if (!partnerId || partnerId === userId) return;
      if (!(await hasConversation(userId, partnerId))) return;
      const room = [userId, partnerId].sort().join(":");
      socket.to(`conversation:${room}`).emit("user_typing", { userId });
    });

    socket.on("typing_stop", async (partnerId: number) => {
      if (!partnerId || partnerId === userId) return;
      if (!(await hasConversation(userId, partnerId))) return;
      const room = [userId, partnerId].sort().join(":");
      socket.to(`conversation:${room}`).emit("user_stop_typing", { userId });
    });

    // Handle read receipts
    socket.on("mark_read", async (partnerId: number) => {
      if (!partnerId || partnerId === userId) return;
      if (!(await hasConversation(userId, partnerId))) return;
      const room = [userId, partnerId].sort().join(":");
      socket.to(`conversation:${room}`).emit("messages_read", { userId });
    });

    socket.on("disconnect", (reason) => {
      logger.info("WebSocket", `User disconnected: ${userId}`, { reason, socketId: socket.id });
    });
  });

  logger.info("WebSocket", "WebSocket server initialized");
  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error("WebSocket not initialized");
  }
  return io;
}

export function notifyUser(userId: number, event: string, data: any) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

export function notifyConversation(partnerIds: number[], event: string, data: any) {
  if (io) {
    const room = partnerIds.sort().join(":");
    io.to(`conversation:${room}`).emit(event, data);
  }
}
