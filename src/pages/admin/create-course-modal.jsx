// Create Course Modal - For Admin
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../components/ui/interactive.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { courseService } from '../../services/courseService.js';
import { useToast } from '../../components/ui/toast.jsx';

export function CreateCourseModal({ isOpen, onClose, onSuccess }) {
  const navigate = useNavigate();
  const { success, error } = useToast();
  
  const [formData, setFormData] = useState({
    subjectId: '',
    semesterId: '',
    code: '',
    title: '',
    status: 'ACTIVE',
    startDate: '',
    endDate: '',
    maxStudents: 40
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Mock data for dropdowns
  const semesters = [
    { id: '2026-spring', name: 'Spring 2026' },
    { id: '2025-fall', name: 'Fall 2025' },
  ];

  const subjects = [
    { id: 'se101', name: 'Software Engineering Fundamentals', code: 'SE101' },
    { id: 'se102', name: 'Advanced Software Engineering', code: 'SE102' },
    { id: 'cs201', name: 'Computer Science Fundamentals', code: 'CS201' },
  ];

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
    if (!formData.code.trim()) newErrors.code = 'Course code is required';
    if (!formData.title.trim()) newErrors.title = 'Course title is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    
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
      const course = await courseService.createCourse(formData);
      success(`Course "${course.title}" created successfully!`);
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
        code: '',
        title: '',
        status: 'ACTIVE',
        startDate: '',
        endDate: '',
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
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="e.g., SE101.001"
              className={errors.code ? 'border-red-300' : ''}
              disabled={loading}
            />
            {errors.code && (
              <p className="text-red-500 text-sm mt-1">{errors.code}</p>
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
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Software Engineering Fundamentals - Spring 2026"
            className={errors.title ? 'border-red-300' : ''}
            disabled={loading}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <Input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className={errors.startDate ? 'border-red-300' : ''}
              disabled={loading}
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <Input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className={errors.endDate ? 'border-red-300' : ''}
              disabled={loading}
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
            )}
          </div>

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
