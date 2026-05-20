class UserModel {
  final int id;
  final String firstname;
  final String lastname;
  final String email;
  final String? avatar;
  final String? phone;
  final String? bio;

  UserModel({
    required this.id,
    required this.firstname,
    required this.lastname,
    required this.email,
    this.avatar,
    this.phone,
    this.bio,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        id: json['id'] as int? ?? 0,
        firstname: json['firstname'] as String? ?? '',
        lastname: json['lastname'] as String? ?? '',
        email: json['email'] as String? ?? '',
        avatar: json['avatar'] as String?,
        phone: json['phone'] as String?,
        bio: json['bio'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'firstname': firstname,
        'lastname': lastname,
        'email': email,
        'avatar': avatar,
        'phone': phone,
        'bio': bio,
      };
}
