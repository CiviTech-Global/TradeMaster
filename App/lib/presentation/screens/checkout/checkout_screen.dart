import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trademaster/presentation/providers/cart_provider.dart';
import 'package:trademaster/presentation/providers/order_provider.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _shippingController = TextEditingController();
  final _notesController = TextEditingController();
  bool _isPlacingOrder = false;
  String? _error;

  @override
  void dispose() {
    _shippingController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _placeOrders() async {
    if (_shippingController.text.trim().isEmpty) {
      setState(() => _error = 'Please enter a shipping address');
      return;
    }

    setState(() {
      _isPlacingOrder = true;
      _error = null;
    });

    final cart = ref.read(cartProvider);
    final datasource = ref.read(orderDatasourceProvider);
    final itemsByBusiness = cart.itemsByBusiness;
    final orderNumbers = <String>[];

    try {
      for (final entry in itemsByBusiness.entries) {
        final businessId = entry.key;
        final items = entry.value;

        final orderItems = items
            .map((item) => {
                  'product_id': item.product.id,
                  if (item.variantId != null) 'variant_id': item.variantId,
                  'quantity': item.quantity,
                })
            .toList();

        final order = await createOrder(
          datasource,
          businessId: businessId,
          items: orderItems,
          shippingAddress: _shippingController.text.trim(),
          notes: _notesController.text.trim().isNotEmpty
              ? _notesController.text.trim()
              : null,
        );

        orderNumbers.add(order.orderNumber);
        ref.read(cartProvider.notifier).clearBusinessItems(businessId);
      }

      if (mounted) {
        _showSuccessDialog(orderNumbers);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isPlacingOrder = false;
          _error = 'Failed to place order. Please try again.';
        });
      }
    }
  }

  void _showSuccessDialog(List<String> orderNumbers) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        icon: const Icon(Icons.check_circle, color: Colors.green, size: 48),
        title: const Text('Order Placed!'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Your order has been placed successfully.'),
            const SizedBox(height: 12),
            for (final num in orderNumbers)
              Text(
                'Order #$num',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
          ],
        ),
        actions: [
          FilledButton(
            onPressed: () {
              Navigator.pop(ctx);
              context.go('/');
            },
            child: const Text('Back to Home'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cart = ref.watch(cartProvider);

    if (cart.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Checkout')),
        body: const Center(child: Text('Your cart is empty')),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order summary
            Text('Order Summary', style: theme.textTheme.titleMedium),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  children: [
                    for (final item in cart.items) ...[
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.product.title,
                                  style: theme.textTheme.bodyMedium,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                if (item.variantLabel != null)
                                  Text(
                                    item.variantLabel!,
                                    style: theme.textTheme.bodySmall?.copyWith(
                                      color:
                                          theme.colorScheme.onSurfaceVariant,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          Text('x${item.quantity}',
                              style: theme.textTheme.bodyMedium),
                          const SizedBox(width: 16),
                          Text(
                            '\$${item.totalPrice.toStringAsFixed(2)}',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      if (item != cart.items.last)
                        const Divider(height: 16),
                    ],
                    const Divider(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Total',
                            style: theme.textTheme.titleMedium),
                        Text(
                          '\$${cart.totalAmount.toStringAsFixed(2)}',
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

            const SizedBox(height: 24),

            // Shipping address
            Text('Shipping Address', style: theme.textTheme.titleMedium),
            const SizedBox(height: 8),
            TextField(
              controller: _shippingController,
              decoration: const InputDecoration(
                hintText: 'Enter your full shipping address',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.location_on_outlined),
              ),
              maxLines: 3,
              textInputAction: TextInputAction.next,
            ),

            const SizedBox(height: 16),

            // Notes
            Text('Notes (optional)', style: theme.textTheme.titleMedium),
            const SizedBox(height: 8),
            TextField(
              controller: _notesController,
              decoration: const InputDecoration(
                hintText: 'Any special instructions for the seller',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.note_outlined),
              ),
              maxLines: 2,
              textInputAction: TextInputAction.done,
            ),

            // Error
            if (_error != null) ...[
              const SizedBox(height: 16),
              Text(
                _error!,
                style: TextStyle(color: theme.colorScheme.error),
              ),
            ],

            const SizedBox(height: 32),

            // Place order button
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: _isPlacingOrder ? null : _placeOrders,
                icon: _isPlacingOrder
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.shopping_bag_outlined),
                label: Text(
                    _isPlacingOrder ? 'Placing Order...' : 'Place Order'),
              ),
            ),

            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
