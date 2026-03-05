// Student Dashboard — Enterprise SaaS Learning Workspace (DB-connected)
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import db from "../../mock/db.js";
import { LINK_STATUS as LINK_STATUS_CFG, SRS_STATUS, isGroupLeader, requireLeader, buildStudentAlerts } from "../../shared/permissions.js";
import {
    BookOpen, GitBranch, Bell, CheckCircle, AlertTriangle,
    ChevronRight, Clock, ArrowRight, Link2,
    Users, GraduationCap, Calendar, BarChart2,
    Crown, MapPin, Github, Star, RefreshCw, UserPlus
} from "lucide-react";

/* ── Status config (from shared module) ── */
const SRS_STATUS_CLS = Object.fromEntries(Object.entries(SRS_STATUS).map(([k, v]) => [k, v.cls]));

/* ─── SRS Upload Modal ─── */
function SRSUploadModal({ isOpen, onClose, onSave, editingReport }) {
    const [form, setForm] = useState({ version: "", note: "" });
    useEffect(() => {
        setForm(editingReport ? { version: editingReport.version, note: editingReport.note || "" } : { version: "", note: "" });
    }, [editingReport, isOpen]);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-[28px] shadow-2xl p-6 w-full max-w-sm mx-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                    {editingReport ? "Chỉnh sửa SRS" : "Nộp SRS Report"}
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phiên bản *</label>
                        <input
                            value={form.version}
                            onChange={e => setForm({ ...form, version: e.target.value })}
                            placeholder="VD: 1.0, 1.1"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ghi chú</label>
                        <textarea
                            value={form.note}
                            onChange={e => setForm({ ...form, note: e.target.value })}
                            rows={3}
                            placeholder="Ghi chú cho phiên bản này..."
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all resize-none"
                        />
                    </div>
                </div>
                <div className="flex gap-3 mt-5">
                    <Button onClick={onClose} variant="outline" className="flex-1 rounded-xl border-gray-200 text-gray-600 h-10">Hủy</Button>
                    <Button
                        onClick={() => { if (!form.version.trim()) return; onSave(form); setForm({ version: "", note: "" }); }}
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 border-0 shadow-sm"
                    >
                        {editingReport ? "Lưu" : "Nộp"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

/* ═══════════ MAIN COMPONENT ═══════════ */
export default function StudentDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { success, error } = useToast();

    const [courses, setCourses] = useState([]);
    const [groups, setGroups] = useState([]);   // groups student belongs to (keyed by courseId)
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [editingReport, setEditingReport] = useState(null);
    const [srsState, setSrsState] = useState({}); // groupId → srs[]

    useEffect(() => {
        if (user?.id) loadData();
    }, [user]);

    const loadData = () => {
        // Find all courses student is enrolled in
        const enrollments = db.findMany("courseEnrollments", { studentId: user.id });
        const myCoursesIds = enrollments.map(e => e.courseId);
        const myCourses = myCoursesIds.map(id => db.findById("courses", id)).filter(Boolean).map(c => ({
            ...c,
            subject: db.findById("subjects", c.subjectId),
            semester: db.findById("semesters", c.semesterId),
            lecturers: db.getCourseLecturers(c.id),
        }));
        setCourses(myCourses);

        // Find groups student is in, per course
        const allGroups = db.findMany("groups");
        const myGroups = {};
        for (const g of allGroups) {
            if (g.studentIds?.includes(user.id)) {
                myGroups[g.courseId] = g;
            }
        }
        setGroups(myGroups);

        // Load SRS from DB per group
        const srs = {};
        for (const g of Object.values(myGroups)) {
            const proj = db.findMany("projects", { courseId: g.courseId })[0];
            if (proj) srs[g.id] = db.findMany("srsReports", { projectId: proj.id });
            else srs[g.id] = [];
        }
        setSrsState(srs);
    };

    /* ── Alerts (personal): derive from DB ── */
    const buildAlerts = () => {
        const myGroups = Object.values(groups);
        return buildStudentAlerts(myGroups, user?.id);
    };

    const alerts = buildAlerts();

    /* ── Link submit (Leader only) ── */
    const handleSubmitLinks = (group, githubUrl, jiraUrl, topic) => {
        const err = requireLeader(group, user?.id);
        if (err) { error(err); return; }
        if (!githubUrl.trim() || !jiraUrl.trim()) { error("Vui lòng nhập đầy đủ GitHub URL và Jira URL!"); return; }
        db.update("groups", group.id, {
            githubRepoUrl: githubUrl.trim(),
            jiraProjectUrl: jiraUrl.trim(),
            topic: topic.trim(),
            githubStatus: "PENDING",
            jiraStatus: "PENDING",
            updatedAt: new Date().toISOString(),
        });
        success("Đã submit links! Đang chờ giảng viên duyệt.");
        loadData();
    };

    /* ── SRS submit / edit (Leader only) ── */
    const handleSaveSRS = (form) => {
        const g = groups[selectedCourseId];
        if (!g) return;
        const err = requireLeader(g, user?.id);
        if (err) { error(err); return; }

        const proj = db.findMany("projects", { courseId: g.courseId })[0];
        if (!proj) { error("Không tìm thấy project"); return; }

        if (editingReport) {
            db.update("srsReports", editingReport.id, { version: form.version, note: form.note, updatedAt: new Date().toISOString() });
            success("Đã cập nhật SRS!");
        } else {
            db.create("srsReports", {
                projectId: proj.id,
                version: form.version,
                status: "DRAFT",
                submittedByStudentId: user.id,
                submittedAt: new Date().toISOString(),
                note: form.note,
                fileName: `SRS_v${form.version}.pdf`,
            });
            success("Đã nộp SRS!");
        }
        setShowUploadModal(false);
        setEditingReport(null);
        loadData();
    };

    const handleDeleteSRS = (srsId) => {
        const g = groups[selectedCourseId];
        const err = requireLeader(g, user?.id);
        if (err) { error(err); return; }

        db.delete("srsReports", srsId);
        success("Đã xóa SRS!");
        loadData();
    };

    /* ── Derived data ── */
    const approvedCount = Object.values(groups).filter(g => g.githubStatus === "APPROVED" && g.jiraStatus === "APPROVED").length;
    const selectedGroup = selectedCourseId ? groups[selectedCourseId] : null;
    const selectedCourse = selectedCourseId ? courses.find(c => c.id === selectedCourseId) : null;
    const groupStudents = selectedGroup ? db.getGroupStudents(selectedGroup.id) : [];

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
                        <StatCard icon={<Users size={20} />} color="bg-teal-500" label="Nhóm của tôi" value={Object.keys(groups).length} />
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
                        srsReports={srsState[selectedGroup.id] || []}
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
                            {courses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                    <GraduationCap size={36} className="text-gray-300" />
                                    <p className="text-sm text-gray-400">Bạn chưa được đăng ký lớp nào</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {courses.map(course => {
                                        const grp = groups[course.id];
                                        const ghStatus = grp?.githubStatus || "NONE";
                                        const jiraStatus = grp?.jiraStatus || "NONE";
                                        // Determine overall link status
                                        let linkStatus = "NONE";
                                        if (grp?.githubStatus === "APPROVED" && grp?.jiraStatus === "APPROVED") linkStatus = "APPROVED";
                                        else if (grp?.githubRepoUrl || grp?.jiraProjectUrl) {
                                            if (grp?.githubStatus === "REJECTED" || grp?.jiraStatus === "REJECTED") linkStatus = "REJECTED";
                                            else linkStatus = "PENDING";
                                        }
                                        const lsCfg = LINK_STATUS_CFG[linkStatus];
                                        const isLeader = grp?.teamLeaderId === user?.id;
                                        return (
                                            <Card key={course.id}
                                                className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white hover:shadow-md transition-all duration-200 group cursor-pointer"
                                                onClick={() => setSelectedCourseId(course.id)}
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
                                        {alerts.map((a, i) => (
                                            <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${a.type === "error" ? "bg-red-50 border-red-100" : a.type === "info" ? "bg-blue-50 border-blue-100" : "bg-orange-50 border-orange-100"}`}>
                                                <AlertTriangle size={14} className={`shrink-0 mt-0.5 ${a.type === "error" ? "text-red-500" : a.type === "info" ? "text-blue-500" : "text-orange-500"}`} />
                                                <p className={`text-sm ${a.type === "error" ? "text-red-800" : a.type === "info" ? "text-blue-800" : "text-orange-800"}`}>{a.msg}</p>
                                            </div>
                                        ))}
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

/* ─────── CourseWorkspace ─────── */
function CourseWorkspace({ course, group, groupStudents, srsReports, userId, onBack, onSubmitLinks, onUploadSRS, onEditSRS, onDeleteSRS }) {
    const [githubInput, setGithubInput] = useState(group.githubRepoUrl || "");
    const [jiraInput, setJiraInput] = useState(group.jiraProjectUrl || "");
    const [topicInput, setTopicInput] = useState(group.topic || "");

    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteAvailableStudents, setInviteAvailableStudents] = useState([]);
    const [inviteSelectedIds, setInviteSelectedIds] = useState([]);

    const isLeader = group.teamLeaderId === userId;
    const ghApproved = group.githubStatus === "APPROVED";
    const jiraApproved = group.jiraStatus === "APPROVED";
    const bothApproved = ghApproved && jiraApproved;

    // Overall link status derived from per-link statuses
    const githubStatusKey = group.githubRepoUrl ? group.githubStatus : "NONE";
    const jiraStatusKey = group.jiraProjectUrl ? group.jiraStatus : "NONE";

    // My commit count from DB
    const proj = db.findMany("projects", { courseId: course.id })[0];
    const myCommits = proj ? db.findMany("commits", { projectId: proj.id }).filter(c => c.authorStudentId === userId).length : 0;
    const totalCommits = proj ? db.findMany("commits", { projectId: proj.id }).length : 0;

    const { success, error } = useToast();

    const handleOpenInvite = () => {
        // Find students enrolled in the course who are NOT in any group in this course
        const enrollments = db.findMany("courseEnrollments", { courseId: course.id });
        const enrolledIds = enrollments.map(e => e.studentId);
        const allCourseGroups = db.findMany("groups", { courseId: course.id });
        const groupedStudentIds = new Set(allCourseGroups.flatMap(g => g.studentIds));

        const availableIds = enrolledIds.filter(id => !groupedStudentIds.has(id));
        const availableStudents = availableIds.map(id => db.findById("users.students", id)).filter(Boolean);

        setInviteAvailableStudents(availableStudents);
        setInviteSelectedIds([]);
        setShowInviteModal(true);
    };

    const toggleInviteStudent = (studentId) => {
        setInviteSelectedIds((prev) =>
            prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
        );
    };

    const handleInviteSubmit = () => {
        if (inviteSelectedIds.length === 0) return;
        try {
            inviteSelectedIds.forEach(studentId => {
                db.create("teamInvitations", {
                    groupId: group.id,
                    invitedStudentId: studentId,
                    invitedByStudentId: userId,
                    status: "PENDING",
                    invitedAt: new Date().toISOString()
                });
            });
            success(`Đã gửi ${inviteSelectedIds.length} lời mời tham gia nhóm!`);
            setShowInviteModal(false);
        } catch (err) {
            error("Không thể gửi lời mời");
        }
    };

    return (
        <div className="space-y-5">
            <button onClick={onBack} className="flex items-center gap-2 text-xs font-semibold text-teal-700 hover:underline">
                ← Quay lại danh sách lớp
            </button>

            {/* ── Project Header ── */}
            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <div className="h-1 bg-gradient-to-r from-teal-500 to-teal-600" />
                <CardContent className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">{course.subject?.code || course.code}</span>
                                {isLeader ? (
                                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-100">
                                        <Crown size={10} />Team Leader
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-gray-100 text-gray-600 border-gray-200">Team Member</span>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{group.name}</h3>
                            {group.topic && (
                                <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                                    <MapPin size={12} className="text-teal-500 shrink-0" />{group.topic}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${LINK_STATUS_CFG[githubStatusKey]?.cls || LINK_STATUS_CFG.NONE.cls}`}>
                                <Github size={11} />GitHub: {LINK_STATUS_CFG[githubStatusKey]?.label || "—"}
                            </div>
                            <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${LINK_STATUS_CFG[jiraStatusKey]?.cls || LINK_STATUS_CFG.NONE.cls}`}>
                                <Link2 size={11} />Jira: {LINK_STATUS_CFG[jiraStatusKey]?.label || "—"}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* ── Left: Links + Contribution Snapshot ── */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Links panel */}
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center"><Link2 size={14} className="text-indigo-600" /></div>
                                <CardTitle className="text-base font-semibold text-gray-800">Liên kết dự án</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {isLeader ? (
                                <>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Đề tài</label>
                                        <input value={topicInput} onChange={e => setTopicInput(e.target.value)}
                                            placeholder="Tên đề tài..."
                                            className="mt-1.5 w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Github size={10} /> GitHub Repo URL</label>
                                        <input value={githubInput} onChange={e => setGithubInput(e.target.value)}
                                            placeholder="https://github.com/..."
                                            className="mt-1.5 w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Link2 size={10} /> Jira Project URL</label>
                                        <input value={jiraInput} onChange={e => setJiraInput(e.target.value)}
                                            placeholder="https://...atlassian.net/..."
                                            className="mt-1.5 w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                                        />
                                    </div>
                                    {!bothApproved && (
                                        <Button
                                            onClick={() => onSubmitLinks(group, githubInput, jiraInput, topicInput)}
                                            className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 text-sm border-0 shadow-sm mt-1"
                                        >
                                            Gửi để GV phê duyệt
                                        </Button>
                                    )}
                                    {bothApproved && (
                                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-3 py-2 border border-green-100">
                                            <CheckCircle size={15} />Đã được giảng viên duyệt
                                        </div>
                                    )}
                                    {(group.githubStatus === "REJECTED" || group.jiraStatus === "REJECTED") && (
                                        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2 border border-red-100">
                                            <AlertTriangle size={15} />Một link bị từ chối — hãy sửa và gửi lại
                                        </div>
                                    )}
                                </>
                            ) : (
                                // Member: view only
                                <div className="space-y-3">
                                    {!isLeader && (
                                        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 px-3 py-2 rounded-xl">
                                            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                                            Chỉ Team Leader mới được submit/chỉnh sửa links.
                                        </div>
                                    )}
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">GitHub</p>
                                        <p className="text-xs text-gray-700 break-all">{group.githubRepoUrl || "Chưa liên kết"}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Jira</p>
                                        <p className="text-xs text-gray-700 break-all">{group.jiraProjectUrl || "Chưa liên kết"}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Contribution Snapshot */}
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center"><BarChart2 size={14} className="text-blue-600" /></div>
                                <CardTitle className="text-base font-semibold text-gray-800">Đóng góp của tôi</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-2 gap-3">
                            {[
                                { label: "My Commits", value: myCommits, color: "text-blue-700 bg-blue-50" },
                                { label: "Total Commits", value: totalCommits, color: "text-teal-700 bg-teal-50" },
                            ].map(({ label, value, color }) => (
                                <div key={label} className={`rounded-xl px-3 py-2.5 flex flex-col items-center text-center ${color}`}>
                                    <span className="text-xl font-bold">{value}</span>
                                    <span className="text-[10px] font-medium mt-0.5 leading-tight">{label}</span>
                                </div>
                            ))}
                            <p className="col-span-2 text-[10px] text-gray-400">
                                {/* TODO: Connect to GitHub API for live data */}
                                * Từ mock DB. Sẽ kết nối GitHub API sau tích hợp.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Right: Members + SRS ── */}
                <div className="lg:col-span-3 space-y-5">
                    {/* Team Members */}
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center"><Users size={14} className="text-teal-600" /></div>
                                <CardTitle className="text-base font-semibold text-gray-800">Thành viên nhóm</CardTitle>
                                <span className="ml-auto text-xs font-semibold text-gray-400 mr-2">{groupStudents.length} người</span>
                                {isLeader && (
                                    <button
                                        onClick={handleOpenInvite}
                                        className="text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                                    >
                                        <UserPlus size={12} /> Mời SV
                                    </button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {groupStudents.map(stu => {
                                const isMe = stu.id === userId;
                                const isLeaderM = stu.id === group.teamLeaderId;
                                const myCommitCount = proj ? db.findMany("commits", { projectId: proj.id }).filter(c => c.authorStudentId === stu.id).length : 0;
                                return (
                                    <div key={stu.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isLeaderM ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"}`}>
                                            {stu.name?.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{stu.name}</p>
                                                {isLeaderM && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Star size={8} />Leader</span>}
                                                {isMe && <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded-full">Bạn</span>}
                                            </div>
                                            <p className="text-xs text-gray-400">{stu.studentId}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-700">{myCommitCount}</p>
                                            <p className="text-[10px] text-gray-400">commits</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* SRS Reports */}
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center"><BookOpen size={14} className="text-purple-600" /></div>
                                    <CardTitle className="text-base font-semibold text-gray-800">SRS Reports</CardTitle>
                                </div>
                                {isLeader && (
                                    <button onClick={onUploadSRS} className="text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 px-3 py-1.5 rounded-xl transition-colors">
                                        + Nộp SRS
                                    </button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {!isLeader && (
                                <div className="flex items-start gap-2 mx-5 mt-3 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl">
                                    <AlertTriangle size={12} className="shrink-0 mt-0.5 text-amber-500" />
                                    Chỉ Team Leader mới được upload/xóa SRS.
                                </div>
                            )}
                            {srsReports.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-2">
                                    <BookOpen size={24} className="text-gray-300" />
                                    <p className="text-sm text-gray-400">Chưa có SRS nào</p>
                                    {isLeader && <button onClick={onUploadSRS} className="text-xs font-semibold text-teal-700 hover:underline mt-1">Nộp SRS đầu tiên</button>}
                                </div>
                            ) : srsReports.map(rpt => (
                                <div key={rpt.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-xs font-mono font-semibold text-gray-700">v{rpt.version}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${SRS_STATUS_CLS[rpt.status] || SRS_STATUS_CLS.DRAFT}`}>{rpt.status}</span>
                                        </div>
                                        {rpt.note && <p className="text-xs text-gray-400 truncate">{rpt.note}</p>}
                                        {rpt.feedback && <p className="text-xs text-blue-600 italic mt-0.5">Nhận xét GV: {rpt.feedback}</p>}
                                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5"><Clock size={9} />{new Date(rpt.submittedAt).toLocaleDateString("vi-VN")}</p>
                                    </div>
                                    {isLeader && (
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {rpt.status === "DRAFT" && (
                                                <button onClick={() => onEditSRS(rpt)} className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-2.5 py-1 rounded-lg transition-colors">Sửa</button>
                                            )}
                                            <button onClick={() => onDeleteSRS(rpt.id)} className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-2.5 py-1 rounded-lg transition-colors">Xóa</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Invite Student Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-[24px] shadow-2xl p-6 w-full max-w-md mx-4 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Mời Sinh Viên</h3>
                                <p className="text-xs text-gray-500">Gửi lời mời tham gia nhóm {group.name}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowInviteModal(false)} className="h-8 w-8 rounded-full text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100">
                                ×
                            </Button>
                        </div>

                        <div className="overflow-y-auto flex-1 min-h-0 border border-gray-100 rounded-xl divide-y divide-gray-50 mb-5">
                            {inviteAvailableStudents.length === 0 ? (
                                <div className="px-4 py-8 text-center bg-gray-50/50">
                                    <p className="text-sm text-gray-500">Không có sinh viên nào mới để mời (tất cả đã có nhóm).</p>
                                </div>
                            ) : (
                                inviteAvailableStudents.map((student) => (
                                    <label
                                        key={student.id}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-teal-50/30 cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={inviteSelectedIds.includes(student.id)}
                                            onChange={() => toggleInviteStudent(student.id)}
                                            className="w-4 h-4 rounded text-teal-600 border-gray-300 focus:ring-teal-400"
                                        />
                                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0">
                                            {student.name?.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{student.name}</p>
                                            <p className="text-xs text-gray-400">{student.studentId}</p>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>

                        <div className="shrink-0 pt-2 border-t border-gray-50">
                            <Button
                                onClick={handleInviteSubmit}
                                disabled={inviteSelectedIds.length === 0}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 font-semibold text-sm shadow-sm border-0 transition-all focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 disabled:opacity-50"
                            >
                                Gửi lời mời
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
