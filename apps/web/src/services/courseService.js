import client from '../api/client.js';
import { unwrap } from '../api/unwrap.js';

export const courseService = {
  async getCourses(filters = {}) {
    const res = await client.get('/courses', { params: filters });
    return unwrap(res) || [];
  },

  async getCourseById(courseId) {
    const res = await client.get(`/courses/${courseId}`);
    return unwrap(res);
  },

  async createCourse(courseData) {
    const res = await client.post('/courses', courseData);
    return unwrap(res);
  },

  async updateCourse(courseId, updates) {
    const res = await client.put(`/courses/${courseId}`, updates);
    return unwrap(res);
  },

  async deleteCourse(courseId) {
    const res = await client.delete(`/courses/${courseId}`);
    return unwrap(res);
  },

  async assignLecturer(courseId, lecturerId, role = 'SECONDARY') {
    const res = await client.post(`/courses/${courseId}/lecturers`, { lecturerId, role });
    return unwrap(res);
  },

  async unassignLecturer(courseId, lecturerId) {
    const res = await client.delete(`/courses/${courseId}/lecturers/${lecturerId}`);
    return unwrap(res);
  },

  async enrollStudent(courseId, studentId) {
    const res = await client.post(`/courses/${courseId}/students`, { studentId });
    return unwrap(res);
  },

  async unenrollStudent(courseId, studentId) {
    const res = await client.delete(`/courses/${courseId}/students/${studentId}`);
    return unwrap(res);
  },

  async getAvailableStudents(courseId) {
    const res = await client.get(`/courses/${courseId}/available-students`);
    return unwrap(res) || [];
  },

  async getAvailableLecturers(courseId) {
    const res = await client.get(`/courses/${courseId}/available-lecturers`);
    return unwrap(res) || [];
  }
};
