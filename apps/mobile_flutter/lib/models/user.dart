class User {
  final int id;
  final String email;
  final String fullName;
  final List<String> roles;
  final String? studentCode;
  final String? lecturerCode;

  User({
    required this.id,
    required this.email,
    required this.fullName,
    required this.roles,
    this.studentCode,
    this.lecturerCode,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      fullName: json['fullName'],
      roles: List<String>.from(json['roles'] ?? []),
      studentCode: json['studentCode'],
      lecturerCode: json['lecturerCode'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "email": email,
      "fullName": fullName,
      "roles": roles,
      "studentCode": studentCode,
      "lecturerCode": lecturerCode
    };
  }

  bool get isAdmin => roles.contains("ADMIN");
  bool get isLecturer => roles.contains("LECTURER");
  bool get isStudent => roles.contains("STUDENT");
}