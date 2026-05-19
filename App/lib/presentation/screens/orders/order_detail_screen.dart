import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trademaster/data/models/order_model.dart';
import 'package:trademaster/presentation/providers/order_provider.dart';
import 'package:trademaster/presentation/providers/review_provider.dart';
import 'package:trademaster/presentation/widgets/star_rating.dart';

class OrderDetailScreen extends ConsumerWidget {
  final int orderId;

  const OrderDetailScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final orderState = ref.watch(orderDetailProvider(orderId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Order Details'),
      ),
      body: orderState.when(
        data: (order) => _buildContent(context, ref, order, theme),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline,
                  size: 48, color: theme.colorScheme.error),
              const SizedBox(height: 8),
              const Text('Failed to load order'),
              const SizedBox(height: 8),
              FilledButton(
                onPressed: () => ref
                    .read(orderDetailProvider(orderId).notifier)
                    .loadOrder(orderId),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContent(
      BuildContext context, WidgetRef ref, OrderModel order, ThemeData theme) {
    final canCancel =
        order.status == 'pending' || order.status == 'confirmed';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Order header
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Order #${order.orderNumber}',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      _StatusChip(status: order.status),
                    ],
                  ),
                  if (order.createdAt != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      'Placed on ${_formatDate(order.createdAt!)}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Status timeline
          Text('Order Status', style: theme.textTheme.titleMedium),
          const SizedBox(height: 12),
          _StatusTimeline(currentStatus: order.status),

          const SizedBox(height: 24),

          // Items
          Text('Items', style: theme.textTheme.titleMedium),
          const SizedBox(height: 8),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                children: [
                  for (int i = 0; i < order.items.length; i++) ...[
                    _OrderItemRow(item: order.items[i]),
                    if (i < order.items.length - 1)
                      const Divider(height: 16),
                  ],
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Total', style: theme.textTheme.titleMedium),
                      Text(
                        '\$${order.totalAmount.toStringAsFixed(2)}',
                        style: theme.textTheme.titleMedium?.copyWith(
                          color: theme.colorScheme.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Shipping address
          if (order.shippingAddress != null) ...[
            const SizedBox(height: 24),
            Text('Shipping Address', style: theme.textTheme.titleMedium),
            const SizedBox(height: 8),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Icon(Icons.location_on_outlined,
                        color: theme.colorScheme.onSurfaceVariant),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(order.shippingAddress!,
                          style: theme.textTheme.bodyMedium),
                    ),
                  ],
                ),
              ),
            ),
          ],

          // Notes
          if (order.notes != null && order.notes!.isNotEmpty) ...[
            const SizedBox(height: 24),
            Text('Notes', style: theme.textTheme.titleMedium),
            const SizedBox(height: 8),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Icon(Icons.note_outlined,
                        color: theme.colorScheme.onSurfaceVariant),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(order.notes!,
                          style: theme.textTheme.bodyMedium),
                    ),
                  ],
                ),
              ),
            ),
          ],

          // Business info
          if (order.business != null) ...[
            const SizedBox(height: 24),
            Text('Seller', style: theme.textTheme.titleMedium),
            const SizedBox(height: 8),
            Card(
              child: ListTile(
                leading: CircleAvatar(
                  child: Icon(Icons.store,
                      color: theme.colorScheme.onPrimaryContainer),
                ),
                title: Text(order.business!.title),
                subtitle: order.business!.address != null
                    ? Text(order.business!.address!)
                    : null,
                trailing: FilledButton.tonalIcon(
                  onPressed: () {
                    // Navigate to chat with seller, using business owner's ID
                    // For now, use businessId as a proxy
                    context.push('/messages/${order.businessId}');
                  },
                  icon: const Icon(Icons.message_outlined, size: 18),
                  label: const Text('Message'),
                ),
              ),
            ),
          ],

          // Leave a Review button (only for delivered orders)
          if (order.status == 'delivered') ...[
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: () => _showReviewDialog(context, ref, order),
                icon: const Icon(Icons.rate_review_outlined),
                label: const Text('Leave a Review'),
              ),
            ),
          ],

          // Cancel button
          if (canCancel) ...[
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => _confirmCancel(context, ref, order),
                icon: const Icon(Icons.cancel_outlined),
                label: const Text('Cancel Order'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: theme.colorScheme.error,
                  side: BorderSide(color: theme.colorScheme.error),
                ),
              ),
            ),
          ],

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  void _showReviewDialog(
      BuildContext context, WidgetRef ref, OrderModel order) {
    int selectedRating = 0;
    final commentController = TextEditingController();
    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 24,
                right: 24,
                top: 24,
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Leave a Review',
                    style: Theme.of(ctx).textTheme.titleLarge,
                  ),
                  if (order.business != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      'for ${order.business!.title}',
                      style: Theme.of(ctx).textTheme.bodyMedium?.copyWith(
                            color:
                                Theme.of(ctx).colorScheme.onSurfaceVariant,
                          ),
                    ),
                  ],
                  const SizedBox(height: 20),
                  Text(
                    'Rating',
                    style: Theme.of(ctx).textTheme.titleSmall,
                  ),
                  const SizedBox(height: 8),
                  Center(
                    child: InteractiveStarRating(
                      rating: selectedRating,
                      onChanged: (rating) {
                        setSheetState(() => selectedRating = rating);
                      },
                      size: 40,
                    ),
                  ),
                  const SizedBox(height: 20),
                  TextField(
                    controller: commentController,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      labelText: 'Comment (optional)',
                      hintText: 'Share your experience...',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: selectedRating == 0 || isSubmitting
                          ? null
                          : () async {
                              setSheetState(() => isSubmitting = true);
                              try {
                                final datasource =
                                    ref.read(reviewDatasourceProvider);
                                await submitReview(
                                  datasource,
                                  businessId: order.businessId,
                                  orderId: order.id,
                                  rating: selectedRating,
                                  comment:
                                      commentController.text.trim().isEmpty
                                          ? null
                                          : commentController.text.trim(),
                                );
                                if (ctx.mounted) {
                                  Navigator.pop(ctx);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content:
                                          Text('Review submitted successfully'),
                                    ),
                                  );
                                }
                              } catch (e) {
                                setSheetState(() => isSubmitting = false);
                                if (ctx.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                          'Failed to submit review: $e'),
                                      backgroundColor:
                                          Theme.of(context).colorScheme.error,
                                    ),
                                  );
                                }
                              }
                            },
                      child: isSubmitting
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text('Submit Review'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _confirmCancel(BuildContext context, WidgetRef ref, OrderModel order) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cancel Order'),
        content: const Text('Are you sure you want to cancel this order?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('No'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              ref
                  .read(orderDetailProvider(orderId).notifier)
                  .cancelOrder(orderId);
            },
            child: Text(
              'Yes, Cancel',
              style: TextStyle(color: Theme.of(context).colorScheme.error),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      final months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return '${months[date.month - 1]} ${date.day}, ${date.year}';
    } catch (_) {
      return dateStr;
    }
  }
}

class _OrderItemRow extends StatelessWidget {
  final OrderItemModel item;

  const _OrderItemRow({required this.item});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                item.product?.title ?? 'Product #${item.productId}',
                style: theme.textTheme.bodyMedium,
              ),
              Text(
                '\$${item.unitPrice.toStringAsFixed(2)} x ${item.quantity}',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
        Text(
          '\$${item.totalPrice.toStringAsFixed(2)}',
          style: theme.textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String status;

  const _StatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    final (color, label) = _statusInfo(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  (Color, String) _statusInfo(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return (Colors.orange, 'Pending');
      case 'confirmed':
        return (Colors.blue, 'Confirmed');
      case 'processing':
        return (Colors.indigo, 'Processing');
      case 'shipped':
        return (Colors.purple, 'Shipped');
      case 'delivered':
        return (Colors.green, 'Delivered');
      case 'cancelled':
        return (Colors.red, 'Cancelled');
      default:
        return (Colors.grey, status);
    }
  }
}

class _StatusTimeline extends StatelessWidget {
  final String currentStatus;

  const _StatusTimeline({required this.currentStatus});

  static const _steps = [
    ('pending', 'Pending', Icons.hourglass_empty),
    ('confirmed', 'Confirmed', Icons.thumb_up_outlined),
    ('processing', 'Processing', Icons.settings_outlined),
    ('shipped', 'Shipped', Icons.local_shipping_outlined),
    ('delivered', 'Delivered', Icons.check_circle_outline),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isCancelled = currentStatus.toLowerCase() == 'cancelled';

    if (isCancelled) {
      return Card(
        color: Colors.red.withValues(alpha: 0.1),
        child: const Padding(
          padding: EdgeInsets.all(16),
          child: Row(
            children: [
              Icon(Icons.cancel, color: Colors.red),
              SizedBox(width: 12),
              Text(
                'This order has been cancelled',
                style: TextStyle(
                  color: Colors.red,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      );
    }

    final currentIndex = _steps
        .indexWhere((s) => s.$1 == currentStatus.toLowerCase());
    final activeIndex = currentIndex >= 0 ? currentIndex : 0;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            for (int i = 0; i < _steps.length; i++) ...[
              Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: i <= activeIndex
                          ? theme.colorScheme.primary
                          : theme.colorScheme.surfaceContainerHighest,
                    ),
                    child: Icon(
                      _steps[i].$3,
                      size: 16,
                      color: i <= activeIndex
                          ? theme.colorScheme.onPrimary
                          : theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    _steps[i].$2,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight:
                          i == activeIndex ? FontWeight.w600 : FontWeight.normal,
                      color: i <= activeIndex
                          ? theme.colorScheme.onSurface
                          : theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  if (i == activeIndex)
                    Padding(
                      padding: const EdgeInsets.only(left: 8),
                      child: Icon(Icons.arrow_back,
                          size: 14, color: theme.colorScheme.primary),
                    ),
                ],
              ),
              if (i < _steps.length - 1)
                Padding(
                  padding: const EdgeInsets.only(left: 15),
                  child: Container(
                    width: 2,
                    height: 24,
                    color: i < activeIndex
                        ? theme.colorScheme.primary
                        : theme.colorScheme.surfaceContainerHighest,
                  ),
                ),
            ],
          ],
        ),
      ),
    );
  }
}
