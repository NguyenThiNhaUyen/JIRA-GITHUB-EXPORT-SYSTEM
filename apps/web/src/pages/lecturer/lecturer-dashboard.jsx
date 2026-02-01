// Lecturer Dashboard - New group management flow
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import db from "../../mock/db.js";

export default function LecturerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [filter, setFilter] = useState("all"); // all | inactive-students | inactive-groups

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadCoursesForSubject(selectedSubject);
    } else {
      setCourses([]);
      setSelectedCourse("");
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedCourse) {
      loadGroupsForCourse(selectedCourse);
    } else {
      setGroups([]);
    }
  }, [selectedCourse, filter]);

  const loadSubjects = () => {
    try {
      const allSubjects = db.findMany('subjects');
      setSubjects(allSubjects);
    } catch (err) {
      error("Không thể tải danh sách môn học");
    }
  };

  const loadCoursesForSubject = (subjectId) => {
    try {
      setLoading(true);
      // Get all courses for this subject that lecturer teaches
      const allCourses = db.findMany('courses', { subjectId });
      const lecturerCourses = allCourses.filter(course => {
        const assignments = db.findMany('courseLecturers', { courseId: course.id, lecturerId: user?.id });
        return assignments.length > 0;
      });
      setCourses(lecturerCourses);

      if (lecturerCourses.length > 0 && !selectedCourse) {
        setSelectedCourse(lecturerCourses[0].id);
      }
    } catch (err) {
      error("Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  };

  const loadGroupsForCourse = (courseId) => {
    try {
      setLoading(true);
      let courseGroups = db.getCourseGroups(courseId);

      // Apply filters
      if (filter === "inactive-students") {
        // Groups with students having few commits (for now, show all)
        courseGroups = courseGroups.filter(group => group.githubStatus === 'PENDING');
      } else if (filter === "inactive-groups") {
        // Groups with no approved links
        courseGroups = courseGroups.filter(group =>
          group.githubStatus !== 'APPROVED' || group.jiraStatus !== 'APPROVED'
        );
      }

      setGroups(courseGroups);
    } catch (err) {
      error("Không thể tải danh sách nhóm");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleManageGroups = () => {
    if (!selectedCourse) {
      error("Vui lòng chọn lớp học");
      return;
    }
    navigate(`/lecturer/course/${selectedCourse}/manage-groups`);
  };

  const handleViewGroupDetail = (groupId) => {
    navigate(`/lecturer/group/${groupId}`);
  };

  const handleSendWarning = (group) => {
    success(`Đã gửi cảnh báo đến nhóm "${group.name}"`);
    // TODO: Implement email notification
  };

  const getGroupStats = (group) => {
    const students = db.getGroupStudents(group.id);
    return {
      totalStudents: students.length,
      githubApproved: group.githubStatus === 'APPROVED',
      jiraApproved: group.jiraStatus === 'APPROVED',
    };
  };

  const currentSubject = subjects.find(s => s.id === selectedSubject);
  const currentCourse = courses.find(c => c.id === selectedCourse);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50">
      {/* Premium Header with gradient */}
      <div className="bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">
                Bảng điều khiển Giảng viên
              </h1>
              <p className="text-green-100 text-lg">Xin chào, <span className="font-semibold">{user?.name}</span>!</p>
            </div>
            <Button
              onClick={handleLogout}
              className="bg-white bg-opacity-40 text-green-600 hover:bg-green-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subject → Course → Filter Selection */}
        <Card className="mb-8 border-0 shadow-lg rounded-2xl">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">-- Chọn môn học --</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lớp học</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={!selectedSubject || courses.length === 0}
                >
                  <option value="">-- Chọn lớp học --</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bộ lọc</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={!selectedCourse}
                >
                  <option value="all">Tất cả nhóm</option>
                  <option value="inactive-students">Học sinh ít commit</option>
                  <option value="inactive-groups">Nhóm chưa hoàn thành</option>
                </select>
              </div>
            </div>

            {selectedCourse && (
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleManageGroups}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white border-0"
                >
                  + Quản lý nhóm
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Groups List */}
        {selectedCourse && (
          <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-cyan-100">
              <CardTitle className="text-3xl text-gray-800 font-bold">
                Danh sách Nhóm {currentCourse && `- ${currentCourse.code}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang tải...</p>
                </div>
              ) : groups.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Chưa có nhóm nào trong lớp học này.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groups.map(group => {
                    const stats = getGroupStats(group);
                    const students = db.getGroupStudents(group.id);

                    return (
                      <div key={group.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900 text-lg">{group.name}</h3>
                              <div className="flex gap-2">
                                <Badge variant={stats.githubApproved ? "success" : "secondary"} size="sm">
                                  GitHub {stats.githubApproved ? "✓" : "..."}
                                </Badge>
                                <Badge variant={stats.jiraApproved ? "success" : "secondary"} size="sm">
                                  Jira {stats.jiraApproved ? "✓" : "..."}
                                </Badge>
                              </div>
                            </div>

                            <div className="text-sm text-gray-600 mb-2">
                              <strong>Đề tài:</strong> {group.topic || <span className="text-gray-400">Chưa có</span>}
                            </div>

                            <div className="text-sm text-gray-600">
                              <strong>Thành viên ({stats.totalStudents}):</strong>{" "}
                              {students.map(s => s.name).join(", ") || "Chưa có"}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleViewGroupDetail(group.id)}
                              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0"
                            >
                              Chi tiết
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendWarning(group)}
                              className="border-orange-500 text-orange-600 hover:bg-orange-50"
                            >
                              ⚠️ Cảnh báo
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!selectedCourse && (
          <Card className="border-0 shadow-xl rounded-3xl">
            <CardContent className="pt-16 pb-16 text-center">
              <p className="text-gray-500 text-lg">Vui lòng chọn môn học và lớp học để bắt đầu</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
