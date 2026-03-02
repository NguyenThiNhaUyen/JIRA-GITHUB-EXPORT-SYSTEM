// Student Dashboard — Enterprise SaaS Learning Workspace
// Logic: giữ nguyên MOCK_COURSES, MOCK_STUDENT_GROUPS, handlers từ file gốc
// UI: redesign hoàn toàn theo design system Admin/Lecturer

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import {
    BookOpen, GitBranch, Bell, CheckCircle, AlertTriangle,
    ChevronRight, Clock, ArrowRight, Github, Link2,
    BarChart2, Users, Star, GraduationCap, Calendar,
    Crown, MapPin, UserCheck
} from "lucide-react";

/* ─────────── MOCK DATA (giữ nguyên từ file gốc) ─────────── */
const MOCK_STUDENT = {
    id: "stu001", studentCode: "SE2026001",
    name: "Nguyễn Văn A", email: "anvse2026001@fpt.edu.vn",
};

const MOCK_COURSES = [
    { id: "course-1", code: "SWD392", name: "Software Development", lecturer: "Nguyễn Văn Nam", semester: "SP2026", status: "ACTIVE" },
    { id: "course-2", code: "PRJ301", name: "Java Web Application", lecturer: "Trần Thị Lan", semester: "SP2026", status: "ACTIVE" },
    { id: "course-3", code: "SWP391", name: "Software Engineering Project", lecturer: "Lê Văn Hùng", semester: "SP2026", status: "ACTIVE" },
];

const MOCK_STUDENT_GROUPS = {
    "course-1": {
        groupId: "grp-1", courseId: "course-1", groupName: "Nhóm 3",
        topic: "E-commerce Platform với AI Recommendation", role: "LEADER", status: "ACTIVE",
        githubUrl: "https://github.com/team3/ecommerce-platform",
        jiraUrl: "https://team3.atlassian.net/browse/ECOM",
        linksStatus: "APPROVED", lastCommit: "2026-01-20",
        teamMembers: [
            { studentId: "stu001", studentCode: "SE2026001", name: "Nguyễn Văn A", contribution: 25, isLeader: true },
            { studentId: "stu002", studentCode: "SE2026002", name: "Trần Thị B", contribution: 22 },
            { studentId: "stu003", studentCode: "SE2026003", name: "Lê Văn C", contribution: 20 },
            { studentId: "stu004", studentCode: "SE2026004", name: "Phạm Thu D", contribution: 18 },
            { studentId: "stu005", studentCode: "SE2026005", name: "Hoàng Minh E", contribution: 15 },
        ],
    },
    "course-2": {
        groupId: "grp-5", courseId: "course-2", groupName: "Nhóm 5",
        topic: "Banking Mobile App", role: "MEMBER", status: "ACTIVE",
        githubUrl: "https://github.com/team5/banking-app",
        jiraUrl: "https://team5.atlassian.net/browse/BANK",
        linksStatus: "PENDING", lastCommit: "2026-01-21",
        teamMembers: [
            { studentId: "stu009", name: "Ngô Văn I", contribution: 18, isLeader: true },
            { studentId: "stu001", name: "Nguyễn Văn A", contribution: 17 },
            { studentId: "stu010", name: "Trương Thị J", contribution: 16 },
            { studentId: "stu011", name: "Mai Văn K", contribution: 18 },
            { studentId: "stu012", name: "Dương Thu L", contribution: 16 },
        ],
    },
    "course-3": {
        groupId: "grp-7", courseId: "course-3", groupName: "Nhóm 7",
        topic: "", role: "LEADER", status: "ACTIVE",
        githubUrl: "", jiraUrl: "", linksStatus: "PENDING", lastCommit: "2026-01-15",
        teamMembers: [
            { studentId: "stu001", name: "Nguyễn Văn A", contribution: 23, isLeader: true },
            { studentId: "stu014", name: "Võ Văn N", contribution: 21 },
            { studentId: "stu015", name: "Phan Thị O", contribution: 19 },
        ],
    },
};

const INITIAL_SRS_REPORTS = {
    "grp-1": [
        { id: "srs-1", version: "1.0", submittedAt: "2026-01-12", note: "Initial SRS", status: "Final" },
        { id: "srs-2", version: "1.1", submittedAt: "2026-01-18", note: "Update scope", status: "Review" },
    ],
    "grp-5": [{ id: "srs-3", version: "1.0", submittedAt: "2026-01-10", note: "Baseline", status: "Draft" }],
    "grp-7": [],
};

/* ─────────── Helpers ─────────── */
const LINKS_STATUS = {
    APPROVED: { cls: "bg-green-50 text-green-700 border-green-100", label: "Đã duyệt" },
    PENDING: { cls: "bg-orange-50 text-orange-700 border-orange-100", label: "Chờ duyệt" },
    NONE: { cls: "bg-gray-100 text-gray-500 border-gray-200", label: "Chưa liên kết" },
};

function getAlertsForGroups(groups) {
    const alerts = [];
    Object.values(groups).forEach(g => {
        if (!g.githubUrl) alerts.push({ type: "warning", msg: `[${g.groupName}] Chưa liên kết GitHub repo` });
        if (!g.jiraUrl) alerts.push({ type: "warning", msg: `[${g.groupName}] Chưa liên kết Jira project` });
        if (g.linksStatus === "PENDING" && g.githubUrl)
            alerts.push({ type: "info", msg: `[${g.groupName}] Links đang chờ giảng viên phê duyệt` });
    });
    return alerts;
}

/* ─────────── SRS Upload Modal ─────────── */
function SRSUploadModal({ isOpen, onClose, onSave, editingReport }) {
    const [form, setForm] = useState({ version: "", note: "" });
    React.useEffect(() => {
        setForm(editingReport ? { version: editingReport.version, note: editingReport.note } : { version: "", note: "" });
    }, [editingReport, isOpen]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-[28px] shadow-2xl p-6 w-full max-w-sm mx-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                    {editingReport ? "Chỉnh sửa SRS" : "Upload SRS Report"}
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phiên bản</label>
                        <input
                            value={form.version}
                            onChange={e => setForm({ ...form, version: e.target.value })}
                            placeholder="VD: 1.0"
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
                        onClick={() => { onSave(form); setForm({ version: "", note: "" }); }}
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 border-0 shadow-sm"
                    >
                        {editingReport ? "Lưu" : "Upload"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

/* ═══════════ MAIN COMPONENT ═══════════ */
export default function StudentDashboardNew() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { success } = useToast();
    const student = user || MOCK_STUDENT;

    const [courses] = useState(MOCK_COURSES);
    const [studentGroups, setStudentGroups] = useState(MOCK_STUDENT_GROUPS);
    const [srsReports, setSrsReports] = useState(INITIAL_SRS_REPORTS);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [editingReport, setEditingReport] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [srsUploadCourse, setSrsUploadCourse] = useState(null);

    const alerts = getAlertsForGroups(studentGroups);
    const totalGroups = Object.keys(studentGroups).length;
    const approvedCount = Object.values(studentGroups).filter(g => g.linksStatus === "APPROVED").length;

    /* ── Handlers (giữ nguyên logic gốc) ── */
    const handleUpdateGroup = (courseId, field, value) =>
        setStudentGroups(prev => ({ ...prev, [courseId]: { ...prev[courseId], [field]: value } }));

    const handleSubmitLinks = (courseId) => {
        const g = studentGroups[courseId];
        if (!g.githubUrl || !g.jiraUrl || !g.topic) { success("Vui lòng điền đầy đủ Topic, GitHub URL và Jira URL!"); return; }
        handleUpdateGroup(courseId, "linksStatus", "PENDING");
        success("Đã submit links! Chờ giảng viên duyệt.");
    };

    const handleSaveSRS = (form) => {
        if (!srsUploadCourse) return;
        const grpId = studentGroups[srsUploadCourse]?.groupId;
        if (!grpId) return;
        const reports = srsReports[grpId] || [];
        if (editingReport) {
            setSrsReports({ ...srsReports, [grpId]: reports.map(r => r.id === editingReport.id ? { ...r, ...form } : r) });
            success("Đã cập nhật SRS!");
        } else {
            setSrsReports({ ...srsReports, [grpId]: [...reports, { id: `srs-${Date.now()}`, ...form, submittedAt: new Date().toISOString().slice(0, 10), status: "Draft" }] });
            success("Đã upload SRS!");
        }
        setShowUploadModal(false); setEditingReport(null); setSrsUploadCourse(null);
    };

    const handleDeleteSRS = (grpId, rptId) => {
        setSrsReports({ ...srsReports, [grpId]: (srsReports[grpId] || []).filter(r => r.id !== rptId) });
        success("Đã xóa report!");
    };

    /* ── View: Course detail selected ── */
    const selectedGroup = selectedCourse ? studentGroups[selectedCourse] : null;
    const selectedCourseData = courses.find(c => c.id === selectedCourse);

    return (
        <>
            <div className="space-y-6">
                {/* ── Breadcrumb ── */}
                <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                    <span className="text-teal-700 font-semibold">Sinh viên</span>
                    <ChevronRight size={12} />
                    <span className="text-gray-800 font-semibold">
                        {selectedCourse ? `${selectedCourseData?.code} — Nhóm của tôi` : "Dashboard"}
                    </span>
                </nav>

                {/* ── A. Welcome Header ── */}
                {!selectedCourse && (
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-gray-800">
                                Chào, {student.name}
                            </h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                <span className="bg-teal-50 text-teal-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-teal-100 mr-2">Sinh viên</span>
                                Mã SV: {student.studentCode} · Học kỳ SP2026
                            </p>
                        </div>
                    </div>
                )}

                {/* ── B. Summary Stats ── */}
                {!selectedCourse && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard icon={<BookOpen size={20} />} color="bg-blue-500" label="Lớp đang học" value={courses.length} />
                        <StatCard icon={<GitBranch size={20} />} color="bg-teal-500" label="Nhóm của tôi" value={totalGroups} />
                        <StatCard icon={<BarChart2 size={20} />} color="bg-indigo-500" label="Links đã duyệt" value={approvedCount} />
                        <StatCard icon={<Bell size={20} />} color="bg-orange-400" label="Cảnh báo" value={alerts.length} />
                    </div>
                )}

                {/* ── Course detail view ── */}
                {selectedCourse && selectedGroup ? (
                    <CourseWorkspace
                        course={selectedCourseData}
                        group={selectedGroup}
                        srsReports={srsReports[selectedGroup.groupId] || []}
                        student={student}
                        onBack={() => setSelectedCourse(null)}
                        onUpdateGroup={handleUpdateGroup}
                        onSubmitLinks={handleSubmitLinks}
                        onUploadSRS={() => { setSrsUploadCourse(selectedCourse); setShowUploadModal(true); }}
                        onEditReport={(r) => { setEditingReport(r); setSrsUploadCourse(selectedCourse); setShowUploadModal(true); }}
                        onDeleteReport={(rId) => handleDeleteSRS(selectedGroup.groupId, rId)}
                        success={success}
                    />
                ) : (
                    <>
                        {/* ── C. My Courses ── */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Lớp học của tôi</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {courses.map(course => {
                                    const grp = studentGroups[course.id];
                                    const lsCfg = LINKS_STATUS[grp?.linksStatus] || LINKS_STATUS.NONE;
                                    return (
                                        <Card key={course.id} className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white hover:shadow-md transition-all duration-200 group cursor-pointer" onClick={() => setSelectedCourse(course.id)}>
                                            <div className="h-1 bg-gradient-to-r from-teal-500 to-teal-400" />
                                            <CardContent className="p-5">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <p className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md inline-block mb-1">{course.code}</p>
                                                        <h4 className="font-bold text-gray-800 text-sm leading-snug">{course.name}</h4>
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${lsCfg.cls}`}>{lsCfg.label}</span>
                                                </div>
                                                <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                                                    <p className="flex items-center gap-1.5">
                                                        <span className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                            <GraduationCap size={9} className="text-blue-600" />
                                                        </span>
                                                        {course.lecturer}
                                                    </p>
                                                    <p className="flex items-center gap-1.5">
                                                        <span className="w-4 h-4 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                                            <Calendar size={9} className="text-green-600" />
                                                        </span>
                                                        {course.semester}
                                                    </p>
                                                    {grp?.groupName && <p className="flex items-center gap-1.5">
                                                        <span className="w-4 h-4 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                                                            <Users size={9} className="text-purple-600" />
                                                        </span>
                                                        {grp.groupName} · {grp.role === "LEADER" ? <span className="text-amber-600 font-semibold">Leader</span> : "Member"}
                                                    </p>}
                                                </div>
                                                <button className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 rounded-xl py-2 transition-colors group-hover:bg-teal-100">
                                                    Vào lớp <ArrowRight size={12} />
                                                </button>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── D. Alerts ── */}
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
                                            <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-orange-50/70 border border-orange-100">
                                                <AlertTriangle size={14} className="text-orange-500 shrink-0 mt-0.5" />
                                                <p className="text-sm text-orange-800">{a.msg}</p>
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

/* ─────── CourseWorkspace (replaces GroupDetails) ─────── */
function CourseWorkspace({ course, group, srsReports, student, onBack, onUpdateGroup, onSubmitLinks, onUploadSRS, onEditReport, onDeleteReport, success }) {
    const [githubInput, setGithubInput] = useState(group.githubUrl || "");
    const [jiraInput, setJiraInput] = useState(group.jiraUrl || "");
    const [topicInput, setTopicInput] = useState(group.topic || "");
    const isLeader = group.role === "LEADER";
    const lsCfg = LINKS_STATUS[group.linksStatus] || LINKS_STATUS.NONE;

    const SRS_STATUS = {
        Final: "bg-green-50 text-green-700 border-green-100",
        Review: "bg-blue-50 text-blue-700 border-blue-100",
        Draft: "bg-gray-100 text-gray-500 border-gray-200",
    };

    return (
        <div className="space-y-5">
            {/* Back */}
            <button onClick={onBack} className="flex items-center gap-2 text-xs font-semibold text-teal-700 hover:underline">
                ← Quay lại danh sách lớp
            </button>

            {/* ── A. Project Header ── */}
            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <div className="h-1 bg-gradient-to-r from-teal-500 to-teal-600" />
                <CardContent className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">{course.code}</span>
                                {isLeader ? (
                                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-100">
                                        <Crown size={10} />Team Leader
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-gray-100 text-gray-600 border-gray-200">Team Member</span>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{group.groupName}</h3>
                            {group.topic && (
                                <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                                    <MapPin size={12} className="text-teal-500 shrink-0" />
                                    {group.topic}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${group.githubUrl ? (group.linksStatus === "APPROVED" ? "bg-green-50 text-green-700 border-green-100" : "bg-orange-50 text-orange-600 border-orange-100")
                                    : "bg-gray-100 text-gray-400 border-gray-200"
                                    }`}>
                                    <Github size={11} />
                                    {group.githubUrl ? (group.linksStatus === "APPROVED" ? "Approved" : "Pending") : "Chưa link"}
                                </div>
                                <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${group.jiraUrl ? (group.linksStatus === "APPROVED" ? "bg-green-50 text-green-700 border-green-100" : "bg-orange-50 text-orange-600 border-orange-100")
                                    : "bg-gray-100 text-gray-400 border-gray-200"
                                    }`}>
                                    <Link2 size={11} />
                                    {group.jiraUrl ? (group.linksStatus === "APPROVED" ? "Approved" : "Pending") : "Chưa link"}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* ── B. Links Panel ── */}
                <div className="lg:col-span-2 space-y-5">
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
                                        <input
                                            value={topicInput}
                                            onChange={e => setTopicInput(e.target.value)}
                                            placeholder="Tên đề tài..."
                                            className="mt-1.5 w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Github size={10} /> GitHub Repo URL</label>
                                        <input
                                            value={githubInput}
                                            onChange={e => setGithubInput(e.target.value)}
                                            placeholder="https://github.com/..."
                                            className="mt-1.5 w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Link2 size={10} /> Jira Project URL</label>
                                        <input
                                            value={jiraInput}
                                            onChange={e => setJiraInput(e.target.value)}
                                            placeholder="https://...atlassian.net/..."
                                            className="mt-1.5 w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                                        />
                                    </div>
                                    {group.linksStatus !== "APPROVED" && (
                                        <Button
                                            onClick={() => {
                                                onUpdateGroup(course.id, "topic", topicInput);
                                                onUpdateGroup(course.id, "githubUrl", githubInput);
                                                onUpdateGroup(course.id, "jiraUrl", jiraInput);
                                                onSubmitLinks(course.id);
                                            }}
                                            className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 text-sm border-0 shadow-sm mt-1"
                                        >
                                            Gửi để GV phê duyệt
                                        </Button>
                                    )}
                                    {group.linksStatus === "APPROVED" && (
                                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-3 py-2 border border-green-100">
                                            <CheckCircle size={15} />Đã được giảng viên duyệt
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">GitHub</p>
                                        <p className="text-xs text-gray-700 break-all">{group.githubUrl || "Chưa liên kết"}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Jira</p>
                                        <p className="text-xs text-gray-700 break-all">{group.jiraUrl || "Chưa liên kết"}</p>
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border ${lsCfg.cls}`}>
                                        {lsCfg.label}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* ── C. Contribution Snapshot ── */}
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center"><BarChart2 size={14} className="text-blue-600" /></div>
                                <CardTitle className="text-base font-semibold text-gray-800">Đóng góp của tôi</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-3 gap-3">
                            {[
                                { label: "Commits (tuần)", value: "—", color: "text-blue-700 bg-blue-50" },
                                { label: "Issues", value: "—", color: "text-indigo-700 bg-indigo-50" },
                                { label: "Last activity", value: group.lastCommit ? new Date(group.lastCommit).toLocaleDateString("vi-VN") : "—", color: "text-teal-700 bg-teal-50" },
                            ].map(({ label, value, color }) => (
                                <div key={label} className={`rounded-xl px-3 py-2.5 flex flex-col items-center text-center ${color}`}>
                                    <span className="text-lg font-bold">{value}</span>
                                    <span className="text-[10px] font-medium mt-0.5 leading-tight">{label}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* ── Right column: Members + SRS ── */}
                <div className="lg:col-span-3 space-y-5">
                    {/* ── D. Team Members ── */}
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center"><Users size={14} className="text-teal-600" /></div>
                                <CardTitle className="text-base font-semibold text-gray-800">Thành viên nhóm</CardTitle>
                                <span className="ml-auto text-xs font-semibold text-gray-400">{group.teamMembers.length} người</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {group.teamMembers.map((m, i) => (
                                <div key={m.studentId} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${m.isLeader ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"
                                        }`}>
                                        {m.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{m.name}</p>
                                            {m.isLeader && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Star size={8} />Leader</span>}
                                            {m.studentId === student.id && <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded-full">Bạn</span>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-700">{m.contribution}</p>
                                        <p className="text-[10px] text-gray-400">commits</p>
                                    </div>
                                    {/* Activity bar */}
                                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-teal-400 rounded-full" style={{ width: `${Math.min(100, (m.contribution / 30) * 100)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* ── E. SRS Section ── */}
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center"><BookOpen size={14} className="text-purple-600" /></div>
                                    <CardTitle className="text-base font-semibold text-gray-800">SRS Reports</CardTitle>
                                </div>
                                {isLeader && (
                                    <button
                                        onClick={onUploadSRS}
                                        className="text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 px-3 py-1.5 rounded-xl transition-colors"
                                    >
                                        + Upload SRS
                                    </button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {srsReports.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-2">
                                    <BookOpen size={24} className="text-gray-300" />
                                    <p className="text-sm text-gray-400">Chưa có SRS nào</p>
                                    {isLeader && <button onClick={onUploadSRS} className="text-xs font-semibold text-teal-700 hover:underline mt-1">Upload SRS đầu tiên</button>}
                                </div>
                            ) : srsReports.map(rpt => (
                                <div key={rpt.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-xs font-mono font-semibold text-gray-700">v{rpt.version}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${SRS_STATUS[rpt.status] || SRS_STATUS.Draft}`}>{rpt.status}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 truncate">{rpt.note}</p>
                                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5"><Clock size={9} />{new Date(rpt.submittedAt).toLocaleDateString("vi-VN")}</p>
                                    </div>
                                    {isLeader && (
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button onClick={() => onEditReport(rpt)} className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-2.5 py-1 rounded-lg transition-colors">Sửa</button>
                                            <button onClick={() => onDeleteReport(rpt.id)} className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-2.5 py-1 rounded-lg transition-colors">Xóa</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
