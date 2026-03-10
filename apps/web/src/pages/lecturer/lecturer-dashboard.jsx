import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { subDays } from "date-fns";
import { useGetSemesters } from "../../features/system/hooks/useSystem.js";
import { useGetProjects } from "../../features/projects/hooks/useProjects.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
// Lecturer Dashboard — Enterprise SaaS (Real API)
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { GroupRadarChart } from "../../components/charts/radar-chart.jsx";
import {
  LayoutList, GitBranch, BookOpen, AlertTriangle,
  Users, Eye, Bell, Settings2, Filter, ChevronRight,
  TrendingUp, Clock, CheckCircle, Activity, FileText
} from "lucide-react";

// Feature Hooks
import { useGetSubjects } from "../../features/system/hooks/useSystem.js";
import { useGetCourses, useGetCourseById } from "../../features/courses/hooks/useCourses.js";
import { useApproveIntegration, useRejectIntegration } from "../../features/projects/hooks/useProjects.js";
import { useGetAlerts, useResolveAlert } from "../../features/system/hooks/useAlerts.js";

// Tạm thời để buildAlerts cũ cho dashboard nhỏ, hoặc dùng useGetAlerts


/* ─── Derived mock recent activity (keep for UI) ────────────────── */
// hoặc useGetGroups nếu có
const MOCK_ACTIVITY = [
  { id: 1, icon: GitBranch, color: "text-teal-600 bg-teal-50", msg: "Nhóm A đã submit GitHub repo", time: "5 phút trước" },
  { id: 2, icon: BookOpen, color: "text-blue-600 bg-blue-50", msg: "Nhóm B đã kết nối Jira project", time: "1 giờ trước" },
  { id: 3, icon: FileText, color: "text-indigo-600 bg-indigo-50", msg: "SRS Draft từ Nhóm C đang chờ review", time: "3 giờ trước" },
  { id: 4, icon: CheckCircle, color: "text-green-600 bg-green-50", msg: "Nhóm D: GitHub đã được phê duyệt", time: "Hôm qua" },
];

export default function LecturerDashboard() {

  
  const navigate = useNavigate();
  const { success, error } = useToast();

const [semesterFilter, setSemesterFilter] = useState("all");
const [courseFilter, setCourseFilter] = useState("all");
const [groupFilter, setGroupFilter] = useState("all");

const { data: semesters = [] } = useGetSemesters();
const { data: coursesApi  = [] } = useGetCourses();
const { data: projects  = [] } = useGetProjects(); 


const [selectedSubject, setSelectedSubject] = useState("");
const [selectedCourse, setSelectedCourse] = useState("");
const [filter, setFilter] = useState("all");

const { data: subjectsData = { items: [] } } = useGetSubjects();
const { data: coursesData = { items: [] } } = useGetCourses();
const { data: course, isLoading: loadingCourse } = useGetCourseById(selectedCourse);
const { data: alertsData } = useGetAlerts({ pageSize: 5 });

/* ───── Demo fallback data (when API empty) ───── */

const demoSubjects = [
  { id: 1, code: "SWD392", name: "Software Architecture" }
];

const demoCourses = [
  { id: 1, code: "SWD392-SE1831", subjectId: 1 }
];

/* ───── Merge API + demo ───── */

const subjects = subjectsData.items.length
  ? subjectsData.items
  : demoSubjects;

const coursesRaw = coursesData.items.length
  ? coursesData.items
  : coursesApi.length
    ? coursesApi
    : demoCourses;

/* ───── Auto select subject ───── */

useEffect(() => {
  if (!selectedSubject && subjects.length) {
    setSelectedSubject(subjects[0].id);
  }
}, [subjects]);

/* ───── Filter course by subject ───── */

const courses = coursesRaw.filter(
  c => !selectedSubject || c.subjectId === parseInt(selectedSubject)
);

/* ───── Auto select course ───── */

useEffect(() => {
  if (!selectedCourse && courses.length) {
    setSelectedCourse(courses[0].id);
  }
}, [courses]);

  const approveIntMutation = useApproveIntegration();
  const rejectIntMutation = useRejectIntegration();
  const resolveAlertMutation = useResolveAlert();

const MOCK_HEATMAP = [
  { date: "2026-03-01", count: 3 },
  { date: "2026-03-02", count: 6 },
  { date: "2026-03-03", count: 2 },
  { date: "2026-03-04", count: 8 },
  { date: "2026-03-05", count: 4 }
];

const MOCK_COMMITS = [
  { day: "Mon", commits: 5 },
  { day: "Tue", commits: 7 },
  { day: "Wed", commits: 3 },
  { day: "Thu", commits: 9 },
  { day: "Fri", commits: 12 }
];

  //const subjects = subjectsData.items || [];
  //const courses = (coursesData.items || []).filter(c => !selectedSubject || c.subjectId === parseInt(selectedSubject));

  const demoGroups = [
  {
    id: 1,
    name: "Team Alpha",
    topic: "AI Interview System",
    team: [
      { id: 1, name: "An" },
      { id: 2, name: "Binh" },
      { id: 3, name: "Chi" }
    ],
    integration: {
      githubStatus: "APPROVED",
      jiraStatus: "APPROVED"
    }
  },
  {
    id: 2,
    name: "Team Beta",
    topic: "Job Matching Platform",
    team: [
      { id: 4, name: "Dung" },
      { id: 5, name: "Huy" }
    ],
    integration: {
      githubStatus: "PENDING",
      jiraStatus: "APPROVED"
    }
  },
  {
    id: 3,
    name: "Team Gamma",
    topic: "Smart Resume Analyzer",
    team: [
      { id: 6, name: "Lan" },
      { id: 7, name: "Minh" }
    ],
    integration: {
      githubStatus: "APPROVED",
      jiraStatus: "PENDING"
    }
  }
];


   const groups = course?.groups?.length ? course.groups : demoGroups;


  const handleManageGroups = () => {
    if (!selectedCourse) { error("Vui lòng chọn lớp học"); return; }
    navigate(`/lecturer/course/${selectedCourse}/manage-groups`);
  };

  const handleSendWarning = (group) => success(`Đã gửi cảnh báo đến nhóm "${group.name}"`);

  const handleApprovePending = async (groupId, type) => {
    try {
      await approveIntMutation.mutateAsync(groupId);
      success(`Đã duyệt tích hợp cho nhóm`);
    } catch (err) {
      error(err.message || `Lỗi khi duyệt tích hợp`);
    }
  };

  const handleRejectPending = async (groupId, type) => {
    const reason = prompt("Nhập lý do từ chối học kỳ/tích hợp:");
    if (reason === null) return;
    try {
      await rejectIntMutation.mutateAsync({ projectId: groupId, reason });
      success(`Đã từ chối tích hợp`);
    } catch (err) {
      error(err.message || `Lỗi khi từ chối tích hợp`);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await resolveAlertMutation.mutateAsync(alertId);
      success("Đã đánh dấu cảnh báo là đã xử lý");
    } catch (err) {
      error(err.message || "Không thể xử lý cảnh báo");
    }
  };

  // Derived stats
  const stats = {
    total: groups.length,
    github: groups.filter(g => g.integration?.githubStatus === "APPROVED").length,
    jira: groups.filter(g => g.integration?.jiraStatus === "APPROVED").length,
    alerts: groups.filter(g => g.integration?.githubStatus !== "APPROVED" || g.integration?.jiraStatus !== "APPROVED").length,
  };
  const alertsList = (alertsData?.items || []).filter(a => a.status === "OPEN").map(a => ({
    id: a.id,
    name: a.groupName,
    msg: a.message,
    severity: a.severity.toLowerCase() === "high" ? "error" : "warning"
  }));
  const currentSubject = subjects.find(s => s.id === parseInt(selectedSubject));
  const currentCourse = courses.find(c => c.id === parseInt(selectedCourse));

  const pendingIntegrations = groups.filter(
    g => g.integration?.githubStatus === "PENDING" || g.integration?.jiraStatus === "PENDING"
  );

  // Build RadarChart data from groups
  const radarData = groups.map(group => {
    const teamSize = group.team?.length || 0;
    return {
      groupName: group.name,
      commits: Math.floor(Math.random() * 20) + 1, // Mock commits for now
      srsDone: Math.floor(Math.random() * 3), // Mock SRS for now
      teamSize,
      githubLinked: group.integration?.githubStatus === 'APPROVED' ? 1 : 0,
      jiraLinked: group.integration?.jiraStatus === 'APPROVED' ? 1 : 0,
    };
  });


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
            {alertsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <CheckCircle size={28} className="text-green-400" />
                <p className="text-sm text-gray-400">Không có cảnh báo nào</p>
              </div>
            ) : alertsList.map(a => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0 group">
                <div className="w-1.5 h-1.5 mt-2 rounded-full bg-orange-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{a.name}</p>
                  <p className="text-xs text-orange-600 mt-0.5">{a.msg}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleResolveAlert(a.id)}
                    className="shrink-0 text-gray-400 hover:text-green-600 transition-colors p-1"
                    title="Đánh dấu đã xử lý"
                  >
                    <CheckCircle size={16} />
                  </button>
                  <button
                    onClick={() => handleSendWarning({ name: a.name })}
                    className="shrink-0 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-100 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <Bell size={11} className="inline mr-1" />Nhắc
                  </button>
                </div>
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
            <div className="col-span-12 md:col-span-2 text-right">Thao tác</div>
          </div>

          <CardContent className="p-0">
            {loadingCourse ? (
              <LoadingRows />
            ) : groups.length === 0 ? (
              <EmptyGroups onAction={handleManageGroups} />
            ) : (
              <div className="divide-y divide-gray-50">
                {groups.map(group => {
                  const githubOk = group.integration?.githubStatus === "APPROVED";
                  const jiraOk = group.integration?.jiraStatus === "APPROVED";
                  return (
                    <GroupRow
                      key={group.id}
                      group={group}
                      students={group.team || []}
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

      {/* Duyệt Tích hợp của Lớp (Pending Integrations) ──────── */}
      {selectedCourse && pendingIntegrations.length > 0 && (
        <Card className="border border-amber-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-amber-50 pb-4 bg-amber-50/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertTriangle size={15} className="text-amber-600" />
              </div>
              <CardTitle className="text-base font-semibold text-amber-900">Duyệt Link Tích Hợp</CardTitle>
              <span className="text-xs text-amber-700 bg-amber-100 rounded-full px-3 py-1 font-bold border border-amber-200 ml-auto">
                {pendingIntegrations.length} yêu cầu
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-amber-50">
              {pendingIntegrations.map(group => (
                <div key={`pending-${group.id}`} className="px-6 py-4 hover:bg-amber-50/20 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-gray-800">{group.name}</p>
                    <button
                      onClick={() => navigate(`/lecturer/group/${group.id}`)}
                      className="text-[10px] font-semibold text-teal-600 hover:underline"
                    >
                      Xem chi tiết nhóm →
                    </button>
                  </div>

                  {/* GitHub Pending */}
                  {group.integration?.githubStatus === "PENDING" && (
                    <div className="flex items-center justify-between bg-gray-50/80 p-3 rounded-xl border border-gray-100 mb-2">
                      <div className="flex items-center gap-2 overflow-hidden mr-4">
                        <GitBranch size={14} className="text-gray-600 shrink-0" />
                        <a href={group.integration?.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                          {group.integration?.githubUrl}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button size="sm" onClick={() => handleApprovePending(group.id, 'github')} className="h-7 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[11px] font-bold shadow-sm">Duyệt</Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectPending(group.id, 'github')} className="h-7 px-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-[11px] font-bold shadow-sm">Từ chối</Button>
                      </div>
                    </div>
                  )}

                  {/* Jira Pending */}
                  {group.integration?.jiraStatus === "PENDING" && (
                    <div className="flex items-center justify-between bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 overflow-hidden mr-4">
                        <BookOpen size={14} className="text-gray-600 shrink-0" />
                        <a href={group.integration?.jiraUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                          {group.integration?.jiraUrl}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button size="sm" onClick={() => handleApprovePending(group.id, 'jira')} className="h-7 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[11px] font-bold shadow-sm">Duyệt</Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectPending(group.id, 'jira')} className="h-7 px-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-[11px] font-bold shadow-sm">Từ chối</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}


      {/* ── E. RadarChart — So sánh Nhóm ──────── */}

      {/* ── F. Contribution Heatmap ───────────── */}
{/* ── F. Contribution Heatmap ───────────── */}
{/* ── F. Contribution Heatmap ───────────── */}
{selectedCourse && (
<Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">

<CardHeader className="border-b border-gray-50 pb-4">
<CardTitle className="text-base font-semibold text-gray-800">
Contribution Activity
</CardTitle>
</CardHeader>

<CardContent className="pt-5 pb-6">

{/* ─── Heatmap Filters ─── */}

<div className="flex gap-3 mb-4">

<select
value={semesterFilter}
onChange={(e)=>setSemesterFilter(e.target.value)}
className="border rounded-lg px-3 py-2 text-sm"
>
<option value="all">Semester</option>
{semesters.map(s=>(
<option key={s.id} value={s.id}>
{s.name}
</option>
))}
</select>

<select
value={courseFilter}
onChange={(e)=>setCourseFilter(e.target.value)}
className="border rounded-lg px-3 py-2 text-sm"
>
<option value="all">Course</option>
{courses.map(c=>(
<option key={c.id} value={c.id}>
{c.code}
</option>
))}
</select>

<select
value={groupFilter}
onChange={(e)=>setGroupFilter(e.target.value)}
className="border rounded-lg px-3 py-2 text-sm"
>
<option value="all">Group</option>
{groups.map(g=>(
<option key={g.id} value={g.id}>
{g.name}
</option>
))}
</select>

</div>

<CalendarHeatmap
startDate={subDays(new Date(), 90)}
endDate={new Date()}
values={MOCK_HEATMAP}
/>

{/* Legend */}

<div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
Less
<div className="w-3 h-3 bg-gray-200 rounded-sm"/>
<div className="w-3 h-3 bg-green-200 rounded-sm"/>
<div className="w-3 h-3 bg-green-400 rounded-sm"/>
<div className="w-3 h-3 bg-green-600 rounded-sm"/>
More
</div>

</CardContent>

</Card>
)}

{/* ── G. Commit Trend ───────────────────── */}
{selectedCourse && (
<Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">

<CardHeader className="border-b border-gray-50 pb-4">
<CardTitle className="text-base font-semibold text-gray-800">
Commit Trend
</CardTitle>
</CardHeader>

<CardContent>

<div className="h-64">

<ResponsiveContainer width="100%" height="100%">

<LineChart data={MOCK_COMMITS}>

<XAxis dataKey="day" />
<YAxis />
<Tooltip />

<Line
type="monotone"
dataKey="commits"
stroke="#14b8a6"
strokeWidth={3}
/>

</LineChart>

</ResponsiveContainer>

</div>

</CardContent>

</Card>
)}

{/* ── H. Team Insights ──────────────────── */}

{selectedCourse && (
<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

<TopTeams groups={groups} />

<RiskTeams groups={groups} />

</div>
)}


      {selectedCourse && radarData.length > 0 && (
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                  <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                </svg>
              </div>
              <CardTitle className="text-base font-semibold text-gray-800">So sánh Nhóm</CardTitle>
              <span className="text-xs text-gray-400 bg-gray-50 rounded-full px-3 py-1 font-medium border border-gray-100 ml-auto">
                {radarData.length} nhóm · {currentCourse?.code}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 pb-6">
            <p className="text-xs text-gray-400 mb-4 text-center">
              So sánh 5 chỉ số: Commits · SRS Done · Team Size · GitHub · Jira (đã chuẩn hoá 0–100)
            </p>
            <GroupRadarChart data={radarData} />
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

function TopTeams({ groups }) {

const ranked = [...groups]
.map(g => ({
  name: g.name,
  commits: Math.floor(Math.random()*50)+5
}))
.sort((a,b)=>b.commits-a.commits)
.slice(0,5)

return (

<Card className="border border-gray-100 shadow-sm rounded-[24px]">

<CardHeader>
<CardTitle className="text-base font-semibold">
Top Active Teams
</CardTitle>
</CardHeader>

<CardContent>

{ranked.map((t,i)=>(

<div
key={i}
className="flex justify-between py-2 border-b text-sm"
>

<span>{i+1}. {t.name}</span>

<span className="font-semibold text-teal-600">
{t.commits} commits
</span>

</div>

))}

</CardContent>

</Card>

)
}

function RiskTeams({ groups }) {

const risky = groups.filter(
g => g.integration?.githubStatus !== "APPROVED"
)

return (

<Card className="border border-gray-100 shadow-sm rounded-[24px]">

<CardHeader>
<CardTitle className="text-base font-semibold">
Teams At Risk
</CardTitle>
</CardHeader>

<CardContent>

{risky.length===0 ? (

<p className="text-sm text-gray-400">
No risk teams
</p>

) : risky.map(g=>(

<div
key={g.id}
className="flex justify-between py-2 border-b text-sm"
>

<span>{g.name}</span>

<span className="text-red-500">
Repo missing
</span>

</div>

))}

</CardContent>

</Card>

)
}

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
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
Less
<div className="w-3 h-3 bg-gray-200 rounded-sm"/>
<div className="w-3 h-3 bg-green-200 rounded-sm"/>
<div className="w-3 h-3 bg-green-400 rounded-sm"/>
<div className="w-3 h-3 bg-green-600 rounded-sm"/>
More
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
