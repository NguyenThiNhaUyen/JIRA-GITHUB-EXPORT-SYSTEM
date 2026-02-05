// User Model
class User {
  final String id;
  final String email;
  final String name;
  final String role; // ADMIN, LECTURER, STUDENT
  final String? studentCode;
  final String? department;

  User({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.studentCode,
    this.department,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      role: json['role'] as String,
      studentCode: json['studentCode'] as String?,
      department: json['department'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role,
      if (studentCode != null) 'studentCode': studentCode,
      if (department != null) 'department': department,
    };
  }

  bool get isAdmin => role == 'ADMIN';
  bool get isLecturer => role == 'LECTURER';
  bool get isStudent => role == 'STUDENT';
}
