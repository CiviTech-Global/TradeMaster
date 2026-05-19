import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trademaster/data/models/message_model.dart';
import 'package:trademaster/presentation/providers/message_provider.dart';

class MessagesScreen extends ConsumerStatefulWidget {
  const MessagesScreen({super.key});

  @override
  ConsumerState<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends ConsumerState<MessagesScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
        () => ref.read(conversationsProvider.notifier).loadConversations());
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final conversationsState = ref.watch(conversationsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Messages'),
      ),
      body: conversationsState.when(
        data: (conversations) {
          if (conversations.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.message_outlined,
                    size: 64,
                    color: theme.colorScheme.onSurfaceVariant
                        .withValues(alpha: 0.5),
                  ),
                  const SizedBox(height: 16),
                  Text('No messages yet',
                      style: theme.textTheme.titleMedium),
                  const SizedBox(height: 8),
                  Text(
                    'Start a conversation with a seller',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => ref
                .read(conversationsProvider.notifier)
                .loadConversations(),
            child: ListView.builder(
              itemCount: conversations.length,
              itemBuilder: (context, index) {
                return _ConversationTile(
                    conversation: conversations[index]);
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline,
                  size: 48, color: theme.colorScheme.error),
              const SizedBox(height: 8),
              const Text('Failed to load conversations'),
              const SizedBox(height: 8),
              FilledButton(
                onPressed: () => ref
                    .read(conversationsProvider.notifier)
                    .loadConversations(),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ConversationTile extends StatelessWidget {
  final ConversationModel conversation;

  const _ConversationTile({required this.conversation});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final partner = conversation.partner;
    final lastMessage = conversation.lastMessage;
    final hasUnread = conversation.unreadCount > 0;

    return ListTile(
      onTap: () => context.push('/messages/${partner.id}'),
      leading: CircleAvatar(
        backgroundColor: theme.colorScheme.primaryContainer,
        child: Text(
          partner.firstname.isNotEmpty
              ? partner.firstname[0].toUpperCase()
              : '?',
          style: TextStyle(
            color: theme.colorScheme.onPrimaryContainer,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      title: Row(
        children: [
          Expanded(
            child: Text(
              partner.fullName,
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: hasUnread ? FontWeight.w700 : FontWeight.w500,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          if (lastMessage?.createdAt != null)
            Text(
              _formatTime(lastMessage!.createdAt!),
              style: theme.textTheme.bodySmall?.copyWith(
                color: hasUnread
                    ? theme.colorScheme.primary
                    : theme.colorScheme.onSurfaceVariant,
                fontWeight:
                    hasUnread ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
        ],
      ),
      subtitle: Row(
        children: [
          Expanded(
            child: Text(
              lastMessage?.content ?? 'No messages',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.bodySmall?.copyWith(
                color: hasUnread
                    ? theme.colorScheme.onSurface
                    : theme.colorScheme.onSurfaceVariant,
                fontWeight:
                    hasUnread ? FontWeight.w500 : FontWeight.normal,
              ),
            ),
          ),
          if (hasUnread)
            Container(
              margin: const EdgeInsets.only(left: 8),
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: theme.colorScheme.primary,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                '${conversation.unreadCount}',
                style: TextStyle(
                  color: theme.colorScheme.onPrimary,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
        ],
      ),
    );
  }

  String _formatTime(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      final now = DateTime.now();
      final diff = now.difference(date);

      if (diff.inMinutes < 1) return 'now';
      if (diff.inHours < 1) return '${diff.inMinutes}m';
      if (diff.inDays < 1) return '${diff.inHours}h';
      if (diff.inDays < 7) return '${diff.inDays}d';
      return '${date.day}/${date.month}';
    } catch (_) {
      return '';
    }
  }
}
