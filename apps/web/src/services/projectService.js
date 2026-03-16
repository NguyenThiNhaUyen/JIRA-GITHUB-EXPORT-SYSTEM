import client from '../api/client.js';
import { unwrap } from '../api/unwrap.js';

export const projectService = {
  async getProjects(filters = {}) {
    const res = await client.get('/projects', { params: filters });
    return unwrap(res) || [];
  },

  async getProjectById(projectId) {
    const res = await client.get(`/projects/${projectId}`);
    return unwrap(res);
  },

  async createProject(projectData) {
    const res = await client.post('/projects', projectData);
    return unwrap(res);
  },

  async updateProject(projectId, updates) {
    const res = await client.put(`/projects/${projectId}`, updates);
    return unwrap(res);
  },

  async deleteProject(projectId) {
    const res = await client.delete(`/projects/${projectId}`);
    return unwrap(res);
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

  async syncCommits(projectId) {
    const res = await client.post(`/projects/${projectId}/sync-commits`);
    return unwrap(res);
  },

  async getProjectStats(projectId) {
    const res = await client.get(`/analytics/projects/${projectId}/stats`);
    return unwrap(res);
  },

  async getCourseProjects(courseId, filters = {}) {
    const res = await client.get(`/courses/${courseId}/projects`, { params: filters });
    return unwrap(res) || [];
  }
};
