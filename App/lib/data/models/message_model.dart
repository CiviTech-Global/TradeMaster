class MessageUserModel {
  final int id;
  final String firstname;
  final String lastname;
  final String? avatar;

  MessageUserModel({
    required this.id,
    required this.firstname,
    required this.lastname,
    this.avatar,
  });

  String get fullName => '$firstname $lastname';

  factory MessageUserModel.fromJson(Map<String, dynamic> json) =>
      MessageUserModel(
        id: json['id'] as int? ?? 0,
        firstname: json['firstname'] as String? ?? '',
        lastname: json['lastname'] as String? ?? '',
        avatar: json['avatar'] as String?,
      );
}

class MessageModel {
  final int id;
  final int senderId;
  final int receiverId;
  final int? orderId;
  final int? productId;
  final String content;
  final bool isRead;
  final MessageUserModel? sender;
  final MessageUserModel? receiver;
  final String? createdAt;

  MessageModel({
    required this.id,
    required this.senderId,
    required this.receiverId,
    this.orderId,
    this.productId,
    required this.content,
    this.isRead = false,
    this.sender,
    this.receiver,
    this.createdAt,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) => MessageModel(
        id: json['id'] as int? ?? 0,
        senderId: json['sender_id'] as int? ?? 0,
        receiverId: json['receiver_id'] as int? ?? 0,
        orderId: json['order_id'] as int?,
        productId: json['product_id'] as int?,
        content: json['content'] as String? ?? '',
        isRead: json['is_read'] as bool? ?? false,
        sender: json['sender'] != null
            ? MessageUserModel.fromJson(json['sender'])
            : null,
        receiver: json['receiver'] != null
            ? MessageUserModel.fromJson(json['receiver'])
            : null,
        createdAt: json['createdAt'],
      );
}

class ConversationModel {
  final MessageUserModel partner;
  final MessageModel? lastMessage;
  final int unreadCount;

  ConversationModel({
    required this.partner,
    this.lastMessage,
    this.unreadCount = 0,
  });

  factory ConversationModel.fromJson(Map<String, dynamic> json) =>
      ConversationModel(
        partner: MessageUserModel.fromJson(json['partner']),
        lastMessage: json['lastMessage'] != null
            ? MessageModel.fromJson(json['lastMessage'])
            : null,
        unreadCount: json['unreadCount'] ?? 0,
      );
}
