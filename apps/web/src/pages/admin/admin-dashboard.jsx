import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  BookOpen,
  Library,
  CalendarDays,
  Users,
  GraduationCap,
  TrendingUp
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { error } = useToast();

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
    <div className="space-y-6">
      {/* Top Stats Cards - Edaca Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Học kỳ */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-inner">
            <CalendarDays size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Học kỳ</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.semesters}</h3>
          </div>
        </div>

        {/* Môn học */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-inner">
            <Library size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Môn học</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.subjects}</h3>
          </div>
        </div>

        {/* Lớp học */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-inner">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Lớp học</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.courses}</h3>
          </div>
        </div>

        {/* Giảng viên */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-inner">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Giảng viên</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.lecturers}</h3>
          </div>
        </div>

        {/* Sinh viên */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-blue-400 text-white flex items-center justify-center shrink-0 shadow-inner">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Sinh viên</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.students}</h3>
          </div>
        </div>
      </div>

      <div className="w-full mt-6">
        {/* Recent Courses List - Edaca style table card */}
        <div className="w-full">
          <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white h-full">
            <CardHeader className="border-b border-gray-50 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-gray-800 font-bold">Lớp học gần đây</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate("/admin/courses")} className="rounded-full text-xs h-8 px-4 border-gray-200 text-gray-600">
                  Xem tất cả
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center flex items-center">
                <div className="col-span-5 md:col-span-4">Tên lớp</div>
                <div className="col-span-3 hidden md:block">Môn / Kỳ</div>
                <div className="col-span-3 md:col-span-2">Sĩ số</div>
                <div className="col-span-4 md:col-span-3">Trạng thái</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-50">
                {recentCourses.map((course, index) => (
                  <div key={course.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">
                    {/* Course Info */}
                    <div className="col-span-5 md:col-span-4 flex items-center justify-center gap-4">
                      <div className="w-8 flex justify-center text-sm font-medium text-gray-400">
                        {index + 1}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-800 text-sm">
                          {course.code}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 max-w-[120px] truncate">
                          {course.name}
                        </div>
                      </div>
                    </div>

                    {/* Subject & Semester */}
                    <div className="col-span-3 hidden md:flex flex-col gap-1 items-center justify-center">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {getSubjectName(course.subjectId)}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {getSemesterName(course.semesterId)}
                      </span>
                    </div>

                    {/* Students */}
                    <div className="col-span-3 md:col-span-2 text-center">
                      <div className="text-sm font-semibold text-gray-700">
                        {course.currentStudents}<span className="text-gray-400 text-xs ml-1">/ {course.maxStudents}</span>
                      </div>
                    </div>

                    {/* Status & Action */}
                    <div className="col-span-4 md:col-span-3 flex items-center justify-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider inline-block whitespace-nowrap ${course.status === 'ACTIVE' ? 'text-green-600 bg-green-50' :
                        course.status === 'UPCOMING' ? 'text-blue-600 bg-blue-50' :
                          'text-gray-600 bg-gray-100'
                        }`}>
                        {course.status === 'ACTIVE' ? 'ĐANG MỞ' : course.status === 'UPCOMING' ? 'SẮP MỞ' : 'ĐÃ ĐÓNG'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
