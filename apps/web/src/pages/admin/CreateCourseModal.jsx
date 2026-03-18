// Create Course Modal - For Admin
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from "@/components/ui/Interactive.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Input } from "@/components/ui/Input.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card.jsx";
import { useCreateCourse } from "@/features/courses/hooks/useCourses.js';
import { useToast } from "@/components/ui/Toast.jsx";

import { useGetSemesters, useGetSubjects } from "@/features/system/hooks/useSystem.js';

export function CreateCourseModal({ isOpen, onClose, onSuccess }) {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { mutateAsync: createCourseMutation } = useCreateCourse();
  
  const [formData, setFormData] = useState({
    subjectId: '',
    semesterId: '',
    courseCode: '',
    courseName: '',
    status: 'ACTIVE',
    maxStudents: 40
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { data: semestersData } = useGetSemesters();
  const { data: subjectsData } = useGetSubjects();

  const semesters = semestersData || [];
  const subjects = subjectsData || [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.subjectId) newErrors.subjectId = 'Subject is required';
    if (!formData.semesterId) newErrors.semesterId = 'Semester is required';
    if (!formData.courseCode.trim()) newErrors.courseCode = 'Course code is required';
    if (!formData.courseName.trim()) newErrors.courseName = 'Course title is required';
    
    if (!formData.maxStudents || formData.maxStudents < 1) {
      newErrors.maxStudents = 'Max students must be at least 1';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const payload = {
        subjectId: Number(formData.subjectId),
        semesterId: Number(formData.semesterId),
        courseCode: formData.courseCode,
        courseName: formData.courseName,
        status: formData.status,
        maxStudents: Number(formData.maxStudents)
      };

      const course = await createCourseMutation(payload);
      success(`Course "${course.courseName || course.title}" created successfully!`);
      onSuccess?.(course);
      onClose();
      
      // Navigate to course detail
      navigate(`/admin/courses/${course.id}`);
      
    } catch (err) {
      error(err.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        subjectId: '',
        semesterId: '',
        courseCode: '',
        courseName: '',
        status: 'ACTIVE',
        maxStudents: 40
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Course" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <select
              name="subjectId"
              value={formData.subjectId}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.subjectId ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.code} - {subject.name}
                </option>
              ))}
            </select>
            {errors.subjectId && (
              <p className="text-red-500 text-sm mt-1">{errors.subjectId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester *
            </label>
            <select
              name="semesterId"
              value={formData.semesterId}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.semesterId ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">Select Semester</option>
              {semesters.map(semester => (
                <option key={semester.id} value={semester.id}>
                  {semester.name}
                </option>
              ))}
            </select>
            {errors.semesterId && (
              <p className="text-red-500 text-sm mt-1">{errors.semesterId}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Code *
            </label>
            <Input
              name="courseCode"
              value={formData.courseCode}
              onChange={handleInputChange}
              placeholder="e.g., SE101.001"
              className={errors.courseCode ? 'border-red-300' : ''}
              disabled={loading}
            />
            {errors.courseCode && (
              <p className="text-red-500 text-sm mt-1">{errors.courseCode}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={loading}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Title *
          </label>
          <Input
            name="courseName"
            value={formData.courseName}
            onChange={handleInputChange}
            placeholder="e.g., Software Engineering Fundamentals - Spring 2026"
            className={errors.courseName ? 'border-red-300' : ''}
            disabled={loading}
          />
          {errors.courseName && (
            <p className="text-red-500 text-sm mt-1">{errors.courseName}</p>
          )}
        </div>

<div className="grid grid-cols-1 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Students *
            </label>
            <Input
              type="number"
              name="maxStudents"
              value={formData.maxStudents}
              onChange={handleInputChange}
              min="1"
              max="100"
              className={errors.maxStudents ? 'border-red-300' : ''}
              disabled={loading}
            />
            {errors.maxStudents && (
              <p className="text-red-500 text-sm mt-1">{errors.maxStudents}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Course'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
