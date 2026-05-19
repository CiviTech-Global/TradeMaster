import { networkService } from './NetworkService';
import type {
  Order,
  OrderStatus,
  OrderListResponse,
  OrderResponse,
} from '../../domain/types/order';
import type { NetworkResponse } from './NetworkService';

/**
 * Order API Service
 * Handles all order-related API operations
 */
export class OrderService {
  private baseUrl = '/orders';

  /**
   * Get orders for a specific business
   */
  async getOrdersByBusiness(
    businessId: number,
    filters?: { status?: OrderStatus; page?: number; limit?: number }
  ): Promise<{ orders: Order[]; pagination?: OrderListResponse['pagination'] }> {
    try {
      let url = `${this.baseUrl}/business/${businessId}`;
      const params: string[] = [];
      if (filters?.status) params.push(`status=${filters.status}`);
      if (filters?.page) params.push(`page=${filters.page}`);
      if (filters?.limit) params.push(`limit=${filters.limit}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const response: NetworkResponse<OrderListResponse> = await networkService.get(url, {
        cache: false,
      });
      const data = response.data;
      return {
        orders: Array.isArray(data.data) ? data.data : [],
        pagination: data.pagination,
      };
    } catch (error) {
      console.error('Error fetching orders for business:', error);
      return { orders: [] };
    }
  }

  /**
   * Get a single order by ID
   */
  async getOrderById(id: number): Promise<Order | null> {
    try {
      const response: NetworkResponse<OrderResponse> = await networkService.get(
        `${this.baseUrl}/${id}`,
        { cache: false }
      );
      return response.data.data as Order;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    id: number,
    status: OrderStatus,
    reason?: string
  ): Promise<Order | null> {
    try {
      const body: { status: OrderStatus; cancelled_reason?: string } = { status };
      if (reason) body.cancelled_reason = reason;

      const response: NetworkResponse<OrderResponse> = await networkService.patch(
        `${this.baseUrl}/${id}/status`,
        body,
        {
          validateResponse: (data) => data.data && typeof data.data === 'object',
          customErrorMessage: 'Failed to update order status.',
        }
      );
      return response.data.data as Order;
    } catch (error) {
      console.error('Error updating order status:', error);
      return null;
    }
  }
}

/**
 * Default order service instance
 */
export const orderService = new OrderService();
