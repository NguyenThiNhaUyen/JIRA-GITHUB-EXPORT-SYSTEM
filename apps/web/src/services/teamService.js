import client from '../api/client.js';
import { unwrap } from '../api/unwrap.js';

export const teamService = {
  async getProjectTeam(projectId) {
    const res = await client.get(`/projects/${projectId}/team`);
    return unwrap(res) || [];
  },

  async addTeamMember(projectId, studentId, roleInTeam = 'MEMBER', responsibility = '') {
    const res = await client.post(`/projects/${projectId}/team`, { studentId, roleInTeam, responsibility });
    return unwrap(res);
  },

  async removeTeamMember(projectId, studentId) {
    const res = await client.delete(`/projects/${projectId}/team/${studentId}`);
    return unwrap(res);
  },

  async updateTeamMember(projectId, studentId, updates) {
    const res = await client.put(`/projects/${projectId}/team/${studentId}`, updates);
    return unwrap(res);
  },

  async setTeamLeader(projectId, studentId) {
    const res = await client.put(`/projects/${projectId}/team/${studentId}/leader`);
    return unwrap(res);
  },

  async getAvailableStudents(projectId) {
    const res = await client.get(`/projects/${projectId}/available-students`);
    return unwrap(res) || [];
  },

  async getTeamStats(projectId) {
    const res = await client.get(`/analytics/projects/${projectId}/team-stats`);
    return unwrap(res);
  },

  async updateContributionScores(projectId, scores) {
    const res = await client.put(`/projects/${projectId}/team-scores`, { scores });
    return unwrap(res);
  },

  async getMemberActivity(projectId, studentId, days = 30) {
    const res = await client.get(`/analytics/projects/${projectId}/members/${studentId}/activity`, { params: { days } });
    return unwrap(res);
  },

  async inviteStudentToTeam(projectId, inviterStudentId, invitedStudentId, message = '') {
    const res = await client.post(`/projects/${projectId}/invitations`, { invitedStudentId, message });
    return unwrap(res);
  },

  async acceptInvitation(invitationId, studentId) {
    const res = await client.post(`/invitations/${invitationId}/accept`);
    return unwrap(res);
  },

  async rejectInvitation(invitationId, studentId, reason = '') {
    const res = await client.post(`/invitations/${invitationId}/reject`, { reason });
    return unwrap(res);
  },

  async getPendingInvitations(studentId) {
    const res = await client.get(`/users/student/${studentId}/invitations`, { params: { status: 'PENDING' } });
    return unwrap(res) || [];
  }
};
