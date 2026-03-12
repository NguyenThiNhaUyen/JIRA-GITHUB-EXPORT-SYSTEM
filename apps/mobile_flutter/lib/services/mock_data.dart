// Mock Data Service - Courses data
import '../models/course.dart';

class MockData {
  static List<Course> getStudentCourses() {
    return [
      Course(
        id: 'course-1',
        code: 'SWD392',
        name: 'Software Development',
        lecturer: 'Nguyễn Văn Nam',
        status: 'ACTIVE',
        groupName: 'Nhóm 3',
        progress: 75,
      ),
      Course(
        id: 'course-2',
        code: 'PRJ301',
        name: 'Java Web Application',
        lecturer: 'Trần Thị Lan',
        status: 'ACTIVE',
        groupName: 'Nhóm 5',
        progress: 60,
      ),
      Course(
        id: 'course-3',
        code: 'SWP391',
        name: 'Software Engineering Project',
        lecturer: 'Lê Văn Hùng',
        status: 'PENDING',
        groupName: 'Nhóm 7',
        progress: 20,
      ),
    ];
  }

  static List<Course> getLecturerCourses() {
    return [
      Course(
        id: 'c1',
        code: 'SWD392',
        name: 'Software Development',
        lecturer: 'Nguyễn Văn Nam',
        status: 'ACTIVE',
      ),
      Course(
        id: 'c2',
        code: 'PRJ301',
        name: 'Java Web Application',
        lecturer: 'Nguyễn Văn Nam',
        status: 'ACTIVE',
      ),
    ];
  }
}
