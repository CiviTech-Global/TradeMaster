import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrdersByBusiness,
} from "../../application.layer/controllers/order.ctrl";
import { authenticateJWT } from "../../infrastructure.layer/utils/jwt.util";
import { validate } from "../../infrastructure.layer/validation/middleware";
import { createOrderSchema, updateOrderStatusSchema } from "../../infrastructure.layer/validation/schemas";

const router = express.Router();

// All order routes require authentication
router.get("/", authenticateJWT, getOrders);
router.post("/", authenticateJWT, validate(createOrderSchema), createOrder);
router.get("/business/:businessId", authenticateJWT, getOrdersByBusiness);
router.get("/:id", authenticateJWT, getOrderById);
router.patch("/:id/status", authenticateJWT, validate(updateOrderStatusSchema), updateOrderStatus);

export default router;
