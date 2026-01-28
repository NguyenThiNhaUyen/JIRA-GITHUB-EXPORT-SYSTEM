// Lecturer Dashboard - Simple version (before CRUD complexity)
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { SimpleStatCard } from "../../components/ui/layout.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { Alert } from "../../components/ui/interactive.jsx";

export default function LecturerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalStudents: 0,
    activeTeams: 0,
    lastSync: "2 phút"
  });

  useEffect(() => {
    // Mock data for simple dashboard
    setCourses([
      { id: 'se101', code: 'SE101', name: 'Software Engineering Fundamentals' },
      { id: 'se102', code: 'SE102', name: 'Advanced Software Engineering' }
    ]);
    
    setProjects([
      { id: 'proj1', name: 'E-commerce Platform', status: 'ACTIVE', description: 'Build full-stack e-commerce' },
      { id: 'proj2', name: 'Task Management System', status: 'ACTIVE', description: 'Create task management app' },
      { id: 'proj3', name: 'AI Chatbot', status: 'IN_PROGRESS', description: 'Develop AI-powered chatbot' }
    ]);
    
    setStats({
      totalProjects: 3,
      totalStudents: 45,
      activeTeams: 3,
      lastSync: "2 phút"
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCourseChange = (courseId) => {
    setSelectedCourse(courseId);
    // In real app, would load projects for this course
  };

  const handleViewProject = (projectId) => {
    navigate(`/lecturer/project/${projectId}`);
  };

  const handleViewAllProjects = () => {
    navigate(`/lecturer/course/${selectedCourse}/projects`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lecturer Dashboard</h1>
              <p className="text-gray-600">Chào mừng, {user?.name}!</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Selector */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn Course
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Chọn Course --</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <SimpleStatCard
                title="Projects"
                value={stats.totalProjects}
                change="Đang hoạt động"
                changeType="positive"
              />
              <SimpleStatCard
                title="Teams"
                value={stats.activeTeams}
                change="Đang hoạt động"
                changeType="positive"
              />
              <SimpleStatCard
                title="Students"
                value={stats.totalStudents}
                change="Tổng số sinh viên"
                changeType="neutral"
              />
              <SimpleStatCard
                title="Last Sync"
                value={stats.lastSync}
                change="Sync tốt"
                changeType="success"
              />
            </div>

            {/* Alerts */}
            <div className="space-y-4 mb-8">
              <Alert variant="warning">
                <strong>Cảnh báo:</strong> 1 project không có hoạt động commit trong 7 ngày qua.
              </Alert>
              <Alert variant="info">
                <strong>Thông báo:</strong> 2 sinh viên cần được theo dõi thêm.
              </Alert>
            </div>

            {/* Quick Actions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="w-full">
                    Add Student
                  </Button>
                  <Button variant="outline" className="w-full">
                    Create Project
                  </Button>
                  <Button variant="secondary" className="w-full" onClick={handleViewAllProjects}>
                    View All Projects
                  </Button>
                  <Button variant="ghost" className="w-full">
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projects.map(project => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-600">{project.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={project.status === 'ACTIVE' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {project.status}
                        </Badge>
                        <Button 
                          size="sm"
                          variant="outline"
                        >
                          Sync
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleViewProject(project.id)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleViewAllProjects}
                    className="w-full"
                  >
                    View All Projects
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
