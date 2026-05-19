import type { Category } from './category';

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  value: string;
  price_modifier: number;
  stock_quantity: number;
  sku: string | null;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: number;
  business_id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  stock_quantity: number;
  is_active: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  business?: {
    id: number;
    title: string;
    address: string;
  };
  Category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  business_id: number;
  category_id?: number | null;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  stock_quantity?: number;
  is_active?: boolean;
}

export interface UpdateProductRequest {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  stock_quantity?: number;
  is_active?: boolean;
  category_id?: number | null;
}

export interface ProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductListResponse {
  data: Product[];
  pagination: ProductPagination;
  message: string;
}

export interface ProductResponse {
  data: Product | Product[];
  message: string;
}

export interface ProductImageResponse {
  data: ProductImage | ProductImage[];
  message: string;
}

export interface ProductVariantResponse {
  data: ProductVariant | ProductVariant[];
  message: string;
}

export interface ProductFilters {
  business_id?: number;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
}

export interface CreateVariantRequest {
  name: string;
  value: string;
  price_modifier?: number;
  stock_quantity?: number;
  sku?: string;
}

export interface UpdateVariantRequest {
  name?: string;
  value?: string;
  price_modifier?: number;
  stock_quantity?: number;
  sku?: string;
  is_active?: boolean;
}
