import { Request, Response } from "express";
import {
  createOrderQuery,
  getOrderByIdQuery,
  getOrdersByBuyerQuery,
  getOrdersByBusinessQuery,
  updateOrderStatusQuery,
  getOrderBusinessOwnerId,
} from "../../infrastructure.layer/utils/order.util";
import { AuthenticatedRequest } from "../../infrastructure.layer/utils/jwt.util";
import { verifyBusinessOwnership } from "../../infrastructure.layer/utils/product.util";
import { logger } from "../../infrastructure.layer/utils/logger.util";

export async function createOrder(req: AuthenticatedRequest, res: Response) {
  try {
    const { business_id, items, shipping_address, shipping_latitude, shipping_longitude, notes, currency } = req.body;
    const buyerId = req.user!.id;

    if (!business_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "business_id and items (non-empty array) are required" });
    }

    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: "Each item must have a valid product_id and quantity (>= 1)" });
      }
    }

    const order = await createOrderQuery(buyerId, business_id, items, {
      shipping_address,
      shipping_latitude,
      shipping_longitude,
      notes,
      currency,
    });

    res.status(201).json({ data: order, message: "Order created successfully" });
  } catch (error: any) {
    console.error("Error creating order:", error);
    if (error.message && (
      error.message.includes('not found') ||
      error.message.includes('not active') ||
      error.message.includes('Insufficient stock') ||
      error.message.includes('does not belong')
    )) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create order" });
  }
}

export async function getOrders(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const role = req.query.role as string;
    const filters = {
      status: req.query.status as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };

    logger.debug("OrderCtrl", "getOrders called", { userId, role, ...filters });

    if (role === 'seller') {
      return res.status(400).json({ error: "Use /orders/business/:businessId for seller orders" });
    }

    // Default: get orders as buyer
    const result = await getOrdersByBuyerQuery(userId, filters);
    logger.debug("OrderCtrl", "getOrders success", { userId, count: (result.data as unknown[]).length, total: result.pagination.total });
    res.json({ ...result, message: "Orders retrieved successfully" });
  } catch (error) {
    logger.error("OrderCtrl", "getOrders failed", error, { userId: req.user?.id });
    res.status(500).json({ error: "Failed to get orders" });
  }
}

export async function getOrderById(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid order ID" });

    const order = await getOrderByIdQuery(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const userId = req.user!.id;
    const isBusinessOwner = order.business?.owner === userId;
    const isBuyer = order.buyer_id === userId;

    if (!isBuyer && !isBusinessOwner) {
      return res.status(403).json({ error: "You do not have access to this order" });
    }

    res.json({ data: order, message: "Order retrieved successfully" });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to get order" });
  }
}

export async function updateOrderStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid order ID" });

    const { status, reason } = req.body;
    if (!status) return res.status(400).json({ error: "status is required" });

    const order = await getOrderByIdQuery(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const userId = req.user!.id;
    const isBusinessOwner = order.business?.owner === userId;
    const isBuyer = order.buyer_id === userId;

    // Buyers can only cancel
    if (isBuyer && !isBusinessOwner) {
      if (status !== 'cancelled') {
        return res.status(403).json({ error: "Buyers can only cancel orders" });
      }
    }

    // Sellers can confirm, ship, deliver, cancel
    if (isBusinessOwner && !isBuyer) {
      if (!['confirmed', 'in_transit', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: "Invalid status for seller" });
      }
    }

    // Neither buyer nor seller
    if (!isBuyer && !isBusinessOwner) {
      return res.status(403).json({ error: "You do not have access to this order" });
    }

    const updatedOrder = await updateOrderStatusQuery(id, status, reason);
    res.json({ data: updatedOrder, message: "Order status updated successfully" });
  } catch (error: any) {
    console.error("Error updating order status:", error);
    if (error.message && error.message.includes('Invalid status transition')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to update order status" });
  }
}

export async function getOrdersByBusiness(req: AuthenticatedRequest, res: Response) {
  try {
    const businessId = parseInt(req.params.businessId, 10);
    if (isNaN(businessId)) return res.status(400).json({ error: "Invalid business ID" });

    const isOwner = await verifyBusinessOwnership(businessId, req.user!.id);
    if (!isOwner) {
      return res.status(403).json({ error: "You can only view orders for your own business" });
    }

    const filters = {
      status: req.query.status as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };

    const result = await getOrdersByBusinessQuery(businessId, filters);
    res.json({ ...result, message: "Business orders retrieved successfully" });
  } catch (error) {
    console.error("Error fetching business orders:", error);
    res.status(500).json({ error: "Failed to get business orders" });
  }
}
