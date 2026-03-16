<<<<<<< HEAD
import { useMemo } from "react";
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";
import { useGetProjects, useGetProjectMetrics } from "../../features/projects/hooks/useProjects.js";
import { useGetAlerts } from "../../features/system/hooks/useAlerts.js";
import { useGetProjectSrs } from "../../features/srs/hooks/useSrs.js";
=======
import { useMemo, useState } from "react";
>>>>>>> d4f993c269f0e55c18a55ca5482935dba01b41e8
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  GitBranch,
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  BookOpen,
  BarChart2,
  Users,
  Activity,
  FileDown,
  FolderKanban,
  Target,
  FileText
} from "lucide-react";

// Components UI
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

<<<<<<< HEAD
/* ───────────────────────── UI helpers ───────────────────────── */

function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-50">
        <Icon size={32} className="text-gray-300" />
      </div>
      <p className="font-semibold text-gray-700">{title}</p>
      {desc ? <p className="text-sm text-gray-400">{desc}</p> : null}
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-gray-800">{title}</h2>
      <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function SummaryCard({ icon: Icon, color, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${color} text-white`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );
}

function Breadcrumb({ title }) {
  const navigate = useNavigate();
  return (
    <nav className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
      <span
        className="cursor-pointer font-semibold text-teal-700 hover:underline"
        onClick={() => navigate("/student")}
      >
        Sinh viên
      </span>
      <ChevronRight size={12} />
      <span className="font-semibold text-gray-800">{title}</span>
    </nav>
  );
}
=======
// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { StatusBadge } from "../../components/shared/Badge.jsx";

// Feature Hooks
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";
import { useGetProjects, useGetProjectMetrics } from "../../features/projects/hooks/useProjects.js";
import { useGetAlerts } from "../../features/system/hooks/useAlerts.js";
import { useGetProjectSrs } from "../../features/srs/hooks/useSrs.js";
>>>>>>> d4f993c269f0e55c18a55ca5482935dba01b41e8

/* ═══════════ Courses Page ═══════════ */
export default function StudentCoursesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: coursesData, isLoading: loadingCourses } = useGetCourses();
    const { data: projectsData, isLoading: loadingProjects } = useGetProjects();

<<<<<<< HEAD
  const { data: coursesData } = useGetCourses({ pageSize: 100 });
  const { data: projectsData } = useGetProjects({ pageSize: 100 });
  const coursesList = coursesData?.items || [];
  const projectsList = projectsData?.items || [];
=======
    const coursesList = coursesData?.items || [];
    const projectsList = projectsData?.items || [];
>>>>>>> d4f993c269f0e55c18a55ca5482935dba01b41e8

    if (loadingCourses || loadingProjects) {
        return (
            <div className="flex flex-col h-64 items-center justify-center gap-4">
                <Activity className="animate-spin text-teal-600 h-10 w-10" /> 
                <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Đang tải danh sách lớp học...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader 
                title="Khóa học của tôi"
                subtitle="Danh sách các lớp học phần bạn đang tham gia trong học kỳ này."
                breadcrumb={["Sinh viên", "Lớp học"]}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard label="Tổng số lớp" value={coursesList.length} icon={BookOpen} variant="info" />
                <StatsCard label="Đang hoạt động" value={coursesList.filter(c => c.status === 'ACTIVE').length} icon={Target} variant="success" />
                <StatsCard label="Dự án nhóm" value={projectsList.length} icon={Users} variant="warning" />
            </div>

            {coursesList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-[32px] border border-gray-50 shadow-sm">
                    <BookOpen size={48} className="text-gray-200" />
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Bạn chưa được đăng ký lớp nào</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coursesList.map(c => {
                        const project = projectsList.find(p => p.courseId === c.id);
                        const isLeader = project?.team?.find(m => m.studentId === user?.id)?.role === "LEADER";
                        return (
                            <Card key={c.id}
                                className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white hover:shadow-xl transition-all cursor-pointer group"
                                onClick={() => navigate("/student")}
                            >
                                <div className="h-2 bg-gradient-to-r from-teal-500 to-indigo-500" />
                                <CardContent className="p-8 space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-teal-600 bg-teal-50 px-3 py-1 rounded-full inline-block uppercase tracking-widest mb-3">{c.subject?.code || c.code}</p>
                                        <h4 className="font-black text-gray-800 text-lg tracking-tight group-hover:text-teal-600 transition-colors uppercase">{c.name}</h4>
                                        <p className="text-xs text-gray-400 font-bold uppercase mt-1">GV: {c.lecturerNames?.join(", ") || "Chưa có GV"}</p>
                                    </div>
                                    
                                    {project ? (
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><FolderKanban size={14}/></div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{project.name}</span>
                                            </div>
                                            <StatusBadge status={isLeader ? 'warning' : 'info'} label={isLeader ? 'Leader' : 'Member'} variant={isLeader ? 'warning' : 'info'} />
                                        </div>
                                    ) : (
                                        <div className="pt-4 border-t border-gray-50">
                                            <p className="text-[10px] font-black text-gray-300 uppercase italic">Chưa phân nhóm</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ═══════════ My Project Page ═══════════ */
export function StudentMyProjectPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: projectsData, isLoading: loadingProjects } = useGetProjects();
    const myGroups = projectsData?.items || [];

<<<<<<< HEAD
  const { data: projectsData } = useGetProjects({ pageSize: 100 });
  const myProjects = projectsData?.items || [];
=======
    if (loadingProjects) {
        return (
            <div className="flex flex-col h-64 items-center justify-center gap-4">
                <Activity className="animate-spin text-teal-600 h-10 w-10" /> 
                <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Đang tải dữ liệu dự án...</span>
            </div>
        );
    }
>>>>>>> d4f993c269f0e55c18a55ca5482935dba01b41e8

    const leaderCount = myGroups.filter(g => g.team?.find(m => m.studentId === user?.id)?.role === "LEADER").length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader 
                title="Dự án của tôi"
                subtitle="Quản lý các nhóm và dự án bạn đang tham gia."
                breadcrumb={["Sinh viên", "Dự án"]}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard label="Dự án tham gia" value={myGroups.length} icon={FolderKanban} variant="indigo" />
                <StatsCard label="Vai trò Leader" value={leaderCount} icon={Users} variant="warning" />
                <StatsCard label="Tiến độ TB" value="--" icon={Activity} variant="success" />
            </div>

            {myGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-[32px] border border-gray-50 shadow-sm">
                    <FolderKanban size={48} className="text-gray-200" />
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Bạn chưa tham gia dự án nào</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {myGroups.map(p => {
                        const isLeader = p.team?.find(m => m.studentId === user?.id)?.role === "LEADER";
                        return (
                            <Card key={p.id} className="rounded-[40px] border border-gray-100 shadow-sm overflow-hidden bg-white hover:shadow-xl transition-all">
                                <CardContent className="p-10 flex flex-wrap items-center justify-between gap-8">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-4 mb-4">
                                            <h3 className="font-black text-gray-800 text-2xl uppercase tracking-tighter">{p.name}</h3>
                                            <StatusBadge status={isLeader ? 'warning' : 'info'} label={isLeader ? 'Leader' : 'Member'} variant={isLeader ? 'warning' : 'info'} />
                                        </div>
                                        <div className="flex gap-8">
                                            <div><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1.5">Lớp học</p><p className="text-xs font-black text-gray-700 uppercase">{p.courseName || "Software Project"}</p></div>
                                            <div><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1.5">Tiến độ</p><p className="text-xs font-black text-teal-600">{p.progressPercent || 0}%</p></div>
                                        </div>
                                    </div>
                                    <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-[24px] h-14 px-10 text-[10px] font-black uppercase tracking-widest border-0 shadow-xl shadow-teal-100 transition-all hover:scale-105" onClick={() => navigate(`/student/project/${p.id}`)}>Bảng điều khiển</Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    );
}

/* ═══════════ Contribution Page ═══════════ */
export function StudentContributionPage() {
<<<<<<< HEAD
  const { user } = useAuth();
  const { data: projectsData } = useGetProjects({ pageSize: 100 });
  const myGroups = projectsData?.items || [];
  const totalMyCommits = useMemo(() => {
    return myGroups.reduce((sum, project) => sum + (project.commits || 0), 0);
  }, [myGroups]);
  const activeGroups = useMemo(() => {
    return myGroups.filter((project) => (project.commits || 0) > 0).length;
  }, [myGroups]);

  return (
    <div className="space-y-6">
      <Breadcrumb title="Đóng góp của tôi" />
      <SectionHeader
        title="Đóng góp của tôi"
        subtitle="Tổng quan commit và đóng góp cá nhân theo nhóm"
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <SummaryCard
          icon={GitBranch}
          color="bg-teal-500"
          label="Tổng commits của tôi"
          value={totalMyCommits}
        />
        <SummaryCard
          icon={Users}
          color="bg-blue-500"
          label="Nhóm tham gia"
          value={myGroups.length}
        />
        <SummaryCard
          icon={Activity}
          color="bg-green-500"
          label="Nhóm có hoạt động"
          value={activeGroups}
        />
      </div>

      {myGroups.length === 0 ? (
        <EmptyState
          icon={BarChart2}
          title="Bạn chưa tham gia nhóm nào"
          desc="Khi có project, contribution sẽ hiển thị ở đây"
        />
      ) : (
        myGroups.map((g) => (
          <ProjectContributionCard key={g.id} project={g} userId={user?.id} />
        ))
      )}
    </div>
  );
}

function ProjectContributionCard({ project, userId }) {
  const { data: metricsData } = useGetProjectMetrics(project.id);
  const metrics = metricsData || { studentMetrics: [], totalCommits: 0 };
  const members = project.team || [];
=======
    const { user } = useAuth();
    const { data: projectsData, isLoading: loadingProjects } = useGetProjects();
    const myGroups = projectsData?.items || [];

    if (loadingProjects) {
        return (
            <div className="flex flex-col h-64 items-center justify-center gap-4">
                <Activity className="animate-spin text-teal-600 h-10 w-10" /> 
                <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Đang tổng hợp đóng góp...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader 
                title="Đóng góp cá nhân" 
                subtitle="Thống kê các hoạt động commit và task đã hoàn thành trên hệ thống." 
                breadcrumb={["Sinh viên", "Đóng góp"]} 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {myGroups.length === 0 ? (
                    <div className="md:col-span-2 flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-[32px] border border-gray-50 shadow-sm">
                        <BarChart2 size={48} className="text-gray-200" />
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Chưa có dữ liệu đóng góp</p>
                    </div>
                ) : myGroups.map(p => (
                    <ProjectContributionCard key={p.id} project={p} userId={user?.id} />
                ))}
            </div>
        </div>
    );
}

function ProjectContributionCard({ project, userId }) {
    const { data: metrics, isLoading } = useGetProjectMetrics(project.id);
    const members = project.team || [];
>>>>>>> d4f993c269f0e55c18a55ca5482935dba01b41e8

    if (isLoading || !metrics) {
        return <div className="p-12 animate-pulse bg-gray-50 rounded-[32px] border border-gray-100 h-48" />;
    }

    const myMetric = metrics.contributions?.find(m => m.studentId === userId) || { commits: 0, issues: 0 };
    const maxCommits = Math.max(...(metrics.contributions?.map(m => m.commits) || [1]), 1);

    return (
        <Card className="rounded-[40px] border border-gray-50 bg-white p-10 hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h4 className="font-black text-gray-800 text-lg uppercase tracking-widest group-hover:text-teal-600 transition-colors">{project.name}</h4>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1.5 opacity-70">Thống kê hoạt động của bạn</p>
                </div>
                <div className="text-right">
                    <p className="text-4xl font-black text-teal-600 tracking-tighter leading-none">{myMetric.commits}</p>
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-2">Commits</p>
                </div>
            </div>
            
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase mb-3">
                        <span className="text-gray-400 tracking-widest">Đóng góp so với Max</span>
                        <span className="text-indigo-600">{(myMetric.commits / maxCommits * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 shadow-lg shadow-teal-100" style={{width: `${(myMetric.commits / maxCommits) * 100}%`}} />
                    </div>
                </div>
            </div>
        </Card>
    );
}

/* ═══════════ Alerts Page ═══════════ */
export function StudentAlertsPage() {
<<<<<<< HEAD
  const { data: alertsData } = useGetAlerts({ pageSize: 100 });
  const alerts = alertsData?.items || [];

  const sevCls = {
    high: {
      border: `${({
  high: { cls: "bg-red-50 border-red-100" },
  medium: { cls: "bg-orange-50 border-orange-100" },
  info: { cls: "bg-blue-50 border-blue-100" },
}).high?.cls || "bg-red-50 border-red-100"} border`,
      icon: "text-red-500",
      text: "text-red-800",
    },
    medium: {
      border: `${({
  high: { cls: "bg-red-50 border-red-100" },
  medium: { cls: "bg-orange-50 border-orange-100" },
  info: { cls: "bg-blue-50 border-blue-100" },
}).medium?.cls || "bg-orange-50 border-orange-100"} border`,
      icon: "text-orange-500",
      text: "text-orange-800",
    },
    info: {
      border: "border border-blue-100 bg-blue-50",
      icon: "text-blue-500",
      text: "text-blue-800",
    },
  };

  return (
    <div className="space-y-6">
      <Breadcrumb title="Cảnh báo" />
      <SectionHeader
        title="Cảnh báo cá nhân"
        subtitle="Nhắc nhở từ hệ thống liên quan đến các nhóm của bạn"
      />

      <div className="grid grid-cols-2 gap-4">
        <SummaryCard
          icon={Bell}
          color="bg-orange-400"
          label="Tổng cảnh báo"
          value={alerts.length}
        />
        <SummaryCard
          icon={AlertTriangle}
          color="bg-red-400"
          label="Cần xử lý ngay"
          value={alerts.filter((a) => String(a.severity).toLowerCase() === "high").length}
        />
      </div>

      <Card className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
        <CardContent className="p-0">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-green-50">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <p className="font-semibold text-gray-700">Không có cảnh báo nào!</p>
              <p className="text-sm text-gray-400">
                Tất cả nhóm của bạn đang hoạt động tốt 🎉
              </p>
=======
    const { user } = useAuth();
    const { data: alertsData, isLoading } = useGetAlerts(); // Filter handled by BE
    const alerts = alertsData?.items || [];

    if (isLoading) {
        return (
            <div className="flex flex-col h-64 items-center justify-center gap-4">
                <Activity className="animate-spin text-teal-600 h-10 w-10" /> 
                <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Đang tải thông báo...</span>
>>>>>>> d4f993c269f0e55c18a55ca5482935dba01b41e8
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader 
                title="Thông báo & Cảnh báo" 
                subtitle="Các nhắc nhở về tiến độ từ hệ thống và Giảng viên hướng dẫn." 
                breadcrumb={["Sinh viên", "Cảnh báo"]} 
            />
            
            <Card className="rounded-[40px] border border-gray-100 bg-white overflow-hidden shadow-sm">
                <CardContent className="p-0 divide-y divide-gray-50">
                    {alerts.length === 0 ? (
                        <div className="p-24 text-center">
                            <div className="w-20 h-20 rounded-[32px] bg-green-50 flex items-center justify-center text-green-500 mx-auto mb-6"><CheckCircle size={32}/></div>
                            <h4 className="font-black text-gray-800 uppercase tracking-widest mb-2">Tuyệt vời!</h4>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Không có cảnh báo nào cho bạn trong lúc này.</p>
                        </div>
                    ) : alerts.map((a, i) => (
                        <div key={i} className="p-10 flex gap-8 hover:bg-gray-50/50 transition-all group">
                            <div className={`w-14 h-14 rounded-[24px] flex items-center justify-center shrink-0 shadow-sm ${a.severity === 'HIGH' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                                <AlertTriangle size={24}/>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-4 mb-2">
                                    <h4 className="font-black text-gray-800 text-base uppercase tracking-widest">{a.severity === 'HIGH' ? 'Cảnh báo rủi ro' : 'Nhắc nhở nhẹ'}</h4>
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{new Date(a.createdAt).toLocaleString("vi-VN")}</span>
                                </div>
                                <p className="text-sm text-gray-500 font-bold leading-relaxed mb-1.5">{a.message}</p>
                                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Project: {a.groupName || "Project Alpha"}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

/* ═══════════ SRS Page ═══════════ */
export function StudentSrsPage() {
<<<<<<< HEAD
  const { success } = useToast();
  const { data: projectsData } = useGetProjects({ pageSize: 100 });
  const myGroups = projectsData?.items || [];
  const srsSummary = { SUBMITTED: 0, UNDER_REVIEW: 0, NEEDS_REVISION: 0, APPROVED: 0, REJECTED: 0 };

  return (
    <div className="space-y-6">
      <Breadcrumb title="SRS Reports" />
      <SectionHeader
        title="SRS Reports của nhóm"
        subtitle="Xem lịch sử nộp SRS và phản hồi từ admin"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {["SUBMITTED", "UNDER_REVIEW", "NEEDS_REVISION", "APPROVED", "REJECTED"].map((s) => (
          <div
            key={s}
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${({
  SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  NEEDS_REVISION: "bg-red-50 text-red-700 border-red-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-slate-100 text-slate-700 border-slate-200",
})[String(rpt.status || "SUBMITTED").toUpperCase()]}`}
          >
            <span className="text-[11px] font-semibold">{s}</span>
            <span className="text-xl font-bold">{srsSummary[s]}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => success?.("Mở mock form nộp SRS mới lên admin")}
        >
          <Upload size={16} />
          Nộp SRS mới
        </Button>
      </div>

      <Card className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
        <CardContent className="p-0">
          {myGroups.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Nhóm chưa có SRS nào được nộp"
              desc="Khi có file SRS, danh sách sẽ hiển thị ở đây"
            />
          ) : (
            <div className="divide-y divide-gray-50">
              {myGroups.map((g) => (
                <ProjectSrsRows key={g.id} project={g} />
              ))}
=======
    const { user } = useAuth();
    const { success, error: showError } = useToast();
    const { data: projectsData, isLoading: loadingProjects } = useGetProjects();
    const myGroups = projectsData?.items || [];

    if (loadingProjects) {
        return (
            <div className="flex flex-col h-64 items-center justify-center gap-4">
                <Activity className="animate-spin text-teal-600 h-10 w-10" /> 
                <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Đang tải lịch sử tài liệu...</span>
>>>>>>> d4f993c269f0e55c18a55ca5482935dba01b41e8
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader 
                title="Tài liệu SRS" 
                subtitle="Nộp và theo dõi trạng thái phê duyệt tài liệu Đặc tả Yêu cầu phần mềm (SRS)." 
                breadcrumb={["Sinh viên", "SRS"]} 
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                    {myGroups.map(g => (
                        <SrsProjectHistory key={g.id} project={g} />
                    ))}
                    {myGroups.length === 0 && (
                        <Card className="rounded-[32px] border border-gray-50 bg-white p-24 text-center">
                            <FileText size={48} className="text-gray-200 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Chưa có thông tin dự án</p>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="rounded-[40px] border-0 bg-gradient-to-br from-teal-600 to-indigo-700 text-white p-10 shadow-2xl shadow-teal-200">
                        <div className="w-14 h-14 rounded-[24px] bg-white/20 flex items-center justify-center mb-6"><Upload size={24}/></div>
                        <h4 className="text-xl font-black uppercase tracking-widest mb-4">Nộp tài liệu mới</h4>
                        <p className="text-[11px] text-teal-50 font-bold leading-relaxed mb-10 uppercase opacity-80">Vui lòng kiểm tra kỹ định dạng file (.pdf) theo mẫu IEEE 29148. Mọi thay đổi sẽ được lưu dưới dạng version mới.</p>
                        <Button 
                            className="w-full h-14 bg-white text-teal-700 hover:bg-teal-50 rounded-[20px] font-black uppercase tracking-widest border-0 shadow-lg transition-all hover:scale-105"
                            onClick={() => success("Vui lòng chọn file từ máy tính...")}
                        >
                            Chọn File & Nộp ngay
                        </Button>
                    </Card>
                    
                    <Card className="rounded-[40px] border border-gray-100 bg-white p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600"><Target size={20}/></div>
                            <h4 className="font-black text-gray-800 uppercase tracking-widest text-xs">Mẫu tham khảo</h4>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <span>IEEE Std 29148-2018</span>
                                <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-indigo-50 text-indigo-600"><FileDown size={14}/></Button>
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
}

<<<<<<< HEAD
function ProjectSrsRows({ project }) {
  const { success } = useToast();
  const { data: srsData } = useGetProjectSrs(project.id);
  const srsList = srsData?.items || [];
=======
function SrsProjectHistory({ project }) {
    const { data: srsList = [], isLoading } = useGetProjectSrs(project.id);
    
    if (isLoading) return <div className="p-12 animate-pulse bg-gray-50 rounded-[32px] border border-gray-100" />;
>>>>>>> d4f993c269f0e55c18a55ca5482935dba01b41e8

    return (
        <Card className="rounded-[32px] border border-gray-100 bg-white overflow-hidden shadow-sm">
            <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between bg-gray-50/20">
                <div>
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-800">{project.name}</CardTitle>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Lịch sử nộp tài liệu SRS</p>
                </div>
                <StatusBadge status="info" label={`${srsList.length} Bản nộp`} variant="info" />
            </CardHeader>
            <CardContent className="p-0 divide-y divide-gray-50">
                {srsList.length === 0 ? (
                    <div className="p-16 text-center">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Chưa có bản nộp nào</p>
                    </div>
                ) : srsList.map((rpt, idx) => (
                    <div key={rpt.id} className="p-8 flex items-center justify-between hover:bg-gray-50/30 transition-all">
                        <div className="flex gap-6 items-center">
                            <div className="w-12 h-12 rounded-[20px] bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-inner"><FileText size={20}/></div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <p className="text-sm font-black text-gray-800 uppercase tracking-tight">Version {rpt.version}</p>
                                    <StatusBadge status={rpt.status === 'FINAL' ? 'success' : 'warning'} label={rpt.status === 'FINAL' ? 'Đã duyệt' : 'Đang xử lý'} />
                                </div>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest italic">Nộp lúc: {new Date(rpt.submittedAt).toLocaleString("vi-VN")}</p>
                                {rpt.feedback && <p className="mt-2 text-[10px] font-bold text-indigo-600 uppercase tracking-tight bg-indigo-50 px-3 py-1.5 rounded-lg inline-block">GV: {rpt.feedback}</p>}
                            </div>
                        </div>
                        {rpt.fileUrl && (
                            <Button variant="outline" className="rounded-xl h-10 px-4 text-[9px] font-black uppercase tracking-widest border-gray-100 hover:bg-white shadow-sm" onClick={() => window.open(rpt.fileUrl, '_blank')}>
                                <FileDown size={14} className="mr-2"/> Tải xuống
                            </Button>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

<<<<<<< HEAD
  return (
    <>
      {srsList.map((rpt) => (
        <div
          key={rpt.id}
          className="flex items-center gap-4 border-b border-gray-50 px-5 py-4 transition-colors last:border-0 hover:bg-gray-50/50"
        >
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-gray-700">
                v{rpt.version}
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                  ({
  SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  NEEDS_REVISION: "bg-red-50 text-red-700 border-red-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-slate-100 text-slate-700 border-slate-200",
})[String(rpt.status || "SUBMITTED").toUpperCase()] ||
                  "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                {rpt.status}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {rpt.receiver || "Admin"}
              </span>
            </div>

            <p className="truncate text-xs text-gray-500">
              {project.name} · {project.course?.name || "Lớp"}
            </p>

            {rpt.feedback ? (
              <p className="mt-0.5 text-xs italic text-blue-600">
                Phản hồi admin: {rpt.feedback}
              </p>
            ) : null}

            <div className="mt-1.5 flex items-center justify-between">
              <p className="flex items-center gap-1 text-[10px] text-gray-400">
                <Clock size={9} />
                {new Date(rpt.submittedAt).toLocaleDateString("vi-VN")}
              </p>

              <div className="flex items-center gap-2">
                <a
                  href={rpt.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] font-bold text-teal-600 hover:underline"
                >
                  <FileDown size={10} />
                  Tải file
                </a>

                <button
                  type="button"
                  onClick={() => success?.(`Đã mở mock file SRS v${rpt.version}`)}
                  className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline"
                >
                  <Eye size={10} />
                  Xem
                </button>

                <button
                  type="button"
                  onClick={() => success?.(`Mở mock nộp lại SRS version mới cho ${project.name}`)}
                  className="flex items-center gap-1 text-[10px] font-bold text-orange-600 hover:underline"
                >
                  <Upload size={10} />
                  Nộp lại
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
=======
/* Alias for compatibility if needed elsewhere */
export const StudentCourses = StudentCoursesPage;
export const StudentMyProject = StudentMyProjectPage;
export const StudentContribution = StudentContributionPage;
export const StudentAlerts = StudentAlertsPage;
export const StudentSrs = StudentSrsPage;
>>>>>>> d4f993c269f0e55c18a55ca5482935dba01b41e8
