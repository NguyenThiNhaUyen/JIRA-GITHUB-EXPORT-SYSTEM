import client from '../api/client.js';
import { unwrap } from '../api/unwrap.js';

export const srsService = {
  async getSrsReports(filters = {}) {
    const res = await client.get('/reports/srs', { params: filters });
    return unwrap(res) || [];
  },

  async getProjectSrsReports(projectId) {
    const res = await client.get(`/projects/${projectId}/srs`);
    return unwrap(res) || [];
  },

  async getCourseSrsReports(courseId) {
    return this.getSrsReports({ courseId });
  },

  async getStudentSrsReports(studentId) {
    return this.getSrsReports({ studentId });
  },

  async uploadSrsReport(projectId, studentId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post(`/projects/${projectId}/srs`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return unwrap(res);
  },

  async updateSrsReport(reportId, updates, reviewerId = null) {
    const payload = { ...updates, reviewerId };
    const res = await client.put(`/reports/srs/${reportId}`, payload);
    return unwrap(res);
  },

  async reviewSrsReport(reportId, lecturerId, status, comments = '') {
    const res = await client.post(`/reports/srs/${reportId}/review`, { status, comments, reviewerId: lecturerId });
    return unwrap(res);
  },

  async deleteSrsReport(reportId) {
    const res = await client.delete(`/reports/srs/${reportId}`);
    return unwrap(res);
  },

  async getSrsStats(filters = {}) {
    const res = await client.get('/analytics/srs-stats', { params: filters });
    return unwrap(res);
  },

  async getPendingReviews(lecturerId, courseId = null) {
    const res = await client.get('/reports/srs/pending-reviews', { params: { lecturerId, courseId } });
    return unwrap(res) || [];
  },

  async getSubmissionTrends(courseId = null, days = 30) {
    const res = await client.get('/analytics/srs-trends', { params: { courseId, days } });
    return unwrap(res) || [];
  },

  generateFileId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  },

  async getLatestSrsForProject(projectId) {
    const reports = await this.getProjectSrsReports(projectId);
    return reports.length > 0 ? reports[0] : null;
  },

  async hasFinalSrs(projectId) {
    const reports = await this.getProjectSrsReports(projectId);
    return reports.some(r => r.status === 'FINAL');
  },

  async getCourseCompletionRate(courseId) {
    const res = await client.get(`/analytics/courses/${courseId}/srs-completion`);
    return unwrap(res)?.rate || 0;
  }
};
