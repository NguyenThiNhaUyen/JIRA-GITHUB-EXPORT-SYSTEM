// Assign Lecturer Modal - For Admin
import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/interactive.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { courseService } from '../../services/courseService.js';
import { useToast } from '../../components/ui/toast.jsx';

export function AssignLecturerModal({ isOpen, onClose, onSuccess, courseId }) {
  const { success, error } = useToast();
  
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedLecturer, setSelectedLecturer] = useState('');
  const [role, setRole] = useState('SECONDARY');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, courseId]);

  const loadData = async () => {
    try {
      // Load courses
      const coursesData = await courseService.getCourses();
      setCourses(coursesData);
      
      // Set default course if provided
      if (courseId) {
        setSelectedCourse(courseId);
      } else if (coursesData.length > 0) {
        setSelectedCourse(coursesData[0].id);
      }
      
      // Load available lecturers for selected course
      if (courseId || coursesData.length > 0) {
        const targetCourseId = courseId || coursesData[0].id;
        const availableLecturers = await courseService.getAvailableLecturers(targetCourseId);
        setLecturers(availableLecturers);
        
        if (availableLecturers.length > 0) {
          setSelectedLecturer(availableLecturers[0].id);
        }
      }
    } catch (err) {
      error('Failed to load data');
    }
  };

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    setSelectedLecturer('');
    
    try {
      const availableLecturers = await courseService.getAvailableLecturers(courseId);
      setLecturers(availableLecturers);
      
      if (availableLecturers.length > 0) {
        setSelectedLecturer(availableLecturers[0].id);
      }
    } catch (err) {
      error('Failed to load lecturers');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedCourse) newErrors.course = 'Course is required';
    if (!selectedLecturer) newErrors.lecturer = 'Lecturer is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const assignment = await courseService.assignLecturer(
        selectedCourse,
        selectedLecturer,
        role
      );
      
      success(`Lecturer "${assignment.lecturer.name}" assigned to course successfully!`);
      onSuccess?.(assignment);
      onClose();
      
      // Reset form
      setSelectedLecturer('');
      setRole('SECONDARY');
      
    } catch (err) {
      error(err.message || 'Failed to assign lecturer');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedLecturer('');
      setRole('SECONDARY');
      setErrors({});
      onClose();
    }
  };

  const selectedCourseData = courses.find(c => c.id === selectedCourse);
  const selectedLecturerData = lecturers.find(l => l.id === selectedLecturer);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Assign Lecturer to Course" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course *
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => handleCourseChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.course ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading || !!courseId} // Disable if courseId is pre-selected
          >
            <option value="">Select Course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.title}
              </option>
            ))}
          </select>
          {errors.course && (
            <p className="text-red-500 text-sm mt-1">{errors.course}</p>
          )}
        </div>

        {selectedCourseData && (
          <Card className="bg-gray-50">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Subject:</span>
                  <p>{selectedCourseData.subject?.name}</p>
                </div>
                <div>
                  <span className="font-medium">Semester:</span>
                  <p>{selectedCourseData.semester?.name}</p>
                </div>
                <div>
                  <span className="font-medium">Students:</span>
                  <p>{selectedCourseData.currentStudents}/{selectedCourseData.maxStudents}</p>
                </div>
                <div>
                  <span className="font-medium">Current Lecturers:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedCourseData.lecturers?.map(lecturer => (
                      <Badge key={lecturer.id} variant="outline" size="sm">
                        {lecturer.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lecturer *
          </label>
          <select
            value={selectedLecturer}
            onChange={(e) => setSelectedLecturer(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.lecturer ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
          >
            <option value="">Select Lecturer</option>
            {lecturers.map(lecturer => (
              <option key={lecturer.id} value={lecturer.id}>
                {lecturer.name} - {lecturer.department}
              </option>
            ))}
          </select>
          {errors.lecturer && (
            <p className="text-red-500 text-sm mt-1">{errors.lecturer}</p>
          )}
          
          {lecturers.length === 0 && selectedCourse && (
            <p className="text-amber-600 text-sm mt-1">
              All available lecturers are already assigned to this course
            </p>
          )}
        </div>

        {selectedLecturerData && (
          <Card className="bg-gray-50">
            <CardContent className="pt-4">
              <div className="text-sm">
                <div>
                  <span className="font-medium">Email:</span>
                  <p>{selectedLecturerData.email}</p>
                </div>
                <div className="mt-2">
                  <span className="font-medium">Department:</span>
                  <p>{selectedLecturerData.department}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={loading}
          >
            <option value="PRIMARY">Primary Lecturer</option>
            <option value="SECONDARY">Secondary Lecturer</option>
          </select>
          <p className="text-gray-500 text-sm mt-1">
            Primary lecturers have full control over the course. Secondary lecturers can assist with grading and management.
          </p>
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
            disabled={loading || !selectedLecturer}
          >
            {loading ? 'Assigning...' : 'Assign Lecturer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
