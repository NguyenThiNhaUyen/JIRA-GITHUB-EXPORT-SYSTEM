import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  GitBranch, 
  BookOpen, 
  CheckCircle, 
  Activity, 
  FileText,
  Clock,
  Eye,
  Bell,
  AlertTriangle,
  TrendingUp,
  LayoutList,
  ChevronRight,
  Settings2,
  Filter,
  Users
} from "lucide-react";

// Components
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { LecturerStats } from "../../features/dashboard/components/LecturerStats.jsx";
import { LecturerFilters } from "../../features/dashboard/components/LecturerFilters.jsx";
import { GroupRadarChart } from "../../components/charts/radar-chart.jsx";
import { Badge } from "../../components/ui/badge.jsx";

// Hooks
import { useAuth } from "../../context/AuthContext.jsx";
import { 
  useGetSubjects,
  useGetSemesters 
} from "../../features/system/hooks/useSystem.js";
import { 
  useGetCourses, 
  useGetCourseById 
} from "../../features/courses/hooks/useCourses.js";
import { 
  useLecturerWorkload,
} from "../../features/dashboard/hooks/useDashboard.js";
import { 
  useApproveIntegration, 
  useRejectIntegration 
} from "../../features/projects/hooks/useProjects.js";
import { 
  useGetAlerts, 
  useResolveAlert 
} from "../../features/system/hooks/useAlerts.js";

<<<<<<< HEAD
// Tạm thời để buildAlerts cũ cho dashboard nhỏ, hoặc dùng useGetAlerts


/* ─── Derived mock recent activity (keep for UI) ────────────────── */
// hoặc useGetGroups nếu có
const MOCK_ACTIVITY = [];
=======
const MOCK_ACTIVITY = [
  { id: 1, icon: GitBranch, color: "text-teal-600 bg-teal-50", msg: "Nhóm Alpha đã submit GitHub repo", time: "5 phút trước" },
  { id: 2, icon: BookOpen, color: "text-blue-600 bg-blue-50", msg: "Nhóm Beta đã kết nối Jira project", time: "1 giờ trước" },
  { id: 3, icon: FileText, color: "text-indigo-600 bg-indigo-50", msg: "SRS Draft từ Nhóm Gamma đang chờ review", time: "3 giờ trước" },
  { id: 4, icon: CheckCircle, color: "text-green-600 bg-green-50", msg: "Nhóm Delta: Tích hợp đã được phê duyệt", time: "Hôm qua" },
];
>>>>>>> d4f993c269f0e55c18a55ca5482935dba01b41e8

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { user } = useAuth();

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [filter, setFilter] = useState("all");

<<<<<<< HEAD
const { user } = useAuth();
const { data: semesters = [] } = useGetSemesters();
const { data: workload } = useLecturerWorkload(user?.id);
const { data: projects = [] } = useGetProjects(); 


const [selectedSubject, setSelectedSubject] = useState("");
const [selectedCourse, setSelectedCourse] = useState("");
const [filter, setFilter] = useState("all");

const { data: subjectsData = { items: [] } } = useGetSubjects();
const { data: coursesData = { items: [] } } = useGetCourses();
const { data: course, isLoading: loadingCourse } = useGetCourseById(selectedCourse);
const { data: alertsData } = useGetAlerts({ pageSize: 5 });

/* ───── Demo fallback data (when API empty) ───── */





/* ───── Merge API + demo ───── */

const subjects = subjectsData?.items || [];

const coursesRaw = coursesData?.items || [];

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
=======
  const { data: workload } = useLecturerWorkload(user?.id);
  const { data: subjectsData = { items: [] } } = useGetSubjects();
  const { data: coursesData = { items: [] } } = useGetCourses();
  const { data: course, isLoading: loadingCourse } = useGetCourseById(selectedCourse);
  const { data: alertsData } = useGetAlerts({ pageSize: 5 });
>>>>>>> d4f993c269f0e55c18a55ca5482935dba01b41e8

  const approveIntMutation = useApproveIntegration();
  const rejectIntMutation = useRejectIntegration();
  const resolveAlertMutation = useResolveAlert();

  const subjects = subjectsData?.items || [];
  const courses = useMemo(() => {
    const list = coursesData?.items || [];
    return selectedSubject ? list.filter(c => c.subjectId === parseInt(selectedSubject)) : list;
  }, [coursesData, selectedSubject]);

  const groups = course?.groups || [];

  const stats = useMemo(() => ({
    courses: workload?.coursesCount || 0,
    students: workload?.studentsCount || 0,
    github: groups.filter(g => g.integration?.githubStatus === "APPROVED").length,
    alerts: groups.filter(g => g.integration?.githubStatus !== "APPROVED" || g.integration?.jiraStatus !== "APPROVED").length,
  }), [workload, groups]);

<<<<<<< HEAD
  
=======
  const alertsList = (alertsData?.items || []).filter(a => a.status === "OPEN").map(a => ({
    id: a.id,
    name: a.groupName,
    msg: a.message,
    severity: a.severity?.toLowerCase() === "high" ? "error" : "warning"
  }));
>>>>>>> d4f993c269f0e55c18a55ca5482935dba01b41e8

  const pendingIntegrations = groups.filter(
    g => g.integration?.githubStatus === "PENDING" || g.integration?.jiraStatus === "PENDING"
  );

<<<<<<< HEAD
   const groups = course?.groups || [];
=======
  const radarData = useMemo(() => groups.map(group => ({
    groupName: group.name,
    commits: group.stats?.commitsCount || 0,
    srsDone: group.stats?.srsCompletionPercent || 0,
    teamSize: group.team?.length || 0,
    githubLinked: group.integration?.githubStatus === 'APPROVED' ? 100 : 0,
    jiraLinked: group.integration?.jiraStatus === 'APPROVED' ? 100 : 0,
  })), [groups]);
>>>>>>> d4f993c269f0e55c18a55ca5482935dba01b41e8

  const handleApprovePending = async (groupId) => {
    try {
      await approveIntMutation.mutateAsync(groupId);
      success(`Đã phê duyệt tích hợp của nhóm`);
    } catch (err) {
      showError(err.message || `Lỗi phê duyệt`);
    }
  };

  const handleRejectPending = async (groupId) => {
    const reason = prompt("Nhập lý do từ chối tích hợp:");
    if (!reason) return;
    try {
      await rejectIntMutation.mutateAsync({ projectId: groupId, reason });
      success(`Đã từ chối tích hợp`);
    } catch (err) {
      showError(err.message || `Lỗi khi từ chối`);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await resolveAlertMutation.mutateAsync(alertId);
      success("Đã đánh dấu cảnh báo đã hoàn tất");
    } catch (err) {
      showError(err.message || "Xử lý cảnh báo thất bại");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Dashboard Giảng viên"
        subtitle={`Chào mừng trở lại, ${user?.name || 'Giảng viên'}! Dưới đây là tình chuyên môn các lớp học.`}
        breadcrumb={["Giảng viên", "Hệ thống", "Tổng quan"]}
        actions={[
          <Button key="alerts" variant="outline" className="rounded-full w-10 h-10 p-0 border-gray-100 relative" onClick={() => navigate("/lecturer/alerts")}>
            <Bell size={18} />
            {alertsList.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>}
          </Button>
        ]}
      />

      <LecturerStats stats={stats} />

      <LecturerFilters 
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        filter={filter}
        setFilter={setFilter}
        subjects={subjects}
        courses={courses}
        onManageGroups={() => navigate(`/lecturer/course/${selectedCourse}/manage-groups`)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 py-6 px-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center shadow-sm">
                <Activity size={18} className="text-teal-600" />
              </div>
              <CardTitle className="text-sm font-black text-gray-800 uppercase tracking-widest leading-none">Dòng hoạt động thời gian thực</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {MOCK_ACTIVITY.map(act => (
              <div key={act.id} className="flex items-start gap-4 px-8 py-5 border-b border-gray-50 hover:bg-gray-50/20 transition-all last:border-0 group">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${act.color}`}>
                  <act.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-700 leading-tight tracking-tight">{act.msg}</p>
                  <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1 font-bold uppercase tracking-widest">
                    <Clock size={12} className="text-gray-300" /> {act.time}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="rounded-xl h-8 px-3 text-[10px] font-black uppercase tracking-widest text-teal-600 hover:bg-teal-50">Chi tiết</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-50 py-6 px-8">
               <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center shadow-sm">
                  <AlertTriangle size={18} className="text-amber-600" />
                </div>
                <CardTitle className="text-sm font-black text-gray-800 uppercase tracking-widest leading-none">Cảnh báo hệ thống</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                {alertsList.length === 0 ? (
                  <div className="text-center py-4">
                     <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mọi thứ đều ổn ổn định</p>
                  </div>
                ) : alertsList.map(a => (
                  <div key={a.id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex justify-between items-center group transition-all hover:bg-amber-50">
                    <div>
                      <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">{a.name}</p>
                      <p className="text-xs text-amber-700 mt-1 font-bold">{a.msg}</p>
                    </div>
                    <Button onClick={() => handleResolveAlert(a.id)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-amber-600 hover:bg-white"><CheckCircle size={14}/></Button>
                  </div>
                ))}
                <Button 
                  variant="ghost" 
                  className="w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-all border border-dashed border-gray-100"
                  onClick={() => navigate("/lecturer/alerts")}
                >
                  Trung tâm cảnh báo →
                </Button>
              </div>
            </CardContent>
          </Card>

          {pendingIntegrations.length > 0 && (
             <Card className="border border-indigo-100 shadow-sm rounded-[32px] overflow-hidden bg-indigo-50/30">
                <CardHeader className="border-b border-indigo-100 py-6 px-8">
                   <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md">
                      <TrendingUp size={18} className="text-white" />
                    </div>
                    <CardTitle className="text-sm font-black text-gray-800 uppercase tracking-widest leading-none">Phê duyệt Link</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                   {pendingIntegrations.map(g => (
                     <div key={g.id} className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-sm">
                        <p className="text-xs font-black text-gray-800 uppercase tracking-widest mb-3">{g.name}</p>
                        <div className="flex flex-col gap-2">
                          {g.integration?.githubStatus === 'PENDING' && (
                            <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-xl">
                               <div className="flex items-center gap-2 overflow-hidden">
                                 <GitBranch size={14} className="text-gray-400 shrink-0"/>
                                 <span className="text-[10px] font-bold text-blue-600 truncate">{g.integration.githubUrl}</span>
                               </div>
                               <button onClick={() => handleApprovePending(g.id)} className="shrink-0 text-[10px] font-black text-teal-600 uppercase tracking-widest hover:underline">Duyệt</button>
                            </div>
                          )}
                          {g.integration?.jiraStatus === 'PENDING' && (
                            <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-xl">
                               <div className="flex items-center gap-2 overflow-hidden">
                                 <BookOpen size={14} className="text-gray-400 shrink-0"/>
                                 <span className="text-[10px] font-bold text-blue-600 truncate">{g.integration.jiraUrl}</span>
                               </div>
                               <button onClick={() => handleApprovePending(g.id)} className="shrink-0 text-[10px] font-black text-teal-600 uppercase tracking-widest hover:underline">Duyệt</button>
                            </div>
                          )}
                        </div>
                     </div>
                   ))}
                </CardContent>
             </Card>
          )}
        </div>
      </div>

      {selectedCourse && groups.length > 0 && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
              <CardHeader className="border-b border-gray-50 py-6 px-8 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg">
                      <LayoutList size={18} className="text-white" />
                    </div>
                    <CardTitle className="text-sm font-black text-gray-800 uppercase tracking-widest leading-none">Bảng theo dõi nhóm</CardTitle>
                  </div>
                  <Badge className="bg-teal-50 border-teal-100 text-teal-700 rounded-full py-1.5 px-4 font-black text-[10px] uppercase tracking-widest">{groups.length} NHÓM</Badge>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead className="bg-gray-50/50">
                          <tr>
                             <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Nhóm & Đề tài</th>
                             <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center border-b border-gray-100">Cấu hình Link</th>
                             <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center border-b border-gray-100">Thành viên</th>
                             <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right border-b border-gray-100">Hành động</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {groups.map(g => (
                            <tr key={g.id} className="hover:bg-teal-50/10 transition-all border-none group">
                               <td className="py-6 px-8">
                                  <p className="font-black text-gray-800 text-sm tracking-tight">{g.name}</p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 truncate max-w-[200px]">{g.topic || "Chưa đăng ký đề tài"}</p>
                               </td>
                               <td className="py-6 px-8 text-center">
                                  <div className="flex justify-center gap-2">
                                     <StatusBadge label="Git" active={g.integration?.githubStatus === 'APPROVED'} />
                                     <StatusBadge label="Jira" active={g.integration?.jiraStatus === 'APPROVED'} />
                                  </div>
                               </td>
                               <td className="py-6 px-8">
                                  <div className="flex -space-x-2 justify-center">
                                     {g.team?.slice(0, 3).map(s => (
                                       <div key={s.id} className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 border-2 border-white flex items-center justify-center text-white text-[10px] font-black shadow-sm" title={s.name}>{s.name?.charAt(0)}</div>
                                     ))}
                                     {g.team?.length > 3 && (
                                       <div className="w-8 h-8 rounded-xl bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-gray-500">+{g.team.length - 3}</div>
                                     )}
                                  </div>
                               </td>
                               <td className="py-6 px-8 text-right">
                                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                     <Button onClick={() => navigate(`/lecturer/group/${g.id}`)} variant="ghost" size="icon" className="w-10 h-10 rounded-2xl bg-white border border-transparent hover:border-teal-100 hover:text-teal-600 shadow-sm"><Eye size={16}/></Button>
                                     <Button onClick={() => success(`Đã nhắc nhở nhóm ${g.name}`)} variant="ghost" size="icon" className="w-10 h-10 rounded-2xl bg-white border border-transparent hover:border-amber-100 hover:text-amber-600 shadow-sm"><Bell size={16}/></Button>
                                  </div>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white p-8">
              <CardTitle className="text-sm font-black text-gray-800 uppercase tracking-widest mb-8 flex items-center gap-2">
                <TrendingUp size={18} className="text-teal-600" /> Bản đồ Hiệu suất
              </CardTitle>
              <div className="aspect-square w-full">
                <GroupRadarChart data={radarData} />
              </div>
              <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-2 gap-4">
                 <div className="text-center p-4 bg-teal-50 rounded-2xl">
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Git Approved</p>
                    <p className="text-xl font-black text-gray-800">{stats.github}</p>
                 </div>
                 <div className="text-center p-4 bg-indigo-50 rounded-2xl">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Active Alerts</p>
                    <p className="text-xl font-black text-gray-800">{alertsList.length}</p>
                 </div>
              </div>
            </Card>
         </div>
      )}

      {!selectedCourse && (
        <div className="flex flex-col items-center justify-center py-20 gap-6 opacity-40">
           <div className="w-24 h-24 rounded-3xl bg-gray-50 flex items-center justify-center shadow-inner border border-gray-100">
             <LayoutList size={40} className="text-gray-300" />
           </div>
           <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Khởi tạo không gian làm việc bằng cách chọn Lớp học</p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ label, active }) {
  return (
    <span className={`px-2 py-0.5 rounded-lg font-black text-[9px] uppercase tracking-widest border transition-all ${
      active ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-300'
    }`}>
      {label} {active ? '✓' : '✗'}
    </span>
  );
}
