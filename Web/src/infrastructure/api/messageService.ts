import { networkService } from './NetworkService';
import type {
  Message,
  Conversation,
  MessageListResponse,
  ConversationListResponse,
  MessageResponse,
  UnreadCountResponse,
} from '../../domain/types/message';
import type { NetworkResponse } from './NetworkService';

/**
 * Message API Service
 * Handles all message-related API operations
 */
export class MessageService {
  private baseUrl = '/messages';

  /**
   * Get all conversations for the current user
   */
  async getConversations(): Promise<Conversation[]> {
    try {
      const response: NetworkResponse<ConversationListResponse> = await networkService.get(
        `${this.baseUrl}/conversations`,
        { cache: false }
      );
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  /**
   * Get messages for a specific conversation with a user
   */
  async getConversationMessages(
    userId: number,
    options?: { page?: number; limit?: number }
  ): Promise<{ messages: Message[]; pagination?: MessageListResponse['pagination'] }> {
    try {
      let url = `${this.baseUrl}/conversation/${userId}`;
      const params: string[] = [];
      if (options?.page) params.push(`page=${options.page}`);
      if (options?.limit) params.push(`limit=${options.limit}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const response: NetworkResponse<MessageListResponse> = await networkService.get(url, {
        cache: false,
      });
      const data = response.data;
      return {
        messages: Array.isArray(data.data) ? data.data : [],
        pagination: data.pagination,
      };
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      return { messages: [] };
    }
  }

  /**
   * Send a new message
   */
  async sendMessage(data: {
    receiver_id: number;
    content: string;
    order_id?: number;
    product_id?: number;
  }): Promise<Message | null> {
    try {
      const response: NetworkResponse<MessageResponse> = await networkService.post(
        this.baseUrl,
        data,
        {
          validateResponse: (resData) => resData.data && typeof resData.data === 'object',
          customErrorMessage: 'Failed to send message.',
        }
      );
      return response.data.data as Message;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  /**
   * Mark a message as read
   */
  async markAsRead(messageId: number): Promise<Message | null> {
    try {
      const response: NetworkResponse<MessageResponse> = await networkService.patch(
        `${this.baseUrl}/${messageId}/read`
      );
      return response.data.data as Message;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return null;
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response: NetworkResponse<UnreadCountResponse> = await networkService.get(
        `${this.baseUrl}/unread-count`,
        { cache: false }
      );
      return response.data.data?.count ?? 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }
}

/**
 * Default message service instance
 */
export const messageService = new MessageService();
