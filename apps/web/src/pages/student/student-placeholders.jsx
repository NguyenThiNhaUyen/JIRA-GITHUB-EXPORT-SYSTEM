import { useMemo, useState } from "react";
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

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { StatusBadge } from "../../components/shared/Badge.jsx";

// Feature Hooks
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";
import { useGetProjects, useGetProjectMetrics } from "../../features/projects/hooks/useProjects.js";
import { useGetAlerts } from "../../features/system/hooks/useAlerts.js";
import { useGetProjectSrs } from "../../features/srs/hooks/useSrs.js";

/* ═══════════ Courses Page ═══════════ */
export default function StudentCoursesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: coursesData, isLoading: loadingCourses } = useGetCourses();
    const { data: projectsData, isLoading: loadingProjects } = useGetProjects();

    const coursesList = coursesData?.items || [];
    const projectsList = projectsData?.items || [];

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

    if (loadingProjects) {
        return (
            <div className="flex flex-col h-64 items-center justify-center gap-4">
                <Activity className="animate-spin text-teal-600 h-10 w-10" /> 
                <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Đang tải dữ liệu dự án...</span>
            </div>
        );
    }

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
    const { user } = useAuth();
    const { data: alertsData, isLoading } = useGetAlerts(); // Filter handled by BE
    const alerts = alertsData?.items || [];

    if (isLoading) {
        return (
            <div className="flex flex-col h-64 items-center justify-center gap-4">
                <Activity className="animate-spin text-teal-600 h-10 w-10" /> 
                <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Đang tải thông báo...</span>
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
    const { user } = useAuth();
    const { success, error: showError } = useToast();
    const { data: projectsData, isLoading: loadingProjects } = useGetProjects();
    const myGroups = projectsData?.items || [];

    if (loadingProjects) {
        return (
            <div className="flex flex-col h-64 items-center justify-center gap-4">
                <Activity className="animate-spin text-teal-600 h-10 w-10" /> 
                <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Đang tải lịch sử tài liệu...</span>
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

function SrsProjectHistory({ project }) {
    const { data: srsList = [], isLoading } = useGetProjectSrs(project.id);
    
    if (isLoading) return <div className="p-12 animate-pulse bg-gray-50 rounded-[32px] border border-gray-100" />;

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

/* Alias for compatibility if needed elsewhere */
export const StudentCourses = StudentCoursesPage;
export const StudentMyProject = StudentMyProjectPage;
export const StudentContribution = StudentContributionPage;
export const StudentAlerts = StudentAlertsPage;
export const StudentSrs = StudentSrsPage;
