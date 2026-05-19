import type { Product, ProductVariant } from './product';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export interface OrderBuyer {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

export interface OrderBusiness {
  id: number;
  title: string;
  address: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
  variant?: ProductVariant;
}

export interface Order {
  id: number;
  order_number: string;
  buyer_id: number;
  business_id: number;
  status: OrderStatus;
  total_amount: number;
  currency: string;
  shipping_address: string;
  shipping_latitude: number | null;
  shipping_longitude: number | null;
  notes: string | null;
  cancelled_reason: string | null;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  buyer?: OrderBuyer;
  business?: OrderBusiness;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  data: Order[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
}

export interface OrderResponse {
  data: Order;
  message: string;
}
