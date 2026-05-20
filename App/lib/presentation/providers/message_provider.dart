import 'dart:async';
import 'dart:developer' as developer;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trademaster/data/datasources/message_remote_datasource.dart';
import 'package:trademaster/data/models/message_model.dart';

final messageDatasourceProvider = Provider<MessageRemoteDatasource>((ref) {
  return MessageRemoteDatasource();
});

// Conversations list
class ConversationsNotifier
    extends StateNotifier<AsyncValue<List<ConversationModel>>> {
  final MessageRemoteDatasource _datasource;

  ConversationsNotifier(this._datasource)
      : super(const AsyncValue.loading());

  Future<void> loadConversations() async {
    developer.log('ConversationsNotifier.loadConversations: starting', name: 'MessageProvider');
    state = const AsyncValue.loading();
    try {
      final conversations = await _datasource.getConversations();
      developer.log('ConversationsNotifier.loadConversations: success, ${conversations.length} conversations', name: 'MessageProvider');
      state = AsyncValue.data(conversations);
    } catch (e, st) {
      developer.log('ConversationsNotifier.loadConversations: FAILED - $e', name: 'MessageProvider', level: 1000);
      state = AsyncValue.error(e, st);
    }
  }
}

final conversationsProvider = StateNotifierProvider<ConversationsNotifier,
    AsyncValue<List<ConversationModel>>>((ref) {
  return ConversationsNotifier(ref.watch(messageDatasourceProvider));
});

// Chat messages for a specific conversation
class ChatState {
  final List<MessageModel> messages;
  final bool isLoading;
  final String? error;

  const ChatState({
    this.messages = const [],
    this.isLoading = false,
    this.error,
  });
}

class ChatNotifier extends StateNotifier<ChatState> {
  final MessageRemoteDatasource _datasource;
  final int partnerId;
  Timer? _pollTimer;

  ChatNotifier(this._datasource, this.partnerId) : super(const ChatState());

  Future<void> loadMessages() async {
    state = const ChatState(isLoading: true);
    try {
      final response = await _datasource.getConversationMessages(partnerId);
      state = ChatState(messages: response.messages);
    } catch (e) {
      state = ChatState(error: e.toString());
    }
  }

  Future<void> sendMessage(String content, {int? orderId, int? productId}) async {
    try {
      final message = await _datasource.sendMessage(
        receiverId: partnerId,
        content: content,
        orderId: orderId,
        productId: productId,
      );
      state = ChatState(messages: [...state.messages, message]);
    } catch (e) {
      state = ChatState(
        messages: state.messages,
        error: e.toString(),
      );
    }
  }

  void startPolling() {
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(const Duration(seconds: 30), (_) async {
      try {
        final response = await _datasource.getConversationMessages(partnerId);
        if (mounted) {
          state = ChatState(messages: response.messages);
        }
      } catch (_) {
        // Silently ignore polling errors
      }
    });
  }

  void stopPolling() {
    _pollTimer?.cancel();
    _pollTimer = null;
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }
}

final chatProvider =
    StateNotifierProvider.family<ChatNotifier, ChatState, int>(
  (ref, partnerId) {
    final notifier =
        ChatNotifier(ref.watch(messageDatasourceProvider), partnerId);
    notifier.loadMessages();
    notifier.startPolling();
    ref.onDispose(() => notifier.stopPolling());
    return notifier;
  },
);

// Unread count with polling
class UnreadCountNotifier extends StateNotifier<int> {
  final MessageRemoteDatasource _datasource;
  Timer? _pollTimer;

  UnreadCountNotifier(this._datasource) : super(0);

  Future<void> loadCount() async {
    try {
      final count = await _datasource.getUnreadCount();
      if (mounted) {
        state = count;
      }
    } catch (_) {
      // Ignore errors for unread count
    }
  }

  void startPolling() {
    loadCount();
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      loadCount();
    });
  }

  void stopPolling() {
    _pollTimer?.cancel();
    _pollTimer = null;
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }
}

final unreadCountProvider =
    StateNotifierProvider<UnreadCountNotifier, int>((ref) {
  final notifier = UnreadCountNotifier(ref.watch(messageDatasourceProvider));
  notifier.startPolling();
  ref.onDispose(() => notifier.stopPolling());
  return notifier;
});
