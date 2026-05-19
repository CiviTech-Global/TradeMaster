import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trademaster/data/models/order_model.dart';
import 'package:trademaster/presentation/providers/order_provider.dart';

class OrdersScreen extends ConsumerStatefulWidget {
  const OrdersScreen({super.key});

  @override
  ConsumerState<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends ConsumerState<OrdersScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
        () => ref.read(orderListProvider.notifier).loadOrders());
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final orderState = ref.watch(orderListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Orders'),
      ),
      body: _buildBody(theme, orderState),
    );
  }

  Widget _buildBody(ThemeData theme, OrderListState orderState) {
    if (orderState.isLoading && orderState.orders.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (orderState.error != null && orderState.orders.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline,
                size: 48, color: theme.colorScheme.error),
            const SizedBox(height: 8),
            const Text('Failed to load orders'),
            const SizedBox(height: 8),
            FilledButton(
              onPressed: () =>
                  ref.read(orderListProvider.notifier).loadOrders(),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (orderState.orders.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.receipt_long_outlined,
              size: 64,
              color:
                  theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 16),
            Text('No orders yet', style: theme.textTheme.titleMedium),
            const SizedBox(height: 8),
            Text(
              'Your orders will appear here',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(orderListProvider.notifier).loadOrders(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: orderState.orders.length,
        itemBuilder: (context, index) {
          final order = orderState.orders[index];
          return _OrderCard(order: order);
        },
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final OrderModel order;

  const _OrderCard({required this.order});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => context.push('/orders/${order.id}'),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '#${order.orderNumber}',
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  _StatusChip(status: order.status),
                ],
              ),
              const SizedBox(height: 8),
              if (order.business != null)
                Row(
                  children: [
                    Icon(Icons.store_outlined,
                        size: 16,
                        color: theme.colorScheme.onSurfaceVariant),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        order.business!.title,
                        style: theme.textTheme.bodyMedium,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (order.createdAt != null)
                    Text(
                      _formatDate(order.createdAt!),
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  Text(
                    '\$${order.totalAmount.toStringAsFixed(2)}',
                    style: theme.textTheme.titleSmall?.copyWith(
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
    );
  }

  String _formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      return '${date.day}/${date.month}/${date.year}';
    } catch (_) {
      return dateStr;
    }
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
        return (const Color(0xFFFFA726), 'Pending'); // Warm Amber
      case 'confirmed':
        return (const Color(0xFF42A5F5), 'Confirmed');
      case 'processing':
        return (const Color(0xFFAB47BC), 'Processing');
      case 'shipped':
        return (const Color(0xFF7E57C2), 'Shipped');
      case 'delivered':
        return (const Color(0xFF66BB6A), 'Delivered'); // Mint Green
      case 'cancelled':
        return (const Color(0xFFEF5350), 'Cancelled'); // Soft Red
      default:
        return (const Color(0xFF8D8D8D), status);
    }
  }
}
