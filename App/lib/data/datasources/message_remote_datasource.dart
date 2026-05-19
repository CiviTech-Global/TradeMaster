import 'package:trademaster/core/network/dio_client.dart';
import 'package:trademaster/data/models/message_model.dart';
import 'package:trademaster/data/models/product_model.dart';

class MessageListResponse {
  final List<MessageModel> messages;
  final PaginationModel? pagination;

  MessageListResponse({required this.messages, this.pagination});
}

class MessageRemoteDatasource {
  final DioClient _dioClient;

  MessageRemoteDatasource({DioClient? dioClient})
      : _dioClient = dioClient ?? DioClient.instance;

  Future<List<ConversationModel>> getConversations() async {
    final response = await _dioClient.get('/messages/conversations');
    return (response.data['data'] as List)
        .map((c) => ConversationModel.fromJson(c))
        .toList();
  }

  Future<MessageListResponse> getConversationMessages(
    int userId, {
    int page = 1,
    int limit = 50,
  }) async {
    final response = await _dioClient.get(
      '/messages/conversation/$userId',
      queryParameters: {'page': page, 'limit': limit},
    );
    final data = response.data;
    return MessageListResponse(
      messages: (data['data'] as List)
          .map((m) => MessageModel.fromJson(m))
          .toList(),
      pagination: data['pagination'] != null
          ? PaginationModel.fromJson(data['pagination'])
          : null,
    );
  }

  Future<MessageModel> sendMessage({
    required int receiverId,
    required String content,
    int? orderId,
    int? productId,
  }) async {
    final response = await _dioClient.post('/messages', data: {
      'receiver_id': receiverId,
      'content': content,
      'order_id': ?orderId,
      'product_id': ?productId,
    });
    return MessageModel.fromJson(response.data['data']);
  }

  Future<void> markAsRead(int messageId) async {
    await _dioClient.patch('/messages/$messageId/read');
  }

  Future<int> getUnreadCount() async {
    final response = await _dioClient.get('/messages/unread-count');
    return response.data['data']['count'] ?? 0;
  }
}
