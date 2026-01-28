// SRS Service - Business logic for SRS report management
import db from '../mock/db.js';

export const srsService = {
  // Get SRS reports with filters
  getSrsReports(filters = {}) {
    let reports = db.findMany('srsReports', filters);
    
    // Enrich with related data
    return reports.map(report => ({
      ...report,
      project: db.findById('projects', report.projectId),
      submittedBy: db.findById('users.students', report.submittedByStudentId),
      course: report.project ? db.findById('courses', report.project.courseId) : null
    })).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  },

  // Get SRS reports for project
  getProjectSrsReports(projectId) {
    return this.getSrsReports({ projectId });
  },

  // Get SRS reports for course
  getCourseSrsReports(courseId) {
    const courseProjects = db.findMany('projects', { courseId });
    const projectIds = courseProjects.map(p => p.id);
    
    return this.getSrsReports()
      .filter(report => projectIds.includes(report.projectId));
  },

  // Get SRS reports by student
  getStudentSrsReports(studentId) {
    return this.getSrsReports({ submittedByStudentId: studentId });
  },

  // Upload SRS report
  uploadSrsReport(projectId, studentId, fileName, version = '1.0', status = 'DRAFT') {
    const project = db.findById('projects', projectId);
    const student = db.findById('users.students', studentId);
    
    if (!project) throw new Error('Project not found');
    if (!student) throw new Error('Student not found');

    // Check if student is a team member
    const teamMember = db.findMany('teamMembers', { 
      projectId, 
      studentId 
    });
    if (teamMember.length === 0) {
      throw new Error('Only team members can upload SRS reports');
    }

    // Validate file name
    if (!fileName || fileName.trim() === '') {
      throw new Error('File name is required');
    }

    // Check if file extension is valid
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const hasValidExtension = validExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
    if (!hasValidExtension) {
      throw new Error('File must be PDF or Word document');
    }

    // Generate unique file ID (mock file upload)
    const fileId = this.generateFileId();
    const fileUrl = `/uploads/srs/${fileId}/${fileName}`;

    const report = db.create('srsReports', {
      projectId,
      version,
      status,
      submittedByStudentId: studentId,
      submittedAt: new Date().toISOString(),
      fileName,
      fileUrl,
      fileId,
      fileSize: Math.floor(Math.random() * 5000000) + 100000, // Mock file size (100KB - 5MB)
      reviewedByLecturerId: null,
      reviewedAt: null,
      reviewComments: null
    });

    return this.getSrsReports({ id: report.id })[0];
  },

  // Update SRS report
  updateSrsReport(reportId, updates, reviewerId = null) {
    const report = db.findById('srsReports', reportId);
    if (!report) {
      throw new Error('SRS report not found');
    }

    // If updating status to REVIEW or FINAL, require reviewer
    if ((updates.status === 'REVIEW' || updates.status === 'FINAL') && !reviewerId) {
      throw new Error('Reviewer ID is required to change status to REVIEW or FINAL');
    }

    // Validate reviewer is a lecturer assigned to the course
    if (reviewerId) {
      const project = db.findById('projects', report.projectId);
      const assignment = db.findMany('courseLecturers', { 
        courseId: project.courseId, 
        lecturerId: reviewerId 
      });
      if (assignment.length === 0) {
        throw new Error('Reviewer must be a lecturer assigned to this course');
      }
    }

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (reviewerId) {
      updateData.reviewedByLecturerId = reviewerId;
      updateData.reviewedAt = new Date().toISOString();
    }

    db.update('srsReports', reportId, updateData);

    return this.getSrsReports({ id: reportId })[0];
  },

  // Review SRS report (lecturer action)
  reviewSrsReport(reportId, lecturerId, status, comments = '') {
    const validStatuses = ['DRAFT', 'REVIEW', 'FINAL', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    return this.updateSrsReport(reportId, { 
      status, 
      reviewComments: comments 
    }, lecturerId);
  },

  // Delete SRS report
  deleteSrsReport(reportId, studentId = null) {
    const report = db.findById('srsReports', reportId);
    if (!report) {
      throw new Error('SRS report not found');
    }

    // Only the submitter can delete their own reports
    if (studentId && report.submittedByStudentId !== studentId) {
      throw new Error('You can only delete your own SRS reports');
    }

    // Cannot delete FINAL reports
    if (report.status === 'FINAL') {
      throw new Error('Cannot delete FINAL SRS reports');
    }

    return db.delete('srsReports', reportId);
  },

  // Get SRS statistics
  getSrsStats(filters = {}) {
    let reports = this.getSrsReports(filters);
    
    const stats = {
      total: reports.length,
      draft: reports.filter(r => r.status === 'DRAFT').length,
      review: reports.filter(r => r.status === 'REVIEW').length,
      final: reports.filter(r => r.status === 'FINAL').length,
      rejected: reports.filter(r => r.status === 'REJECTED').length,
      byProject: {},
      byStudent: {},
      byCourse: {},
      submissionsOverTime: {}
    };

    // Group by project
    reports.forEach(report => {
      if (!stats.byProject[report.projectId]) {
        stats.byProject[report.projectId] = {
          project: report.project,
          count: 0,
          final: 0,
          latest: null
        };
      }
      stats.byProject[report.projectId].count++;
      if (report.status === 'FINAL') {
        stats.byProject[report.projectId].final++;
      }
      if (!stats.byProject[report.projectId].latest || 
          new Date(report.submittedAt) > new Date(stats.byProject[report.projectId].latest.submittedAt)) {
        stats.byProject[report.projectId].latest = report;
      }
    });

    // Group by student
    reports.forEach(report => {
      if (!stats.byStudent[report.submittedByStudentId]) {
        stats.byStudent[report.submittedByStudentId] = {
          student: report.submittedBy,
          count: 0,
          final: 0
        };
      }
      stats.byStudent[report.submittedByStudentId].count++;
      if (report.status === 'FINAL') {
        stats.byStudent[report.submittedByStudentId].final++;
      }
    });

    // Group by course
    reports.forEach(report => {
      if (report.course) {
        if (!stats.byCourse[report.course.id]) {
          stats.byCourse[report.course.id] = {
            course: report.course,
            count: 0,
            final: 0
          };
        }
        stats.byCourse[report.course.id].count++;
        if (report.status === 'FINAL') {
          stats.byCourse[report.course.id].final++;
        }
      }
    });

    // Group by submission date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    reports
      .filter(report => new Date(report.submittedAt) >= thirtyDaysAgo)
      .forEach(report => {
        const date = report.submittedAt.split('T')[0];
        stats.submissionsOverTime[date] = (stats.submissionsOverTime[date] || 0) + 1;
      });

    return stats;
  },

  // Get pending reviews for lecturer
  getPendingReviews(lecturerId, courseId = null) {
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

    // Get SRS reports in REVIEW status for these courses
    const courseProjects = db.findMany('projects')
      .filter(p => courseIds.includes(p.courseId));
    const projectIds = courseProjects.map(p => p.id);

    const pendingReports = db.findMany('srsReports', { status: 'REVIEW' })
      .filter(report => projectIds.includes(report.projectId));

    return pendingReports.map(report => ({
      ...report,
      project: db.findById('projects', report.projectId),
      submittedBy: db.findById('users.students', report.submittedByStudentId),
      course: db.findById('courses', courseProjects.find(p => p.id === report.projectId)?.courseId)
    }));
  },

  // Get submission trends for charts
  getSubmissionTrends(courseId = null, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let reports = this.getSrsReports();
    
    if (courseId) {
      const courseProjects = db.findMany('projects', { courseId });
      const projectIds = courseProjects.map(p => p.id);
      reports = reports.filter(r => projectIds.includes(r.projectId));
    }

    reports = reports.filter(r => new Date(r.submittedAt) >= startDate);

    // Generate daily data
    const dailyData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayReports = reports.filter(r => r.submittedAt.split('T')[0] === dateStr);
      dailyData.push({
        date: dateStr,
        submissions: dayReports.length,
        final: dayReports.filter(r => r.status === 'FINAL').length,
        draft: dayReports.filter(r => r.status === 'DRAFT').length,
        review: dayReports.filter(r => r.status === 'REVIEW').length
      });
    }

    return dailyData;
  },

  // Generate file ID for mock uploads
  generateFileId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  },

  // Get latest SRS for project
  getLatestSrsForProject(projectId) {
    const reports = this.getProjectSrsReports(projectId);
    return reports.length > 0 ? reports[0] : null;
  },

  // Check if project has FINAL SRS
  hasFinalSrs(projectId) {
    const reports = this.getProjectSrsReports(projectId);
    return reports.some(r => r.status === 'FINAL');
  },

  // Get SRS completion rate for course
  getCourseCompletionRate(courseId) {
    const courseProjects = db.findMany('projects', { courseId });
    const totalProjects = courseProjects.length;
    
    if (totalProjects === 0) return 0;

    const projectsWithFinalSrs = courseProjects.filter(project => 
      this.hasFinalSrs(project.id)
    ).length;

    return Math.round((projectsWithFinalSrs / totalProjects) * 100);
  }
};
