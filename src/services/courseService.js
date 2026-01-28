// Course Service - Business logic for course management
import db from '../mock/db.js';

export const courseService = {
  // Get all courses with optional filters
  getCourses(filters = {}) {
    let courses = db.findMany('courses', filters);
    
    // Enrich with related data
    return courses.map(course => ({
      ...course,
      semester: db.findById('semesters', course.semesterId),
      subject: db.findById('subjects', course.subjectId),
      lecturers: db.getCourseLecturers(course.id),
      students: db.getCourseStudents(course.id),
      projects: db.findMany('projects', { courseId: course.id })
    }));
  },

  // Get single course by ID
  getCourseById(courseId) {
    const course = db.findById('courses', courseId);
    if (!course) return null;

    return {
      ...course,
      semester: db.findById('semesters', course.semesterId),
      subject: db.findById('subjects', course.subjectId),
      lecturers: db.getCourseLecturers(course.id),
      students: db.getCourseStudents(course.id),
      projects: db.findMany('projects', { courseId: course.id })
    };
  },

  // Create new course
  createCourse(courseData) {
    // Validate required fields
    const required = ['subjectId', 'semesterId', 'code', 'title', 'startDate', 'endDate'];
    for (const field of required) {
      if (!courseData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Check for duplicate code in same semester
    const existing = db.findMany('courses', { 
      semesterId: courseData.semesterId, 
      code: courseData.code 
    });
    if (existing.length > 0) {
      throw new Error('Course code already exists in this semester');
    }

    // Validate dates
    if (new Date(courseData.endDate) <= new Date(courseData.startDate)) {
      throw new Error('End date must be after start date');
    }

    const course = db.create('courses', {
      ...courseData,
      status: courseData.status || 'ACTIVE',
      maxStudents: courseData.maxStudents || 40,
      currentStudents: 0,
      createdAt: new Date().toISOString()
    });

    return this.getCourseById(course.id);
  },

  // Update course
  updateCourse(courseId, updates) {
    const course = db.findById('courses', courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Validate date logic if dates are being updated
    if (updates.startDate || updates.endDate) {
      const startDate = updates.startDate || course.startDate;
      const endDate = updates.endDate || course.endDate;
      if (new Date(endDate) <= new Date(startDate)) {
        throw new Error('End date must be after start date');
      }
    }

    // Check for duplicate code if code is being updated
    if (updates.code && updates.code !== course.code) {
      const existing = db.findMany('courses', { 
        semesterId: course.semesterId, 
        code: updates.code 
      });
      if (existing.length > 0) {
        throw new Error('Course code already exists in this semester');
      }
    }

    db.update('courses', courseId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    return this.getCourseById(courseId);
  },

  // Delete course
  deleteCourse(courseId) {
    const course = db.findById('courses', courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if course has enrollments
    const enrollments = db.findMany('courseEnrollments', { courseId });
    if (enrollments.length > 0) {
      throw new Error('Cannot delete course with active enrollments');
    }

    // Check if course has projects
    const projects = db.findMany('projects', { courseId });
    if (projects.length > 0) {
      throw new Error('Cannot delete course with active projects');
    }

    // Remove lecturer assignments
    const lecturerAssignments = db.findMany('courseLecturers', { courseId });
    lecturerAssignments.forEach(assignment => {
      db.delete('courseLecturers', assignment.id);
    });

    return db.delete('courses', courseId);
  },

  // Assign lecturer to course
  assignLecturer(courseId, lecturerId, role = 'SECONDARY') {
    const course = db.findById('courses', courseId);
    const lecturer = db.findById('users.lecturers', lecturerId);
    
    if (!course) throw new Error('Course not found');
    if (!lecturer) throw new Error('Lecturer not found');

    // Check if already assigned
    const existing = db.findMany('courseLecturers', { courseId, lecturerId });
    if (existing.length > 0) {
      throw new Error('Lecturer already assigned to this course');
    }

    const assignment = db.create('courseLecturers', {
      courseId,
      lecturerId,
      role,
      assignedAt: new Date().toISOString()
    });

    return {
      ...assignment,
      lecturer,
      course
    };
  },

  // Unassign lecturer from course
  unassignLecturer(courseId, lecturerId) {
    const assignments = db.findMany('courseLecturers', { courseId, lecturerId });
    if (assignments.length === 0) {
      throw new Error('Lecturer not assigned to this course');
    }

    // Check if this is the primary lecturer
    const primaryAssignment = assignments.find(a => a.role === 'PRIMARY');
    if (primaryAssignment) {
      // Check if there are other lecturers
      const otherAssignments = db.findMany('courseLecturers', { courseId });
      if (otherAssignments.length <= 1) {
        throw new Error('Cannot remove primary lecturer when no other lecturers assigned');
      }
    }

    assignments.forEach(assignment => {
      db.delete('courseLecturers', assignment.id);
    });

    return true;
  },

  // Enroll student in course
  enrollStudent(courseId, studentId) {
    const course = db.findById('courses', courseId);
    const student = db.findById('users.students', studentId);
    
    if (!course) throw new Error('Course not found');
    if (!student) throw new Error('Student not found');

    // Check if already enrolled
    const existing = db.findMany('courseEnrollments', { courseId, studentId });
    if (existing.length > 0) {
      throw new Error('Student already enrolled in this course');
    }

    // Check capacity
    if (course.currentStudents >= course.maxStudents) {
      throw new Error('Course is at maximum capacity');
    }

    const enrollment = db.create('courseEnrollments', {
      courseId,
      studentId,
      enrolledAt: new Date().toISOString(),
      status: 'ACTIVE'
    });

    // Update course student count
    db.update('courses', courseId, {
      currentStudents: course.currentStudents + 1
    });

    return {
      ...enrollment,
      student,
      course
    };
  },

  // Unenroll student from course
  unenrollStudent(courseId, studentId) {
    const enrollments = db.findMany('courseEnrollments', { courseId, studentId });
    if (enrollments.length === 0) {
      throw new Error('Student not enrolled in this course');
    }

    const course = db.findById('courses', courseId);
    
    enrollments.forEach(enrollment => {
      db.delete('courseEnrollments', enrollment.id);
    });

    // Update course student count
    db.update('courses', courseId, {
      currentStudents: Math.max(0, course.currentStudents - 1)
    });

    return true;
  },

  // Get available students for enrollment (not already enrolled)
  getAvailableStudents(courseId) {
    const enrolledStudents = db.getCourseStudents(courseId).map(s => s.id);
    const allStudents = db.findMany('users.students');
    
    return allStudents.filter(student => !enrolledStudents.includes(student.id));
  },

  // Get available lecturers for assignment (not already assigned)
  getAvailableLecturers(courseId) {
    const assignedLecturers = db.getCourseLecturers(courseId).map(l => l.id);
    const allLecturers = db.findMany('users.lecturers');
    
    return allLecturers.filter(lecturer => !assignedLecturers.includes(lecturer.id));
  }
};
