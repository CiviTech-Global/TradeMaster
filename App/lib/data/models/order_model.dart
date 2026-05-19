import 'package:trademaster/data/models/product_model.dart';

class OrderItemModel {
  final int id;
  final int orderId;
  final int productId;
  final int? variantId;
  final int quantity;
  final double unitPrice;
  final double totalPrice;
  final ProductModel? product;

  OrderItemModel({
    required this.id,
    required this.orderId,
    required this.productId,
    this.variantId,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
    this.product,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) => OrderItemModel(
        id: json['id'],
        orderId: json['order_id'],
        productId: json['product_id'],
        variantId: json['variant_id'],
        quantity: json['quantity'],
        unitPrice: (json['unit_price'] as num).toDouble(),
        totalPrice: (json['total_price'] as num).toDouble(),
        product: json['product'] != null
            ? ProductModel.fromJson(json['product'])
            : null,
      );
}

class OrderBusinessModel {
  final int id;
  final String title;
  final String? logo;
  final String? address;

  OrderBusinessModel({
    required this.id,
    required this.title,
    this.logo,
    this.address,
  });

  factory OrderBusinessModel.fromJson(Map<String, dynamic> json) =>
      OrderBusinessModel(
        id: json['id'],
        title: json['title'],
        logo: json['logo'],
        address: json['address'],
      );
}

class OrderModel {
  final int id;
  final String orderNumber;
  final int buyerId;
  final int businessId;
  final String status;
  final double totalAmount;
  final String currency;
  final String? shippingAddress;
  final String? notes;
  final List<OrderItemModel> items;
  final OrderBusinessModel? business;
  final String? createdAt;

  OrderModel({
    required this.id,
    required this.orderNumber,
    required this.buyerId,
    required this.businessId,
    required this.status,
    required this.totalAmount,
    this.currency = 'USD',
    this.shippingAddress,
    this.notes,
    this.items = const [],
    this.business,
    this.createdAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) => OrderModel(
        id: json['id'],
        orderNumber: json['order_number'] ?? '',
        buyerId: json['buyer_id'],
        businessId: json['business_id'],
        status: json['status'] ?? 'pending',
        totalAmount: (json['total_amount'] as num).toDouble(),
        currency: json['currency'] ?? 'USD',
        shippingAddress: json['shipping_address'],
        notes: json['notes'],
        items: json['items'] != null
            ? (json['items'] as List)
                .map((i) => OrderItemModel.fromJson(i))
                .toList()
            : [],
        business: json['business'] != null
            ? OrderBusinessModel.fromJson(json['business'])
            : null,
        createdAt: json['createdAt'],
      );
}

class OrderListResponse {
  final List<OrderModel> orders;
  final PaginationModel pagination;

  OrderListResponse({required this.orders, required this.pagination});

  factory OrderListResponse.fromJson(Map<String, dynamic> json) =>
      OrderListResponse(
        orders: (json['data'] as List)
            .map((o) => OrderModel.fromJson(o))
            .toList(),
        pagination: PaginationModel.fromJson(json['pagination']),
      );
}
