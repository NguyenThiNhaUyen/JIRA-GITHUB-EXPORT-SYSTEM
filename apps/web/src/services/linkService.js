import client from '../api/client.js';
import { unwrap } from '../api/unwrap.js';

export const linkService = {
  async getStudentLinks(studentId, courseId = null) {
    const res = await client.get(`/users/student/${studentId}/links`, { params: { courseId } });
    return unwrap(res) || [];
  },

  async requestLinkConfirmation(studentId, courseId, githubAccountUrl, jiraAccountUrl) {
    const res = await client.post(`/users/student/${studentId}/links/request`, { courseId, githubUrl: githubAccountUrl, jiraUrl: jiraAccountUrl });
    return unwrap(res);
  },

  async confirmLink(linkId, lecturerId) {
    const res = await client.post(`/links/${linkId}/confirm`, { lecturerId });
    return unwrap(res);
  },

  async rejectLink(linkId, lecturerId, rejectionReason = '') {
    const res = await client.post(`/links/${linkId}/reject`, { lecturerId, reason: rejectionReason });
    return unwrap(res);
  },

  async getPendingLinks(lecturerId, courseId = null) {
    const res = await client.get('/links/pending', { params: { lecturerId, courseId } });
    return unwrap(res) || [];
  },

  async getCourseLinkStats(courseId) {
    const res = await client.get(`/analytics/courses/${courseId}/links-stats`);
    return unwrap(res);
  },

  isValidGitHubUrl(url) {
    if (!url) return true;
    const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\/?$/;
    return githubRegex.test(url);
  },

  isValidJiraUrl(url) {
    if (!url) return true;
    const jiraRegex = /^https:\/\/[a-zA-Z0-9.-]+\.atlassian\.net\/.*$/;
    return jiraRegex.test(url);
  },

  async bulkConfirmLinks(linkIds, lecturerId) {
    const res = await client.post('/links/bulk-confirm', { linkIds, lecturerId });
    return unwrap(res);
  },

  async bulkRejectLinks(linkIds, lecturerId, rejectionReason = '') {
    const res = await client.post('/links/bulk-reject', { linkIds, lecturerId, reason: rejectionReason });
    return unwrap(res);
  },

  async getStudentLinkHistory(studentId) {
    const res = await client.get(`/users/student/${studentId}/links/history`);
    return unwrap(res) || [];
  }
};
