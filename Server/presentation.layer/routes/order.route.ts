import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrdersByBusiness,
} from "../../application.layer/controllers/order.ctrl";
import { authenticateJWT } from "../../infrastructure.layer/utils/jwt.util";

const router = express.Router();

// All order routes require authentication
router.get("/", authenticateJWT, getOrders);
router.post("/", authenticateJWT, createOrder);
router.get("/business/:businessId", authenticateJWT, getOrdersByBusiness);
router.get("/:id", authenticateJWT, getOrderById);
router.patch("/:id/status", authenticateJWT, updateOrderStatus);

export default router;
