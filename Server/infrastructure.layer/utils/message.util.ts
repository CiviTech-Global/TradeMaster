import { Message } from "../../domain.layer/models/message";
import { User } from "../../domain.layer/models/user";
import { Op, literal, fn, col } from "sequelize";

const userAttributes = ['id', 'firstname', 'lastname', 'email', 'avatar'];

export async function getConversationsQuery(userId: number) {
  // Get the latest message for each conversation partner
  const messages = await Message.findAll({
    where: {
      [Op.or]: [
        { sender_id: userId },
        { receiver_id: userId },
      ],
    },
    include: [
      { model: User, as: 'sender', attributes: userAttributes },
      { model: User, as: 'receiver', attributes: userAttributes },
    ],
    order: [['createdAt', 'DESC']],
  });

  // Group by conversation partner and get latest message
  const conversationMap = new Map<number, any>();
  for (const msg of messages) {
    const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
    if (!conversationMap.has(partnerId)) {
      const partner = msg.sender_id === userId ? msg.receiver : msg.sender;
      conversationMap.set(partnerId, {
        partner,
        lastMessage: msg,
        unreadCount: 0,
      });
    }
  }

  // Count unread messages per conversation
  const unreadCounts = await Message.findAll({
    where: {
      receiver_id: userId,
      is_read: false,
    },
    attributes: [
      'sender_id',
      [fn('COUNT', col('id')), 'count'],
    ],
    group: ['sender_id'],
    raw: true,
  }) as any[];

  for (const row of unreadCounts) {
    const conv = conversationMap.get(row.sender_id);
    if (conv) {
      conv.unreadCount = parseInt(row.count, 10);
    }
  }

  return Array.from(conversationMap.values());
}

export async function getConversationMessagesQuery(
  userId: number,
  partnerId: number,
  options: { orderId?: number; productId?: number; page?: number; limit?: number } = {}
) {
  const page = options.page || 1;
  const limit = Math.min(options.limit || 50, 100);
  const offset = (page - 1) * limit;

  const where: any = {
    [Op.or]: [
      { sender_id: userId, receiver_id: partnerId },
      { sender_id: partnerId, receiver_id: userId },
    ],
  };

  if (options.orderId) where.order_id = options.orderId;
  if (options.productId) where.product_id = options.productId;

  const { rows, count } = await Message.findAndCountAll({
    where,
    include: [
      { model: User, as: 'sender', attributes: userAttributes },
      { model: User, as: 'receiver', attributes: userAttributes },
    ],
    order: [['createdAt', 'ASC']],
    limit,
    offset,
  });

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

export async function createMessageQuery(data: {
  sender_id: number;
  receiver_id: number;
  content: string;
  order_id?: number;
  product_id?: number;
}) {
  const message = await Message.create({
    sender_id: data.sender_id,
    receiver_id: data.receiver_id,
    content: data.content,
    order_id: data.order_id || null,
    product_id: data.product_id || null,
  });

  return await Message.findByPk(message.id, {
    include: [
      { model: User, as: 'sender', attributes: userAttributes },
      { model: User, as: 'receiver', attributes: userAttributes },
    ],
  });
}

export async function markMessageAsReadQuery(messageId: number, userId: number) {
  const message = await Message.findOne({
    where: { id: messageId, receiver_id: userId },
  });
  if (!message) return null;

  await message.update({ is_read: true });
  return message;
}

export async function markConversationAsReadQuery(userId: number, partnerId: number) {
  await Message.update(
    { is_read: true },
    {
      where: {
        sender_id: partnerId,
        receiver_id: userId,
        is_read: false,
      },
    }
  );
}

export async function getUnreadCountQuery(userId: number): Promise<number> {
  return await Message.count({
    where: {
      receiver_id: userId,
      is_read: false,
    },
  });
}
