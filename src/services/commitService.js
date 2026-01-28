// Commit Service - Business logic for commit management
import db from '../mock/db.js';

export const commitService = {
  // Get commits with filters
  getCommits(filters = {}) {
    let commits = db.findMany('commits', filters);
    
    // Enrich with related data
    return commits.map(commit => ({
      ...commit,
      project: db.findById('projects', commit.projectId),
      author: db.findById('users.students', commit.authorStudentId),
      integration: db.findMany('projectIntegrations', { projectId: commit.projectId })[0]
    }));
  },

  // Get commits for project
  getProjectCommits(projectId, limit = 50) {
    return this.getCommits({ projectId })
      .sort((a, b) => new Date(b.committedAt) - new Date(a.committedAt))
      .slice(0, limit);
  },

  // Get commits by student
  getStudentCommits(studentId, courseId = null, limit = 50) {
    let filters = { authorStudentId: studentId };
    
    if (courseId) {
      // Get projects in this course
      const courseProjects = db.findMany('projects', { courseId });
      const projectIds = courseProjects.map(p => p.id);
      
      return this.getCommits(filters)
        .filter(commit => projectIds.includes(commit.projectId))
        .sort((a, b) => new Date(b.committedAt) - new Date(a.committedAt))
        .slice(0, limit);
    }
    
    return this.getCommits(filters)
      .sort((a, b) => new Date(b.committedAt) - new Date(a.committedAt))
      .slice(0, limit);
  },

  // Get commits for course
  getCourseCommits(courseId, startDate, endDate, limit = 200) {
    const courseProjects = db.findMany('projects', { courseId });
    const projectIds = courseProjects.map(p => p.id);
    
    let commits = this.getCommits()
      .filter(commit => projectIds.includes(commit.projectId));
    
    if (startDate) {
      commits = commits.filter(commit => new Date(commit.committedAt) >= new Date(startDate));
    }
    
    if (endDate) {
      commits = commits.filter(commit => new Date(commit.committedAt) <= new Date(endDate));
    }
    
    return commits
      .sort((a, b) => new Date(b.committedAt) - new Date(a.committedAt))
      .slice(0, limit);
  },

  // Sync commits for project (mock implementation)
  syncCommits(projectId, options = {}) {
    const project = db.findById('projects', projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const integration = db.findMany('projectIntegrations', { projectId })[0];
    if (!integration) {
      throw new Error('Project integration not found');
    }

    const teamMembers = db.getProjectTeam(projectId);
    if (teamMembers.length === 0) {
      throw new Error('No team members found for this project');
    }

    // Mock commit messages based on project type
    const commitTemplates = {
      'ecommerce': [
        'Add product catalog feature',
        'Implement shopping cart functionality',
        'Fix payment gateway integration',
        'Update user authentication',
        'Optimize database queries',
        'Add responsive design',
        'Fix checkout process bug',
        'Update product search algorithm'
      ],
      'task-management': [
        'Add task creation API',
        'Implement drag-and-drop functionality',
        'Fix task assignment bug',
        'Add task filtering options',
        'Update task status workflow',
        'Improve performance',
        'Add real-time updates',
        'Fix notification system'
      ],
      'ai-chatbot': [
        'Add natural language processing',
        'Implement machine learning model',
        'Fix conversation context handling',
        'Add sentiment analysis',
        'Update response generation',
        'Optimize AI model performance',
        'Add multi-language support',
        'Fix training data pipeline'
      ]
    };

    // Determine template based on project name
    let template = commitTemplates['task-management']; // default
    const projectName = project.name.toLowerCase();
    if (projectName.includes('ecommerce')) {
      template = commitTemplates['ecommerce'];
    } else if (projectName.includes('ai') || projectName.includes('chatbot')) {
      template = commitTemplates['ai-chatbot'];
    }

    const newCommits = [];
    const commitCount = options.commitCount || Math.floor(Math.random() * 8) + 3;
    
    for (let i = 0; i < commitCount; i++) {
      const randomMember = teamMembers[Math.floor(Math.random() * teamMembers.length)];
      const randomMessage = template[Math.floor(Math.random() * template.length)];
      
      // Generate random timestamp within last 7 days
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      
      const commit = db.create('commits', {
        projectId,
        repo: integration.githubRepo,
        sha: this.generateCommitSha(),
        message: randomMessage,
        authorStudentId: randomMember.studentId,
        committedAt: timestamp.toISOString()
      });
      
      newCommits.push({
        ...commit,
        project,
        author: randomMember.student,
        integration
      });
    }

    // Update integration sync status
    db.update('projectIntegrations', integration.id, {
      syncStatus: 'SUCCESS',
      lastSyncAt: new Date().toISOString()
    });

    return {
      success: true,
      commitsAdded: newCommits.length,
      lastSyncAt: new Date().toISOString(),
      commits: newCommits.sort((a, b) => new Date(b.committedAt) - new Date(a.committedAt))
    };
  },

  // Sync commits for student (student-initiated)
  syncStudentCommits(studentId, projectId) {
    const project = db.findById('projects', projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check if student is a team member
    const teamMember = db.findMany('teamMembers', { 
      projectId, 
      studentId 
    });
    if (teamMember.length === 0) {
      throw new Error('Student is not a team member of this project');
    }

    // Generate commits primarily for this student
    const integration = db.findMany('projectIntegrations', { projectId })[0];
    const student = db.findById('users.students', studentId);
    
    const studentCommitMessages = [
      'Fix bug in my assigned feature',
      'Update implementation based on feedback',
      'Add unit tests for my module',
      'Refactor code for better performance',
      'Update documentation',
      'Fix styling issues',
      'Add error handling',
      'Optimize algorithm'
    ];

    const newCommits = [];
    const commitCount = Math.floor(Math.random() * 5) + 2;
    
    for (let i = 0; i < commitCount; i++) {
      const randomMessage = studentCommitMessages[Math.floor(Math.random() * studentCommitMessages.length)];
      const timestamp = new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000); // Last 3 days
      
      const commit = db.create('commits', {
        projectId,
        repo: integration.githubRepo,
        sha: this.generateCommitSha(),
        message: randomMessage,
        authorStudentId: studentId,
        committedAt: timestamp.toISOString()
      });
      
      newCommits.push({
        ...commit,
        project,
        author: student,
        integration
      });
    }

    // Update integration sync status
    db.update('projectIntegrations', integration.id, {
      syncStatus: 'SUCCESS',
      lastSyncAt: new Date().toISOString()
    });

    return {
      success: true,
      commitsAdded: newCommits.length,
      lastSyncAt: new Date().toISOString(),
      commits: newCommits.sort((a, b) => new Date(b.committedAt) - new Date(a.committedAt))
    };
  },

  // Get commit statistics
  getCommitStats(filters = {}) {
    let commits = this.getCommits(filters);
    
    const stats = {
      total: commits.length,
      byProject: {},
      byStudent: {},
      byDate: {},
      recentActivity: []
    };

    // Group by project
    commits.forEach(commit => {
      if (!stats.byProject[commit.projectId]) {
        stats.byProject[commit.projectId] = {
          project: commit.project,
          count: 0,
          students: new Set()
        };
      }
      stats.byProject[commit.projectId].count++;
      stats.byProject[commit.projectId].students.add(commit.authorStudentId);
    });

    // Group by student
    commits.forEach(commit => {
      if (!stats.byStudent[commit.authorStudentId]) {
        stats.byStudent[commit.authorStudentId] = {
          student: commit.author,
          count: 0,
          projects: new Set()
        };
      }
      stats.byStudent[commit.authorStudentId].count++;
      stats.byStudent[commit.authorStudentId].projects.add(commit.projectId);
    });

    // Group by date
    commits.forEach(commit => {
      const date = commit.committedAt.split('T')[0];
      stats.byDate[date] = (stats.byDate[date] || 0) + 1;
    });

    // Recent activity (last 10 commits)
    stats.recentActivity = commits
      .sort((a, b) => new Date(b.committedAt) - new Date(a.committedAt))
      .slice(0, 10);

    return stats;
  },

  // Get activity trends for charts
  getActivityTrends(projectId = null, courseId = null, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let commits = this.getCommits();
    
    if (projectId) {
      commits = commits.filter(c => c.projectId === projectId);
    } else if (courseId) {
      const courseProjects = db.findMany('projects', { courseId });
      const projectIds = courseProjects.map(p => p.id);
      commits = commits.filter(c => projectIds.includes(c.projectId));
    }

    commits = commits.filter(c => new Date(c.committedAt) >= startDate);

    // Generate daily data
    const dailyData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      dailyData.push({
        date: dateStr,
        commits: commits.filter(c => c.committedAt.split('T')[0] === dateStr).length
      });
    }

    return dailyData;
  },

  // Get silent projects (no commits in X days)
  getSilentProjects(courseId = null, days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let projects = db.findMany('projects');
    if (courseId) {
      projects = projects.filter(p => p.courseId === courseId);
    }

    return projects.filter(project => {
      const lastCommit = db.findMany('commits', { projectId: project.id })
        .sort((a, b) => new Date(b.committedAt) - new Date(a.committedAt))[0];
      
      return !lastCommit || new Date(lastCommit.committedAt) < cutoffDate;
    }).map(project => ({
      ...project,
      lastCommit: db.findMany('commits', { projectId: project.id })
        .sort((a, b) => new Date(b.committedAt) - new Date(a.committedAt))[0],
      daysSinceLastCommit: lastCommit ? 
        Math.floor((new Date() - new Date(lastCommit.committedAt)) / (1000 * 60 * 60 * 24)) : 
        null
    }));
  },

  // Get inactive students (no commits in X days)
  getInactiveStudents(courseId = null, days = 14) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let students = db.findMany('users.students');
    if (courseId) {
      const enrolledStudents = db.getCourseStudents(courseId);
      students = enrolledStudents;
    }

    return students.filter(student => {
      const recentCommits = db.findMany('commits', { authorStudentId: student.id })
        .filter(commit => new Date(commit.committedAt) >= cutoffDate);
      
      return recentCommits.length === 0;
    }).map(student => {
      const lastCommit = db.findMany('commits', { authorStudentId: student.id })
        .sort((a, b) => new Date(b.committedAt) - new Date(a.committedAt))[0];
      
      return {
        ...student,
        lastCommit,
        daysSinceLastCommit: lastCommit ? 
          Math.floor((new Date() - new Date(lastCommit.committedAt)) / (1000 * 60 * 60 * 24)) : 
          null
      };
    });
  },

  // Generate random commit SHA
  generateCommitSha() {
    return Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
  }
};
