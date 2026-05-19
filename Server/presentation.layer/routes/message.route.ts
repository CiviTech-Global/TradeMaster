import express from "express";
import {
  getConversations,
  getConversationMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
} from "../../application.layer/controllers/message.ctrl";
import { authenticateJWT } from "../../infrastructure.layer/utils/jwt.util";

const router = express.Router();

// All message routes are protected
router.get("/conversations", authenticateJWT, getConversations);
router.get("/unread-count", authenticateJWT, getUnreadCount);
router.get("/conversation/:userId", authenticateJWT, getConversationMessages);
router.post("/", authenticateJWT, sendMessage);
router.patch("/:id/read", authenticateJWT, markAsRead);

export default router;
