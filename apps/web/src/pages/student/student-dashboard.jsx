import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  CalendarClock,
  Clock3,
  Download,
  Eye,
  FileText,
  Flame,
  GitBranch,
  Github,
  Users,
  Target,
  CheckSquare,
  Upload,
  RefreshCw,
  FolderKanban,
  BarChart3,
  ExternalLink,
  ChevronRight,
  LogOut
} from "lucide-react";

// Components UI
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useToast } from "../../components/ui/toast.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { StatusBadge } from "../../components/shared/Badge.jsx";

// Features & Hooks
import { useAuth } from "../../context/AuthContext.jsx";
import {
  useStudentStats,
  useAnalyticsHeatmap,
  useStudentCommitActivity,
  useStudentDeadlines,
} from "../../features/dashboard/hooks/useDashboard.js";
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";
import { useGetProjects } from "../../features/projects/hooks/useProjects.js";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const [selectedCourseId, setSelectedCourseId] = useState("all");

  const { data: stats, isLoading: statsLoading } = useStudentStats();
  const { data: heatmap } = useAnalyticsHeatmap();
  const { data: commitActivity } = useStudentCommitActivity(7);
  const { data: deadlinesData } = useStudentDeadlines();
  const { data: courseData, isLoading: coursesLoading } = useGetCourses();
  const { data: projectData, isLoading: projectsLoading } = useGetProjects();

  const handleLogout = () => { logout(); window.location.href = "/login"; };

  const courses = courseData?.items || [];
  const projects = projectData?.items || [];
  const upcomingDeadlines = deadlinesData?.items || deadlinesData || [];

  const filteredProjects = useMemo(() => {
    if (selectedCourseId === "all") return projects;
    return projects.filter((p) => String(p.courseId) === String(selectedCourseId));
  }, [selectedCourseId, projects]);

  const currentMainProject = filteredProjects[0] || projects[0];

  const studentKPI = {
    totalCommits: stats?.weeklyCommits || projects.reduce((sum, item) => sum + (item.commits || 0), 0),
    totalIssues: stats?.totalIssues || projects.reduce((sum, item) => sum + (item.issuesDone || 0), 0),
    totalPrs: stats?.totalPrs || projects.reduce((sum, item) => sum + (item.prsMerged || 0), 0),
    avgContrib: stats?.contributionPercent || (projects.length > 0
      ? Math.round(projects.reduce((sum, item) => sum + (item.myContribution || 0), 0) / projects.length)
      : 0)
  };

  if (statsLoading || coursesLoading || projectsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-10 w-10 animate-spin text-teal-500" />
          <p className="text-slate-500 font-medium">Đang chuẩn bị dữ liệu học tập...</p>
        </div>
      </div>
    );
  }

  const handleSyncProject = (project) => {
    success?.(`Đã đồng bộ commits cho project ${project.title}`);
  };

  const handleUploadSrs = (project) => {
    success?.(`Mở form nộp SRS cho project ${project.title}`);
  };

  const handleExport = () => {
    success?.("Đã xuất báo cáo cá nhân thành công");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title={`Chào mừng, ${user?.name || "Student"}!`}
        subtitle="Theo dõi tiến độ GitHub, Jira, deadline và đóng góp của bạn."
        breadcrumb={["Student", "Tổng quan"]}
        actions={[
          <Button key="export" variant="outline" className="rounded-2xl border-gray-200 h-11 px-6 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all" onClick={() => success?.("Export thành công")}>
            <Download size={16} className="mr-2" /> Export Báo cáo
          </Button>,
          <Button key="logout" onClick={handleLogout} className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-11 px-6 text-xs font-black uppercase tracking-widest border-0">
            <LogOut size={16} className="mr-2" /> Đăng xuất
          </Button>
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Tổng Commits" value={studentKPI.totalCommits} icon={Github} variant="success" hint="Tuần này" />
        <StatsCard label="Issues Hoàn thành" value={studentKPI.totalIssues} icon={CheckSquare} variant="info" />
        <StatsCard label="PRs Merged" value={studentKPI.totalPrs} icon={GitBranch} variant="indigo" />
        <StatsCard label="Contribution Score" value={`${studentKPI.avgContrib}%`} icon={Target} variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Courses Selection */}
          <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-50 py-5 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Khóa học của tôi</CardTitle>
              <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-teal-600 px-0 h-auto" onClick={() => navigate("/student/courses")}>Xem tất cả <ChevronRight size={14}/></Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {courses.map(course => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`p-4 rounded-2xl border transition-all text-left ${selectedCourseId === course.id ? 'border-teal-500 bg-teal-50/30' : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-teal-200'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-teal-600 font-bold text-xs">{course.code?.substring(0,3)}</div>
                      <StatusBadge status={course.status} label={course.status} variant={course.status === 'ACTIVE' ? 'success' : 'default'} />
                    </div>
                    <p className="font-bold text-gray-800 text-sm">{course.code}</p>
                    <p className="text-[10px] text-gray-400 font-medium truncate mb-3">{course.name}</p>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500" style={{ width: `${(course.currentStudents / course.maxStudents) * 100}%` }}></div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Logs */}
          <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-50 py-5 px-6">
              <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Hoạt động tuần này</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-4 text-xs font-black text-gray-400 uppercase tracking-widest"><Flame size={14} className="text-orange-500"/> Commit Frequency</div>
                  <div className="flex h-40 items-end justify-between gap-2 px-2">
                    {(commitActivity || [0,0,0,0,0,0,0]).map((item, i) => {
                      const count = item.commits ?? item.count ?? 0;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div className="h-full w-full bg-teal-500/10 rounded-t-lg relative group">
                            <div className="absolute bottom-0 left-0 w-full bg-teal-500 rounded-lg transition-all" style={{ height: `${Math.min(count * 10, 100)}%` }}></div>
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] py-1 px-2 rounded-lg pointer-events-none">{count}</div>
                          </div>
                          <span className="text-[9px] font-black text-gray-400 uppercase">{item.label || `D${i+1}`}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="flex flex-col justify-center border-l border-gray-100 md:pl-8">
                   <div className="flex items-center gap-2 mb-4 text-xs font-black text-gray-400 uppercase tracking-widest"><Target size={14} className="text-indigo-500"/> Heatmap Overview</div>
                   <div className="grid grid-cols-7 gap-1.5">
                      {(heatmap || Array(21).fill(0)).slice(0, 21).map((val, i) => (
                        <div key={i} className={`aspect-square rounded-[4px] ${val > 0 ? 'bg-teal-500' : 'bg-gray-100'}`} style={{ opacity: val > 0 ? (0.2 + (val/5)) : 1 }}></div>
                      ))}
                   </div>
                   <div className="mt-4 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <span>Low</span>
                      <div className="flex gap-1">
                        {[0,1,2,3,4].map(l => <div key={l} className="w-2.5 h-2.5 rounded-[2px]" style={{ background: l===0 ? '#f3f4f6' : '#14b8a6', opacity: l===0 ? 1 : (0.2 + l/5) }}></div>)}
                      </div>
                      <span>High</span>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Quick Nav */}
          <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-50 py-5 px-6">
              <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Truy cập nhanh</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: BookOpen, label: "Lớp học", to: "/student/courses" },
                  { icon: FolderKanban, label: "Dự án", to: "/student/my-project" },
                  { icon: BarChart3, label: "Đóng góp", to: "/student/contribution" },
                  { icon: FileText, label: "SRS Docs", to: "/student/srs" }
                ].map((item, idx) => (
                  <button key={idx} onClick={() => navigate(item.to)} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-teal-500 hover:shadow-lg transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover:text-teal-600 shadow-sm"><item.icon size={18}/></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-900">{item.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deadlines */}
          <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-50 py-5 px-6">
              <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {upcomingDeadlines.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">No deadlines ✔️</div>
              ) : (
                upcomingDeadlines.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="p-4 border-b border-gray-50 flex items-start gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <CalendarClock size={16} className="text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 leading-tight truncate">{item.title}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{item.due || item.dueDate}</p>
                    </div>
                  </div>
                ))
              )}
              <Button variant="ghost" className="w-full h-12 rounded-none text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-teal-600" onClick={() => navigate("/student/srs")}>Xem tất cả SRS</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}