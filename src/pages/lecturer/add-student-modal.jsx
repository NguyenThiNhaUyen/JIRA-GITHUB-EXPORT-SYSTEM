// Add Student Modal - For Lecturer
import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/interactive.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { courseService } from '../../services/courseService.js';
import { useToast } from '../../components/ui/toast.jsx';

export function AddStudentModal({ isOpen, onClose, onSuccess, courseId }) {
  const { success, error } = useToast();
  
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (isOpen && courseId) {
      loadAvailableStudents();
    }
  }, [isOpen, courseId]);

  const loadAvailableStudents = async () => {
    try {
      setLoading(true);
      const students = await courseService.getAvailableStudents(courseId);
      setAvailableStudents(students);
    } catch (err) {
      error('Failed to load available students');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = availableStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const handleEnroll = async () => {
    if (selectedStudents.length === 0) {
      error('Please select at least one student');
      return;
    }

    setEnrolling(true);
    
    try {
      const enrollmentPromises = selectedStudents.map(studentId =>
        courseService.enrollStudent(courseId, studentId)
      );
      
      const results = await Promise.allSettled(enrollmentPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (successful > 0) {
        success(`${successful} student(s) enrolled successfully!`);
      }
      
      if (failed > 0) {
        error(`${failed} student(s) could not be enrolled`);
      }
      
      onSuccess?.({ successful, failed });
      onClose();
      
      // Reset form
      setSelectedStudents([]);
      setSearchTerm('');
      
    } catch (err) {
      error('Failed to enroll students');
    } finally {
      setEnrolling(false);
    }
  };

  const handleClose = () => {
    if (!loading && !enrolling) {
      setSelectedStudents([]);
      setSearchTerm('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Students to Course" size="lg">
      <div className="space-y-6">
        {/* Search */}
        <div>
          <Input
            placeholder="Search by name, email, or student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Select All */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              disabled={loading}
            />
            <span className="text-sm font-medium text-gray-700">
              Select All ({selectedStudents.length} selected)
            </span>
          </label>
          
          <Badge variant="outline">
            {filteredStudents.length} available
          </Badge>
        </div>

        {/* Students List */}
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                {searchTerm ? 'No students found matching your search' : 'No available students'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredStudents.map(student => (
                <label
                  key={student.id}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleStudentToggle(student.id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    disabled={loading}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {student.name}
                      </span>
                      <Badge variant="outline" size="sm">
                        {student.studentId}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {student.email}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Selected Students Summary */}
        {selectedStudents.length > 0 && (
          <Card className="bg-gray-50">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Selected Students ({selectedStudents.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedStudents.map(studentId => {
                  const student = availableStudents.find(s => s.id === studentId);
                  return student ? (
                    <Badge key={studentId} variant="primary" size="sm">
                      {student.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading || enrolling}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEnroll}
            disabled={loading || enrolling || selectedStudents.length === 0}
          >
            {enrolling ? 'Enrolling...' : `Enroll ${selectedStudents.length} Student(s)`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
