import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import CourseCard from "../../components/student/CourseCard.jsx";
import GroupDetails from "../../components/student/GroupDetails.jsx";
import { BookOpen } from "lucide-react";

// Mock Student Data
const MOCK_STUDENT = {
    id: "stu001",
    studentCode: "SE2026001",
    name: "Nguyễn Văn A",
    email: "anvse2026001@fpt.edu.vn",
};

// Mock Courses
const MOCK_COURSES = [
    {
        id: "course-1",
        code: "SWD392",
        name: "Software Development",
        lecturer: "Nguyễn Văn Nam",
        status: "ACTIVE",
    },
    {
        id: "course-2",
        code: "PRJ301",
        name: "Java Web Application",
        lecturer: "Trần Thị Lan",
        status: "ACTIVE",
    },
    {
        id: "course-3",
        code: "SWP391",
        name: "Software Engineering Project",
        lecturer: "Lê Văn Hùng",
        status: "ACTIVE",
    },
];

// Available topics (provided by lecturer)
const AVAILABLE_TOPICS = [
    "E-commerce Platform với AI Recommendation",
    "Smart Campus IoT System",
    "Banking Mobile App",
    "Healthcare Management System",
    "Online Learning Platform",
    "Restaurant Management & Delivery",
    "Social Media Platform",
    "Data Analytics Dashboard",
];

// Student's group in each course (1 group per course)
const MOCK_STUDENT_GROUPS = {
    "course-1": {
        groupId: "grp-1",
        courseId: "course-1",
        groupName: "Nhóm 3",
        topic: "E-commerce Platform với AI Recommendation",
        role: "LEADER",
        status: "ACTIVE",
        githubUrl: "https://github.com/team3/ecommerce-platform",
        jiraUrl: "https://team3.atlassian.net/browse/ECOM",
        linksStatus: "APPROVED",
        lastCommit: "2026-01-20",
        teamMembers: [
            { studentId: "stu001", studentCode: "SE2026001", name: "Nguyễn Văn A", email: "anvse2026001@fpt.edu.vn", contribution: 25, isLeader: true },
            { studentId: "stu002", studentCode: "SE2026002", name: "Trần Thị B", email: "bttse2026002@fpt.edu.vn", contribution: 22 },
            { studentId: "stu003", studentCode: "SE2026003", name: "Lê Văn C", email: "cvlse2026003@fpt.edu.vn", contribution: 20 },
            { studentId: "stu004", studentCode: "SE2026004", name: "Phạm Thu D", email: "dtpse2026004@fpt.edu.vn", contribution: 18 },
            { studentId: "stu005", studentCode: "SE2026005", name: "Hoàng Minh E", email: "emhse2026005@fpt.edu.vn", contribution: 15 },
        ],
    },
    "course-2": {
        groupId: "grp-5",
        courseId: "course-2",
        groupName: "Nhóm 5",
        topic: "Banking Mobile App",
        role: "MEMBER",
        status: "ACTIVE",
        githubUrl: "https://github.com/team5/banking-app",
        jiraUrl: "https://team5.atlassian.net/browse/BANK",
        linksStatus: "PENDING",
        lastCommit: "2026-01-21",
        teamMembers: [
            { studentId: "stu009", studentCode: "SE2026009", name: "Ngô Văn I", email: "ivnse2026009@fpt.edu.vn", contribution: 18, isLeader: true },
            { studentId: "stu001", studentCode: "SE2026001", name: "Nguyễn Văn A", email: "anvse2026001@fpt.edu.vn", contribution: 17 },
            { studentId: "stu010", studentCode: "SE2026010", name: "Trương Thị J", email: "jttse2026010@fpt.edu.vn", contribution: 16 },
            { studentId: "stu011", studentCode: "SE2026011", name: "Mai Văn K", email: "kvmse2026011@fpt.edu.vn", contribution: 18 },
            { studentId: "stu012", studentCode: "SE2026012", name: "Dương Thu L", email: "ltdse2026012@fpt.edu.vn", contribution: 16 },
        ],
    },
    "course-3": {
        groupId: "grp-7",
        courseId: "course-3",
        groupName: "Nhóm 7",
        topic: "",
        role: "LEADER",
        status: "ACTIVE",
        githubUrl: "",
        jiraUrl: "",
        linksStatus: "PENDING",
        lastCommit: "2026-01-22",
        teamMembers: [
            { studentId: "stu001", studentCode: "SE2026001", name: "Nguyễn Văn A", email: "anvse2026001@fpt.edu.vn", contribution: 23, isLeader: true },
            { studentId: "stu014", studentCode: "SE2026014", name: "Võ Văn N", email: "nvvse2026014@fpt.edu.vn", contribution: 21 },
            { studentId: "stu015", studentCode: "SE2026015", name: "Phan Thị O", email: "otpse2026015@fpt.edu.vn", contribution: 19 },
            { studentId: "stu016", studentCode: "SE2026016", name: "Cao Văn P", email: "pvcse2026016@fpt.edu.vn", contribution: 20 },
            { studentId: "stu017", studentCode: "SE2026017", name: "Tô Thu Q", email: "qttse2026017@fpt.edu.vn", contribution: 17 },
        ],
    },
};

const INITIAL_SRS_REPORTS = {
    "grp-1": [
        { id: "srs-1", version: "1.0", submittedAt: "2026-01-12", note: "Initial SRS" },
        { id: "srs-2", version: "1.1", submittedAt: "2026-01-18", note: "Update scope" },
    ],
    "grp-5": [{ id: "srs-3", version: "1.0", submittedAt: "2026-01-10", note: "Baseline" }],
    "grp-7": [],
};

// SRS Upload Modal Component
function SRSUploadModal({ isOpen, onClose, onSave, editingReport }) {
    const [form, setForm] = useState({ version: "", note: "" });

    React.useEffect(() => {
        if (editingReport) {
            setForm({ version: editingReport.version, note: editingReport.note });
        } else {
            setForm({ version: "", note: "" });
        }
    }, [editingReport, isOpen]);

    const handleSave = () => {
        onSave(form);
        setForm({ version: "", note: "" });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">{editingReport ? "Edit SRS Report" : "Upload SRS Report"}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Version</label>
                        <input
                            type="text"
                            value={form.version}
                            onChange={(e) => setForm({ ...form, version: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="1.0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Note</label>
                        <textarea
                            value={form.note}
                            onChange={(e) => setForm({ ...form, note: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2"
                            rows={3}
                            placeholder="Initial version"
                        />
                    </div>
                </div>
                <div className="flex gap-2 mt-6">
                    <Button onClick={handleSave} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
                        Save
                    </Button>
                    <Button onClick={onClose} variant="outline" className="flex-1">
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function StudentDashboardNew() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { success } = useToast();

    const student = user || MOCK_STUDENT;

    const [courses] = useState(MOCK_COURSES);
    const [studentGroups, setStudentGroups] = useState(MOCK_STUDENT_GROUPS);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [srsReports, setSrsReports] = useState(INITIAL_SRS_REPORTS);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [editingReport, setEditingReport] = useState(null);

    const selectedGroup = selectedCourse ? studentGroups[selectedCourse] : null;
    const selectedCourseData = courses.find((c) => c.id === selectedCourse);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleSelectCourse = (courseId) => {
        setSelectedCourse(courseId);
    };

    const handleBackToCourses = () => {
        setSelectedCourse(null);
    };

    const handleUpdateGroup = (courseId, field, value) => {
        setStudentGroups((prev) => ({
            ...prev,
            [courseId]: {
                ...prev[courseId],
                [field]: value,
            },
        }));
    };

    const handleSubmitLinks = (courseId) => {
        const group = studentGroups[courseId];
        if (!group.githubUrl || !group.jiraUrl || !group.topic) {
            success("Vui lòng điền đầy đủ Topic, GitHub URL và Jira URL!");
            return;
        }
        handleUpdateGroup(courseId, "linksStatus", "PENDING");
        success("Đã submit links! Chờ giảng viên duyệt.");
    };

    const handleSaveSRS = (form) => {
        if (!selectedGroup) return;
        const reports = srsReports[selectedGroup.groupId] || [];

        if (editingReport) {
            const updated = reports.map((report) =>
                report.id === editingReport.id
                    ? { ...report, version: form.version, note: form.note }
                    : report
            );
            setSrsReports({ ...srsReports, [selectedGroup.groupId]: updated });
            success("Đã cập nhật SRS report!");
        } else {
            const newReport = {
                id: `srs-${Date.now()}`,
                version: form.version,
                note: form.note,
                submittedAt: new Date().toISOString().slice(0, 10),
            };
            setSrsReports({ ...srsReports, [selectedGroup.groupId]: [...reports, newReport] });
            success("Đã upload SRS report!");
        }

        setShowUploadModal(false);
        setEditingReport(null);
    };

    const handleEditReport = (report) => {
        setEditingReport(report);
        setShowUploadModal(true);
    };

    const handleDeleteReport = (groupId, reportId) => {
        const updated = (srsReports[groupId] || []).filter((report) => report.id !== reportId);
        setSrsReports({ ...srsReports, [groupId]: updated });
        success("Đã xóa report!");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-500 border-b border-orange-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>
                            <p className="text-orange-100">Chào mừng, {student.name}!</p>
                            <p className="text-sm text-orange-200">Mã SV: {student.studentCode}</p>
                        </div>
                        <Button
                            onClick={handleLogout}
                            className="bg-white bg-opacity-50 text-green-600 hover:bg-green-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
                        >
                            Đăng xuất
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!selectedCourse ? (
                    /* Courses List View */
                    <section>
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <BookOpen className="w-6 h-6 text-orange-600" />
                                Môn học của tôi
                            </h2>
                            <p className="text-gray-600">Chọn môn học để xem chi tiết nhóm và dự án</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    group={studentGroups[course.id]}
                                    onSelect={handleSelectCourse}
                                />
                            ))}
                        </div>
                    </section>
                ) : (
                    /* Group Details View */
                    <GroupDetails
                        course={selectedCourseData}
                        group={selectedGroup}
                        srsReports={srsReports}
                        availableTopics={AVAILABLE_TOPICS}
                        onBack={handleBackToCourses}
                        onUpdateGroup={handleUpdateGroup}
                        onSubmitLinks={handleSubmitLinks}
                        onUploadSRS={() => setShowUploadModal(true)}
                        onEditReport={handleEditReport}
                        onDeleteReport={handleDeleteReport}
                    />
                )}
            </div>

            {/* SRS Upload Modal */}
            <SRSUploadModal
                isOpen={showUploadModal}
                onClose={() => {
                    setShowUploadModal(false);
                    setEditingReport(null);
                }}
                onSave={handleSaveSRS}
                editingReport={editingReport}
            />
        </div>
    );
}
