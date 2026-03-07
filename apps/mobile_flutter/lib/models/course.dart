// Course Model
class Course {
  final String id;
  final String code;
  final String name;
  final String lecturer;
  final String status;
  final String? groupName;
  final int? progress;

  Course({
    required this.id,
    required this.code,
    required this.name,
    required this.lecturer,
    required this.status,
    this.groupName,
    this.progress,
  });

  factory Course.fromJson(Map<String, dynamic> json) {
    return Course(
      id: json['id'] as String,
      code: json['code'] as String,
      name: json['name'] as String,
      lecturer: json['lecturer'] as String,
      status: json['status'] as String,
      groupName: json['groupName'] as String?,
      progress: json['progress'] as int?,
    );
  }

  bool get isActive => status == 'ACTIVE';
  bool get isPending => status == 'PENDING';
}
