// Student real sub-pages — Contribution, Alerts (personal), SRS standalone view
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, GitBranch, Bell, CheckCircle, AlertTriangle, Clock, BookOpen, BarChart2, Users, Activity, FileDown, Star, ArrowRight, UserCheck, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";
import { useGetProjectMetrics } from "../../features/projects/hooks/useProjects.js";
import { useGetMyProjects } from "../../features/student/hooks/useStudent.js";
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
    const { data: projectsData, isLoading: loadingProjects } = useGetMyProjects();
    const myGroups = Array.isArray(projectsData?.items) ? projectsData.items : [];

    const metricQueries = useQueries({
        queries: myGroups.map((g) => ({
            queryKey: ['projects', 'detail', g.id, 'metrics'],
            queryFn: () => getProjectMetrics(g.id),
            staleTime: 60000,
        }))
    });

    const totalMyCommits = metricQueries.reduce((sum, q) => {
        if (!q.data) return sum;
        const myMetric = (Array.isArray(q?.data?.studentMetrics) ? q.data.studentMetrics : []).find(
            (m) => String(m?.studentId) === String(user?.id)
        );
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
            ) : myGroups.map((g) => (
                <ProjectContributionCard key={g.id} project={g} userId={user?.id} />
            ))}
        </div>
    );
}

function ProjectContributionCard({ project, userId }) {
    const { data: metrics, isLoading } = useGetProjectMetrics(project.id);
    const members = Array.isArray(project?.team) ? project.team : [];

    if (isLoading || !metrics) return null;

    const studentMetrics = Array.isArray(metrics?.studentMetrics) ? metrics.studentMetrics : [];
    const myMetric = studentMetrics.find((m) => String(m?.studentId) === String(userId)) || { commitCount: 0 };
    const maxCommits = Math.max(...(studentMetrics.map((m) => m?.commitCount ?? 0) || [1]), 1);

    return (
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-50 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-semibold text-gray-800">{project?.name ?? `Nhóm (ID: ${project?.id ?? "N/A"})`}</CardTitle>
                        <p className="text-xs text-gray-400 mt-0.5">{project?.course?.name ?? `Khóa học (ID: ${project?.courseId ?? "N/A"})`}</p>
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
                {studentMetrics.map((m) => {
                    const student =
                        members.find((s) => String(s?.studentId ?? s?.id) === String(m?.studentId)) ||
                        { studentName: `SV (ID: ${m?.studentId ?? "N/A"})`, studentCode: m?.studentId };
                    const displayName = student?.studentName ?? student?.name ?? student?.fullName ?? `SV (ID: ${m?.studentId ?? "N/A"})`;
                    const isMe = String(m?.studentId) === String(userId);
                    return (
                        <div key={m?.studentId} className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600"}`}>
                                {displayName?.charAt?.(0) ?? "S"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-xs font-semibold text-gray-700">{displayName}</span>
                                    {isMe && <span className="text-[9px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded-full">Bạn</span>}
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${isMe ? "bg-teal-500" : "bg-gray-300"}`}
                                        style={{ width: `${((m?.commitCount ?? 0) / maxCommits) * 100}%` }} />
                                </div>
                            </div>
                            <span className="text-xs font-bold text-gray-600 shrink-0">{m?.commitCount ?? 0}</span>
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
    const alerts = Array.isArray(alertsData?.items) ? alertsData.items : [];

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
                                const severity = a?.severity?.toLowerCase?.() ?? "info";
                                const cls = sevCls[severity] || sevCls.info;
                                return (
                                    <div key={i} className={`flex items-start gap-3 px-5 py-4 ${cls.border} border-b last:border-0`}>
                                        <AlertTriangle size={15} className={`shrink-0 mt-0.5 ${cls.icon}`} />
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{a?.groupName ?? `Nhóm (ID: ${a?.groupId ?? "N/A"})`}</p>
                                            <p className={`text-sm ${cls.text}`}>{a?.message ?? "Không có nội dung cảnh báo"}</p>
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

    const { data: projectsData, isLoading: loadingProjects } = useGetMyProjects();
    const myGroups = Array.isArray(projectsData?.items) ? projectsData.items : [];

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
    const normalizedSrsList = Array.isArray(srsList) ? srsList : [];
    if (normalizedSrsList.length === 0) return null;

    return (
        <div className="border-b border-gray-100 last:border-0 p-5">
            <h4 className="text-sm font-bold text-gray-800 mb-3">{project?.name ?? `Nhóm (ID: ${project?.id ?? "N/A"})`}</h4>
            <div className="grid grid-cols-3 gap-3 mb-4">
                {["FINAL", "REVIEW", "DRAFT"].map(s => {
                    const count = normalizedSrsList.filter((x) => x?.status === s).length;
                    return (
                        <div key={s} className={`rounded-xl px-3 py-2 border flex items-center justify-between text-[10px] ${SRS_STATUS_CLS[s]} ${count === 0 ? "opacity-40" : ""}`}>
                            <span className="font-semibold">{s}</span>
                            <span className="text-sm font-bold">{count}</span>
                        </div>
                    );
                })}
            </div>
            <div className="space-y-3">
                {normalizedSrsList.map((rpt) => (
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
    const { data: projectsData, isLoading: loadingProjects } = useGetMyProjects();

    const coursesList = Array.isArray(coursesData?.items) ? coursesData.items : [];
    const projectsList = Array.isArray(projectsData?.items) ? projectsData.items : [];

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

            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-800">Lớp học của tôi</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Tất cả lớp học phần bạn đang tham gia</p>
                </div>
                <span className="text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                    {coursesList.length} lớp
                </span>
            </div>

            {coursesList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-16 h-16 rounded-3xl bg-teal-50 flex items-center justify-center">
                        <BookOpen size={28} className="text-teal-400" />
                    </div>
                    <p className="font-semibold text-gray-700">Bạn chưa được đăng ký lớp nào</p>
                    <p className="text-sm text-gray-400">Liên hệ giảng viên để được thêm vào lớp học</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {coursesList.map((c) => {
                        const project = projectsList.find(p => String(p.courseId) === String(c.id));
                        const safeTeam = Array.isArray(project?.team) ? project.team : [];
                        const myMember = safeTeam.find((m) => String(m?.studentId ?? m?.id) === String(user?.id));
                        const isLeader = myMember?.role?.toUpperCase() === "LEADER";
                        const leader = safeTeam.find((m) => m?.role?.toUpperCase?.() === "LEADER");
                        const ghApproved = project?.integration?.githubStatus === "APPROVED";
                        const jiraApproved = project?.integration?.jiraStatus === "APPROVED";
                        const bothApproved = ghApproved && jiraApproved;
                        const memberCount = safeTeam?.length ?? 0;

                        return (
                            <div
                                key={c.id}
                                className="bg-white border border-gray-100 rounded-[24px] shadow-sm hover:shadow-md hover:border-teal-100 transition-all cursor-pointer group overflow-hidden"
                                onClick={() => project ? navigate(`/student/project/${project.id}`) : null}
                            >
                                {/* Top color bar */}
                                <div className="h-1 bg-gradient-to-r from-teal-500 to-emerald-400" />

                                <div className="p-5">
                                    {/* Badges row */}
                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                        <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-lg">
                                            {c.subject?.code || c.code || "N/A"}
                                        </span>
                                        {project && (
                                            <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border uppercase ${isLeader
                                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                                : "bg-gray-50 text-gray-500 border-gray-200"
                                                }`}>
                                                {isLeader ? <><Crown size={10} /> Leader</> : <><Users size={10} /> Member</>}
                                            </span>
                                        )}
                                        {!project && (
                                            <span className="text-[11px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                                                Chưa có nhóm
                                            </span>
                                        )}
                                    </div>

                                    {/* Course + Group Name */}
                                    <h4 className="font-bold text-gray-800 text-base leading-snug mb-0.5">
                                        {project ? project.name : c.name}
                                    </h4>
                                    {project && (
                                        <p className="text-xs text-gray-400 mb-4">{c.name}</p>
                                    )}

                                    {project ? (
                                        <>
                                            {/* Leader info */}
                                            {leader && (
                                                <div className="flex items-center gap-2.5 mb-3">
                                                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                        {(leader?.studentName ?? leader?.name ?? leader?.fullName ?? `SV (ID: ${leader?.studentId ?? leader?.id ?? "N/A"})`)?.charAt?.(0) ?? "S"}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-800">{leader?.studentName ?? leader?.name ?? leader?.fullName ?? `SV (ID: ${leader?.studentId ?? leader?.id ?? "N/A"})`}</p>
                                                        <p className="text-[10px] text-gray-400">Team Leader</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Member count */}
                                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                                                <Users size={13} className="text-gray-300" />
                                                <span>{memberCount} thành viên</span>
                                            </div>

                                            {/* Divider */}
                                            <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                                                {/* Status */}
                                                <div className="flex items-center gap-2">
                                                    {bothApproved ? (
                                                        <span className="flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                                                            <CheckCircle size={11} /> Đã duyệt
                                                        </span>
                                                    ) : (
                                                        <>
                                                            {ghApproved
                                                                ? <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full"><CheckCircle size={9} /> GitHub</span>
                                                                : <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full"><Clock size={9} /> GitHub</span>
                                                            }
                                                            {jiraApproved
                                                                ? <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full"><CheckCircle size={9} /> Jira</span>
                                                                : <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full"><Clock size={9} /> Jira</span>
                                                            }
                                                        </>
                                                    )}
                                                </div>
                                                {/* Arrow */}
                                                <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-teal-50 border border-gray-100 group-hover:border-teal-200 flex items-center justify-center transition-colors">
                                                    <ArrowRight size={14} className="text-gray-400 group-hover:text-teal-600 transition-colors" />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* No project state */}
                                            <p className="text-xs text-gray-400 mb-3">
                                                GV: {Array.isArray(c?.lecturerNames) && c.lecturerNames.length > 0 ? c.lecturerNames.join(", ") : `GV (ID: ${c?.lecturerId ?? "N/A"})`}
                                            </p>
                                            <div className="border-t border-gray-50 pt-3">
                                                <span className="text-[11px] text-gray-400 italic">Bạn chưa được thêm vào nhóm của lớp này</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
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
    const { data: projectsData, isLoading } = useGetMyProjects();
    const myGroups = Array.isArray(projectsData?.items) ? projectsData.items : [];

    // Auto-redirect to the first group if only one group exists
    useEffect(() => {
        if (!isLoading && myGroups.length === 1) {
            navigate(`/student/project/${myGroups[0].id}`, { replace: true });
        }
    }, [isLoading, myGroups, navigate]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
            </div>
        );
    }

    if (myGroups.length === 0) {
        return (
            <div className="space-y-6">
                <Breadcrumb title="Nhóm của tôi" />
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-800">Nhóm của tôi</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Nhóm dự án bạn đang tham gia trong các lớp học</p>
                </div>
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <GitBranch size={36} className="text-gray-300" />
                    <p className="text-sm text-gray-400">Bạn chưa thuộc nhóm nào</p>
                    <button
                        onClick={() => navigate("/student/courses")}
                        className="text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 px-4 py-2 rounded-xl transition-colors"
                    >
                        Xem danh sách lớp học
                    </button>
                </div>
            </div>
        );
    }

    // Multiple groups: show picker list
    return (
        <div className="space-y-6">
            <Breadcrumb title="Nhóm của tôi" />
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-800">Nhóm của tôi</h2>
                <p className="text-sm text-gray-500 mt-0.5">Nhóm dự án bạn đang tham gia trong các lớp học</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myGroups.map((g) => {
                    const safeTeam = Array.isArray(g?.team) ? g.team : [];
                    const myMember = safeTeam.find((m) => String(m?.studentId ?? m?.id) === String(user?.id));
                    const isLeader = myMember?.role?.toUpperCase() === "LEADER";
                    const ghApproved = g.integration?.githubStatus === "APPROVED";
                    const jiraApproved = g.integration?.jiraStatus === "APPROVED";
                    return (
                        <Card
                            key={g.id}
                            className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white hover:shadow-md transition-all cursor-pointer"
                            onClick={() => navigate(`/student/project/${g.id}`)}
                        >
                            <div className="h-1 bg-gradient-to-r from-teal-500 to-teal-400" />
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div>
                                        <p className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md inline-block mb-1">
                                            {g.course?.subject?.code || g.course?.code || "Lớp học"}
                                        </p>
                                        <h4 className="font-bold text-gray-800">{g.name}</h4>
                                        {g.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{g.description}</p>}
                                    </div>
                                    <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${isLeader ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                                        {isLeader ? "Leader" : "Member"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${ghApproved ? "bg-green-50 text-green-700 border-green-100" : "bg-gray-100 text-gray-400 border-gray-200"}`}>
                                        <GitBranch size={9} /> GitHub: {ghApproved ? "Đã duyệt" : "Chờ duyệt"}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${jiraApproved ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-gray-100 text-gray-400 border-gray-200"}`}>
                                        <BookOpen size={9} /> Jira: {jiraApproved ? "Đã duyệt" : "Chờ duyệt"}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2">{safeTeam?.length ?? 0} thành viên</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
