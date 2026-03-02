// Lecturer Dashboard — Enterprise SaaS (logic unchanged, UI overhauled)
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import db from "../../mock/db.js";
import {
  LayoutList, GitBranch, BookOpen, AlertTriangle,
  Users, Eye, Bell, Settings2, Filter, ChevronRight,
  TrendingUp, Clock, CheckCircle, Activity
} from "lucide-react";

/* ─── Derived mock alerts from groups ─────────────── */
function buildAlerts(groups) {
  return groups
    .filter(g => g.githubStatus !== "APPROVED" || g.jiraStatus !== "APPROVED")
    .slice(0, 5)
    .map(g => ({
      id: g.id,
      name: g.name,
      msg: [
        g.githubStatus !== "APPROVED" && "GitHub chưa được duyệt",
        g.jiraStatus !== "APPROVED" && "Jira chưa được duyệt",
      ].filter(Boolean).join(" · "),
      severity: "warning",
    }));
}

/* ─── Derived mock recent activity ────────────────── */
const MOCK_ACTIVITY = [
  { id: 1, icon: GitBranch, color: "text-teal-600 bg-teal-50", msg: "Nhóm A đã submit GitHub repo", time: "5 phút trước" },
  { id: 2, icon: BookOpen, color: "text-blue-600 bg-blue-50", msg: "Nhóm B đã kết nối Jira project", time: "1 giờ trước" },
  { id: 3, icon: FileText, color: "text-indigo-600 bg-indigo-50", msg: "SRS Draft từ Nhóm C đang chờ review", time: "3 giờ trước" },
  { id: 4, icon: CheckCircle, color: "text-green-600 bg-green-50", msg: "Nhóm D: GitHub đã được phê duyệt", time: "Hôm qua" },
];

import { FileText } from "lucide-react";

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
  const [filter, setFilter] = useState("all");

  useEffect(() => { loadSubjects(); }, []);
  useEffect(() => {
    if (selectedSubject) loadCoursesForSubject(selectedSubject);
    else { setCourses([]); setSelectedCourse(""); }
  }, [selectedSubject]);
  useEffect(() => {
    if (selectedCourse) loadGroupsForCourse(selectedCourse);
    else setGroups([]);
  }, [selectedCourse, filter]);

  const loadSubjects = () => {
    try { setSubjects(db.findMany("subjects")); }
    catch { error("Không thể tải môn học"); }
  };

  const loadCoursesForSubject = (subjectId) => {
    try {
      setLoading(true);
      const all = db.findMany("courses", { subjectId });
      const mine = all.filter(c => db.findMany("courseLecturers", { courseId: c.id, lecturerId: user?.id }).length > 0);
      setCourses(mine);
      if (mine.length > 0 && !selectedCourse) setSelectedCourse(mine[0].id);
    } catch { error("Không thể tải lớp học"); }
    finally { setLoading(false); }
  };

  const loadGroupsForCourse = (courseId) => {
    try {
      setLoading(true);
      let g = db.getCourseGroups(courseId);
      if (filter === "inactive-students") g = g.filter(x => x.githubStatus === "PENDING");
      else if (filter === "inactive-groups") g = g.filter(x => x.githubStatus !== "APPROVED" || x.jiraStatus !== "APPROVED");
      setGroups(g);
    } catch { error("Không thể tải nhóm"); }
    finally { setLoading(false); }
  };

  const handleManageGroups = () => {
    if (!selectedCourse) { error("Vui lòng chọn lớp học"); return; }
    navigate(`/lecturer/course/${selectedCourse}/manage-groups`);
  };

  const handleSendWarning = (group) => success(`Đã gửi cảnh báo đến nhóm "${group.name}"`);

  // Derived stats
  const allCourseGroups = selectedCourse ? db.getCourseGroups(selectedCourse) : [];
  const stats = {
    total: allCourseGroups.length,
    github: allCourseGroups.filter(g => g.githubStatus === "APPROVED").length,
    jira: allCourseGroups.filter(g => g.jiraStatus === "APPROVED").length,
    alerts: allCourseGroups.filter(g => g.githubStatus !== "APPROVED" || g.jiraStatus !== "APPROVED").length,
  };
  const alerts = buildAlerts(allCourseGroups);
  const currentSubject = subjects.find(s => s.id === selectedSubject);
  const currentCourse = courses.find(c => c.id === selectedCourse);

  return (
    <div className="space-y-7">
      {/* ── Breadcrumb ──────────────────────── */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
        <span className="text-teal-700 font-semibold">Giảng viên</span>
        <ChevronRight size={12} />
        <span className="text-gray-800 font-semibold">Tổng quan</span>
        {currentSubject && <><ChevronRight size={12} /><span>{currentSubject.code}</span></>}
        {currentCourse && <><ChevronRight size={12} /><span className="font-semibold text-gray-800">{currentCourse.code}</span></>}
      </nav>

      {/* ── C. Command Bar / Control Panel ───── */}
      <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-teal-600" />
              <CardTitle className="text-base font-semibold text-gray-800">Bộ lọc lớp học</CardTitle>
            </div>
            {selectedCourse && (
              <Button
                onClick={handleManageGroups}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm h-9 px-5 shadow-sm border-0 transition-all focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
              >
                <Settings2 size={14} />Quản lý nhóm
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-5 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <SelectField label="Môn học" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
              <option value="">— Chọn môn học —</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.code} – {s.name}</option>)}
            </SelectField>
            <SelectField label="Lớp học" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} disabled={!selectedSubject || courses.length === 0}>
              <option value="">— Chọn lớp học —</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
            </SelectField>
            <SelectField label="Bộ lọc" value={filter} onChange={e => setFilter(e.target.value)} disabled={!selectedCourse}>
              <option value="all">Tất cả nhóm</option>
              <option value="inactive-students">Ít commit</option>
              <option value="inactive-groups">Chưa hoàn thành</option>
            </SelectField>
          </div>
        </CardContent>
      </Card>

      {/* ── A. Summary Stats ────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<LayoutList size={20} />} color="bg-blue-500" label="Tổng nhóm" value={selectedCourse ? stats.total : "—"} />
        <StatCard icon={<GitBranch size={20} />} color="bg-teal-500" label="GitHub đã duyệt" value={selectedCourse ? stats.github : "—"} />
        <StatCard icon={<BookOpen size={20} />} color="bg-indigo-500" label="Jira đã duyệt" value={selectedCourse ? stats.jira : "—"} />
        <StatCard icon={<AlertTriangle size={20} />} color="bg-orange-400" label="Cần cảnh báo" value={selectedCourse ? stats.alerts : "—"} />
      </div>

      {/* ── B. Activity & Alerts (2-col) ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Alerts */}
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                <AlertTriangle size={15} className="text-orange-500" />
              </div>
              <CardTitle className="text-base font-semibold text-gray-800">Cảnh báo gần đây</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <CheckCircle size={28} className="text-green-400" />
                <p className="text-sm text-gray-400">Không có cảnh báo nào</p>
              </div>
            ) : alerts.map(a => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0">
                <div className="w-1.5 h-1.5 mt-2 rounded-full bg-orange-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{a.name}</p>
                  <p className="text-xs text-orange-600 mt-0.5">{a.msg}</p>
                </div>
                <button
                  onClick={() => handleSendWarning({ name: a.name })}
                  className="shrink-0 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Bell size={11} className="inline mr-1" />Nhắc
                </button>
              </div>
            ))}
            <div className="px-5 py-3 border-t border-gray-50">
              <button onClick={() => navigate("/lecturer/alerts")} className="text-xs text-teal-600 font-medium hover:underline">
                Xem tất cả cảnh báo →
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Activity */}
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                <Activity size={15} className="text-teal-600" />
              </div>
              <CardTitle className="text-base font-semibold text-gray-800">Hoạt động gần đây</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {MOCK_ACTIVITY.map(act => (
              <div key={act.id} className="flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${act.color}`}>
                  <act.icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">{act.msg}</p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock size={10} />{act.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>



      {/* ── D. Group Overview ────────────────── */}
      {selectedCourse && (
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-800">
                Nhóm {currentCourse && <span className="text-gray-400 font-normal ml-1">— {currentCourse.code}</span>}
              </CardTitle>
              <span className="text-xs text-gray-400 bg-gray-50 rounded-full px-3 py-1 font-medium border border-gray-100">
                {groups.length} nhóm
              </span>
            </div>
          </CardHeader>

          {/* Table header */}
          <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-4">Nhóm / Đề tài</div>
            <div className="col-span-3 hidden md:block text-center">Thành viên</div>
            <div className="col-span-3 hidden md:block text-center">Trạng thái</div>
            <div className="col-span-5 md:col-span-2 text-right">Thao tác</div>
          </div>

          <CardContent className="p-0">
            {loading ? (
              <LoadingRows />
            ) : groups.length === 0 ? (
              <EmptyGroups onAction={handleManageGroups} />
            ) : (
              <div className="divide-y divide-gray-50">
                {groups.map(group => {
                  const students = db.getGroupStudents(group.id);
                  const githubOk = group.githubStatus === "APPROVED";
                  const jiraOk = group.jiraStatus === "APPROVED";
                  return (
                    <GroupRow
                      key={group.id}
                      group={group}
                      students={students}
                      githubOk={githubOk}
                      jiraOk={jiraOk}
                      onDetail={() => navigate(`/lecturer/group/${group.id}`)}
                      onWarn={() => handleSendWarning(group)}
                    />
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty state when no course selected */}
      {!selectedCourse && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-20 h-20 rounded-3xl bg-teal-50 flex items-center justify-center shadow-inner">
            <TrendingUp size={36} className="text-teal-400" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-gray-700">Chọn lớp học để xem dashboard</p>
            <p className="text-sm text-gray-400">Sử dụng bộ lọc phía trên để chọn môn học và lớp học</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ───────────────────────────────── */

function StatCard({ icon, color, label, value }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
      <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center shrink-0 shadow-inner`}>{icon}</div>
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
      <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed" {...props}>
        {children}
      </select>
    </div>
  );
}

function GroupRow({ group, students, githubOk, jiraOk, onDetail, onWarn }) {
  const hasAlert = !githubOk || !jiraOk;
  return (
    <div className={`grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors border-l-4 ${hasAlert ? "border-l-orange-300" : "border-l-transparent"}`}>
      <div className="col-span-7 md:col-span-4">
        <p className="font-semibold text-gray-800 text-sm leading-snug">{group.name}</p>
        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">
          {group.topic || <span className="italic">Chưa có đề tài</span>}
        </p>
      </div>
      <div className="col-span-3 hidden md:flex items-center justify-center gap-1">
        <div className="flex -space-x-2">
          {students.slice(0, 3).map(s => (
            <div key={s.id} className="w-7 h-7 rounded-full bg-teal-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-teal-700" title={s.name}>
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
      <div className="col-span-3 hidden md:flex items-center justify-center gap-2">
        <StatusPill ok={githubOk} icon={<GitBranch size={10} />} label="GitHub" />
        <StatusPill ok={jiraOk} icon={<BookOpen size={10} />} label="Jira" />
      </div>
      <div className="col-span-5 md:col-span-2 flex items-center justify-end gap-2">
        <button onClick={onDetail} className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg px-3 py-1.5 transition-colors border border-teal-100">
          <Eye size={12} />Chi tiết
        </button>
        <button onClick={onWarn} className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg px-3 py-1.5 transition-colors border border-orange-100" title="Gửi cảnh báo">
          <Bell size={12} />
        </button>
      </div>
    </div>
  );
}

function StatusPill({ ok, icon, label }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${ok ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
      {icon}{label}{ok && " ✓"}
    </span>
  );
}

function LoadingRows() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      <p className="text-sm text-gray-400">Đang tải...</p>
    </div>
  );
}

function EmptyGroups({ onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Users size={24} className="text-gray-400" />
      </div>
      <p className="text-sm text-gray-500">Chưa có nhóm nào trong lớp học này.</p>
      <Button onClick={onAction} className="mt-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm h-9 px-5 shadow-sm border-0">
        + Tạo nhóm đầu tiên
      </Button>
    </div>
  );
}
