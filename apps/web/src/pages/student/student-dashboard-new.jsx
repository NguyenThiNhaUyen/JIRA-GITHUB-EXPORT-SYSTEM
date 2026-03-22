// Student Dashboard — Enterprise SaaS Learning Workspace (Real API)
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { LINK_STATUS as LINK_STATUS_CFG, SRS_STATUS, requireLeader, buildStudentAlerts } from "../../shared/permissions.js";
import {
    BookOpen, GitBranch, Bell, CheckCircle, AlertTriangle,
    ChevronRight, Clock, ArrowRight, Link2,
    Users, GraduationCap, Calendar, BarChart2,
    Crown, MapPin, Github, Star, RefreshCw, UserPlus
} from "lucide-react";

// Feature Hooks
import { useGetCourses, useGetEnrolledStudents } from "../../features/courses/hooks/useCourses.js";
import { useGetProjects, useLinkIntegration, useAddTeamMember, useCreateProject } from "../../features/projects/hooks/useProjects.js";
import { useGetProjectSrs, useSubmitSrs, useDeleteSrs } from "../../features/srs/hooks/useSrs.js";
import { useGetAlerts, useResolveAlert } from "../../features/system/hooks/useAlerts.js";
import { useGetStudentDashboardStats, useGetMyTasks, useGetMyDeadlines, useGetMyCommitActivity, useGetMyInvitations } from "../../features/student/hooks/useStudent.js";

import CourseWorkspace from "./CourseWorkspace.jsx";


/* ── Status config (from shared module) ── */
const SRS_STATUS_CLS = Object.fromEntries(Object.entries(SRS_STATUS).map(([k, v]) => [k, v.cls]));

/* ═══════════ MAIN COMPONENT ═══════════ */
export default function StudentDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();

    const [selectedCourseId, setSelectedCourseId] = useState(null);

    // Data Fetching - Real API
    const { data: coursesData = { items: [] }, isLoading: coursesLoading, refetch: refetchCourses } = useGetCourses({ pageSize: 100 });
    const { data: projectsData = { items: [] }, isLoading: projectsLoading, refetch: refetchProjects } = useGetProjects({ pageSize: 100 });
    const { data: alertsData = { items: [] }, isLoading: alertsLoading, refetch: refetchAlerts } = useGetAlerts({ pageSize: 10 });
    // Personal analytics APIs
    const { data: dashboardStats } = useGetStudentDashboardStats();
    const { data: myTasksData } = useGetMyTasks({ pageSize: 5, status: 'IN_PROGRESS' });
    const { data: myDeadlinesData } = useGetMyDeadlines();
    const { data: commitActivity } = useGetMyCommitActivity(7);
    const { data: myInvitationsData, refetch: refetchInvitations } = useGetMyInvitations();

    const courses = coursesData.items || [];
    const myGroupsList = projectsData.items || [];

    // Map projects to a courseId keyed object for easy lookup in Workspace
    // Dùng String() để đảm bảo key type nhất quán với selectedCourseId (cũng là String)
    const groupsMapByCourse = {};
    myGroupsList.forEach(p => {
        groupsMapByCourse[String(p.courseId)] = p;
    });

    const selectedGroup = selectedCourseId ? groupsMapByCourse[selectedCourseId] : null;

    // Fetch SRS for selected group (only when a group is selected)
    const { data: srsData = [], refetch: refetchSrs } = useGetProjectSrs(selectedGroup?.id);

    const isLoading = coursesLoading || projectsLoading;

    // Personal stats from API
    const myStats = {
        totalCommits: dashboardStats?.totalCommits ?? dashboardStats?.commits ?? 0,
        openTasks: dashboardStats?.openTasks ?? dashboardStats?.tasksDue ?? (Array.isArray(myTasksData?.items) ? myTasksData.items.length : 0),
        upcomingDeadlines: Array.isArray(myDeadlinesData) ? myDeadlinesData.filter(d => {
            if (!d.dueDate && !d.deadline) return true;
            const due = new Date(d.dueDate || d.deadline);
            return due > new Date();
        }).length : 0,
    };

    // loadData: hàm làm mới dữ liệu thủ công
    const loadData = () => {
        refetchCourses();
        refetchProjects();
        refetchAlerts();
        refetchInvitations();
        if (selectedGroup?.id) refetchSrs();
    };

    // Invitations helpers
    const myInvitations = Array.isArray(myInvitationsData) ? myInvitationsData :
        (myInvitationsData?.items ?? []);

    const handleAcceptInvitation = async (invitationId) => {
        try {
            const client = (await import('../../api/client.js')).default;
            const { unwrap } = await import('../../api/unwrap.js');
            await unwrap(await client.post(`/invitations/${invitationId}/accept`));
            success('Chấp nhận lời mời thành công!');
            refetchInvitations();
            refetchProjects();
        } catch (err) {
            showError(err.message || 'Chấp nhận không thành công');
        }
    };

    const handleDeclineInvitation = async (invitationId) => {
        try {
            const client = (await import('../../api/client.js')).default;
            const { unwrap } = await import('../../api/unwrap.js');
            await unwrap(await client.post(`/invitations/${invitationId}/reject`));
            success('Từ chối lời mời');
            refetchInvitations();
        } catch (err) {
            showError(err.message || 'Không thể từ chối lời mời');
        }
    };

    // Projects Mutations
    const { mutate: createProjectMutate } = useCreateProject();



    /* ── Alerts (personal): drive from real API ── */
    const alerts = (alertsData?.items || []).filter(a => a.status === "OPEN");

    const { mutate: linkMutate } = useLinkIntegration();
    const resolveAlertMutation = useResolveAlert();

    const handleResolveAlert = async (alertId) => {
        try {
            await resolveAlertMutation.mutateAsync(alertId);
            success("Đã đánh dấu là đã đọc");
        } catch (err) {
            showError(err.message || "Không thể xử lý cảnh báo");
        }
    };

    /* ── Link submit (Leader only) ── */
    const handleSubmitLinks = (group, githubUrl, jiraUrl, topic) => {
        const err = requireLeader({ ...group, teamLeaderId: group.team?.find(m => m.role === 'LEADER')?.studentId }, user?.id);
        if (err) { showError(err); return; }
        if (!githubUrl.trim() || !jiraUrl.trim()) { showError("Vui lòng nhập đầy đủ GitHub URL và Jira URL!"); return; }

        linkMutate({
            projectId: group.id,
            body: {
                githubUrl: githubUrl.trim(),
                jiraUrl: jiraUrl.trim(),
                topic: topic.trim()
            }
        }, {
            onSuccess: () => {
                success("Đã submit links! Đang chờ giảng viên duyệt.");
                // useLinkIntegration hook tự invalidate queries → UI tự cập nhật
            },
            onError: (err) => {
                showError(err.message || "Không thể submit links");
            }
        });
    };

    /* ── Link submit (Leader only) ── */

    const handleCreateProject = (courseId, courseName) => {
        const projectName = window.prompt(`Nhập tên nhóm cho lớp ${courseName}:`, `Team ${user?.name || ''}`);
        if (!projectName || !projectName.trim()) return;

        createProjectMutate(
            { courseId, name: projectName.trim(), description: `Nhóm học tập lớp ${courseName}` },
            {
                onSuccess: (newProj) => {
                    success(`Đã tạo nhóm ${projectName} thành công! Bạn là Leader.`);
                    refetchProjects();
                    // Optionally select it immediately
                    setSelectedCourseId(String(courseId));
                },
                onError: (err) => showError(err?.message || "Không thể tạo nhóm"),
            }
        );
    };

    /* ── Derived data ── */
    const approvedCount = myGroupsList.filter(g =>
        g.integration?.githubStatus === "APPROVED" &&
        g.integration?.jiraStatus === "APPROVED"
    ).length;

    const selectedCourse = selectedCourseId ? courses.find(c => String(c.id) === selectedCourseId) : null;
    const groupStudents = selectedGroup ? (selectedGroup.team || []) : [];



    return (
        <>
            <div className="space-y-8 bg-white shadow-sm border-gray-100 min-h-screen -m-6 p-6 pb-20 overflow-x-hidden">
                {/* ── Breadcrumb ── */}
                <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                    <span className="text-teal-700 font-semibold">Sinh viên</span>
                    <ChevronRight size={12} />
                    <span className="text-gray-500 font-semibold">
                        {selectedCourseId ? `${selectedCourse?.code} — Nhóm của tôi` : "Dashboard"}
                    </span>
                </nav>

                {/* ── A. Welcome Header ── */}
                {!selectedCourseId && (
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-gray-800 uppercase">
                                Xin chào, {user?.name || "Sinh viên"}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                <span className="bg-teal-500/10 text-teal-600 text-[10px] font-bold px-2 py-0.5 rounded border border-teal-500/20 uppercase">Auth: Active</span>
                                Học kỳ đang hoạt động — hãy kiểm tra tiến độ nhóm
                            </p>
                        </div>
                        <button onClick={loadData} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-teal-700 transition-colors">
                            <RefreshCw size={13} />Làm mới
                        </button>
                    </div>
                )}

                {/* ── B. Summary Stats ── */}
                {!selectedCourseId && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-1">
                        <StatCard icon={<BookOpen size={18} />} color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" label="Lớp đang học" value={courses.length} />
                        <StatCard icon={<Users size={18} />} color="bg-violet-500/10 text-violet-400 border-violet-500/20" label="Nhóm của tôi" value={Object.keys(groupsMapByCourse).length} />
                        <StatCard icon={<GitBranch size={18} />} color="bg-blue-500/10 text-blue-400 border-blue-500/20" label="Commits" value={myStats.totalCommits} />
                        <StatCard icon={<Bell size={18} />} color={alerts.length > 0 ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-gray-50 text-gray-500 border-gray-100"} label="Cảnh báo" value={alerts.length} />
                    </div>
                )}

                {/* ── Course detail view ── */}
                {selectedCourseId && selectedGroup && selectedCourse ? (
                    <CourseWorkspace
                        course={selectedCourse}
                        group={selectedGroup}
                        groupStudents={groupStudents}
                        srsReports={Array.isArray(srsData) ? srsData : []}
                        userId={user?.id}
                        onBack={() => setSelectedCourseId(null)}
                        onSubmitLinks={handleSubmitLinks}
                    />
                ) : selectedCourseId && selectedCourse && !selectedGroup ? (
                    /* Nhánh: đã chọn lớp nhưng chưa có nhóm */
                    <NoGroupView
                        course={selectedCourse}
                        onBack={() => setSelectedCourseId(null)}
                        onCreateGroup={() => handleCreateProject(selectedCourse.id, selectedCourse.name)}
                    />
                ) : (
                    !selectedCourseId && <>
                        {/* ── C. My Courses ── */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Lớp học của tôi</h3>
                            {isLoading ? (
                                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" /></div>
                            ) : courses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                    <GraduationCap size={36} className="text-gray-300" />
                                    <p className="text-sm text-gray-400">Bạn chưa được đăng ký lớp nào</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {courses.map(course => {
                                        const grp = groupsMapByCourse[course.id];
                                        // Determine overall link status
                                        let linkStatus = "NONE";
                                        if (grp?.integration?.githubStatus === "APPROVED" && grp?.integration?.jiraStatus === "APPROVED") {
                                            linkStatus = "APPROVED";
                                        } else if (grp?.integration?.githubUrl || grp?.integration?.jiraUrl) {
                                            if (grp?.integration?.githubStatus === "REJECTED" || grp?.integration?.jiraStatus === "REJECTED") {
                                                linkStatus = "REJECTED";
                                            } else {
                                                linkStatus = "PENDING";
                                            }
                                        }
                                        const lsCfg = LINK_STATUS_CFG[linkStatus] || LINK_STATUS_CFG.NONE;
                                        const isLeader = grp?.team?.find(m => m.studentId === user?.id)?.role === 'LEADER';
                                        
                                        // Card layout inspired by the screenshot: Minimal, Dark/Clean
                                        return (
                                            <div key={course.id}
                                                className="relative group bg-white shadow-sm border-gray-100 border border-gray-100 rounded-[20px] p-6 hover:border-teal-500/40 transition-all cursor-pointer overflow-hidden"
                                                onClick={() => setSelectedCourseId(String(course.id))}
                                            >
                                                <div className="flex flex-col h-full space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold text-teal-600 bg-teal-400/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                                                    {course.subject?.code || course.code}
                                                                </span>
                                                                {isLeader && <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded uppercase flex items-center gap-1"><Crown size={8}/>Leader</span>}
                                                            </div>
                                                            <h4 className="text-base font-bold text-gray-800 group-hover:text-teal-600 transition-colors uppercase tracking-tight">{course.name}</h4>
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 space-y-2.5">
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <div className="w-5 h-5 rounded bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                                                {course.lecturers?.[0]?.name?.charAt(0) || "G"}
                                                            </div>
                                                            <span className="truncate">{course.lecturers?.[0]?.name || "Chưa có GV"}</span>
                                                        </div>
                                                        {grp && (
                                                            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                                                <div className="w-5 h-5 rounded bg-teal-400/10 flex items-center justify-center text-teal-500">
                                                                    <Users size={10} />
                                                                </div>
                                                                <span className="truncate">{grp.name}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="pt-2">
                                                        {!grp ? (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleCreateProject(course.id, course.name); }}
                                                                className="w-full flex items-center justify-center gap-2 text-[11px] font-bold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 py-2 rounded-lg border border-amber-400/20 transition-all"
                                                            >
                                                                <UserPlus size={12} /> TẠO NHÓM MỚI
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center justify-between">
                                                                 <span className={`text-[10px] font-bold px-2.5 py-1 rounded bg-white shadow-sm border-gray-100 border border-gray-100 uppercase tracking-tighter ${lsCfg.cls}`}>
                                                                    {linkStatus === "PENDING" && <span className="mr-1 text-amber-500">⚠</span>}
                                                                    {linkStatus === "APPROVED" && <span className="mr-1 text-emerald-500">✓</span>}
                                                                    {linkStatus === "REJECTED" && <span className="mr-1 text-rose-500">×</span>}
                                                                    {lsCfg.label}
                                                                </span>
                                                                <ArrowRight size={14} className="text-zinc-600 group-hover:text-teal-600 transform group-hover:translate-x-1 transition-all" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>


                        {/* ── D. Personal Stats 2-col: Deadlines & Active Tasks ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* Deadlines */}
                            <div className="bg-white shadow-sm border-gray-100 border border-gray-100 rounded-[24px] overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                     <div className="flex items-center gap-2">
                                         <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                             <Clock size={15} className="text-blue-400" />
                                         </div>
                                         <h3 className="text-base font-bold text-gray-800 uppercase tracking-tight">Deadline sắp đến</h3>
                                     </div>
                                 </div>
                                 <div className="p-4 pt-2">
                                     {!Array.isArray(myDeadlinesData) || myDeadlinesData.length === 0 ? (
                                         <div className="flex flex-col items-center justify-center py-8 gap-2">
                                             <CheckCircle size={24} className="text-emerald-500/30" />
                                             <p className="text-xs text-gray-500 font-medium">Không có deadline sắp đến</p>
                                         </div>
                                     ) : (
                                         <div className="space-y-1">
                                             {myDeadlinesData.slice(0, 5).map((d, i) => {
                                                 const dueDate = d.dueDate || d.deadline;
                                                 const isOverdue = dueDate && new Date(dueDate) < new Date();
                                                 return (
                                                     <div key={d.id || i} className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors group">
                                                         <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOverdue ? 'bg-rose-500' : 'bg-blue-500'}`} />
                                                         <div className="flex-1 min-w-0">
                                                             <p className="text-sm font-semibold text-gray-700 truncate group-hover:text-blue-400 transition-colors uppercase tracking-tight">{d.title || d.summary || d.name}</p>
                                                             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{d.projectName || d.courseName || ''}</p>
                                                         </div>
                                                         {dueDate && (
                                                             <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded border ${isOverdue ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                                                 {new Date(dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                                             </span>
                                                         )}
                                                     </div>
                                                 );
                                             })}
                                         </div>
                                     )}
                                </div>
                            </div>

                            {/* Active Jira Tasks */}
                            <div className="bg-white shadow-sm border-gray-100 border border-gray-100 rounded-[24px] overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center">
                                            <BarChart2 size={15} className="text-teal-600" />
                                        </div>
                                        <h3 className="text-base font-bold text-gray-800 uppercase tracking-tight">Task Jira đang thực hiện</h3>
                                    </div>
                                </div>
                                <div className="p-4 pt-2">
                                    {!myTasksData?.items?.length ? (
                                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                                            <CheckCircle size={24} className="text-teal-500/30" />
                                            <p className="text-xs text-gray-500 font-medium">Không có task nào đang thực hiện</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {myTasksData.items.slice(0, 5).map((t, i) => (
                                                <div key={t.id || i} className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors group">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-700 truncate group-hover:text-teal-600 transition-colors uppercase tracking-tight">{t.summary || t.title || t.name}</p>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t.projectKey || t.project || ''}</p>
                                                    </div>
                                                    <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded border bg-teal-500/10 text-teal-600 border-teal-500/20 uppercase tracking-tighter">
                                                        {t.status || 'IN PROGRESS'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── E. L\u1eddi m\u1eddi tham gia nh\u00f3m ── */}
                        {myInvitations.length > 0 && (
                            <div className="bg-white shadow-sm border-gray-100 border border-amber-500/20 rounded-[24px] overflow-hidden bg-gradient-to-br from-amber-500/5 to-transparent">
                                <div className="p-6 border-b border-amber-500/10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                            <Users size={15} className="text-amber-400" />
                                        </div>
                                        <h3 className="text-base font-bold text-gray-800 uppercase tracking-tight">Lời mời tham gia Nhóm</h3>
                                        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 bg-amber-500 text-black rounded-full uppercase tracking-tighter">
                                            {myInvitations.length} MỚI
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-3">
                                        {myInvitations.map((inv, i) => (
                                            <div key={inv.id || i} className="flex items-center gap-3 bg-white shadow-sm border-gray-100 rounded-[18px] px-4 py-3 border border-gray-100">
                                                <div className="w-9 h-9 rounded-full bg-teal-500/20 text-teal-600 flex items-center justify-center text-sm font-black shrink-0">
                                                    {(inv.projectName || inv.groupName || 'N')?.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-700 truncate uppercase tracking-tight">
                                                        {inv.projectName || inv.groupName || 'Nhóm chưa có tên'}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                        {inv.inviterName ? `By: ${inv.inviterName}` : ''}{inv.courseName ? ` · ${inv.courseName}` : ''}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button
                                                        onClick={() => handleAcceptInvitation(inv.id)}
                                                        className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-all uppercase"
                                                    >
                                                        ✓ Đồng ý
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeclineInvitation(inv.id)}
                                                        className="text-[10px] font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded-lg transition-all uppercase"
                                                    >
                                                        × Từ chối
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── F. Personal Alerts ── */}
                        <div className="bg-white shadow-sm border-gray-100 border border-gray-100 rounded-[24px] overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                        <Bell size={15} className="text-rose-400" />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-800 uppercase tracking-tight">Cảnh báo & Nhắc nhở</h3>
                                </div>
                            </div>
                            <div className="p-4">
                                {alerts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <CheckCircle size={28} className="text-emerald-500/50" />
                                        </div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Hệ thống an toàn</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 pt-1">
                                        {alerts.map((a, i) => {
                                            const isError = a.severity.toLowerCase() === "high";
                                            const isInfo = a.severity.toLowerCase() === "low";
                                            return (
                                                <div key={a.id} className={`flex items-start gap-3 px-4 py-4 rounded-xl border group transition-all ${isError ? "bg-rose-500/5 border-rose-500/20" : isInfo ? "bg-blue-500/5 border-blue-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
                                                    <AlertTriangle size={14} className={`shrink-0 mt-0.5 ${isError ? "text-rose-500" : isInfo ? "text-blue-500" : "text-amber-500"}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium ${isError ? "text-rose-200" : isInfo ? "text-blue-200" : "text-amber-200"}`}>{a.message}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleResolveAlert(a.id)}
                                                        className="shrink-0 text-gray-500 hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                                        title="Đã xem"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

        </>
    );
}

/* ─────── StatCard ─────── */
function StatCard({ icon, color, label, value }) {
    return (
        <div className={`bg-white shadow-sm border-gray-100 rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:border-zinc-700 transition-all group cursor-default`}>
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0 border border-current/10`}>{icon}</div>
            <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</p>
                <h3 className="text-xl font-bold text-gray-800 transition-all group-hover:scale-105 origin-left">{value}</h3>
            </div>
        </div>
    );
}

/* ─────── NoGroupView ─────── */
/* Hiển thị khi SV đã chọn lớp nhưng chưa có nhóm */
function NoGroupView({ course, onBack, onCreateGroup }) {
    return (
        <div className="space-y-5">
            <button onClick={onBack} className="flex items-center gap-2 text-xs font-semibold text-teal-700 hover:underline">
                ← Quay lại danh sách lớp
            </button>

            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 flex flex-col items-center gap-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-400/10 flex items-center justify-center">
                    <GraduationCap size={32} className="text-amber-500" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800 uppercase tracking-tight">{course.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        <span className="font-bold text-teal-600">{course.subject?.code || course.code}</span>
                        {course.lecturers?.[0]?.name && (
                            <> · GV: <span className="font-semibold">{course.lecturers[0].name}</span></>
                        )}
                    </p>
                </div>

                <div className="bg-amber-400/5 border border-amber-400/20 rounded-2xl px-6 py-5 max-w-sm">
                    <p className="text-sm font-semibold text-amber-700">Bạn chưa có nhóm trong lớp này</p>
                    <p className="text-xs text-gray-500 mt-2">
                        Tạo nhóm mới để làm Leader, hoặc chờ Leader nhóm khác gửi lời mời tham gia.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onCreateGroup}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
                    >
                        <UserPlus size={16} /> Tạo nhóm mới (Làm Leader)
                    </button>
                    <button
                        onClick={onBack}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-all"
                    >
                        ← Quay lại
                    </button>
                </div>

                <p className="text-xs text-gray-400">
                    💡 Sau khi tạo nhóm hoặc được mời, hãy làm mới trang để cập nhật thông tin.
                </p>
            </div>
        </div>
    );
}
