export interface IProduct {
  id: number;
  business_id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  stock_quantity: number;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface IProductImage {
  id: number;
  product_id: number;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductVariant {
  id: number;
  product_id: number;
  name: string;
  value: string;
  price_modifier: number;
  stock_quantity: number | null;
  sku: string | null;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
