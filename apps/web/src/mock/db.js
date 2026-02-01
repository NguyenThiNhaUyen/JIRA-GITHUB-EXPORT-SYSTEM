// Mock Database Layer - In-memory + localStorage persistence
class MockDB {
  constructor() {
    this.STORAGE_KEY = 'pbl_mock_db_v1';
    this.initializeData();
  }

  initializeData() {
    // Try to load from localStorage first
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.data = data;
        return;
      } catch (e) {
        console.warn('Failed to load from localStorage, using fresh data');
      }
    }

    // Fresh data initialization
    this.data = {
      // Semesters: Kỳ học (e.g., Spring 2026, Fall 2025)
      semesters: [
        { id: 'sem-spring-2026', code: 'SPRING2026', name: 'Spring 2026', startDate: '2026-01-05', endDate: '2026-04-20', status: 'ACTIVE', createdAt: '2025-12-01' },
        { id: 'sem-fall-2025', code: 'FALL2025', name: 'Fall 2025', startDate: '2025-09-01', endDate: '2025-12-31', status: 'COMPLETED', createdAt: '2025-08-01' },
        { id: 'sem-summer-2026', code: 'SUMMER2026', name: 'Summer 2026', startDate: '2026-05-01', endDate: '2026-08-15', status: 'UPCOMING', createdAt: '2026-01-15' },
      ],

      // Subjects: Môn học
      subjects: [
        { id: 'subj-exe101', code: 'EXE101', name: 'Exe Project', createdAt: '2025-01-01' },
        { id: 'subj-prn222', code: 'PRN222', name: 'Programming .NET', createdAt: '2025-01-01' },
        { id: 'subj-swd302', code: 'SWD302', name: 'Software Development', createdAt: '2025-01-01' },
        { id: 'subj-swt301', code: 'SWT301', name: 'Software Testing', createdAt: '2025-01-01' },
      ],

      // Courses: Lớp học cụ thể (e.g., SE1821, SE1822) - combination of Subject + Semester
      courses: [
        // SWD302 Courses for Spring 2026
        { id: 'course-se1821', code: 'se1821', subjectId: 'subj-swd302', semesterId: 'sem-spring-2026', name: 'SWD302 - se1821', description: 'Software Development - Class se1821', status: 'ACTIVE', maxStudents: 40, currentStudents: 35, createdAt: '2025-12-15' },
        { id: 'course-se1822', code: 'se1822', subjectId: 'subj-swd302', semesterId: 'sem-spring-2026', name: 'SWD302 - se1822', description: 'Software Development - Class se1822', status: 'ACTIVE', maxStudents: 40, currentStudents: 38, createdAt: '2025-12-15' },
        { id: 'course-se1823', code: 'se1823', subjectId: 'subj-swd302', semesterId: 'sem-spring-2026', name: 'SWD302 - se1823', description: 'Software Development - Class se1823', status: 'ACTIVE', maxStudents: 40, currentStudents: 32, createdAt: '2025-12-15' },

        // EXE101 Courses for Spring 2026
        { id: 'course-exe1821', code: 'exe1821', subjectId: 'subj-exe101', semesterId: 'sem-spring-2026', name: 'EXE101 - exe1821', description: 'Exe Project - Class exe1821', status: 'ACTIVE', maxStudents: 30, currentStudents: 28, createdAt: '2025-12-15' },
        { id: 'course-exe1822', code: 'exe1822', subjectId: 'subj-exe101', semesterId: 'sem-spring-2026', name: 'EXE101 - exe1822', description: 'Exe Project - Class exe1822', status: 'ACTIVE', maxStudents: 30, currentStudents: 25, createdAt: '2025-12-15' },

        // PRN222 Courses for Spring 2026
        { id: 'course-prn1821', code: 'prn1821', subjectId: 'subj-prn222', semesterId: 'sem-spring-2026', name: 'PRN222 - prn1821', description: 'Programming .NET - Class prn1821', status: 'ACTIVE', maxStudents: 35, currentStudents: 30, createdAt: '2025-12-15' },

        // Fall 2025 courses (completed)
        { id: 'course-se1721', code: 'se1721', subjectId: 'subj-swd302', semesterId: 'sem-fall-2025', name: 'SWD302 - se1721', description: 'Software Development - Class se1721', status: 'COMPLETED', maxStudents: 40, currentStudents: 40, createdAt: '2025-08-15' },
      ],

      users: {
        admins: [
          { id: 'adm001', name: 'Admin System', email: 'admin@gmail.com', role: 'ADMIN', avatar: null, createdAt: '2025-01-01' },
        ],
        lecturers: [
          { id: 'lec001', name: 'Nguyễn Văn A', email: 'lecturer@gmail.com', role: 'LECTURER', avatar: null, department: 'Computer Science', createdAt: '2025-01-01' },
          { id: 'lec002', name: 'Trần Thị B', email: 'lecturer2@gmail.com', role: 'LECTURER', avatar: null, department: 'Software Engineering', createdAt: '2025-01-01' },
        ],
        students: [
          { id: 'stu001', name: 'Lê Văn C', email: 'student@gmail.com', role: 'STUDENT', avatar: null, studentId: 'SE2026001', createdAt: '2025-01-01' },
          { id: 'stu002', name: 'Phạm Thị D', email: 'student2@gmail.com', role: 'STUDENT', avatar: null, studentId: 'SE2026002', createdAt: '2025-01-01' },
          { id: 'stu003', name: 'Hoàng Văn E', email: 'student3@gmail.com', role: 'STUDENT', avatar: null, studentId: 'SE2026003', createdAt: '2025-01-01' },
          { id: 'stu004', name: 'David Brown', email: 'david.brown@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026004', createdAt: '2025-01-01' },
          { id: 'stu005', name: 'Emma Miller', email: 'emma.miller@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026005', createdAt: '2025-01-01' },
        ]
      },

      // Course-Lecturer assignments: Mỗi course chỉ có 1 giảng viên PRIMARY
      courseLecturers: [
        // Lecturer 1 teaches multiple SWD courses
        { id: 'cl1', courseId: 'course-se1821', lecturerId: 'lec001', role: 'PRIMARY', assignedAt: '2025-12-01' },
        { id: 'cl2', courseId: 'course-se1822', lecturerId: 'lec001', role: 'PRIMARY', assignedAt: '2025-12-01' },
        { id: 'cl3', courseId: 'course-se1823', lecturerId: 'lec001', role: 'PRIMARY', assignedAt: '2025-12-01' },

        // Lecturer 2 teaches EXE and PRN courses
        { id: 'cl4', courseId: 'course-exe1821', lecturerId: 'lec002', role: 'PRIMARY', assignedAt: '2025-12-01' },
        { id: 'cl5', courseId: 'course-prn1821', lecturerId: 'lec002', role: 'PRIMARY', assignedAt: '2025-12-01' },
      ],

      courseEnrollments: [
        { id: 'ce1', courseId: 'course-se1821', studentId: 'stu001', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce2', courseId: 'course-se1821', studentId: 'stu002', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce3', courseId: 'course-se1822', studentId: 'stu003', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce4', courseId: 'course-exe1821', studentId: 'stu004', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce5', courseId: 'course-prn1821', studentId: 'stu005', enrolledAt: '2025-12-15', status: 'ACTIVE' },
      ],

      projects: [
        { id: 'proj1', courseId: 'course-se1821', name: 'E-commerce Platform', description: 'Build a full-stack e-commerce platform', status: 'ACTIVE', startDate: '2026-01-15', endDate: '2026-04-10', createdAt: '2026-01-10' },
        { id: 'proj2', courseId: 'course-se1822', name: 'Task Management System', description: 'Create a task management application', status: 'ACTIVE', startDate: '2026-01-15', endDate: '2026-04-10', createdAt: '2026-01-10' },
        { id: 'proj3', courseId: 'course-exe1821', name: 'AI Chatbot', description: 'Develop an AI-powered chatbot', status: 'ACTIVE', startDate: '2026-01-20', endDate: '2026-04-15', createdAt: '2026-01-15' },
      ],

      teamMembers: [
        { id: 'tm1', projectId: 'proj1', studentId: 'stu001', roleInTeam: 'LEADER', responsibility: 'Backend Development', status: 'ACTIVE', contributionScore: 95, joinedAt: '2026-01-12' },
        { id: 'tm2', projectId: 'proj1', studentId: 'stu002', roleInTeam: 'MEMBER', responsibility: 'Frontend Development', status: 'ACTIVE', contributionScore: 88, joinedAt: '2026-01-12' },
        { id: 'tm3', projectId: 'proj1', studentId: 'stu003', roleInTeam: 'MEMBER', responsibility: 'UI/UX Design', status: 'ACTIVE', contributionScore: 92, joinedAt: '2026-01-12' },
        { id: 'tm4', projectId: 'proj2', studentId: 'stu002', roleInTeam: 'LEADER', responsibility: 'Full Stack Development', status: 'ACTIVE', contributionScore: 90, joinedAt: '2026-01-12' },
        { id: 'tm5', projectId: 'proj3', studentId: 'stu004', roleInTeam: 'LEADER', responsibility: 'AI/ML Development', status: 'ACTIVE', contributionScore: 93, joinedAt: '2026-01-15' },
        { id: 'tm6', projectId: 'proj3', studentId: 'stu005', roleInTeam: 'MEMBER', responsibility: 'Data Processing', status: 'ACTIVE', contributionScore: 87, joinedAt: '2026-01-15' },
      ],

      projectIntegrations: [
        { id: 'pi1', projectId: 'proj1', jiraKey: 'ECOM', jiraUrl: 'https://university.atlassian.net/browse/ECOM', githubRepo: 'ecommerce-platform', githubUrl: 'https://github.com/university/ecommerce-platform', syncStatus: 'SUCCESS', lastSyncAt: '2026-01-28T09:00:00Z' },
        { id: 'pi2', projectId: 'proj2', jiraKey: 'TASK', jiraUrl: 'https://university.atlassian.net/browse/TASK', githubRepo: 'task-management', githubUrl: 'https://github.com/university/task-management', syncStatus: 'SUCCESS', lastSyncAt: '2026-01-28T08:30:00Z' },
        { id: 'pi3', projectId: 'proj3', jiraKey: 'AI', jiraUrl: 'https://university.atlassian.net/browse/AI', githubRepo: 'ai-chatbot', githubUrl: 'https://github.com/university/ai-chatbot', syncStatus: 'ERROR', lastSyncAt: '2026-01-27T15:45:00Z' },
      ],

      studentLinks: [
        { id: 'sl1', studentId: 'stu001', courseId: 'course-se1821', githubAccountUrl: 'https://github.com/alicejohnson', jiraAccountUrl: 'https://university.atlassian.net/secure/ViewProfile.jspa?name=alicejohnson', status: 'CONFIRMED', confirmedByLecturerId: 'lec001', updatedAt: '2026-01-15T10:00:00Z' },
        { id: 'sl2', studentId: 'stu002', courseId: 'course-se1821', githubAccountUrl: 'https://github.com/bobwilson', jiraAccountUrl: 'https://university.atlassian.net/secure/ViewProfile.jspa?name=bobwilson', status: 'PENDING', confirmedByLecturerId: null, updatedAt: '2026-01-20T14:30:00Z' },
        { id: 'sl3', studentId: 'stu003', courseId: 'course-se1822', githubAccountUrl: 'https://github.com/caroldavis', jiraAccountUrl: 'https://university.atlassian.net/secure/ViewProfile.jspa?name=caroldavis', status: 'REJECTED', confirmedByLecturerId: 'lec001', updatedAt: '2026-01-18T16:20:00Z', rejectionReason: 'Invalid GitHub URL' },
      ],

      commits: [
        { id: 'c1', projectId: 'proj1', repo: 'ecommerce-platform', sha: 'abc123', message: 'Add user authentication module', authorStudentId: 'stu001', committedAt: '2026-01-27T10:30:00Z' },
        { id: 'c2', projectId: 'proj1', repo: 'ecommerce-platform', sha: 'def456', message: 'Fix login validation bug', authorStudentId: 'stu002', committedAt: '2026-01-27T14:15:00Z' },
        { id: 'c3', projectId: 'proj1', repo: 'ecommerce-platform', sha: 'ghi789', message: 'Update product catalog UI', authorStudentId: 'stu003', committedAt: '2026-01-26T16:45:00Z' },
        { id: 'c4', projectId: 'proj2', repo: 'task-management', sha: 'jkl012', message: 'Implement task creation API', authorStudentId: 'stu002', committedAt: '2026-01-27T09:20:00Z' },
        { id: 'c5', projectId: 'proj3', repo: 'ai-chatbot', sha: 'mno345', message: 'Add natural language processing', authorStudentId: 'stu004', committedAt: '2026-01-25T11:00:00Z' },
      ],

      srsReports: [
        { id: 'srs1', projectId: 'proj1', version: '1.0', status: 'FINAL', submittedByStudentId: 'stu001', submittedAt: '2026-01-20T10:00:00Z', fileName: 'SRS_Ecommerce_v1.0.pdf' },
        { id: 'srs2', projectId: 'proj1', version: '1.1', status: 'DRAFT', submittedByStudentId: 'stu001', submittedAt: '2026-01-25T15:30:00Z', fileName: 'SRS_Ecommerce_v1.1_draft.pdf' },
        { id: 's3', projectId: 'proj2', version: '1.0', status: 'REVIEW', submittedByStudentId: 'stu002', submittedAt: '2026-01-24T09:15:00Z', fileName: 'SRS_TaskManagement_v1.0.pdf' },
      ],
    };

    this.save();
  }

  save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
  }

  // Reset database to fresh data
  reset() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.initializeData();
  }

  // Generic CRUD operations
  create(collection, item) {
    const newItem = { ...item, id: this.generateId() };
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    this.data[collection].push(newItem);
    this.save();
    return newItem;
  }

  findById(collection, id) {
    const items = Array.isArray(this.data[collection]) ? this.data[collection] : [];
    return items.find(item => item.id === id);
  }

  findMany(collection, filter = {}) {
    let items = Array.isArray(this.data[collection]) ? this.data[collection] : [];

    Object.keys(filter).forEach(key => {
      if (filter[key] !== undefined && filter[key] !== null) {
        items = items.filter(item => item[key] === filter[key]);
      }
    });

    return items;
  }

  update(collection, id, updates) {
    const items = this.data[collection];
    if (!Array.isArray(items)) return null;

    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;

    items[index] = { ...items[index], ...updates };
    this.save();
    return items[index];
  }

  delete(collection, id) {
    const items = this.data[collection];
    if (!Array.isArray(items)) return false;

    const index = items.findIndex(item => item.id === id);
    if (index === -1) return false;

    items.splice(index, 1);
    this.save();
    return true;
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Specialized queries
  getCourseStudents(courseId) {
    const enrollments = this.findMany('courseEnrollments', { courseId });
    return enrollments.map(e => this.findById('users.students', e.studentId)).filter(Boolean);
  }

  getCourseLecturers(courseId) {
    const assignments = this.findMany('courseLecturers', { courseId });
    return assignments.map(a => this.findById('users.lecturers', a.lecturerId)).filter(Boolean);
  }

  getProjectTeam(projectId) {
    return this.findMany('teamMembers', { projectId });
  }

  getProjectCommits(projectId, limit = 50) {
    return this.findMany('commits', { projectId })
      .sort((a, b) => new Date(b.committedAt) - new Date(a.committedAt))
      .slice(0, limit);
  }

  getStudentProjects(studentId) {
    const teamMemberships = this.findMany('teamMembers', { studentId });
    return teamMemberships.map(tm => this.findById('projects', tm.projectId)).filter(Boolean);
  }

  getStudentLinks(studentId, courseId = null) {
    const filter = { studentId };
    if (courseId) filter.courseId = courseId;
    return this.findMany('studentLinks', filter);
  }

  // Analytics methods
  getCommitsStats(courseId, startDate, endDate) {
    const courseProjects = this.findMany('projects', { courseId });
    const projectIds = courseProjects.map(p => p.id);

    const commits = this.data.commits.filter(commit =>
      projectIds.includes(commit.projectId) &&
      new Date(commit.committedAt) >= new Date(startDate) &&
      new Date(commit.committedAt) <= new Date(endDate)
    );

    return {
      total: commits.length,
      byProject: projectIds.map(projectId => ({
        projectId,
        count: commits.filter(c => c.projectId === projectId).length
      })),
      byStudent: commits.reduce((acc, commit) => {
        acc[commit.authorStudentId] = (acc[commit.authorStudentId] || 0) + 1;
        return acc;
      }, {})
    };
  }

  getActiveStudents(courseId, days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const courseProjects = this.findMany('projects', { courseId });
    const projectIds = courseProjects.map(p => p.id);

    const recentCommits = this.data.commits.filter(commit =>
      projectIds.includes(commit.projectId) &&
      new Date(commit.committedAt) >= cutoffDate
    );

    return [...new Set(recentCommits.map(c => c.authorStudentId))];
  }

  getSilentProjects(courseId, days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const courseProjects = this.findMany('projects', { courseId });

    return courseProjects.filter(project => {
      const lastCommit = this.data.commits
        .filter(c => c.projectId === project.id)
        .sort((a, b) => new Date(b.committedAt) - new Date(a.committedAt))[0];

      return !lastCommit || new Date(lastCommit.committedAt) < cutoffDate;
    });
  }
}

// Export singleton instance
export const db = new MockDB();
export default db;
