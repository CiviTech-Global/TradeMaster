interface IMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  order_id: number | null;
  product_id: number | null;
  content: string;
  is_read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default IMessage;
