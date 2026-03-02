// Lecturer Dashboard - Enterprise UI overhaul (logic unchanged)
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import db from "../../mock/db.js";
import {
  Users, GitBranch, LayoutList, AlertTriangle,
  BookOpen, ChevronRight, Settings2, Eye, Bell,
  Filter
} from "lucide-react";

export default function LecturerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [filter, setFilter] = useState("all"); // all | inactive-students | inactive-groups

  useEffect(() => { loadSubjects(); }, []);

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
      const allSubjects = db.findMany("subjects");
      setSubjects(allSubjects);
    } catch (err) {
      error("Không thể tải danh sách môn học");
    }
  };

  const loadCoursesForSubject = (subjectId) => {
    try {
      setLoading(true);
      const allCourses = db.findMany("courses", { subjectId });
      const lecturerCourses = allCourses.filter((course) => {
        const assignments = db.findMany("courseLecturers", {
          courseId: course.id,
          lecturerId: user?.id,
        });
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
      if (filter === "inactive-students") {
        courseGroups = courseGroups.filter((g) => g.githubStatus === "PENDING");
      } else if (filter === "inactive-groups") {
        courseGroups = courseGroups.filter(
          (g) => g.githubStatus !== "APPROVED" || g.jiraStatus !== "APPROVED"
        );
      }
      setGroups(courseGroups);
    } catch (err) {
      error("Không thể tải danh sách nhóm");
    } finally {
      setLoading(false);
    }
  };

  const handleManageGroups = () => {
    if (!selectedCourse) { error("Vui lòng chọn lớp học"); return; }
    navigate(`/lecturer/course/${selectedCourse}/manage-groups`);
  };

  const handleViewGroupDetail = (groupId) => navigate(`/lecturer/group/${groupId}`);
  const handleSendWarning = (group) => success(`Đã gửi cảnh báo đến nhóm "${group.name}"`);

  const getGroupStats = (group) => {
    const students = db.getGroupStudents(group.id);
    return {
      totalStudents: students.length,
      githubApproved: group.githubStatus === "APPROVED",
      jiraApproved: group.jiraStatus === "APPROVED",
    };
  };

  const currentSubject = subjects.find((s) => s.id === selectedSubject);
  const currentCourse = courses.find((c) => c.id === selectedCourse);

  // Derived stats from all loaded groups (for summary cards)
  const allGroups = selectedCourse ? db.getCourseGroups(selectedCourse) : [];
  const totalGroups = allGroups.length;
  const githubLinked = allGroups.filter((g) => g.githubStatus === "APPROVED").length;
  const jiraLinked = allGroups.filter((g) => g.jiraStatus === "APPROVED").length;
  const warnings = allGroups.filter(
    (g) => g.githubStatus !== "APPROVED" || g.jiraStatus !== "APPROVED"
  ).length;

  return (
    <div className="space-y-6">

      {/* ── Breadcrumb ─────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
        <span className="text-teal-700 font-semibold">Giảng viên</span>
        <ChevronRight size={12} />
        <span className="text-gray-600">Tổng quan</span>
        {currentSubject && (<><ChevronRight size={12} /><span className="text-gray-600">{currentSubject.code}</span></>)}
        {currentCourse && (<><ChevronRight size={12} /><span className="text-gray-800 font-semibold">{currentCourse.code}</span></>)}
      </nav>

      {/* ── Summary Stats Cards ────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<LayoutList size={20} />}
          color="bg-blue-500"
          label="Tổng nhóm"
          value={selectedCourse ? totalGroups : "—"}
        />
        <StatCard
          icon={<GitBranch size={20} />}
          color="bg-teal-500"
          label="GitHub đã duyệt"
          value={selectedCourse ? githubLinked : "—"}
        />
        <StatCard
          icon={<BookOpen size={20} />}
          color="bg-indigo-500"
          label="Jira đã duyệt"
          value={selectedCourse ? jiraLinked : "—"}
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          color="bg-orange-400"
          label="Cần cảnh báo"
          value={selectedCourse ? warnings : "—"}
        />
      </div>

      {/* ── Control Panel ──────────────────────────── */}
      <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-teal-600" />
              <CardTitle className="text-base font-semibold text-gray-800">Bộ lọc lớp học</CardTitle>
            </div>
            {selectedCourse && (
              <Button
                onClick={handleManageGroups}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm h-9 px-5 shadow-sm border-0 transition-all focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
              >
                <Settings2 size={14} />
                Quản lý nhóm
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-5 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <SelectField
              label="Môn học"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">— Chọn môn học —</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.code} – {s.name}</option>
              ))}
            </SelectField>

            <SelectField
              label="Lớp học"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={!selectedSubject || courses.length === 0}
            >
              <option value="">— Chọn lớp học —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.code}</option>
              ))}
            </SelectField>

            <SelectField
              label="Bộ lọc"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              disabled={!selectedCourse}
            >
              <option value="all">Tất cả nhóm</option>
              <option value="inactive-students">Học sinh ít commit</option>
              <option value="inactive-groups">Nhóm chưa hoàn thành</option>
            </SelectField>
          </div>
        </CardContent>
      </Card>

      {/* ── Groups Table ───────────────────────────── */}
      {selectedCourse && (
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-800">
                Danh sách Nhóm
                {currentCourse && (
                  <span className="ml-2 text-sm font-normal text-gray-400">– {currentCourse.code}</span>
                )}
              </CardTitle>
              <span className="text-xs text-gray-400 font-medium bg-gray-50 rounded-full px-3 py-1">
                {groups.length} nhóm
              </span>
            </div>
          </CardHeader>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-4">Nhóm / Đề tài</div>
            <div className="col-span-3 hidden md:block text-center">Thành viên</div>
            <div className="col-span-3 hidden md:block text-center">Trạng thái</div>
            <div className="col-span-5 md:col-span-2 text-right">Thao tác</div>
          </div>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
                <p className="text-sm text-gray-400">Đang tải dữ liệu...</p>
              </div>
            ) : groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Users size={24} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">Chưa có nhóm nào trong lớp học này.</p>
                <Button
                  onClick={handleManageGroups}
                  className="mt-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm h-9 px-5 shadow-sm border-0"
                >
                  + Tạo nhóm đầu tiên
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {groups.map((group) => {
                  const stats = getGroupStats(group);
                  const students = db.getGroupStudents(group.id);
                  return (
                    <div
                      key={group.id}
                      className="grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors group"
                    >
                      {/* Col: Group name + topic */}
                      <div className="col-span-7 md:col-span-4">
                        <p className="font-semibold text-gray-800 text-sm leading-snug">{group.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">
                          {group.topic || <span className="italic">Chưa có đề tài</span>}
                        </p>
                      </div>

                      {/* Col: Members */}
                      <div className="col-span-3 hidden md:flex items-center justify-center gap-1">
                        <div className="flex -space-x-2">
                          {students.slice(0, 3).map((s) => (
                            <div
                              key={s.id}
                              className="w-7 h-7 rounded-full bg-teal-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-teal-700"
                              title={s.name}
                            >
                              {s.name?.charAt(0)}
                            </div>
                          ))}
                          {students.length > 3 && (
                            <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-medium text-gray-500">
                              +{students.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 ml-1">{students.length} SV</span>
                      </div>

                      {/* Col: Status badges */}
                      <div className="col-span-3 hidden md:flex items-center justify-center gap-2">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${stats.githubApproved
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                          }`}>
                          <GitBranch size={10} />
                          GitHub
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${stats.jiraApproved
                            ? "bg-blue-50 text-blue-700"
                            : "bg-gray-100 text-gray-500"
                          }`}>
                          <BookOpen size={10} />
                          Jira
                        </span>
                      </div>

                      {/* Col: Actions */}
                      <div className="col-span-5 md:col-span-2 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewGroupDetail(group.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg px-3 py-1.5 transition-colors border border-teal-100"
                        >
                          <Eye size={12} />
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleSendWarning(group)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg px-3 py-1.5 transition-colors border border-orange-100"
                          title="Gửi cảnh báo"
                        >
                          <Bell size={12} />
                          <span className="hidden sm:inline">Cảnh báo</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Empty State (no course selected) ──────── */}
      {!selectedCourse && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-20 h-20 rounded-3xl bg-teal-50 flex items-center justify-center shadow-inner">
            <BookOpen size={36} className="text-teal-400" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-gray-700">Chọn lớp học để bắt đầu</p>
            <p className="text-sm text-gray-400">Sử dụng bộ lọc phía trên để chọn môn học và lớp học</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ───────────────────────────────────────────── */

function StatCard({ icon, color, label, value }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
      <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center shrink-0 shadow-inner`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <h3 className="text-2xl font-bold text-gray-800 leading-none mt-0.5">{value}</h3>
      </div>
    </div>
  );
}

function SelectField({ label, children, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
      <select
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
