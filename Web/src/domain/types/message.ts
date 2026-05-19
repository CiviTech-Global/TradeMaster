export interface MessageUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  order_id: number | null;
  product_id: number | null;
  content: string;
  is_read: boolean;
  sender?: MessageUser;
  receiver?: MessageUser;
  createdAt: string;
}

export interface Conversation {
  partner: MessageUser;
  lastMessage: Message;
  unreadCount: number;
}

export interface MessageListResponse {
  data: Message[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
}

export interface ConversationListResponse {
  data: Conversation[];
  message: string;
}

export interface MessageResponse {
  data: Message;
  message: string;
}

export interface UnreadCountResponse {
  data: { count: number };
  message: string;
}
