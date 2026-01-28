// Create Project Modal - For Lecturer
import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/interactive.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { projectService } from '../../services/projectService.js';
import { useToast } from '../../components/ui/toast.jsx';

export function CreateProjectModal({ isOpen, onClose, onSuccess, courseId }) {
  const { success, error } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
    jiraKey: '',
    githubRepo: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      // Set default dates based on course
      const today = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3); // 3 months from now
      
      setFormData(prev => ({
        ...prev,
        startDate: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        jiraKey: `PROJ${Date.now().toString(36).toUpperCase()}`,
        githubRepo: `project-${Date.now().toString(36).toLowerCase()}`
      }));
    }
  }, [isOpen]);

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
    
    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const project = await projectService.createProject({
        courseId,
        ...formData
      });
      
      success(`Project "${project.name}" created successfully!`);
      onSuccess?.(project);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'ACTIVE',
        jiraKey: '',
        githubRepo: ''
      });
      
    } catch (err) {
      error(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'ACTIVE',
        jiraKey: '',
        githubRepo: ''
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Project" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name *
          </label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., E-commerce Platform"
            className={errors.name ? 'border-red-300' : ''}
            disabled={loading}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the project objectives, scope, and requirements..."
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
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

        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-base">Integration Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jira Key
              </label>
              <Input
                name="jiraKey"
                value={formData.jiraKey}
                onChange={handleInputChange}
                placeholder="e.g., ECOM"
                disabled={loading}
              />
              <p className="text-gray-500 text-sm mt-1">
                This will be used to generate the Jira project URL
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Repository
              </label>
              <Input
                name="githubRepo"
                value={formData.githubRepo}
                onChange={handleInputChange}
                placeholder="e.g., ecommerce-platform"
                disabled={loading}
              />
              <p className="text-gray-500 text-sm mt-1">
                Repository name (without organization)
              </p>
            </div>
          </CardContent>
        </Card>

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
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
