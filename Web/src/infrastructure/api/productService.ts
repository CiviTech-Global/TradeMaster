import { networkService } from './NetworkService';
import type {
  Product,
  ProductImage,
  ProductVariant,
  CreateProductRequest,
  UpdateProductRequest,
  ProductFilters,
  ProductListResponse,
  ProductResponse,
  ProductImageResponse,
  ProductVariantResponse,
  ProductPagination,
  CreateVariantRequest,
  UpdateVariantRequest,
} from '../../domain/types/product';
import type { NetworkResponse } from './NetworkService';

/**
 * Product API Service
 * Handles all product-related API operations
 */
export class ProductService {
  private baseUrl = '/products';

  /**
   * Get products with optional filters and pagination
   */
  async getProducts(filters: ProductFilters = {}): Promise<{ products: Product[]; pagination: ProductPagination }> {
    const params = new URLSearchParams();
    if (filters.business_id !== undefined) params.append('business_id', filters.business_id.toString());
    if (filters.category_id !== undefined) params.append('category_id', filters.category_id.toString());
    if (filters.min_price !== undefined) params.append('min_price', filters.min_price.toString());
    if (filters.max_price !== undefined) params.append('max_price', filters.max_price.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters.sort_by) params.append('sort_by', filters.sort_by);

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response: NetworkResponse<ProductListResponse> = await networkService.get(url, { cache: false });
    return {
      products: Array.isArray(response.data.data) ? response.data.data : [],
      pagination: response.data.pagination,
    };
  }

  /**
   * Get product by ID
   */
  async getProductById(id: number): Promise<Product | null> {
    try {
      const response: NetworkResponse<ProductResponse> = await networkService.get(`${this.baseUrl}/${id}`);
      return response.data.data as Product;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  /**
   * Get products by business ID
   */
  async getProductsByBusiness(businessId: number): Promise<Product[]> {
    const response: NetworkResponse<ProductResponse> = await networkService.get(
      `${this.baseUrl}/business/${businessId}`,
      { cache: false }
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  }

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response: NetworkResponse<ProductResponse> = await networkService.post(
      this.baseUrl,
      data,
      {
        validateResponse: (resData) => resData.data && typeof resData.data === 'object',
        customErrorMessage: 'Failed to create product. Please check your data and try again.',
      }
    );
    return response.data.data as Product;
  }

  /**
   * Update an existing product
   */
  async updateProduct(id: number, data: UpdateProductRequest): Promise<Product> {
    const response: NetworkResponse<ProductResponse> = await networkService.patch(
      `${this.baseUrl}/${id}`,
      data,
      {
        validateResponse: (resData) => resData.data && typeof resData.data === 'object',
        customErrorMessage: 'Failed to update product. Please try again.',
      }
    );
    return response.data.data as Product;
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: number): Promise<boolean> {
    try {
      await networkService.delete(`${this.baseUrl}/${id}`, {
        customErrorMessage: 'Failed to delete product. Please try again.',
      });
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  /**
   * Upload images for a product
   */
  async uploadProductImages(productId: number, files: File[]): Promise<ProductImage[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    const response: NetworkResponse<ProductImageResponse> = await networkService.post(
      `${this.baseUrl}/${productId}/images`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data as ProductImage];
  }

  /**
   * Delete a product image
   */
  async deleteProductImage(productId: number, imageId: number): Promise<boolean> {
    try {
      await networkService.delete(`${this.baseUrl}/${productId}/images/${imageId}`);
      return true;
    } catch (error) {
      console.error('Error deleting product image:', error);
      return false;
    }
  }

  /**
   * Get variants for a product
   */
  async getVariants(productId: number): Promise<ProductVariant[]> {
    const response: NetworkResponse<ProductVariantResponse> = await networkService.get(
      `${this.baseUrl}/${productId}/variants`
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  }

  /**
   * Create a variant for a product
   */
  async createVariant(productId: number, data: CreateVariantRequest): Promise<ProductVariant> {
    const response: NetworkResponse<ProductVariantResponse> = await networkService.post(
      `${this.baseUrl}/${productId}/variants`,
      data
    );
    return response.data.data as ProductVariant;
  }

  /**
   * Update a product variant
   */
  async updateVariant(productId: number, variantId: number, data: UpdateVariantRequest): Promise<ProductVariant> {
    const response: NetworkResponse<ProductVariantResponse> = await networkService.patch(
      `${this.baseUrl}/${productId}/variants/${variantId}`,
      data
    );
    return response.data.data as ProductVariant;
  }

  /**
   * Delete a product variant
   */
  async deleteVariant(productId: number, variantId: number): Promise<boolean> {
    try {
      await networkService.delete(`${this.baseUrl}/${productId}/variants/${variantId}`);
      return true;
    } catch (error) {
      console.error('Error deleting variant:', error);
      return false;
    }
  }
}

/**
 * Default product service instance
 */
export const productService = new ProductService();
