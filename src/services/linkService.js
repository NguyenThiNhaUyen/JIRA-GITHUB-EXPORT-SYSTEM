// Link Service - Business logic for GitHub/Jira account linking
import db from '../mock/db.js';

export const linkService = {
  // Get student links
  getStudentLinks(studentId, courseId = null) {
    const filter = { studentId };
    if (courseId) filter.courseId = courseId;
    
    const links = db.findMany('studentLinks', filter);
    
    return links.map(link => ({
      ...link,
      student: db.findById('users.students', link.studentId),
      course: db.findById('courses', link.courseId),
      confirmedBy: link.confirmedByLecturerId ? 
        db.findById('users.lecturers', link.confirmedByLecturerId) : null
    }));
  },

  // Request link confirmation
  requestLinkConfirmation(studentId, courseId, githubAccountUrl, jiraAccountUrl) {
    const student = db.findById('users.students', studentId);
    const course = db.findById('courses', courseId);
    
    if (!student) throw new Error('Student not found');
    if (!course) throw new Error('Course not found');

    // Check if student is enrolled in course
    const enrollment = db.findMany('courseEnrollments', { 
      courseId, 
      studentId 
    });
    if (enrollment.length === 0) {
      throw new Error('Student must be enrolled in the course to request link confirmation');
    }

    // Validate URLs
    if (githubAccountUrl && !this.isValidGitHubUrl(githubAccountUrl)) {
      throw new Error('Invalid GitHub URL format');
    }
    if (jiraAccountUrl && !this.isValidJiraUrl(jiraAccountUrl)) {
      throw new Error('Invalid Jira URL format');
    }

    // Check if link already exists
    const existingLinks = db.findMany('studentLinks', { studentId, courseId });
    if (existingLinks.length > 0) {
      // Update existing link
      const link = existingLinks[0];
      db.update('studentLinks', link.id, {
        githubAccountUrl,
        jiraAccountUrl,
        status: 'PENDING',
        confirmedByLecturerId: null,
        updatedAt: new Date().toISOString()
      });
      return this.getStudentLinks(studentId, courseId)[0];
    } else {
      // Create new link
      const link = db.create('studentLinks', {
        studentId,
        courseId,
        githubAccountUrl,
        jiraAccountUrl,
        status: 'PENDING',
        confirmedByLecturerId: null,
        updatedAt: new Date().toISOString()
      });
      return this.getStudentLinks(studentId, courseId)[0];
    }
  },

  // Confirm link (lecturer action)
  confirmLink(linkId, lecturerId) {
    const link = db.findById('studentLinks', linkId);
    const lecturer = db.findById('users.lecturers', lecturerId);
    
    if (!link) throw new Error('Link not found');
    if (!lecturer) throw new Error('Lecturer not found');

    if (link.status !== 'PENDING') {
      throw new Error('Only pending links can be confirmed');
    }

    // Check if lecturer is assigned to the course
    const courseAssignment = db.findMany('courseLecturers', { 
      courseId: link.courseId, 
      lecturerId 
    });
    if (courseAssignment.length === 0) {
      throw new Error('Lecturer is not assigned to this course');
    }

    db.update('studentLinks', linkId, {
      status: 'CONFIRMED',
      confirmedByLecturerId: lecturerId,
      updatedAt: new Date().toISOString()
    });

    return this.getStudentLinks(link.studentId, link.courseId)[0];
  },

  // Reject link (lecturer action)
  rejectLink(linkId, lecturerId, rejectionReason = '') {
    const link = db.findById('studentLinks', linkId);
    const lecturer = db.findById('users.lecturers', lecturerId);
    
    if (!link) throw new Error('Link not found');
    if (!lecturer) throw new Error('Lecturer not found');

    if (link.status !== 'PENDING') {
      throw new Error('Only pending links can be rejected');
    }

    // Check if lecturer is assigned to the course
    const courseAssignment = db.findMany('courseLecturers', { 
      courseId: link.courseId, 
      lecturerId 
    });
    if (courseAssignment.length === 0) {
      throw new Error('Lecturer is not assigned to this course');
    }

    db.update('studentLinks', linkId, {
      status: 'REJECTED',
      confirmedByLecturerId: lecturerId,
      rejectionReason,
      updatedAt: new Date().toISOString()
    });

    return this.getStudentLinks(link.studentId, link.courseId)[0];
  },

  // Get pending links for lecturer
  getPendingLinks(lecturerId, courseId = null) {
    // Get courses where lecturer is assigned
    const assignments = db.findMany('courseLecturers', { lecturerId });
    const courseIds = assignments.map(a => a.courseId);
    
    if (courseId) {
      if (!courseIds.includes(courseId)) {
        throw new Error('Lecturer is not assigned to this course');
      }
      courseIds.length = 0;
      courseIds.push(courseId);
    }

    // Get pending links for these courses
    const pendingLinks = db.findMany('studentLinks', { status: 'PENDING' })
      .filter(link => courseIds.includes(link.courseId));

    return pendingLinks.map(link => ({
      ...link,
      student: db.findById('users.students', link.studentId),
      course: db.findById('courses', link.courseId)
    }));
  },

  // Get link statistics for course
  getCourseLinkStats(courseId) {
    const links = db.findMany('studentLinks', { courseId });
    const enrollments = db.findMany('courseEnrollments', { courseId });
    
    const stats = {
      totalStudents: enrollments.length,
      withLinks: links.length,
      confirmed: links.filter(l => l.status === 'CONFIRMED').length,
      pending: links.filter(l => l.status === 'PENDING').length,
      rejected: links.filter(l => l.status === 'REJECTED').length,
      withoutLinks: enrollments.length - links.length
    };

    return {
      ...stats,
      confirmationRate: stats.totalStudents > 0 ? (stats.confirmed / stats.totalStudents * 100).toFixed(1) : 0,
      pendingRate: stats.totalStudents > 0 ? (stats.pending / stats.totalStudents * 100).toFixed(1) : 0
    };
  },

  // Validate GitHub URL
  isValidGitHubUrl(url) {
    if (!url) return true; // Optional field
    const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\/?$/;
    return githubRegex.test(url);
  },

  // Validate Jira URL
  isValidJiraUrl(url) {
    if (!url) return true; // Optional field
    const jiraRegex = /^https:\/\/[a-zA-Z0-9.-]+\.atlassian\.net\/.*$/;
    return jiraRegex.test(url);
  },

  // Bulk confirm links
  bulkConfirmLinks(linkIds, lecturerId) {
    const results = [];
    
    for (const linkId of linkIds) {
      try {
        const confirmedLink = this.confirmLink(linkId, lecturerId);
        results.push({ success: true, link: confirmedLink });
      } catch (error) {
        results.push({ success: false, error: error.message, linkId });
      }
    }

    return {
      total: linkIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  },

  // Bulk reject links
  bulkRejectLinks(linkIds, lecturerId, rejectionReason = '') {
    const results = [];
    
    for (const linkId of linkIds) {
      try {
        const rejectedLink = this.rejectLink(linkId, lecturerId, rejectionReason);
        results.push({ success: true, link: rejectedLink });
      } catch (error) {
        results.push({ success: false, error: error.message, linkId });
      }
    }

    return {
      total: linkIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  },

  // Get student's link history
  getStudentLinkHistory(studentId) {
    const links = db.findMany('studentLinks', { studentId });
    
    return links.map(link => ({
      ...link,
      course: db.findById('courses', link.courseId),
      confirmedBy: link.confirmedByLecturerId ? 
        db.findById('users.lecturers', link.confirmedByLecturerId) : null
    })).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }
};
