import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trademaster/data/models/product_model.dart';

class CartItem {
  final ProductModel product;
  final int? variantId;
  final int quantity;

  const CartItem({
    required this.product,
    this.variantId,
    this.quantity = 1,
  });

  double get unitPrice {
    double price = product.price;
    if (variantId != null) {
      final variant =
          product.variants.where((v) => v.id == variantId).firstOrNull;
      if (variant != null) {
        price += variant.priceModifier;
      }
    }
    return price;
  }

  double get totalPrice => unitPrice * quantity;

  String? get variantLabel {
    if (variantId == null) return null;
    final variant =
        product.variants.where((v) => v.id == variantId).firstOrNull;
    if (variant == null) return null;
    return '${variant.name}: ${variant.value}';
  }

  CartItem copyWith({int? quantity}) {
    return CartItem(
      product: product,
      variantId: variantId,
      quantity: quantity ?? this.quantity,
    );
  }

  /// Unique key combining product and variant
  String get key => '${product.id}_${variantId ?? 0}';
}

class CartState {
  final List<CartItem> items;

  const CartState({this.items = const []});

  double get totalAmount =>
      items.fold(0, (sum, item) => sum + item.totalPrice);

  int get totalItems => items.fold(0, (sum, item) => sum + item.quantity);

  bool get isEmpty => items.isEmpty;

  /// Group items by business ID for order creation
  Map<int, List<CartItem>> get itemsByBusiness {
    final map = <int, List<CartItem>>{};
    for (final item in items) {
      map.putIfAbsent(item.product.businessId, () => []).add(item);
    }
    return map;
  }
}

class CartNotifier extends StateNotifier<CartState> {
  CartNotifier() : super(const CartState());

  void addItem(ProductModel product, {int? variantId, int quantity = 1}) {
    final key = '${product.id}_${variantId ?? 0}';
    final existingIndex = state.items.indexWhere((i) => i.key == key);

    if (existingIndex >= 0) {
      final existing = state.items[existingIndex];
      final updated = existing.copyWith(
        quantity: existing.quantity + quantity,
      );
      final newItems = [...state.items];
      newItems[existingIndex] = updated;
      state = CartState(items: newItems);
    } else {
      state = CartState(items: [
        ...state.items,
        CartItem(product: product, variantId: variantId, quantity: quantity),
      ]);
    }
  }

  void removeItem(String key) {
    state = CartState(
      items: state.items.where((i) => i.key != key).toList(),
    );
  }

  void updateQuantity(String key, int quantity) {
    if (quantity <= 0) {
      removeItem(key);
      return;
    }
    final index = state.items.indexWhere((i) => i.key == key);
    if (index >= 0) {
      final newItems = [...state.items];
      newItems[index] = newItems[index].copyWith(quantity: quantity);
      state = CartState(items: newItems);
    }
  }

  void clear() {
    state = const CartState();
  }

  void clearBusinessItems(int businessId) {
    state = CartState(
      items: state.items
          .where((i) => i.product.businessId != businessId)
          .toList(),
    );
  }
}

final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier();
});
