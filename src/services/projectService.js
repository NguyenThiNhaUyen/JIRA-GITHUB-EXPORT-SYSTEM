// Project Service - Business logic for project management
import db from '../mock/db.js';

export const projectService = {
  // Get all projects with optional filters
  getProjects(filters = {}) {
    let projects = db.findMany('projects', filters);
    
    // Enrich with related data
    return projects.map(project => ({
      ...project,
      course: db.findById('courses', project.courseId),
      team: db.getProjectTeam(project.id),
      integration: db.findMany('projectIntegrations', { projectId: project.id })[0],
      commits: db.getProjectCommits(project.id, 10),
      srsReports: db.findMany('srsReports', { projectId: project.id })
    }));
  },

  // Get single project by ID
  getProjectById(projectId) {
    const project = db.findById('projects', projectId);
    if (!project) return null;

    return {
      ...project,
      course: db.findById('courses', project.courseId),
      team: db.getProjectTeam(project.id).map(member => ({
        ...member,
        student: db.findById('users.students', member.studentId),
        links: db.getStudentLinks(member.studentId, project.courseId)
      })),
      integration: db.findMany('projectIntegrations', { projectId: project.id })[0],
      commits: db.getProjectCommits(project.id),
      srsReports: db.findMany('srsReports', { projectId: project.id })
    };
  },

  // Create new project
  createProject(projectData) {
    const required = ['courseId', 'name', 'description', 'startDate', 'endDate'];
    for (const field of required) {
      if (!projectData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate course exists
    const course = db.findById('courses', projectData.courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Validate dates
    if (new Date(projectData.endDate) <= new Date(projectData.startDate)) {
      throw new Error('End date must be after start date');
    }

    const project = db.create('projects', {
      ...projectData,
      status: projectData.status || 'ACTIVE',
      createdAt: new Date().toISOString()
    });

    // Create integration record
    db.create('projectIntegrations', {
      projectId: project.id,
      jiraKey: projectData.jiraKey || `PROJ${project.id.toUpperCase()}`,
      jiraUrl: projectData.jiraUrl || `https://university.atlassian.net/browse/PROJ${project.id.toUpperCase()}`,
      githubRepo: projectData.githubRepo || `project-${project.id}`,
      githubUrl: projectData.githubUrl || `https://github.com/university/project-${project.id}`,
      syncStatus: 'PENDING',
      lastSyncAt: null
    });

    return this.getProjectById(project.id);
  },

  // Update project
  updateProject(projectId, updates) {
    const project = db.findById('projects', projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Validate date logic if dates are being updated
    if (updates.startDate || updates.endDate) {
      const startDate = updates.startDate || project.startDate;
      const endDate = updates.endDate || project.endDate;
      if (new Date(endDate) <= new Date(startDate)) {
        throw new Error('End date must be after start date');
      }
    }

    db.update('projects', projectId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    return this.getProjectById(projectId);
  },

  // Delete project
  deleteProject(projectId) {
    const project = db.findById('projects', projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Remove team members
    const teamMembers = db.findMany('teamMembers', { projectId });
    teamMembers.forEach(member => {
      db.delete('teamMembers', member.id);
    });

    // Remove integration
    const integration = db.findMany('projectIntegrations', { projectId });
    integration.forEach(int => {
      db.delete('projectIntegrations', int.id);
    });

    // Remove commits (optional - might want to keep for history)
    const commits = db.findMany('commits', { projectId });
    commits.forEach(commit => {
      db.delete('commits', commit.id);
    });

    // Remove SRS reports
    const srsReports = db.findMany('srsReports', { projectId });
    srsReports.forEach(report => {
      db.delete('srsReports', report.id);
    });

    return db.delete('projects', projectId);
  },

  // Add team member
  addTeamMember(projectId, studentId, roleInTeam = 'MEMBER', responsibility = '') {
    const project = db.findById('projects', projectId);
    const student = db.findById('users.students', studentId);
    
    if (!project) throw new Error('Project not found');
    if (!student) throw new Error('Student not found');

    // Check if already a member
    const existing = db.findMany('teamMembers', { projectId, studentId });
    if (existing.length > 0) {
      throw new Error('Student is already a team member');
    }

    // Check if student is enrolled in the course
    const enrollment = db.findMany('courseEnrollments', { 
      courseId: project.courseId, 
      studentId 
    });
    if (enrollment.length === 0) {
      throw new Error('Student must be enrolled in the course to join project');
    }

    // If setting as leader, remove existing leader
    if (roleInTeam === 'LEADER') {
      const currentLeader = db.findMany('teamMembers', { 
        projectId, 
        roleInTeam: 'LEADER' 
      });
      currentLeader.forEach(leader => {
        db.update('teamMembers', leader.id, { roleInTeam: 'MEMBER' });
      });
    }

    const teamMember = db.create('teamMembers', {
      projectId,
      studentId,
      roleInTeam,
      responsibility,
      status: 'ACTIVE',
      contributionScore: 0,
      joinedAt: new Date().toISOString()
    });

    return {
      ...teamMember,
      student,
      project
    };
  },

  // Remove team member
  removeTeamMember(projectId, studentId) {
    const members = db.findMany('teamMembers', { projectId, studentId });
    if (members.length === 0) {
      throw new Error('Student is not a team member');
    }

    members.forEach(member => {
      db.update('teamMembers', member.id, { 
        status: 'LEFT',
        leftAt: new Date().toISOString()
      });
    });

    return true;
  },

  // Update team member
  updateTeamMember(projectId, studentId, updates) {
    const members = db.findMany('teamMembers', { projectId, studentId });
    if (members.length === 0) {
      throw new Error('Student is not a team member');
    }

    const member = members[0];

    // If setting as leader, remove existing leader
    if (updates.roleInTeam === 'LEADER' && member.roleInTeam !== 'LEADER') {
      const currentLeader = db.findMany('teamMembers', { 
        projectId, 
        roleInTeam: 'LEADER' 
      });
      currentLeader.forEach(leader => {
        if (leader.id !== member.id) {
          db.update('teamMembers', leader.id, { roleInTeam: 'MEMBER' });
        }
      });
    }

    db.update('teamMembers', member.id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    return db.findById('teamMembers', member.id);
  },

  // Sync commits (mock implementation)
  syncCommits(projectId) {
    const project = db.findById('projects', projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const integration = db.findMany('projectIntegrations', { projectId })[0];
    if (!integration) {
      throw new Error('Project integration not found');
    }

    // Mock sync - generate some random commits
    const teamMembers = db.getProjectTeam(projectId);
    const commitMessages = [
      'Fix bug in authentication',
      'Add new feature to dashboard',
      'Update documentation',
      'Refactor code structure',
      'Improve performance',
      'Add unit tests',
      'Fix responsive design issues',
      'Update dependencies',
      'Add error handling',
      'Optimize database queries'
    ];

    const newCommits = [];
    for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
      const randomMember = teamMembers[Math.floor(Math.random() * teamMembers.length)];
      const randomMessage = commitMessages[Math.floor(Math.random() * commitMessages.length)];
      
      const commit = db.create('commits', {
        projectId,
        repo: integration.githubRepo,
        sha: Math.random().toString(36).substr(2, 9),
        message: randomMessage,
        authorStudentId: randomMember.studentId,
        committedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      });
      newCommits.push(commit);
    }

    // Update integration sync status
    db.update('projectIntegrations', integration.id, {
      syncStatus: 'SUCCESS',
      lastSyncAt: new Date().toISOString()
    });

    return {
      success: true,
      commitsAdded: newCommits.length,
      lastSyncAt: new Date().toISOString()
    };
  },

  // Get project statistics
  getProjectStats(projectId) {
    const project = db.getProjectById(projectId);
    if (!project) return null;

    const commits = project.commits || [];
    const team = project.team || [];
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentCommits = commits.filter(c => new Date(c.committedAt) >= sevenDaysAgo);
    const activeMembers = [...new Set(recentCommits.map(c => c.authorStudentId))];
    
    const inactiveMembers = team.filter(member => 
      !activeMembers.includes(member.studentId) && member.status === 'ACTIVE'
    );

    return {
      totalCommits: commits.length,
      recentCommits: recentCommits.length,
      totalMembers: team.length,
      activeMembers: activeMembers.length,
      inactiveMembers: inactiveMembers.length,
      lastCommit: commits.length > 0 ? commits[0].committedAt : null,
      syncStatus: project.integration?.syncStatus || 'UNKNOWN',
      lastSync: project.integration?.lastSyncAt || null
    };
  },

  // Get projects by course with filters
  getCourseProjects(courseId, filters = {}) {
    const projects = this.getProjects({ courseId });
    
    if (filters.syncStatus) {
      return projects.filter(p => p.integration?.syncStatus === filters.syncStatus);
    }

    if (filters.hasRecentCommits) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return projects.filter(p => 
        p.commits.some(c => new Date(c.committedAt) >= sevenDaysAgo)
      );
    }

    if (filters.hasInactiveMembers) {
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      return projects.filter(p => {
        const recentCommits = p.commits.filter(c => new Date(c.committedAt) >= fourteenDaysAgo);
        const activeMembers = [...new Set(recentCommits.map(c => c.authorStudentId))];
        return p.team.some(member => 
          member.status === 'ACTIVE' && !activeMembers.includes(member.studentId)
        );
      });
    }

    return projects;
  }
};
