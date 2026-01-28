// Admin Dashboard - Overview for ADMIN role
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { SimpleStatCard } from "../../components/ui/layout.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { CreateCourseModal } from "./create-course-modal.jsx";
import { AssignLecturerModal } from "./assign-lecturer-modal.jsx";
import { courseService } from "../../services/courseService.js";
import { useToast } from "../../components/ui/toast.jsx";
import db from "../../mock/db.js";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();
  
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [showAssignLecturerModal, setShowAssignLecturerModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    semesters: 0,
    courses: 0,
    lecturers: 0,
    students: 0
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const coursesData = await courseService.getCourses();
      setCourses(coursesData);
      
      // Calculate stats
      setStats({
        semesters: db.findMany('semesters').length,
        courses: coursesData.length,
        lecturers: db.findMany('users.lecturers').length,
        students: db.findMany('users.students').length
      });
    } catch (err) {
      error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCourseCreated = (course) => {
    success(`Course "${course.title}" created successfully!`);
    loadData(); // Refresh data
  };

  const handleLecturerAssigned = (assignment) => {
    success(`Lecturer "${assignment.lecturer.name}" assigned successfully!`);
    loadData(); // Refresh data
  };

  const handleViewReports = () => {
    navigate('/admin/reports');
  };

  const handleManageCourses = () => {
    navigate('/admin/courses');
  };

  const handleManageUsers = () => {
    navigate('/admin/users');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Chào mừng, {user?.name}!</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SimpleStatCard
            title="Học kỳ"
            value={stats.semesters}
            change="2 học kỳ đang hoạt động"
            changeType="positive"
          />
          <SimpleStatCard
            title="Khóa học"
            value={stats.courses}
            change="Tăng 15% so với học kỳ trước"
            changeType="positive"
          />
          <SimpleStatCard
            title="Giảng viên"
            value={stats.lecturers}
            change="3 giảng viên mới"
            changeType="positive"
          />
          <SimpleStatCard
            title="Sinh viên"
            value={stats.students}
            change="156 sinh viên đang học"
            changeType="neutral"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={() => setShowCreateCourseModal(true)}
                className="w-full"
              >
                CREATE COURSE
              </Button>
              <Button 
                onClick={() => setShowAssignLecturerModal(true)}
                variant="outline"
                className="w-full"
              >
                ADD LECTURER
              </Button>
              <Button 
                onClick={handleViewReports}
                variant="secondary"
                className="w-full"
              >
                Xem báo cáo
              </Button>
              <Button 
                onClick={handleManageCourses}
                variant="ghost"
                className="w-full"
              >
                Manage Courses
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {courses.slice(0, 5).map(course => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{course.code}</div>
                    <div className="text-sm text-gray-600">{course.title}</div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={course.status === 'ACTIVE' ? 'success' : 'secondary'}
                      size="sm"
                    >
                      {course.status}
                    </Badge>
                    <div className="text-sm text-gray-500 mt-1">
                      {course.currentStudents}/{course.maxStudents} students
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleManageCourses}
                className="w-full"
              >
                View All Courses
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-500 text-sm">No recent activities to display</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CreateCourseModal
        isOpen={showCreateCourseModal}
        onClose={() => setShowCreateCourseModal(false)}
        onSuccess={handleCourseCreated}
      />
      
      <AssignLecturerModal
        isOpen={showAssignLecturerModal}
        onClose={() => setShowAssignLecturerModal(false)}
        onSuccess={handleLecturerAssigned}
      />
    </div>
  );
}
