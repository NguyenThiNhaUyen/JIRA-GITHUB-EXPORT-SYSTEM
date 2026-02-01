import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import db from "../../mock/db.js";
import { useToast } from "../../components/ui/toast.jsx";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    semesters: 0,
    subjects: 0,
    courses: 0,
    lecturers: 0,
    students: 0,
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const semestersData = db.findMany("semesters");
      const subjectsData = db.findMany("subjects");
      const coursesData = db.findMany("courses");
      const lecturersData = db.findMany("users.lecturers");
      const studentsData = db.findMany("users.students");

      setSemesters(semestersData);
      setSubjects(subjectsData);
      setRecentCourses(coursesData.slice(0, 5));

      setStats({
        semesters: semestersData.length,
        subjects: subjectsData.length,
        courses: coursesData.length,
        lecturers: lecturersData.length,
        students: studentsData.length,
      });
    } catch (err) {
      error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getSemesterName = (semesterId) => {
    const semester = semesters.find((s) => s.id === semesterId);
    return semester?.code || "N/A";
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.code || "N/A";
  };

  const getActiveSemesterCount = () => {
    return semesters.filter((s) => s.status === "ACTIVE").length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Premium Header with gradient */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">
                Bảng điều khiển Admin
              </h1>
              <p className="text-indigo-100 text-lg">Xin chào, <span className="font-semibold">{user?.name}</span>!</p>
            </div>
            <Button
              onClick={handleLogout}
              className="bg-white bg-opacity-40 text-indigo-600 hover:bg-indigo-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Premium Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {/* Học kỳ Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-2xl p-6 text-white transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 hover:shadow-blue-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-5xl font-bold mb-2 drop-shadow-md">{stats.semesters}</h3>
            <p className="text-blue-100 font-semibold text-lg">Học kỳ</p>
            <p className="text-xs text-blue-200 mt-2 bg-white bg-opacity-10 rounded-full px-3 py-1 inline-block">
              {getActiveSemesterCount()} đang hoạt động
            </p>
          </div>

          {/* Môn học Card */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl shadow-2xl p-6 text-white transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 hover:shadow-purple-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <h3 className="text-5xl font-bold mb-2 drop-shadow-md">{stats.subjects}</h3>
            <p className="text-purple-100 font-semibold text-lg">Môn học</p>
          </div>

          {/* Lớp học Card */}
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-3xl shadow-2xl p-6 text-white transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 hover:shadow-pink-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <h3 className="text-5xl font-bold mb-2 drop-shadow-md">{stats.courses}</h3>
            <p className="text-pink-100 font-semibold text-lg">Lớp học</p>
          </div>

          {/* Giảng viên Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl shadow-2xl p-6 text-white transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 hover:shadow-indigo-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <h3 className="text-5xl font-bold mb-2 drop-shadow-md">{stats.lecturers}</h3>
            <p className="text-indigo-100 font-semibold text-lg">Giảng viên</p>
          </div>

          {/* Sinh viên Card */}
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl shadow-2xl p-6 text-white transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 hover:shadow-teal-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-5xl font-bold mb-2 drop-shadow-md">{stats.students}</h3>
            <p className="text-teal-100 font-semibold text-lg">Sinh viên</p>
          </div>
        </div>

        {/* Premium Management Cards */}
        <Card className="mb-10 border-0 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm bg-white/80">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-indigo-50 border-b border-indigo-100 py-6">
            <CardTitle className="text-3xl text-gray-800 font-bold">Quản lý hệ thống</CardTitle>
            <p className="text-sm text-gray-600 mt-2">Truy cập nhanh các chức năng quản lý</p>
          </CardHeader>

          <CardContent className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Học kỳ Button */}
              <button
                onClick={() => navigate("/admin/semesters")}
                className="group relative bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 text-left overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-5 w-fit mb-6 shadow-lg">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 drop-shadow-md">Quản lý Học kỳ</h3>
                </div>
              </button>

              {/* Môn học Button */}
              <button
                onClick={() => navigate("/admin/subjects")}
                className="group relative bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 text-left overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-5 w-fit mb-6 shadow-lg">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 drop-shadow-md">Quản lý Môn học</h3>
                </div>
              </button>

              {/* Lớp học Button */}
              <button
                onClick={() => navigate("/admin/courses")}
                className="group relative bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 text-left overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-5 w-fit mb-6 shadow-lg">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 drop-shadow-md">Quản lý Lớp học</h3>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Premium Recent Courses */}
        <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm bg-white/80">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-pink-50 border-b border-pink-100 flex flex-row items-center justify-between py-6">
            <div>
              <CardTitle className="text-3xl text-gray-800 font-bold">Lớp học gần đây</CardTitle>
              <p className="text-sm text-gray-600 mt-2">Danh sách các lớp học mới nhất</p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/admin/courses")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl px-6 py-3"
            >
              Xem tất cả →
            </Button>
          </CardHeader>

          <CardContent className="p-8 pt-6">
            <div className="space-y-4">
              {recentCourses.map((course, index) => (
                <div
                  key={course.id}
                  className="group flex items-center justify-between p-6 bg-gradient-to-r from-white to-gray-50 rounded-2xl hover:from-indigo-50 hover:to-purple-50 hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-indigo-200"
                >
                  <div className="flex-1 flex items-center gap-5">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl w-14 h-14 flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-gray-900 text-xl">
                          {course.code}
                        </span>
                        <Badge variant="outline" size="sm" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold">
                          {getSubjectName(course.subjectId)}
                        </Badge>
                        <Badge variant="outline" size="sm" className="bg-purple-50 text-purple-700 border-purple-200 font-semibold">
                          {getSemesterName(course.semesterId)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        {course.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        course.status === "ACTIVE"
                          ? "success"
                          : course.status === "UPCOMING"
                            ? "warning"
                            : "default"
                      }
                      className="shadow-md font-semibold"
                    >
                      {course.status}
                    </Badge>
                    <div className="text-sm text-gray-500 mt-2 font-medium">
                      <span className="font-bold text-indigo-600 text-lg">{course.currentStudents}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-700">{course.maxStudents}</span>
                      <span className="ml-1">sinh viên</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
