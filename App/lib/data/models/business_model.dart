import 'package:trademaster/core/utils/json_parse.dart';

class BusinessOwnerModel {
  final int id;
  final String firstname;
  final String lastname;
  final String? email;

  BusinessOwnerModel({
    required this.id,
    required this.firstname,
    required this.lastname,
    this.email,
  });

  String get fullName => '$firstname $lastname';

  factory BusinessOwnerModel.fromJson(Map<String, dynamic> json) =>
      BusinessOwnerModel(
        id: json['id'],
        firstname: json['firstname'],
        lastname: json['lastname'],
        email: json['email'],
      );
}

class BusinessCategoryModel {
  final int id;
  final String name;
  final String slug;
  final String? icon;

  BusinessCategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.icon,
  });

  factory BusinessCategoryModel.fromJson(Map<String, dynamic> json) =>
      BusinessCategoryModel(
        id: json['id'],
        name: json['name'],
        slug: json['slug'],
        icon: json['icon'],
      );
}

class BusinessModel {
  final int id;
  final String title;
  final int owner;
  final String? description;
  final String? address;
  final double? latitude;
  final double? longitude;
  final List<String>? emails;
  final List<String>? phones;
  final bool isActive;
  final String? logo;
  final String? coverImage;
  final int? categoryId;
  final BusinessOwnerModel? ownerUser;
  final BusinessCategoryModel? category;

  BusinessModel({
    required this.id,
    required this.title,
    required this.owner,
    this.description,
    this.address,
    this.latitude,
    this.longitude,
    this.emails,
    this.phones,
    this.isActive = true,
    this.logo,
    this.coverImage,
    this.categoryId,
    this.ownerUser,
    this.category,
  });

  factory BusinessModel.fromJson(Map<String, dynamic> json) => BusinessModel(
        id: json['id'],
        title: json['title'] ?? json['name'] ?? '',
        owner: json['owner'],
        description: json['description'],
        address: json['address'],
        latitude: parseJsonDoubleOrNull(json['latitude']),
        longitude: parseJsonDoubleOrNull(json['longitude']),
        emails: json['emails'] != null
            ? List<String>.from(json['emails'])
            : null,
        phones: json['phones'] != null
            ? List<String>.from(json['phones'])
            : null,
        isActive: json['is_active'] ?? true,
        logo: json['logo'],
        coverImage: json['cover_image'],
        categoryId: json['category_id'],
        ownerUser: json['user'] != null
            ? BusinessOwnerModel.fromJson(json['user'])
            : null,
        category: json['Category'] != null
            ? BusinessCategoryModel.fromJson(json['Category'])
            : (json['category'] != null
                ? BusinessCategoryModel.fromJson(json['category'])
                : null),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'owner': owner,
        'description': description,
        'address': address,
        'latitude': latitude,
        'longitude': longitude,
        'emails': emails,
        'phones': phones,
        'is_active': isActive,
        'logo': logo,
        'cover_image': coverImage,
        'category_id': categoryId,
      };
}
