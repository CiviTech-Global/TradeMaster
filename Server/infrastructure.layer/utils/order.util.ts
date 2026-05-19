import { Order, OrderItem } from "../../domain.layer/models/order";
import { Product, ProductVariant } from "../../domain.layer/models/product";
import { Business } from "../../domain.layer/models/business";
import { User } from "../../domain.layer/models/user";
import { Op } from "sequelize";
import sequelize from "../database/sequelize";

const VALID_STATUSES = ['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'];

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_transit', 'cancelled'],
  in_transit: ['delivered'],
};

const orderIncludes: any[] = [
  {
    model: User,
    attributes: ['id', 'firstname', 'lastname', 'email'],
  },
  {
    model: Business,
    attributes: ['id', 'title', 'owner', 'address', 'logo'],
  },
  {
    model: OrderItem,
    as: 'items',
    include: [
      {
        model: Product,
        attributes: ['id', 'title', 'price', 'currency', 'is_active'],
      },
      {
        model: ProductVariant,
        attributes: ['id', 'name', 'value', 'price_modifier', 'sku'],
        required: false,
      },
    ],
  },
];

interface OrderFilters {
  status?: string;
  page?: number;
  limit?: number;
}

interface OrderItemInput {
  product_id: number;
  variant_id?: number;
  quantity: number;
}

interface ShippingData {
  shipping_address?: string;
  shipping_latitude?: number;
  shipping_longitude?: number;
  notes?: string;
  currency?: string;
}

export async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');

  const prefix = `TM-${dateStr}-`;

  const lastOrder = await Order.findOne({
    where: {
      order_number: { [Op.like]: `${prefix}%` },
    },
    order: [['order_number', 'DESC']],
    paranoid: false,
  });

  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.order_number.split('-')[2], 10);
    if (!isNaN(lastSequence)) {
      sequence = lastSequence + 1;
    }
  }

  return `${prefix}${sequence.toString().padStart(4, '0')}`;
}

export async function createOrderQuery(
  buyerId: number,
  businessId: number,
  items: OrderItemInput[],
  shippingData: ShippingData
) {
  const transaction = await sequelize.transaction();

  try {
    // Validate all products exist, are active, and belong to the business
    let totalAmount = 0;
    const orderItemsData: Array<{
      product_id: number;
      variant_id: number | null;
      quantity: number;
      unit_price: number;
      total_price: number;
    }> = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product_id, {
        include: [{ model: ProductVariant, as: 'variants', required: false }],
        transaction,
      });

      if (!product) {
        throw new Error(`Product with ID ${item.product_id} not found`);
      }

      if (!product.is_active) {
        throw new Error(`Product "${product.title}" is not active`);
      }

      if (product.business_id !== businessId) {
        throw new Error(`Product "${product.title}" does not belong to the specified business`);
      }

      let unitPrice = Number(product.price);
      let stockToCheck = product.stock_quantity;

      if (item.variant_id) {
        const variant = product.variants?.find(v => v.id === item.variant_id);
        if (!variant) {
          throw new Error(`Variant with ID ${item.variant_id} not found for product "${product.title}"`);
        }
        if (!variant.is_active) {
          throw new Error(`Variant "${variant.name}: ${variant.value}" is not active`);
        }
        unitPrice = unitPrice + Number(variant.price_modifier);
        if (variant.stock_quantity !== null) {
          stockToCheck = variant.stock_quantity;
        }
      }

      if (stockToCheck < item.quantity) {
        throw new Error(`Insufficient stock for product "${product.title}". Available: ${stockToCheck}, Requested: ${item.quantity}`);
      }

      const itemTotal = unitPrice * item.quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: itemTotal,
      });

      // Decrement stock
      if (item.variant_id) {
        const variant = product.variants?.find(v => v.id === item.variant_id);
        if (variant && variant.stock_quantity !== null) {
          await ProductVariant.update(
            { stock_quantity: variant.stock_quantity - item.quantity },
            { where: { id: item.variant_id }, transaction }
          );
        }
      } else {
        await Product.update(
          { stock_quantity: product.stock_quantity - item.quantity },
          { where: { id: item.product_id }, transaction }
        );
      }
    }

    const orderNumber = await generateOrderNumber();

    const order = await Order.create({
      order_number: orderNumber,
      buyer_id: buyerId,
      business_id: businessId,
      total_amount: totalAmount,
      currency: shippingData.currency || 'USD',
      shipping_address: shippingData.shipping_address || null,
      shipping_latitude: shippingData.shipping_latitude || null,
      shipping_longitude: shippingData.shipping_longitude || null,
      notes: shippingData.notes || null,
    }, { transaction });

    for (const itemData of orderItemsData) {
      await OrderItem.create({
        order_id: order.id,
        ...itemData,
      }, { transaction });
    }

    await transaction.commit();

    return await getOrderByIdQuery(order.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function getOrderByIdQuery(id: number) {
  return await Order.findByPk(id, {
    include: orderIncludes,
  });
}

export async function getOrdersByBuyerQuery(buyerId: number, filters: OrderFilters) {
  const where: any = { buyer_id: buyerId };
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 100);
  const offset = (page - 1) * limit;

  if (filters.status && VALID_STATUSES.includes(filters.status)) {
    where.status = filters.status;
  }

  const { rows, count } = await Order.findAndCountAll({
    where,
    include: orderIncludes,
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

export async function getOrdersByBusinessQuery(businessId: number, filters: OrderFilters) {
  const where: any = { business_id: businessId };
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 100);
  const offset = (page - 1) * limit;

  if (filters.status && VALID_STATUSES.includes(filters.status)) {
    where.status = filters.status;
  }

  const { rows, count } = await Order.findAndCountAll({
    where,
    include: orderIncludes,
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

export async function updateOrderStatusQuery(id: number, newStatus: string, reason?: string) {
  const order = await Order.findByPk(id);
  if (!order) return null;

  const currentStatus = order.status;
  const allowedTransitions = VALID_TRANSITIONS[currentStatus];

  if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
    throw new Error(`Invalid status transition from "${currentStatus}" to "${newStatus}"`);
  }

  const updateData: any = { status: newStatus };
  const now = new Date();

  if (newStatus === 'confirmed') updateData.confirmed_at = now;
  if (newStatus === 'in_transit') updateData.shipped_at = now;
  if (newStatus === 'delivered') updateData.delivered_at = now;
  if (newStatus === 'cancelled') {
    updateData.cancelled_at = now;
    if (reason) updateData.cancelled_reason = reason;

    // Restore stock for cancelled orders
    const orderItems = await OrderItem.findAll({ where: { order_id: id } });
    for (const item of orderItems) {
      if (item.variant_id) {
        const variant = await ProductVariant.findByPk(item.variant_id);
        if (variant && variant.stock_quantity !== null) {
          await ProductVariant.update(
            { stock_quantity: variant.stock_quantity + item.quantity },
            { where: { id: item.variant_id } }
          );
        }
      } else {
        const product = await Product.findByPk(item.product_id);
        if (product) {
          await Product.update(
            { stock_quantity: product.stock_quantity + item.quantity },
            { where: { id: item.product_id } }
          );
        }
      }
    }
  }

  await order.update(updateData);
  return await getOrderByIdQuery(id);
}

export async function getOrderBusinessOwnerId(orderId: number): Promise<number | null> {
  const order = await Order.findByPk(orderId, {
    include: [{ model: Business, attributes: ['owner'] }],
  });
  return order?.business?.owner || null;
}
