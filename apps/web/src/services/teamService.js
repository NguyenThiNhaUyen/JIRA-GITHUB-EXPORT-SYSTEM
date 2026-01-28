// Team Service - Business logic for team management
import db from '../mock/db.js';

export const teamService = {
  // Get team members for a project
  getProjectTeam(projectId) {
    const project = db.findById('projects', projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const teamMembers = db.getProjectTeam(projectId);
    
    return teamMembers.map(member => ({
      ...member,
      student: db.findById('users.students', member.studentId),
      links: db.getStudentLinks(member.studentId, project.courseId),
      recentCommits: db.findMany('commits', { 
        projectId, 
        authorStudentId: member.studentId 
      }).sort((a, b) => new Date(b.committedAt) - new Date(a.committedAt)).slice(0, 5)
    }));
  },

  // Add member to team
  addTeamMember(projectId, studentId, roleInTeam = 'MEMBER', responsibility = '') {
    return projectService.addTeamMember(projectId, studentId, roleInTeam, responsibility);
  },

  // Remove member from team
  removeTeamMember(projectId, studentId) {
    return projectService.removeTeamMember(projectId, studentId);
  },

  // Update team member
  updateTeamMember(projectId, studentId, updates) {
    return projectService.updateTeamMember(projectId, studentId, updates);
  },

  // Set team leader
  setTeamLeader(projectId, studentId) {
    const project = db.findById('projects', projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check if student is a team member
    const member = db.findMany('teamMembers', { projectId, studentId });
    if (member.length === 0) {
      throw new Error('Student is not a team member');
    }

    // Remove existing leader
    const currentLeader = db.findMany('teamMembers', { 
      projectId, 
      roleInTeam: 'LEADER' 
    });
    currentLeader.forEach(leader => {
      db.update('teamMembers', leader.id, { roleInTeam: 'MEMBER' });
    });

    // Set new leader
    db.update('teamMembers', member[0].id, { 
      roleInTeam: 'LEADER',
      updatedAt: new Date().toISOString()
    });

    return db.findById('teamMembers', member[0].id);
  },

  // Get available students for team (enrolled in course but not in team)
  getAvailableStudents(projectId) {
    const project = db.findById('projects', projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const currentTeam = db.getProjectTeam(projectId).map(m => m.studentId);
    const enrolledStudents = db.getCourseStudents(project.courseId);
    
    return enrolledStudents.filter(student => !currentTeam.includes(student.id));
  },

  // Get team statistics
  getTeamStats(projectId) {
    const team = this.getProjectTeam(projectId);
    const project = db.getProjectById(projectId);
    
    if (!project) return null;

    const commits = project.commits || [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentCommits = commits.filter(c => new Date(c.committedAt) >= sevenDaysAgo);
    const activeMembers = [...new Set(recentCommits.map(c => c.authorStudentId))];
    
    const inactiveMembers = team.filter(member => 
      !activeMembers.includes(member.studentId) && member.status === 'ACTIVE'
    );

    const contributionStats = team.map(member => ({
      studentId: member.studentId,
      studentName: member.student.name,
      totalCommits: commits.filter(c => c.authorStudentId === member.studentId).length,
      recentCommits: recentCommits.filter(c => c.authorStudentId === member.studentId).length,
      contributionScore: member.contributionScore || 0,
      isActive: activeMembers.includes(member.studentId)
    }));

    return {
      totalMembers: team.length,
      activeMembers: activeMembers.length,
      inactiveMembers: inactiveMembers.length,
      totalCommits: commits.length,
      recentCommits: recentCommits.length,
      averageContribution: team.reduce((sum, m) => sum + (m.contributionScore || 0), 0) / team.length,
      contributionStats
    };
  },

  // Update contribution scores
  updateContributionScores(projectId, scores) {
    const team = db.getProjectTeam(projectId);
    
    Object.keys(scores).forEach(studentId => {
      const member = team.find(m => m.studentId === studentId);
      if (member) {
        db.update('teamMembers', member.id, {
          contributionScore: scores[studentId],
          updatedAt: new Date().toISOString()
        });
      }
    });

    return this.getProjectTeam(projectId);
  },

  // Get team member activity
  getMemberActivity(projectId, studentId, days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const commits = db.findMany('commits', { 
      projectId, 
      authorStudentId: studentId 
    }).filter(commit => new Date(commit.committedAt) >= cutoffDate);

    const member = db.findMany('teamMembers', { projectId, studentId });
    const student = db.findById('users.students', studentId);

    return {
      student,
      member: member[0],
      commits: commits.sort((a, b) => new Date(b.committedAt) - new Date(a.committedAt)),
      totalCommits: commits.length,
      averageCommitsPerDay: commits.length / days,
      lastCommit: commits.length > 0 ? commits[0].committedAt : null
    };
  },

  // Invite student to team (student-initiated)
  inviteStudentToTeam(projectId, inviterStudentId, invitedStudentId, message = '') {
    const project = db.findById('projects', projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check if inviter is a team member
    const inviterMember = db.findMany('teamMembers', { 
      projectId, 
      studentId: inviterStudentId 
    });
    if (inviterMember.length === 0) {
      throw new Error('Only team members can invite others');
    }

    // Check if invited student is enrolled in course
    const invitedStudent = db.findById('users.students', invitedStudentId);
    if (!invitedStudent) {
      throw new Error('Student not found');
    }

    const enrollment = db.findMany('courseEnrollments', { 
      courseId: project.courseId, 
      studentId: invitedStudentId 
    });
    if (enrollment.length === 0) {
      throw new Error('Student must be enrolled in the course to join project');
    }

    // Check if already invited or member
    const existingMember = db.findMany('teamMembers', { 
      projectId, 
      studentId: invitedStudentId 
    });
    if (existingMember.length > 0) {
      throw new Error('Student is already a team member');
    }

    // Create invitation (mock - in real app would send notification)
    const invitation = db.create('teamInvitations', {
      projectId,
      inviterStudentId,
      invitedStudentId,
      message,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });

    return {
      ...invitation,
      inviter: db.findById('users.students', inviterStudentId),
      invited: invitedStudent,
      project
    };
  },

  // Accept team invitation
  acceptInvitation(invitationId, studentId) {
    const invitation = db.findById('teamInvitations', invitationId);
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.invitedStudentId !== studentId) {
      throw new Error('You can only accept your own invitations');
    }

    if (invitation.status !== 'PENDING') {
      throw new Error('Invitation is no longer valid');
    }

    // Add to team
    const teamMember = this.addTeamMember(
      invitation.projectId, 
      studentId, 
      'MEMBER', 
      `Joined via invitation from ${invitation.inviterStudentId}`
    );

    // Update invitation status
    db.update('teamInvitations', invitationId, {
      status: 'ACCEPTED',
      respondedAt: new Date().toISOString()
    });

    return teamMember;
  },

  // Reject team invitation
  rejectInvitation(invitationId, studentId, reason = '') {
    const invitation = db.findById('teamInvitations', invitationId);
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.invitedStudentId !== studentId) {
      throw new Error('You can only reject your own invitations');
    }

    if (invitation.status !== 'PENDING') {
      throw new Error('Invitation is no longer valid');
    }

    db.update('teamInvitations', invitationId, {
      status: 'REJECTED',
      rejectionReason: reason,
      respondedAt: new Date().toISOString()
    });

    return true;
  },

  // Get pending invitations for a student
  getPendingInvitations(studentId) {
    const invitations = db.findMany('teamInvitations', { 
      invitedStudentId, 
      status: 'PENDING' 
    });

    return invitations.map(invitation => ({
      ...invitation,
      project: db.getProjectById(invitation.projectId),
      inviter: db.findById('users.students', invitation.inviterStudentId)
    }));
  }
};
