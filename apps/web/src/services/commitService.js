import client from '../api/client.js';
import { unwrap } from '../api/unwrap.js';

export const commitService = {
  async getCommits(filters = {}) {
    const res = await client.get('/commits', { params: filters });
    return unwrap(res) || [];
  },

  async getProjectCommits(projectId, limit = 50) {
    const res = await client.get(`/projects/${projectId}/commits`, { params: { pageSize: limit } });
    return unwrap(res) || [];
  },

  async getStudentCommits(studentId, courseId = null, limit = 50) {
    const res = await client.get(`/users/student/${studentId}/commits`, { params: { courseId, pageSize: limit } });
    return unwrap(res) || [];
  },

  async getCourseCommits(courseId, startDate, endDate, limit = 200) {
    const res = await client.get(`/courses/${courseId}/commits`, { params: { startDate, endDate, pageSize: limit } });
    return unwrap(res) || [];
  },

  async syncCommits(projectId, options = {}) {
    const res = await client.post(`/projects/${projectId}/sync-commits`, options);
    return unwrap(res);
  },

  async syncStudentCommits(studentId, projectId) {
    const res = await client.post(`/projects/${projectId}/sync-commits`, { studentId });
    return unwrap(res);
  },

  async getCommitStats(filters = {}) {
    const res = await client.get('/analytics/commit-stats', { params: filters });
    return unwrap(res);
  },

  async getActivityTrends(projectId = null, courseId = null, days = 30) {
    const res = await client.get('/analytics/commit-trends', { params: { projectId, courseId, days } });
    return unwrap(res) || [];
  },

  async getSilentProjects(courseId = null, days = 7) {
    const res = await client.get('/analytics/silent-projects', { params: { courseId, days } });
    return unwrap(res) || [];
  },

  async getInactiveStudents(courseId = null, days = 14) {
    const res = await client.get('/analytics/inactive-students', { params: { courseId, days } });
    return unwrap(res) || [];
  },

  generateCommitSha() {
    return Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
  }
};
