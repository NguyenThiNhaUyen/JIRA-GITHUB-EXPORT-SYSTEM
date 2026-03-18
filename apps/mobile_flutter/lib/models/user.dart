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
    final dynamic rawRoles = json['roles'];
    final dynamic rawRole = json['role'];

    List<String> parsedRoles = [];

    if (rawRoles is List) {
      parsedRoles = rawRoles.map((e) => e.toString().toUpperCase()).toList();
    } else if (rawRole != null && rawRole.toString().trim().isNotEmpty) {
      parsedRoles = [rawRole.toString().toUpperCase()];
    }

    return User(
      id: json['id'] is int
          ? json['id']
          : int.tryParse(json['id'].toString()) ?? 0,
      email: json['email']?.toString() ?? '',
      fullName: json['fullName']?.toString() ?? '',
      roles: parsedRoles,
      studentCode: json['studentCode']?.toString(),
      lecturerCode: json['lecturerCode']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "email": email,
      "fullName": fullName,
      "roles": roles,
      "studentCode": studentCode,
      "lecturerCode": lecturerCode,
    };
  }

  bool get isAdmin => roles.contains("ADMIN");
  bool get isLecturer => roles.contains("LECTURER");
  bool get isStudent => roles.contains("STUDENT");
}
