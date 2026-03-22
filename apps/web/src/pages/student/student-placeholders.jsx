// Student real sub-pages — Contribution, Alerts (personal), SRS standalone view
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, GitBranch, Bell, CheckCircle, AlertTriangle, Clock, BookOpen, BarChart2, Users, Activity, FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";
import { useGetProjects, useGetProjectMetrics } from "../../features/projects/hooks/useProjects.js";
import { useGetAlerts } from "../../features/system/hooks/useAlerts.js";
import { useGetProjectSrs } from "../../features/srs/hooks/useSrs.js";
import { SRS_STATUS, ALERT_SEVERITY } from "../../shared/permissions.js";

import { useQuery, useQueries } from "@tanstack/react-query";
import { getProjectMetrics } from "../../features/projects/api/projectApi.js";
const SRS_STATUS_CLS = Object.fromEntries(Object.entries(SRS_STATUS).map(([k, v]) => [k, v.cls]));

/* ─── Shared Breadcrumb ─── */
function Breadcrumb({ title }) {
    const navigate = useNavigate();
    return (
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <span className="text-teal-700 font-semibold cursor-pointer hover:underline" onClick={() => navigate("/student")}>Sinh viên</span>
            <ChevronRight size={12} />
            <span className="text-gray-800 font-semibold">{title}</span>
        </nav>
    );
}

/* ═══════════ Contribution Page ═══════════ */
export function StudentContributionPage() {
    const { user } = useAuth();
    const { data: projectsData, isLoading: loadingProjects } = useGetProjects();
    const myGroups = projectsData?.items || [];

    const metricQueries = useQueries({
        queries: myGroups.map(g => ({
            queryKey: ['projects', 'detail', g.id, 'metrics'],
            queryFn: () => getProjectMetrics(g.id),
            staleTime: 60000,
        }))
    });

    const totalMyCommits = metricQueries.reduce((sum, q) => {
        if (!q.data) return sum;
        const myMetric = q.data.studentMetrics?.find(m => m.studentId === user?.id);
        return sum + (myMetric?.commitCount || 0);
    }, 0);

    const activeGroups = myGroups.filter((_, i) => {
        const q = metricQueries[i];
        return q.data && q.data.totalCommits > 0;
    }).length;

    if (loadingProjects) {
        return (
            <div className="flex h-full items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Breadcrumb title="Đóng góp của tôi" />

            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-800">Đóng góp của tôi</h2>
                <p className="text-sm text-gray-500 mt-0.5">Tổng quan commit và đóng góp cá nhân theo nhóm</p>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                    { icon: GitBranch, color: "bg-teal-500", label: "Tổng commits của tôi", value: totalMyCommits },
                    { icon: Users, color: "bg-blue-500", label: "Nhóm tham gia", value: myGroups.length },
                    { icon: Activity, color: "bg-green-500", label: "Nhóm có hoạt động", value: activeGroups },
                ].map(({ icon: Icon, color, label, value }) => (
                    <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-2xl ${color} text-white flex items-center justify-center shrink-0`}><Icon size={18} /></div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">{label}</p>
                            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Per-group breakdown */}
            {myGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <BarChart2 size={36} className="text-gray-300" />
                    <p className="text-sm text-gray-400">Bạn chưa tham gia nhóm nào</p>
                </div>
            ) : myGroups.map(g => (
                <ProjectContributionCard key={g.id} project={g} userId={user?.id} />
            ))}
        </div>
    );
}

function ProjectContributionCard({ project, userId }) {
    const { data: metrics, isLoading } = useGetProjectMetrics(project.id);
    const members = project.team || [];

    if (isLoading || !metrics) return null;

    const myMetric = metrics.studentMetrics?.find(m => m.studentId === userId) || { commitCount: 0 };
    const maxCommits = Math.max(...(metrics.studentMetrics?.map(m => m.commitCount) || [1]), 1);

    return (
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-50 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-semibold text-gray-800">{project.name}</CardTitle>
                        <p className="text-xs text-gray-400 mt-0.5">{project.course?.name || "Lớp học"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-lg font-bold text-teal-700">{myMetric.commitCount}</p>
                            <p className="text-[10px] text-gray-400">My commits</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-gray-700">{metrics.totalCommits}</p>
                            <p className="text-[10px] text-gray-400">Total</p>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="py-4 px-5 space-y-3">
                {metrics.studentMetrics?.map(m => {
                    const student = members.find(s => s.studentId === m.studentId) || { studentName: "Unknown", studentCode: m.studentId };
                    const isMe = m.studentId === userId;
                    return (
                        <div key={m.studentId} className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600"}`}>
                                {student.studentName?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-xs font-semibold text-gray-700">{student.studentName}</span>
                                    {isMe && <span className="text-[9px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded-full">Bạn</span>}
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${isMe ? "bg-teal-500" : "bg-gray-300"}`}
                                        style={{ width: `${(m.commitCount / maxCommits) * 100}%` }} />
                                </div>
                            </div>
                            <span className="text-xs font-bold text-gray-600 shrink-0">{m.commitCount}</span>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

/* ═══════════ Alerts Page ═══════════ */
export function StudentAlertsPage() {
    const { user } = useAuth();
    const { data: alertsData, isLoading } = useGetAlerts({ studentId: user?.id, status: "OPEN" });
    const alerts = alertsData?.items || [];

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
            </div>
        );
    }

    const sevCls = {
        high: { border: `${ALERT_SEVERITY.high.cls} border`, icon: "text-red-500", text: "text-red-800" },
        medium: { border: `${ALERT_SEVERITY.medium.cls} border`, icon: "text-orange-500", text: "text-orange-800" },
        info: { border: "bg-blue-50 border-blue-100 border", icon: "text-blue-500", text: "text-blue-800" },
    };


    return (
        <div className="space-y-6">
            <Breadcrumb title="Cảnh báo" />
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-800">Cảnh báo cá nhân</h2>
                <p className="text-sm text-gray-500 mt-0.5">Nhắc nhở từ hệ thống liên quan đến các nhóm của bạn</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-orange-400 text-white flex items-center justify-center shrink-0"><Bell size={18} /></div>
                    <div><p className="text-xs text-gray-500">Tổng cảnh báo</p><h3 className="text-2xl font-bold text-gray-800">{alerts.length}</h3></div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-red-400 text-white flex items-center justify-center shrink-0"><AlertTriangle size={18} /></div>
                    <div><p className="text-xs text-gray-500">Cần xử lý ngay</p><h3 className="text-2xl font-bold text-gray-800">{alerts.filter(a => a.severity?.toLowerCase() === "high").length}</h3></div>
                </div>
            </div>

            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <CardContent className="p-0">
                    {alerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-16 h-16 rounded-3xl bg-green-50 flex items-center justify-center">
                                <CheckCircle size={32} className="text-green-400" />
                            </div>
                            <p className="font-semibold text-gray-700">Không có cảnh báo nào!</p>
                            <p className="text-sm text-gray-400">Tất cả nhóm của bạn đang hoạt động tốt 🎉</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {alerts.map((a, i) => {
                                const severity = a.severity.toLowerCase();
                                const cls = sevCls[severity] || sevCls.info;
                                return (
                                    <div key={i} className={`flex items-start gap-3 px-5 py-4 ${cls.border} border-b last:border-0`}>
                                        <AlertTriangle size={15} className={`shrink-0 mt-0.5 ${cls.icon}`} />
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{a.groupName}</p>
                                            <p className={`text-sm ${cls.text}`}>{a.message}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

/* ═══════════ SRS Standalone Page ═══════════ */
export function StudentSrsPage() {
    const { user } = useAuth();

    const { data: projectsData, isLoading: loadingProjects } = useGetProjects();
    const myGroups = projectsData?.items || [];
    
    if (loadingProjects) {
        return (
            <div className="flex h-full items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Breadcrumb title="SRS Reports" />
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-800">SRS Reports của nhóm</h2>
                <p className="text-sm text-gray-500 mt-0.5">Xem lịch sử nộp SRS và nhận xét từ giảng viên</p>
            </div>



            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <CardContent className="p-0">
                    {myGroups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <BookOpen size={36} className="text-gray-300" />
                            <p className="text-sm text-gray-400">Nhóm chưa có SRS nào được nộp</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {myGroups.map(g => (
                                <ProjectSrsRows key={g.id} project={g} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function ProjectSrsRows({ project }) {
    const { data: srsList = [], isLoading } = useGetProjectSrs(project.id);
    if (isLoading) return <div className="p-4 animate-pulse bg-gray-50 h-10" />;
    if (srsList.length === 0) return null;

    return (
        <div className="border-b border-gray-100 last:border-0 p-5">
            <h4 className="text-sm font-bold text-gray-800 mb-3">{project.name}</h4>
            <div className="grid grid-cols-3 gap-3 mb-4">
                {["FINAL", "REVIEW", "DRAFT"].map(s => {
                    const count = srsList.filter(x => x.status === s).length;
                    return (
                        <div key={s} className={`rounded-xl px-3 py-2 border flex items-center justify-between text-[10px] ${SRS_STATUS_CLS[s]} ${count === 0 ? "opacity-40" : ""}`}>
                            <span className="font-semibold">{s}</span>
                            <span className="text-sm font-bold">{count}</span>
                        </div>
                    );
                })}
            </div>
            <div className="space-y-3">
                {srsList.map(rpt => (
                    <div key={rpt.id} className="flex items-center gap-4 py-3 border-t border-gray-50 hover:bg-gray-50/50 transition-colors rounded-lg px-2">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-mono font-semibold text-gray-700">v{rpt.version}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase ${SRS_STATUS_CLS[rpt.status] || SRS_STATUS_CLS.DRAFT}`}>{rpt.status}</span>
                            </div>
                            {rpt.feedback && <p className="text-[11px] text-blue-600 italic mt-0.5 bg-blue-50/50 px-2 py-1 rounded-md">Nhận xét GV: {rpt.feedback}</p>}
                            <div className="flex items-center justify-between mt-1.5">
                                <p className="text-[9px] text-gray-400 flex items-center gap-1">
                                    <Clock size={8} />{new Date(rpt.submittedAt).toLocaleDateString("vi-VN")}
                                </p>
                                {rpt.fileUrl && (
                                    <a href={rpt.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-teal-600 hover:underline flex items-center gap-1">
                                        <FileDown size={10} /> Tải file
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

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
            <div className="flex h-full items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Breadcrumb title="Lớp của tôi" />
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-800">Lớp học của tôi</h2>
                <p className="text-sm text-gray-500 mt-0.5">Tất cả lớp học phần bạn đang tham gia</p>
            </div>

            {coursesList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <BookOpen size={36} className="text-gray-300" />
                    <p className="text-sm text-gray-400">Bạn chưa được đăng ký lớp nào</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {coursesList.map(c => {
                        const project = projectsList.find(p => p.courseId === c.id);
                        const isLeader = project?.teamLeaderId === user?.id;
                        return (
                            <Card key={c.id}
                                className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white hover:shadow-md transition-all cursor-pointer"
                                onClick={() => project ? navigate(`/student/project/${project.id}`) : navigate("/student/my-project")}
                            >
                                <div className="h-1 bg-gradient-to-r from-teal-500 to-teal-400" />
                                <CardContent className="p-5">
                                    <p className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md inline-block mb-1">{c.subject?.code || c.code}</p>
                                    <h4 className="font-bold text-gray-800 text-sm mb-2">{c.name}</h4>
                                    <p className="text-xs text-gray-500">{c.lecturerNames?.join(", ") || "Chưa có GV"}</p>
                                    {project && (
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${isLeader ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                                                {isLeader ? "Leader" : "Member"}
                                            </span>
                                            <span className="text-[10px] text-gray-400">{project.name}</span>
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

/* Re-export as alias for convenience */
export { StudentContributionPage as StudentMyProjectPage };
