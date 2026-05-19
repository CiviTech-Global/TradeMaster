import { networkService } from './NetworkService';
import type {
  Review,
  ReviewStats,
  ReviewListResponse,
} from '../../domain/types/review';
import type { NetworkResponse } from './NetworkService';

/**
 * Review API Service
 * Handles all review-related API operations
 */
export class ReviewService {
  private baseUrl = '/reviews';

  /**
   * Get reviews for a specific business
   */
  async getBusinessReviews(
    businessId: number,
    page?: number,
    limit?: number
  ): Promise<{
    reviews: Review[];
    pagination?: ReviewListResponse['pagination'];
    stats?: ReviewStats;
  }> {
    try {
      let url = `${this.baseUrl}/business/${businessId}`;
      const params: string[] = [];
      if (page) params.push(`page=${page}`);
      if (limit) params.push(`limit=${limit}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const response: NetworkResponse<ReviewListResponse> = await networkService.get(url, {
        cache: false,
      });
      const data = response.data;
      return {
        reviews: Array.isArray(data.data) ? data.data : [],
        pagination: data.pagination,
        stats: data.stats,
      };
    } catch (error) {
      console.error('Error fetching reviews for business:', error);
      return { reviews: [] };
    }
  }

  /**
   * Get reviews for a specific product
   */
  async getProductReviews(
    productId: number,
    page?: number,
    limit?: number
  ): Promise<{
    reviews: Review[];
    pagination?: ReviewListResponse['pagination'];
  }> {
    try {
      let url = `${this.baseUrl}/product/${productId}`;
      const params: string[] = [];
      if (page) params.push(`page=${page}`);
      if (limit) params.push(`limit=${limit}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const response: NetworkResponse<ReviewListResponse> = await networkService.get(url, {
        cache: false,
      });
      const data = response.data;
      return {
        reviews: Array.isArray(data.data) ? data.data : [],
        pagination: data.pagination,
      };
    } catch (error) {
      console.error('Error fetching reviews for product:', error);
      return { reviews: [] };
    }
  }
}

/**
 * Default review service instance
 */
export const reviewService = new ReviewService();
