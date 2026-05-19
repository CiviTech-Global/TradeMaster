import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trademaster/data/datasources/order_remote_datasource.dart';
import 'package:trademaster/data/models/order_model.dart';
import 'package:trademaster/data/models/product_model.dart';

final orderDatasourceProvider = Provider<OrderRemoteDatasource>((ref) {
  return OrderRemoteDatasource();
});

// Order list
class OrderListState {
  final List<OrderModel> orders;
  final PaginationModel? pagination;
  final bool isLoading;
  final String? error;

  const OrderListState({
    this.orders = const [],
    this.pagination,
    this.isLoading = false,
    this.error,
  });

  bool get hasMore =>
      pagination != null && pagination!.page < pagination!.totalPages;
}

class OrderListNotifier extends StateNotifier<OrderListState> {
  final OrderRemoteDatasource _datasource;

  OrderListNotifier(this._datasource) : super(const OrderListState());

  Future<void> loadOrders({String? status}) async {
    state = const OrderListState(isLoading: true);
    try {
      final response = await _datasource.getOrders(status: status);
      state = OrderListState(
        orders: response.orders,
        pagination: response.pagination,
      );
    } catch (e) {
      state = OrderListState(error: e.toString());
    }
  }

  Future<void> loadMore({String? status}) async {
    if (state.isLoading || !state.hasMore) return;
    state = OrderListState(
      orders: state.orders,
      pagination: state.pagination,
      isLoading: true,
    );
    try {
      final nextPage = (state.pagination?.page ?? 0) + 1;
      final response =
          await _datasource.getOrders(page: nextPage, status: status);
      state = OrderListState(
        orders: [...state.orders, ...response.orders],
        pagination: response.pagination,
      );
    } catch (e) {
      state = OrderListState(
        orders: state.orders,
        pagination: state.pagination,
        error: e.toString(),
      );
    }
  }
}

final orderListProvider =
    StateNotifierProvider<OrderListNotifier, OrderListState>((ref) {
  return OrderListNotifier(ref.watch(orderDatasourceProvider));
});

// Single order detail
class OrderDetailNotifier extends StateNotifier<AsyncValue<OrderModel>> {
  final OrderRemoteDatasource _datasource;

  OrderDetailNotifier(this._datasource) : super(const AsyncValue.loading());

  Future<void> loadOrder(int id) async {
    state = const AsyncValue.loading();
    try {
      final order = await _datasource.getOrderById(id);
      state = AsyncValue.data(order);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> cancelOrder(int id) async {
    try {
      final updated = await _datasource.updateOrderStatus(id, 'cancelled');
      state = AsyncValue.data(updated);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final orderDetailProvider = StateNotifierProvider.family<OrderDetailNotifier,
    AsyncValue<OrderModel>, int>(
  (ref, id) {
    final notifier = OrderDetailNotifier(ref.watch(orderDatasourceProvider));
    notifier.loadOrder(id);
    return notifier;
  },
);

// Create order action
Future<OrderModel> createOrder(
  OrderRemoteDatasource datasource, {
  required int businessId,
  required List<Map<String, dynamic>> items,
  String? shippingAddress,
  String? notes,
}) async {
  return datasource.createOrder(
    businessId: businessId,
    items: items,
    shippingAddress: shippingAddress,
    notes: notes,
  );
}
