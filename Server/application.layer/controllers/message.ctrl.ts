import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../infrastructure.layer/errors/app-error";
import {
  getConversationsQuery,
  getConversationMessagesQuery,
  createMessageQuery,
  markMessageAsReadQuery,
  markConversationAsReadQuery,
  getUnreadCountQuery,
} from "../../infrastructure.layer/utils/message.util";
import { AuthenticatedRequest } from "../../infrastructure.layer/utils/jwt.util";
import { notifyConversation, notifyUser } from "../../infrastructure.layer/websocket";
import { logger } from "../../infrastructure.layer/utils/logger.util";

export async function getConversations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const conversations = await getConversationsQuery(userId);
    res.json({ data: conversations, message: "Conversations retrieved successfully" });
  } catch (error) {
    logger.error("MESSAGE", "Error fetching conversations", error);
    next(new InternalError("Failed to get conversations"));
  }
}

export async function getConversationMessages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const partnerId = parseInt(req.params.userId, 10);
    if (isNaN(partnerId)) return res.status(400).json({ error: "Invalid user ID" });

    if (partnerId === userId) {
      return res.status(400).json({ error: "Cannot message yourself" });
    }

    const options = {
      orderId: req.query.order_id ? parseInt(req.query.order_id as string) : undefined,
      productId: req.query.product_id ? parseInt(req.query.product_id as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };

    // Mark messages from partner as read
    await markConversationAsReadQuery(userId, partnerId);

    const result = await getConversationMessagesQuery(userId, partnerId, options);
    res.json({ ...result, message: "Messages retrieved successfully" });
  } catch (error) {
    logger.error("MESSAGE", "Error fetching messages", error);
    next(new InternalError("Failed to get messages"));
  }
}

export async function sendMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const senderId = req.user!.id;
    const { receiver_id, content, order_id, product_id } = req.body;

    if (!receiver_id || !content?.trim()) {
      return res.status(400).json({ error: "receiver_id and content are required" });
    }

    if (receiver_id === senderId) {
      return res.status(400).json({ error: "Cannot message yourself" });
    }

    const message = await createMessageQuery({
      sender_id: senderId,
      receiver_id,
      content: content.trim(),
      order_id: order_id || undefined,
      product_id: product_id || undefined,
    });

    // Notify via WebSocket
    if (message) {
      try {
        notifyConversation([senderId, receiver_id], "new_message", {
          id: message.id,
          senderId,
          receiverId: receiver_id,
          content: content.trim(),
          orderId: order_id,
          productId: product_id,
          createdAt: message.createdAt,
        });

        // Notify receiver's other devices/tabs
        notifyUser(receiver_id, "message_notification", {
          senderId,
          messageId: message.id,
          content: content.trim().substring(0, 100),
        });
      } catch (wsError) {
        // WebSocket notification failure shouldn't break the API response
        logger.error("MESSAGE", "WebSocket notification failed", wsError);
      }
    }

    res.status(201).json({ data: message, message: "Message sent successfully" });
  } catch (error) {
    logger.error("MESSAGE", "Error sending message", error);
    next(new InternalError("Failed to send message"));
  }
}

export async function markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const messageId = parseInt(req.params.id, 10);
    if (isNaN(messageId)) return res.status(400).json({ error: "Invalid message ID" });

    const message = await markMessageAsReadQuery(messageId, userId);
    if (!message) {
      return res.status(404).json({ error: "Message not found or not your message" });
    }

    res.json({ data: message, message: "Message marked as read" });
  } catch (error) {
    logger.error("MESSAGE", "Error marking message as read", error);
    next(new InternalError("Failed to mark message as read"));
  }
}

export async function getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const count = await getUnreadCountQuery(userId);
    res.json({ data: { count }, message: "Unread count retrieved successfully" });
  } catch (error) {
    logger.error("MESSAGE", "Error getting unread count", error);
    next(new InternalError("Failed to get unread count"));
  }
}
