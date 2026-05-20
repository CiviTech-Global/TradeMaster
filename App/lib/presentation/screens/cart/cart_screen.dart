import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trademaster/core/constants/api_constants.dart';
import 'package:trademaster/presentation/providers/cart_provider.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final cart = ref.watch(cartProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cart'),
        actions: [
          if (!cart.isEmpty)
            TextButton(
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Clear Cart'),
                    content: const Text(
                        'Are you sure you want to remove all items?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(ctx),
                        child: const Text('Cancel'),
                      ),
                      TextButton(
                        onPressed: () {
                          ref.read(cartProvider.notifier).clear();
                          Navigator.pop(ctx);
                        },
                        child: const Text('Clear'),
                      ),
                    ],
                  ),
                );
              },
              child: const Text('Clear All'),
            ),
        ],
      ),
      body: cart.isEmpty
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.shopping_cart_outlined,
                    size: 64,
                    color: theme.colorScheme.onSurfaceVariant
                        .withValues(alpha: 0.5),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Your cart is empty',
                    style: theme.textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Browse products and add them to your cart',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            )
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: cart.items.length,
                    itemBuilder: (context, index) {
                      final item = cart.items[index];
                      return _CartItemCard(item: item);
                    },
                  ),
                ),
                _CartSummary(cart: cart),
              ],
            ),
    );
  }
}

class _CartItemCard extends ConsumerWidget {
  final CartItem item;

  const _CartItemCard({required this.item});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final imageUrl = item.product.primaryImageUrl;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product image
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: SizedBox(
                width: 80,
                height: 80,
                child: imageUrl != null
                    ? CachedNetworkImage(
                        imageUrl: ApiConstants.imageUrl(imageUrl),
                        fit: BoxFit.cover,
                        placeholder: (_, _) => Container(
                          color: theme.colorScheme.surfaceContainerHighest,
                          child: const Center(
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        ),
                        errorWidget: (_, _, _) => Container(
                          color: theme.colorScheme.surfaceContainerHighest,
                          child: const Icon(Icons.image_outlined),
                        ),
                      )
                    : Container(
                        color: theme.colorScheme.surfaceContainerHighest,
                        child: const Icon(Icons.image_outlined),
                      ),
              ),
            ),
            const SizedBox(width: 12),

            // Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.product.title,
                    style: theme.textTheme.titleSmall,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (item.variantLabel != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      item.variantLabel!,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                  const SizedBox(height: 4),
                  Text(
                    '\$${item.unitPrice.toStringAsFixed(2)}',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      // Quantity controls
                      Container(
                        decoration: BoxDecoration(
                          border: Border.all(
                              color: theme.colorScheme.outlineVariant),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            _QuantityButton(
                              icon: Icons.remove,
                              onPressed: () {
                                ref.read(cartProvider.notifier).updateQuantity(
                                    item.key, item.quantity - 1);
                              },
                            ),
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 12),
                              child: Text(
                                '${item.quantity}',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            _QuantityButton(
                              icon: Icons.add,
                              onPressed: () {
                                ref.read(cartProvider.notifier).updateQuantity(
                                    item.key, item.quantity + 1);
                              },
                            ),
                          ],
                        ),
                      ),
                      const Spacer(),
                      // Remove button
                      IconButton(
                        onPressed: () {
                          ref.read(cartProvider.notifier).removeItem(item.key);
                        },
                        icon: Icon(Icons.delete_outline,
                            color: theme.colorScheme.error),
                        iconSize: 20,
                        visualDensity: VisualDensity.compact,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuantityButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;

  const _QuantityButton({required this.icon, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(6),
      child: Padding(
        padding: const EdgeInsets.all(6),
        child: Icon(icon, size: 16),
      ),
    );
  }
}

class _CartSummary extends StatelessWidget {
  final CartState cart;

  const _CartSummary({required this.cart});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total (${cart.totalItems} items)',
                  style: theme.textTheme.titleMedium,
                ),
                Text(
                  '\$${cart.totalAmount.toStringAsFixed(2)}',
                  style: theme.textTheme.titleLarge?.copyWith(
                    color: theme.colorScheme.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () => context.push('/checkout'),
                child: const Text('Proceed to Checkout'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
