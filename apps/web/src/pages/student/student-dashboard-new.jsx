// Student Dashboard — Enterprise SaaS Learning Workspace (Real API)
import { useState } from "react";
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
import { useGetProjects, useLinkIntegration, useAddTeamMember } from "../../features/projects/hooks/useProjects.js";
import { useGetProjectSrs, useSubmitSrs, useDeleteSrs } from "../../features/srs/hooks/useSrs.js";
import { useGetAlerts, useResolveAlert } from "../../features/system/hooks/useAlerts.js";

import SRSUploadModal from "./SRSUploadModal.jsx";
import CourseWorkspace from "./CourseWorkspace.jsx";


/* ── Status config (from shared module) ── */
const SRS_STATUS_CLS = Object.fromEntries(Object.entries(SRS_STATUS).map(([k, v]) => [k, v.cls]));

/* ═══════════ MAIN COMPONENT ═══════════ */
export default function StudentDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();

    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [editingReport, setEditingReport] = useState(null);

    // Data Fetching - Real API
    const { data: coursesData = { items: [] }, isLoading: coursesLoading, refetch: refetchCourses } = useGetCourses({ pageSize: 100 });
    const { data: projectsData = { items: [] }, isLoading: projectsLoading, refetch: refetchProjects } = useGetProjects({ pageSize: 100 });
    const { data: alertsData = { items: [] }, isLoading: alertsLoading, refetch: refetchAlerts } = useGetAlerts({ pageSize: 10 });

    const courses = coursesData.items || [];
    const myGroupsList = projectsData.items || [];

    // Map projects to a courseId keyed object for easy lookup in Workspace
    const groupsMapByCourse = {};
    myGroupsList.forEach(p => {
        groupsMapByCourse[p.courseId] = p;
    });

    const selectedGroup = selectedCourseId ? groupsMapByCourse[selectedCourseId] : null;

    // Fetch SRS for selected group (only when a group is selected)
    const { data: srsData = [], refetch: refetchSrs } = useGetProjectSrs(selectedGroup?.id);

    const isLoading = coursesLoading || projectsLoading;

    // loadData: hàm làm mới dữ liệu thủ công
    const loadData = () => {
        refetchCourses();
        refetchProjects();
        refetchAlerts();
        if (selectedGroup?.id) refetchSrs();
    };

    // SRS Mutations
    const { mutate: submitSrsMutate } = useSubmitSrs();
    const { mutate: deleteSrsMutate } = useDeleteSrs();



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

    /* ── SRS submit (Leader only) ── */
    const handleSaveSRS = (form) => {
        if (!selectedGroup?.id || !form.file) return;

        // BE chỉ có API upload SRS /api/projects/:id/srs nhận multipart formdata
        // Chỉnh sửa (update) phiên bản hiện chưa có BE endpoint -> coi như upload bản mới luôn
        submitSrsMutate(
            { projectId: selectedGroup.id, file: form.file },
            {
                onSuccess: () => {
                    success("Đã nộp SRS thành công! Đang chờ giảng viên xem xét.");
                    setShowUploadModal(false);
                },
                onError: (err) => showError(err?.message || "Không thể nộp SRS"),
            }
        );
    };

    const handleDeleteSRS = (srsId) => {
        if (!window.confirm("Bạn có chắc muốn xóa SRS report này?")) return;
        deleteSrsMutate(
            { reportId: srsId },
            {
                onSuccess: () => success("Đã xóa SRS report."),
                onError: (err) => showError(err?.message || "Không thể xóa SRS"),
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
            <div className="space-y-6">
                {/* ── Breadcrumb ── */}
                <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                    <span className="text-teal-700 font-semibold">Sinh viên</span>
                    <ChevronRight size={12} />
                    <span className="text-gray-800 font-semibold">
                        {selectedCourseId ? `${selectedCourse?.code} — Nhóm của tôi` : "Dashboard"}
                    </span>
                </nav>

                {/* ── A. Welcome Header ── */}
                {!selectedCourseId && (
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-gray-800">
                                Xin chào, {user?.name || "Sinh viên"}
                            </h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                <span className="bg-teal-50 text-teal-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-teal-100 mr-2">Sinh viên</span>
                                Học kỳ đang hoạt động — hãy kiểm tra tiến độ nhóm của bạn
                            </p>
                        </div>
                        <button onClick={loadData} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-teal-700 transition-colors">
                            <RefreshCw size={13} />Làm mới
                        </button>
                    </div>
                )}

                {/* ── B. Summary Stats ── */}
                {!selectedCourseId && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard icon={<BookOpen size={20} />} color="bg-blue-500" label="Lớp đang học" value={courses.length} />
                        <StatCard icon={<Users size={20} />} color="bg-teal-500" label="Nhóm của tôi" value={Object.keys(groupsMapByCourse).length} />
                        <StatCard icon={<GitBranch size={20} />} color="bg-green-500" label="Links đã duyệt" value={approvedCount} />
                        <StatCard icon={<Bell size={20} />} color={alerts.length > 0 ? "bg-orange-400" : "bg-gray-400"} label="Cảnh báo" value={alerts.length} />
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
                        onUploadSRS={() => { setShowUploadModal(true); setEditingReport(null); }}
                        onEditSRS={(r) => { setEditingReport(r); setShowUploadModal(true); }}
                        onDeleteSRS={handleDeleteSRS}
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
                                        return (
                                            <Card key={course.id}
                                                className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white hover:shadow-md transition-all duration-200 group cursor-pointer"
                                                onClick={() => setSelectedCourseId(String(course.id))}
                                            >
                                                <div className="h-1 bg-gradient-to-r from-teal-500 to-teal-400" />
                                                <CardContent className="p-5">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <p className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md inline-block mb-1">{course.subject?.code || course.code}</p>
                                                            <h4 className="font-bold text-gray-800 text-sm leading-snug">{course.name}</h4>
                                                        </div>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${lsCfg.cls}`}>{lsCfg.label}</span>
                                                    </div>
                                                    <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                                                        <p className="flex items-center gap-1.5">
                                                            <span className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                                <GraduationCap size={9} className="text-blue-600" />
                                                            </span>
                                                            {course.lecturers?.[0]?.name || "Chưa có GV"}
                                                        </p>
                                                        <p className="flex items-center gap-1.5">
                                                            <span className="w-4 h-4 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                                                <Calendar size={9} className="text-green-600" />
                                                            </span>
                                                            {course.semester?.name || "—"}
                                                        </p>
                                                        {grp && (
                                                            <p className="flex items-center gap-1.5">
                                                                <span className="w-4 h-4 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                                                                    <Users size={9} className="text-purple-600" />
                                                                </span>
                                                                {grp.name} ·{" "}
                                                                {isLeader
                                                                    ? <span className="text-amber-600 font-semibold ml-1">Leader</span>
                                                                    : <span className="ml-1">Member</span>
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 rounded-xl py-2 transition-colors group-hover:bg-teal-100">
                                                        Vào lớp <ArrowRight size={12} />
                                                    </button>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </div>


                        {/* ── D. Personal Alerts ── */}
                        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                            <CardHeader className="border-b border-gray-50 pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                                        <Bell size={15} className="text-orange-500" />
                                    </div>
                                    <CardTitle className="text-base font-semibold text-gray-800">Cảnh báo & Nhắc nhở</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-3 pb-2">
                                {alerts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                                        <CheckCircle size={28} className="text-green-400" />
                                        <p className="text-sm text-gray-500 font-medium">Tất cả ổn! Không có cảnh báo nào.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 py-2">
                                        {alerts.map((a, i) => {
                                            const isError = a.severity.toLowerCase() === "high";
                                            const isInfo = a.severity.toLowerCase() === "low";
                                            return (
                                                <div key={a.id} className={`flex items-start gap-3 px-4 py-3 rounded-xl border group transition-all ${isError ? "bg-red-50 border-red-100" : isInfo ? "bg-blue-50 border-blue-100" : "bg-orange-50 border-orange-100"}`}>
                                                    <AlertTriangle size={14} className={`shrink-0 mt-0.5 ${isError ? "text-red-500" : isInfo ? "text-blue-500" : "text-orange-500"}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm ${isError ? "text-red-800" : isInfo ? "text-blue-800" : "text-orange-800"}`}>{a.message}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleResolveAlert(a.id)}
                                                        className="shrink-0 text-gray-400 hover:text-green-600 transition-colors opacity-0 group-hover:opacity-100 p-0.5"
                                                        title="Đã xem"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            <SRSUploadModal
                isOpen={showUploadModal}
                onClose={() => { setShowUploadModal(false); setEditingReport(null); }}
                onSave={handleSaveSRS}
                editingReport={editingReport}
            />
        </>
    );
}

/* ─────── StatCard ─────── */
function StatCard({ icon, color, label, value }) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-all duration-200">
            <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center shrink-0`}>{icon}</div>
            <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <h3 className="text-2xl font-bold text-gray-800 leading-none mt-0.5">{value}</h3>
            </div>
        </div>
    );
}
