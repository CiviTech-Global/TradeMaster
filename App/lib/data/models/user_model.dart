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
        id: json['id'],
        firstname: json['firstname'],
        lastname: json['lastname'],
        email: json['email'],
        avatar: json['avatar'],
        phone: json['phone'],
        bio: json['bio'],
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
