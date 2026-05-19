export interface IOrder {
  id: number;
  order_number: string;
  buyer_id: number;
  business_id: number;
  status: string;
  total_amount: number;
  currency: string;
  shipping_address: string | null;
  shipping_latitude: number | null;
  shipping_longitude: number | null;
  notes: string | null;
  cancelled_reason: string | null;
  confirmed_at: Date | null;
  shipped_at: Date | null;
  delivered_at: Date | null;
  cancelled_at: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface IOrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  createdAt: Date;
  updatedAt: Date;
}
