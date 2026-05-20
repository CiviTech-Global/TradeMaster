import 'package:trademaster/core/utils/json_parse.dart';
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
        id: json['id'] as int? ?? 0,
        orderId: json['order_id'] as int? ?? 0,
        productId: json['product_id'] as int? ?? 0,
        variantId: json['variant_id'] as int?,
        quantity: json['quantity'] as int? ?? 0,
        unitPrice: parseJsonDouble(json['unit_price']),
        totalPrice: parseJsonDouble(json['total_price']),
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
        id: json['id'] as int? ?? 0,
        title: json['title'] as String? ?? '',
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

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    // Sequelize may return the business as 'Business' (capitalized) or 'business'
    final businessJson = json['business'] ?? json['Business'];
    return OrderModel(
      id: json['id'] as int? ?? 0,
      orderNumber: json['order_number'] as String? ?? '',
      buyerId: json['buyer_id'] as int? ?? 0,
      businessId: json['business_id'] as int? ?? 0,
      status: json['status'] as String? ?? 'pending',
      totalAmount: parseJsonDouble(json['total_amount']),
      currency: json['currency'] as String? ?? 'USD',
      shippingAddress: json['shipping_address'] as String?,
      notes: json['notes'] as String?,
      items: json['items'] != null
          ? (json['items'] as List)
              .map((i) => OrderItemModel.fromJson(i as Map<String, dynamic>))
              .toList()
          : [],
      business: businessJson != null
          ? OrderBusinessModel.fromJson(businessJson as Map<String, dynamic>)
          : null,
      createdAt: json['createdAt'] as String?,
    );
  }
}

class OrderListResponse {
  final List<OrderModel> orders;
  final PaginationModel pagination;

  OrderListResponse({required this.orders, required this.pagination});

  factory OrderListResponse.fromJson(Map<String, dynamic> json) =>
      OrderListResponse(
        orders: (json['data'] as List)
            .map((o) => OrderModel.fromJson(o as Map<String, dynamic>))
            .toList(),
        pagination: PaginationModel.fromJson(json['pagination']),
      );
}
