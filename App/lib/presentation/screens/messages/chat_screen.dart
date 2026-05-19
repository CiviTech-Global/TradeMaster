import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trademaster/data/models/message_model.dart';
import 'package:trademaster/presentation/providers/auth_provider.dart';
import 'package:trademaster/presentation/providers/message_provider.dart';

class ChatScreen extends ConsumerStatefulWidget {
  final int partnerId;

  const ChatScreen({super.key, required this.partnerId});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  bool _isSending = false;

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      Future.delayed(const Duration(milliseconds: 100), () {
        if (_scrollController.hasClients) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        }
      });
    }
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty || _isSending) return;

    setState(() => _isSending = true);
    _messageController.clear();

    await ref.read(chatProvider(widget.partnerId).notifier).sendMessage(text);

    if (mounted) {
      setState(() => _isSending = false);
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final chatState = ref.watch(chatProvider(widget.partnerId));
    final currentUserId = ref.watch(authProvider).user?.id;

    // Auto-scroll when messages change
    ref.listen(chatProvider(widget.partnerId), (prev, next) {
      if (prev?.messages.length != next.messages.length) {
        _scrollToBottom();
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: _buildTitle(chatState),
      ),
      body: Column(
        children: [
          // Messages
          Expanded(
            child: chatState.isLoading && chatState.messages.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : chatState.error != null && chatState.messages.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.error_outline,
                                size: 48, color: theme.colorScheme.error),
                            const SizedBox(height: 8),
                            const Text('Failed to load messages'),
                            const SizedBox(height: 8),
                            FilledButton(
                              onPressed: () => ref
                                  .read(chatProvider(widget.partnerId).notifier)
                                  .loadMessages(),
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      )
                    : chatState.messages.isEmpty
                        ? Center(
                            child: Text(
                              'No messages yet. Start the conversation!',
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: theme.colorScheme.onSurfaceVariant,
                              ),
                            ),
                          )
                        : ListView.builder(
                            controller: _scrollController,
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 8),
                            itemCount: chatState.messages.length,
                            itemBuilder: (context, index) {
                              final message = chatState.messages[index];
                              final isMine =
                                  message.senderId == currentUserId;
                              final showDate = index == 0 ||
                                  _isDifferentDay(
                                    chatState.messages[index - 1].createdAt,
                                    message.createdAt,
                                  );

                              return Column(
                                children: [
                                  if (showDate && message.createdAt != null)
                                    _DateSeparator(
                                        date: message.createdAt!),
                                  _MessageBubble(
                                    message: message,
                                    isMine: isMine,
                                  ),
                                ],
                              );
                            },
                          ),
          ),

          // Input
          _MessageInput(
            controller: _messageController,
            isSending: _isSending,
            onSend: _sendMessage,
          ),
        ],
      ),
    );
  }

  Widget _buildTitle(ChatState chatState) {
    // Try to get partner name from messages
    final messages = chatState.messages;
    if (messages.isNotEmpty) {
      final currentUserId = ref.watch(authProvider).user?.id;
      for (final msg in messages) {
        if (msg.senderId != currentUserId && msg.sender != null) {
          return Text(msg.sender!.fullName);
        }
        if (msg.receiverId != currentUserId && msg.receiver != null) {
          return Text(msg.receiver!.fullName);
        }
      }
    }
    return const Text('Chat');
  }

  bool _isDifferentDay(String? a, String? b) {
    if (a == null || b == null) return true;
    try {
      final dateA = DateTime.parse(a);
      final dateB = DateTime.parse(b);
      return dateA.day != dateB.day ||
          dateA.month != dateB.month ||
          dateA.year != dateB.year;
    } catch (_) {
      return false;
    }
  }
}

class _DateSeparator extends StatelessWidget {
  final String date;

  const _DateSeparator({required this.date});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: theme.colorScheme.surfaceContainerHighest,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            _formatDate(date),
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ),
      ),
    );
  }

  String _formatDate(String dateStr) {
    try {
      final d = DateTime.parse(dateStr);
      final now = DateTime.now();
      if (d.year == now.year && d.month == now.month && d.day == now.day) {
        return 'Today';
      }
      final yesterday = now.subtract(const Duration(days: 1));
      if (d.year == yesterday.year &&
          d.month == yesterday.month &&
          d.day == yesterday.day) {
        return 'Yesterday';
      }
      final months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return '${months[d.month - 1]} ${d.day}, ${d.year}';
    } catch (_) {
      return dateStr;
    }
  }
}

class _MessageBubble extends StatelessWidget {
  final MessageModel message;
  final bool isMine;

  const _MessageBubble({required this.message, required this.isMine});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Align(
      alignment: isMine ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isMine
              ? theme.colorScheme.primary
              : theme.colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft:
                isMine ? const Radius.circular(16) : const Radius.circular(4),
            bottomRight:
                isMine ? const Radius.circular(4) : const Radius.circular(16),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              message.content,
              style: TextStyle(
                color: isMine
                    ? theme.colorScheme.onPrimary
                    : theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  _formatTime(message.createdAt),
                  style: TextStyle(
                    fontSize: 11,
                    color: isMine
                        ? theme.colorScheme.onPrimary.withValues(alpha: 0.7)
                        : theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                if (isMine) ...[
                  const SizedBox(width: 4),
                  Icon(
                    message.isRead ? Icons.done_all : Icons.done,
                    size: 14,
                    color:
                        theme.colorScheme.onPrimary.withValues(alpha: 0.7),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatTime(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final d = DateTime.parse(dateStr);
      return '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return '';
    }
  }
}

class _MessageInput extends StatelessWidget {
  final TextEditingController controller;
  final bool isSending;
  final VoidCallback onSend;

  const _MessageInput({
    required this.controller,
    required this.isSending,
    required this.onSend,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 4,
            offset: const Offset(0, -1),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: controller,
                decoration: InputDecoration(
                  hintText: 'Type a message...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                  filled: true,
                  fillColor: theme.colorScheme.surfaceContainerHighest,
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 10),
                  isDense: true,
                ),
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => onSend(),
                maxLines: null,
              ),
            ),
            const SizedBox(width: 8),
            Material(
              color: theme.colorScheme.primary,
              shape: const CircleBorder(),
              child: InkWell(
                onTap: isSending ? null : onSend,
                customBorder: const CircleBorder(),
                child: Padding(
                  padding: const EdgeInsets.all(10),
                  child: isSending
                      ? SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: theme.colorScheme.onPrimary,
                          ),
                        )
                      : Icon(
                          Icons.send,
                          size: 20,
                          color: theme.colorScheme.onPrimary,
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
