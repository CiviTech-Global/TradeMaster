import 'package:trademaster/core/utils/json_parse.dart';

class ProductImageModel {
  final int id;
  final int productId;
  final String url;
  final String? altText;
  final int sortOrder;
  final bool isPrimary;

  ProductImageModel({
    required this.id,
    required this.productId,
    required this.url,
    this.altText,
    this.sortOrder = 0,
    this.isPrimary = false,
  });

  factory ProductImageModel.fromJson(Map<String, dynamic> json) =>
      ProductImageModel(
        id: json['id'] as int? ?? 0,
        productId: json['product_id'] as int? ?? 0,
        url: json['url'] as String? ?? '',
        altText: json['alt_text'] as String?,
        sortOrder: json['sort_order'] as int? ?? 0,
        isPrimary: json['is_primary'] as bool? ?? false,
      );
}

class ProductVariantModel {
  final int id;
  final int productId;
  final String name;
  final String value;
  final double priceModifier;
  final int stockQuantity;
  final String? sku;
  final bool isActive;

  ProductVariantModel({
    required this.id,
    required this.productId,
    required this.name,
    required this.value,
    this.priceModifier = 0,
    this.stockQuantity = 0,
    this.sku,
    this.isActive = true,
  });

  factory ProductVariantModel.fromJson(Map<String, dynamic> json) =>
      ProductVariantModel(
        id: json['id'] as int? ?? 0,
        productId: json['product_id'] as int? ?? 0,
        name: json['name'] as String? ?? '',
        value: json['value'] as String? ?? '',
        priceModifier: parseJsonDouble(json['price_modifier']),
        stockQuantity: json['stock_quantity'] as int? ?? 0,
        sku: json['sku'] as String?,
        isActive: json['is_active'] as bool? ?? true,
      );
}

class ProductBusinessModel {
  final int id;
  final String title;
  final double? latitude;
  final double? longitude;
  final String? address;
  final String? logo;

  ProductBusinessModel({
    required this.id,
    required this.title,
    this.latitude,
    this.longitude,
    this.address,
    this.logo,
  });

  factory ProductBusinessModel.fromJson(Map<String, dynamic> json) =>
      ProductBusinessModel(
        id: json['id'] as int? ?? 0,
        title: json['title'] as String? ?? '',
        latitude: parseJsonDoubleOrNull(json['latitude']),
        longitude: parseJsonDoubleOrNull(json['longitude']),
        address: json['address'] as String?,
        logo: json['logo'] as String?,
      );
}

class ProductCategoryModel {
  final int id;
  final String name;
  final String slug;
  final String? icon;

  ProductCategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.icon,
  });

  factory ProductCategoryModel.fromJson(Map<String, dynamic> json) =>
      ProductCategoryModel(
        id: json['id'] as int? ?? 0,
        name: json['name'] as String? ?? '',
        slug: json['slug'] as String? ?? '',
        icon: json['icon'] as String?,
      );
}

class ProductModel {
  final int id;
  final int businessId;
  final int? categoryId;
  final String title;
  final String? description;
  final double price;
  final String currency;
  final int stockQuantity;
  final bool isActive;
  final List<ProductImageModel> images;
  final List<ProductVariantModel> variants;
  final ProductBusinessModel? business;
  final ProductCategoryModel? category;
  final String? createdAt;

  ProductModel({
    required this.id,
    required this.businessId,
    this.categoryId,
    required this.title,
    this.description,
    required this.price,
    this.currency = 'USD',
    this.stockQuantity = 0,
    this.isActive = true,
    this.images = const [],
    this.variants = const [],
    this.business,
    this.category,
    this.createdAt,
  });

  String? get primaryImageUrl {
    if (images.isEmpty) return null;
    final primary = images.where((i) => i.isPrimary).firstOrNull;
    return (primary ?? images.first).url;
  }

  factory ProductModel.fromJson(Map<String, dynamic> json) => ProductModel(
        id: json['id'] as int? ?? 0,
        businessId: json['business_id'] as int? ?? 0,
        categoryId: json['category_id'] as int?,
        title: json['title'] as String? ?? '',
        description: json['description'] as String?,
        price: parseJsonDouble(json['price']),
        currency: json['currency'] as String? ?? 'USD',
        stockQuantity: json['stock_quantity'] as int? ?? 0,
        isActive: json['is_active'] as bool? ?? true,
        images: json['images'] != null
            ? (json['images'] as List)
                .map((i) => ProductImageModel.fromJson(i))
                .toList()
            : [],
        variants: json['variants'] != null
            ? (json['variants'] as List)
                .map((v) => ProductVariantModel.fromJson(v))
                .toList()
            : [],
        business: json['business'] != null
            ? ProductBusinessModel.fromJson(json['business'])
            : null,
        category: json['Category'] != null
            ? ProductCategoryModel.fromJson(json['Category'])
            : (json['category'] != null
                ? ProductCategoryModel.fromJson(json['category'])
                : null),
        createdAt: json['createdAt'],
      );
}

class PaginationModel {
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  PaginationModel({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  factory PaginationModel.fromJson(Map<String, dynamic> json) =>
      PaginationModel(
        page: json['page'] as int? ?? 1,
        limit: json['limit'] as int? ?? 20,
        total: json['total'] as int? ?? 0,
        totalPages: json['totalPages'] as int? ?? 1,
      );
}

class ProductListResponse {
  final List<ProductModel> products;
  final PaginationModel pagination;

  ProductListResponse({required this.products, required this.pagination});

  factory ProductListResponse.fromJson(Map<String, dynamic> json) =>
      ProductListResponse(
        products: (json['data'] as List)
            .map((p) => ProductModel.fromJson(p))
            .toList(),
        pagination: PaginationModel.fromJson(json['pagination']),
      );
}
