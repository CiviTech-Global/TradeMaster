class User {
  final int id;
  final String firstname;
  final String lastname;
  final String email;
  final String? avatar;
  final String? phone;
  final String? bio;

  const User({
    required this.id,
    required this.firstname,
    required this.lastname,
    required this.email,
    this.avatar,
    this.phone,
    this.bio,
  });

  String get fullName => '$firstname $lastname';
}
