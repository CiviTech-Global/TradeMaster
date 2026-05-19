import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trademaster/core/constants/api_constants.dart';
import 'package:trademaster/data/models/product_model.dart';
import 'package:trademaster/presentation/providers/cart_provider.dart';
import 'package:trademaster/presentation/providers/product_provider.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  final int productId;

  const ProductDetailScreen({super.key, required this.productId});

  @override
  ConsumerState<ProductDetailScreen> createState() =>
      _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  int _currentImageIndex = 0;
  int? _selectedVariantId;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final productState = ref.watch(productDetailProvider(widget.productId));

    return Scaffold(
      body: productState.when(
        data: (product) => _buildContent(context, product, theme),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline,
                  size: 48, color: theme.colorScheme.error),
              const SizedBox(height: 8),
              const Text('Failed to load product'),
              const SizedBox(height: 8),
              FilledButton(
                onPressed: () => ref
                    .read(productDetailProvider(widget.productId).notifier)
                    .loadProduct(widget.productId),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: productState.whenOrNull(
        data: (product) => _buildBottomBar(context, product, theme),
      ),
    );
  }

  Widget _buildContent(
      BuildContext context, ProductModel product, ThemeData theme) {
    final selectedVariant = _selectedVariantId != null
        ? product.variants
            .where((v) => v.id == _selectedVariantId)
            .firstOrNull
        : null;

    final effectivePrice = product.price +
        (selectedVariant?.priceModifier ?? 0);
    final cartItemCount = ref.watch(cartProvider).totalItems;

    return CustomScrollView(
      slivers: [
        // Image carousel
        SliverAppBar(
          expandedHeight: 350,
          pinned: true,
          actions: [
            // Cart badge icon
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: IconButton(
                onPressed: () => context.push('/cart'),
                icon: cartItemCount > 0
                    ? Badge(
                        label: Text('$cartItemCount'),
                        child: const Icon(Icons.shopping_cart_outlined),
                      )
                    : const Icon(Icons.shopping_cart_outlined),
              ),
            ),
          ],
          flexibleSpace: FlexibleSpaceBar(
            background: product.images.isNotEmpty
                ? Stack(
                    fit: StackFit.expand,
                    children: [
                      PageView.builder(
                        itemCount: product.images.length,
                        onPageChanged: (index) {
                          setState(() => _currentImageIndex = index);
                        },
                        itemBuilder: (context, index) {
                          final image = product.images[index];
                          return CachedNetworkImage(
                            imageUrl:
                                '${ApiConstants.baseUrl}${image.url}',
                            fit: BoxFit.cover,
                            placeholder: (_, _) => Container(
                              color:
                                  theme.colorScheme.surfaceContainerHighest,
                              child: const Center(
                                child: CircularProgressIndicator(
                                    strokeWidth: 2),
                              ),
                            ),
                            errorWidget: (_, _, _) => Container(
                              color:
                                  theme.colorScheme.surfaceContainerHighest,
                              child: const Icon(Icons.broken_image, size: 48),
                            ),
                          );
                        },
                      ),
                      // Page indicator
                      if (product.images.length > 1)
                        Positioned(
                          bottom: 12,
                          left: 0,
                          right: 0,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: List.generate(
                              product.images.length,
                              (index) => Container(
                                width: 8,
                                height: 8,
                                margin:
                                    const EdgeInsets.symmetric(horizontal: 3),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: _currentImageIndex == index
                                      ? Colors.white
                                      : Colors.white54,
                                ),
                              ),
                            ),
                          ),
                        ),
                    ],
                  )
                : Container(
                    color: theme.colorScheme.surfaceContainerHighest,
                    child: Center(
                      child: Icon(Icons.image_outlined,
                          size: 64,
                          color: theme.colorScheme.onSurfaceVariant),
                    ),
                  ),
          ),
        ),

        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title and price
                Text(product.title, style: theme.textTheme.headlineSmall),
                const SizedBox(height: 8),
                Text(
                  '\$${effectivePrice.toStringAsFixed(2)}',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    color: theme.colorScheme.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                // Stock
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(
                      product.stockQuantity > 0
                          ? Icons.check_circle
                          : Icons.cancel,
                      size: 16,
                      color: product.stockQuantity > 0
                          ? Colors.green
                          : theme.colorScheme.error,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      product.stockQuantity > 0
                          ? 'In Stock (${product.stockQuantity})'
                          : 'Out of Stock',
                      style: theme.textTheme.bodyMedium,
                    ),
                  ],
                ),

                // Category
                if (product.category != null) ...[
                  const SizedBox(height: 12),
                  Chip(
                    label: Text(product.category!.name),
                    avatar: const Icon(Icons.category, size: 16),
                  ),
                ],

                // Variants
                if (product.variants.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Text('Options', style: theme.textTheme.titleMedium),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: product.variants.map((variant) {
                      final isSelected = _selectedVariantId == variant.id;
                      return ChoiceChip(
                        label: Text(
                          '${variant.name}: ${variant.value}'
                          '${variant.priceModifier != 0 ? ' (${variant.priceModifier > 0 ? '+' : ''}\$${variant.priceModifier.toStringAsFixed(2)})' : ''}',
                        ),
                        selected: isSelected,
                        onSelected: (selected) {
                          setState(() {
                            _selectedVariantId =
                                selected ? variant.id : null;
                          });
                        },
                      );
                    }).toList(),
                  ),
                ],

                // Description
                if (product.description != null) ...[
                  const SizedBox(height: 20),
                  Text('Description', style: theme.textTheme.titleMedium),
                  const SizedBox(height: 8),
                  Text(product.description!,
                      style: theme.textTheme.bodyLarge),
                ],

                // Business info
                if (product.business != null) ...[
                  const SizedBox(height: 24),
                  const Divider(),
                  const SizedBox(height: 12),
                  Text('Sold by', style: theme.textTheme.titleMedium),
                  const SizedBox(height: 8),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: CircleAvatar(
                      child: Icon(Icons.store,
                          color: theme.colorScheme.onPrimaryContainer),
                    ),
                    title: Text(product.business!.title),
                    subtitle: product.business!.address != null
                        ? Text(product.business!.address!)
                        : null,
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => context.push('/business/${product.business!.id}'),
                  ),
                ],

                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBottomBar(
      BuildContext context, ProductModel product, ThemeData theme) {
    final isInStock = product.stockQuantity > 0;

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
        child: SizedBox(
          width: double.infinity,
          child: FilledButton.icon(
            onPressed: isInStock
                ? () {
                    ref.read(cartProvider.notifier).addItem(
                          product,
                          variantId: _selectedVariantId,
                        );
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('${product.title} added to cart'),
                        action: SnackBarAction(
                          label: 'View Cart',
                          onPressed: () => context.push('/cart'),
                        ),
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  }
                : null,
            icon: const Icon(Icons.add_shopping_cart),
            label: Text(isInStock ? 'Add to Cart' : 'Out of Stock'),
          ),
        ),
      ),
    );
  }
}
