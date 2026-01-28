// Lecturer Dashboard - Overview for LECTURER role
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { SimpleStatCard } from "../../components/ui/layout.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { Alert } from "../../components/ui/interactive.jsx";
import { AddStudentModal } from "./add-student-modal.jsx";
import { CreateProjectModal } from "./create-project-modal.jsx";
import { courseService } from "../../services/courseService.js";
import { projectService } from "../../services/projectService.js";
import { commitService } from "../../services/commitService.js";
import { useToast } from "../../components/ui/toast.jsx";

export default function LecturerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();
  
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [courseProjects, setCourseProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalStudents: 0,
    silentProjects: [],
    inactiveStudents: []
  });

  useEffect(() => {
    loadLecturerData();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadCourseData(selectedCourse);
    }
  }, [selectedCourse]);

  const loadLecturerData = async () => {
    try {
      setLoading(true);
      // Get courses where this lecturer is assigned
      const lecturerCourses = await courseService.getCourses();
      const myCourses = lecturerCourses.filter(course => 
        course.lecturers?.some(lecturer => lecturer.id === user.id)
      );
      
      setCourses(myCourses);
      
      if (myCourses.length > 0 && !selectedCourse) {
        setSelectedCourse(myCourses[0].id);
      }
    } catch (err) {
      error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const loadCourseData = async (courseId) => {
    try {
      setLoading(true);
      
      // Get projects for this course
      const projects = await projectService.getCourseProjects(courseId);
      setCourseProjects(projects);
      
      // Calculate stats
      const totalProjects = projects.length;
      const course = courses.find(c => c.id === courseId);
      const totalStudents = course?.currentStudents || 0;
      
      // Find silent projects (no commits in 7 days)
      const silentProjects = await projectService.getCourseProjects(courseId, {
        hasRecentCommits: false
      });
      
      // Find inactive students (no commits in 14 days)
      const inactiveStudents = await commitService.getInactiveStudents(courseId, 14);
      
      setStats({
        totalProjects,
        totalStudents,
        silentProjects,
        inactiveStudents
      });
    } catch (err) {
      error('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSyncCommits = async (projectId) => {
    try {
      const result = await commitService.syncCommits(projectId);
      success(`Synced ${result.commitsAdded} commits for project`);
      loadCourseData(selectedCourse); // Refresh data
    } catch (err) {
      error('Failed to sync commits');
    }
  };

  const handleViewProjectDetail = (projectId) => {
    navigate(`/lecturer/project/${projectId}`);
  };

  const handleStudentAdded = (result) => {
    success(`${result.successful} students enrolled successfully!`);
    loadLecturerData(); // Refresh data
  };

  const handleProjectCreated = (project) => {
    success(`Project "${project.name}" created successfully!`);
    loadCourseData(selectedCourse); // Refresh data
  };

  const handleViewProjectsOverview = () => {
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
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn Course
          </label>
          <select 
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Chọn Course --</option>
            {lecturerCourses.map(course => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <SimpleStatCard
            title="Projects"
            value={totalProjects}
            change={`${courseProjects.length} projects trong course này`}
            changeType="neutral"
          />
          <SimpleStatCard
            title="Teams"
            value={courseProjects.length}
            change="Đang hoạt động"
            changeType="positive"
          />
          <SimpleStatCard
            title="Students"
            value={totalStudents}
            change={`${totalStudents} sinh viên tổng cộng`}
            changeType="neutral"
          />
          <SimpleStatCard
            title="Last Sync"
            value="2 phút"
            change="Sync tốt"
            changeType="success"
          />
        </div>

        {/* Alerts */}
        <div className="space-y-4 mb-8">
          {silentProjects.length > 0 && (
            <Alert variant="warning">
              <div>
                <strong>Cảnh báo:</strong> {silentProjects.length} nhóm không có hoạt động commit trong 7 ngày qua.
                <div className="mt-2">
                  {silentProjects.map(project => (
                    <Badge key={project.id} variant="warning" className="mr-2 mb-2">
                      {project.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </Alert>
          )}

          {inactiveStudents.length > 0 && (
            <Alert variant="error">
              <div>
                <strong>Cảnh báo:</strong> {inactiveStudents.length} sinh viên không có hoạt động commit trong 14 ngày qua.
                <div className="mt-2">
                  {inactiveStudents.map(studentId => {
                    const student = mockUsers.students.find(s => s.id === studentId);
                    return student ? (
                      <Badge key={studentId} variant="error" className="mr-2 mb-2">
                        {student.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            </Alert>
          )}
        </div>

        {/* Course Projects */}
        {selectedCourse && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Course Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => setShowAddStudentModal(true)}
                    variant="outline"
                    className="w-full"
                    disabled={!selectedCourse}
                  >
                    Add Student to Course
                  </Button>
                  <Button 
                    onClick={() => setShowCreateProjectModal(true)}
                    variant="outline"
                    className="w-full"
                    disabled={!selectedCourse}
                  >
                    Create New Project
                  </Button>
                  <Button 
                    onClick={handleViewProjectsOverview}
                    variant="secondary"
                    className="w-full"
                    disabled={!selectedCourse}
                  >
                    View All Projects
                  </Button>
                  <Button 
                    onClick={() => navigate('/admin/reports')}
                    variant="ghost"
                    className="w-full"
                  >
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courseProjects.slice(0, 5).map(project => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-600">{project.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={project.status === 'ACTIVE' ? 'success' : 'secondary'}
                          size="sm"
                        >
                          {project.status}
                        </Badge>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleSyncCommits(project.id)}
                        >
                          Sync
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleViewProjectDetail(project.id)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {courseProjects.length > 5 && (
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleViewProjectsOverview}
                      className="w-full"
                    >
                      View All Projects
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        </div>

        {/* Modals */}
        <AddStudentModal
          isOpen={showAddStudentModal}
          onClose={() => setShowAddStudentModal(false)}
          onSuccess={handleStudentAdded}
          courseId={selectedCourse}
        />
        
        <CreateProjectModal
          isOpen={showCreateProjectModal}
          onClose={() => setShowCreateProjectModal(false)}
          onSuccess={handleProjectCreated}
          courseId={selectedCourse}
        />
      </div>
    </div>
  );
}
