// Reports & Export — Lecturer (Enhanced Mock Version)
import { useMemo, useState } from "react";
import {
    ChevronRight,
    Download,
    FileSpreadsheet,
    FileText,
    Filter,
    CheckSquare,
    Search,
    CalendarDays,
    Users,
    FolderKanban,
    GitBranch,
    AlertTriangle,
    Eye,
    RefreshCcw,
    ShieldAlert,
    FileBarChart2,
    Clock3,
    CheckCircle2,
    ExternalLink,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";

/* -------------------------------- MOCK DATA -------------------------------- */

const MOCK_COURSES = [
    {
        id: "c1",
        code: "SWD392",
        className: "SE1841",
        semester: "Spring 2026",
        lecturer: "Lê Thị Mai",
        totalTeams: 6,
        totalStudents: 31,
    },
    {
        id: "c2",
        code: "SWD392",
        className: "SE1842",
        semester: "Spring 2026",
        lecturer: "Lê Thị Mai",
        totalTeams: 5,
        totalStudents: 27,
    },
    {
        id: "c3",
        code: "PRU211",
        className: "SE1801",
        semester: "Spring 2026",
        lecturer: "Nguyễn Hữu Phúc",
        totalTeams: 4,
        totalStudents: 22,
    },
];

const MOCK_TEAMS = [
    {
        id: "t1",
        courseId: "c1",
        name: "Team Alpha",
        project: "Dormitory Issue Tracker",
        members: 5,
        commits: 124,
        issuesDone: 42,
        issuesTotal: 57,
        prsMerged: 18,
        overdueTasks: 2,
        riskLevel: "Medium",
        jiraCoverage: 74,
        githubCoverage: 76,
        contributionBalance: 81,
        sprintCompletion: 73,
        warningCount: 2,
    },
    {
        id: "t2",
        courseId: "c1",
        name: "Team Beta",
        project: "FPTU Club Event Hub",
        members: 4,
        commits: 142,
        issuesDone: 50,
        issuesTotal: 63,
        prsMerged: 21,
        overdueTasks: 1,
        riskLevel: "Low",
        jiraCoverage: 82,
        githubCoverage: 84,
        contributionBalance: 87,
        sprintCompletion: 79,
        warningCount: 1,
    },
    {
        id: "t3",
        courseId: "c1",
        name: "Team Gamma",
        project: "Lab Asset Booking",
        members: 5,
        commits: 68,
        issuesDone: 23,
        issuesTotal: 48,
        prsMerged: 9,
        overdueTasks: 6,
        riskLevel: "High",
        jiraCoverage: 51,
        githubCoverage: 39,
        contributionBalance: 58,
        sprintCompletion: 44,
        warningCount: 5,
    },
    {
        id: "t4",
        courseId: "c2",
        name: "Team Delta",
        project: "Medical Appointment Queue",
        members: 5,
        commits: 97,
        issuesDone: 31,
        issuesTotal: 52,
        prsMerged: 11,
        overdueTasks: 4,
        riskLevel: "Medium",
        jiraCoverage: 61,
        githubCoverage: 56,
        contributionBalance: 72,
        sprintCompletion: 59,
        warningCount: 3,
    },
    {
        id: "t5",
        courseId: "c2",
        name: "Team Epsilon",
        project: "Student Complaint Portal",
        members: 6,
        commits: 44,
        issuesDone: 15,
        issuesTotal: 47,
        prsMerged: 6,
        overdueTasks: 8,
        riskLevel: "High",
        jiraCoverage: 38,
        githubCoverage: 28,
        contributionBalance: 42,
        sprintCompletion: 31,
        warningCount: 6,
    },
    {
        id: "t6",
        courseId: "c1",
        name: "Team Zeta",
        project: "Canteen Smart Ordering",
        members: 5,
        commits: 115,
        issuesDone: 37,
        issuesTotal: 49,
        prsMerged: 15,
        overdueTasks: 2,
        riskLevel: "Low",
        jiraCoverage: 78,
        githubCoverage: 71,
        contributionBalance: 85,
        sprintCompletion: 76,
        warningCount: 1,
    },
];

const MOCK_STUDENTS = [
    {
        id: "s1",
        teamId: "t1",
        name: "Nguyễn Văn An",
        email: "an.nguyen@fpt.edu.vn",
        commits: 34,
        issuesDone: 12,
        prsMerged: 5,
        sprintCoverage: 82,
        contributionScore: 86,
        status: "Good",
    },
    {
        id: "s2",
        teamId: "t1",
        name: "Trần Hải Bình",
        email: "binh.tran@fpt.edu.vn",
        commits: 26,
        issuesDone: 8,
        prsMerged: 4,
        sprintCoverage: 71,
        contributionScore: 74,
        status: "Good",
    },
    {
        id: "s3",
        teamId: "t3",
        name: "Lê Hoàng Long",
        email: "long.le@fpt.edu.vn",
        commits: 8,
        issuesDone: 3,
        prsMerged: 1,
        sprintCoverage: 39,
        contributionScore: 42,
        status: "Warning",
    },
    {
        id: "s4",
        teamId: "t5",
        name: "Đinh Gia Hân",
        email: "han.dinh@fpt.edu.vn",
        commits: 5,
        issuesDone: 2,
        prsMerged: 0,
        sprintCoverage: 26,
        contributionScore: 31,
        status: "At Risk",
    },
    {
        id: "s5",
        teamId: "t2",
        name: "Trần Mỹ Duyên",
        email: "duyen.tran@fpt.edu.vn",
        commits: 41,
        issuesDone: 15,
        prsMerged: 6,
        sprintCoverage: 88,
        contributionScore: 91,
        status: "Excellent",
    },
    {
        id: "s6",
        teamId: "t6",
        name: "Võ Thành Công",
        email: "cong.vo@fpt.edu.vn",
        commits: 29,
        issuesDone: 10,
        prsMerged: 4,
        sprintCoverage: 80,
        contributionScore: 83,
        status: "Good",
    },
];

const EXPORT_TYPES = [
    {
        id: "by-course",
        icon: FileSpreadsheet,
        color: "bg-teal-500",
        title: "Báo cáo theo Lớp",
        desc: "Tổng hợp toàn bộ tiến độ nhóm trong lớp: số nhóm, commit, issue, PR, sprint completion, cảnh báo và mức độ rủi ro.",
        formats: ["PDF", "Excel"],
        fields: [
            "Course / Class",
            "Total teams",
            "Total commits",
            "Issue completion",
            "Warnings",
            "Risk overview",
        ],
    },
    {
        id: "by-group",
        icon: FileText,
        color: "bg-blue-500",
        title: "Báo cáo theo Nhóm",
        desc: "Chi tiết từng nhóm dự án: backlog Jira, tiến độ sprint, commit history, GitHub coverage, contribution balance.",
        formats: ["PDF", "Excel"],
        fields: [
            "Team & project",
            "Commits",
            "Issues done/total",
            "PR merged",
            "Overdue tasks",
            "Contribution balance",
        ],
    },
    {
        id: "by-student",
        icon: CheckSquare,
        color: "bg-indigo-500",
        title: "Báo cáo theo Sinh viên",
        desc: "Đóng góp cá nhân để hỗ trợ đánh giá quá trình: commits, issues, PR merged, sprint coverage, contribution score.",
        formats: ["PDF", "CSV"],
        fields: [
            "Student name",
            "Team",
            "Commits",
            "Issues done",
            "Sprint coverage",
            "Contribution score",
        ],
    },
    {
        id: "by-warning",
        icon: AlertTriangle,
        color: "bg-amber-500",
        title: "Báo cáo Cảnh báo",
        desc: "Tập trung vào các nhóm hoặc sinh viên có dấu hiệu chậm tiến độ, ít đóng góp, overdue sprint hoặc Jira/GitHub lệch nhau.",
        formats: ["PDF", "Excel"],
        fields: [
            "Risk level",
            "Warning type",
            "Overdue tasks",
            "Inactive members",
            "Low contribution",
            "Jira/GitHub mismatch",
        ],
    },
    {
        id: "by-sync",
        icon: GitBranch,
        color: "bg-violet-500",
        title: "Đối chiếu Jira ↔ GitHub",
        desc: "Báo cáo signature của hệ thống: đối chiếu task management và coding activity giữa Jira và GitHub cho từng nhóm.",
        formats: ["PDF", "Excel"],
        fields: [
            "Jira coverage",
            "GitHub coverage",
            "Issue-code mismatch",
            "Execution ratio",
            "Task mapping quality",
            "Sync score",
        ],
    },
];

const MOCK_EXPORTS = [
    {
        id: 1,
        type: "Báo cáo theo Lớp",
        target: "SWD392 - SE1841",
        format: "PDF",
        date: "2026-03-01T08:22:00",
        size: "1.8 MB",
        createdBy: "Lê Thị Mai",
        filterSummary: "Spring 2026 • All Teams • Full Course",
        status: "Ready",
    },
    {
        id: 2,
        type: "Báo cáo theo Nhóm",
        target: "Team Alpha",
        format: "Excel",
        date: "2026-03-03T14:35:00",
        size: "920 KB",
        createdBy: "Lê Thị Mai",
        filterSummary: "SWD392 • Team Alpha • Sprint 3",
        status: "Ready",
    },
    {
        id: 3,
        type: "Báo cáo theo Sinh viên",
        target: "SWD392 - SE1841",
        format: "CSV",
        date: "2026-03-05T10:10:00",
        size: "240 KB",
        createdBy: "Lê Thị Mai",
        filterSummary: "Students • Warning score < 50",
        status: "Ready",
    },
    {
        id: 4,
        type: "Báo cáo Cảnh báo",
        target: "SWD392 - SE1842",
        format: "PDF",
        date: "2026-03-08T16:40:00",
        size: "1.1 MB",
        createdBy: "Lê Thị Mai",
        filterSummary: "High Risk • Overdue > 3",
        status: "Ready",
    },
    {
        id: 5,
        type: "Đối chiếu Jira ↔ GitHub",
        target: "All SWD392 Teams",
        format: "Excel",
        date: "2026-03-10T09:15:00",
        size: "1.4 MB",
        createdBy: "Lê Thị Mai",
        filterSummary: "Spring 2026 • Sync Analysis",
        status: "Ready",
    },
];

/* -------------------------------- HELPERS -------------------------------- */

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("vi-VN");
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString("vi-VN");
}

function getFormatBadgeCls(format) {
    if (format === "PDF") return "bg-red-50 text-red-700 border-red-100";
    if (format === "Excel") return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (format === "CSV") return "bg-indigo-50 text-indigo-700 border-indigo-100";
    return "bg-gray-100 text-gray-700 border-gray-200";
}

function getRiskCls(level) {
    if (level === "High") return "bg-red-50 text-red-700 border-red-100";
    if (level === "Medium") return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
}

function getStudentStatusCls(status) {
    if (status === "Excellent") return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (status === "Good") return "bg-blue-50 text-blue-700 border-blue-100";
    if (status === "Warning") return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-red-50 text-red-700 border-red-100";
}

/* -------------------------------- COMPONENT -------------------------------- */

export default function Reports() {
    const { success } = useToast();

    const [selectedType, setSelectedType] = useState("by-course");
    const [search, setSearch] = useState("");
    const [courseFilter, setCourseFilter] = useState("all");
    const [teamFilter, setTeamFilter] = useState("all");
    const [semesterFilter, setSemesterFilter] = useState("all");
    const [riskFilter, setRiskFilter] = useState("all");

    const selectedConfig = EXPORT_TYPES.find((x) => x.id === selectedType);

    const courseOptions = useMemo(() => MOCK_COURSES, []);
    const teamOptions = useMemo(() => {
        if (courseFilter === "all") return MOCK_TEAMS;
        return MOCK_TEAMS.filter((t) => t.courseId === courseFilter);
    }, [courseFilter]);

    const previewData = useMemo(() => {
        const selectedCourse =
            courseFilter === "all"
                ? null
                : MOCK_COURSES.find((c) => c.id === courseFilter);

        let teams = [...MOCK_TEAMS];
        let students = [...MOCK_STUDENTS];

        if (courseFilter !== "all") {
            teams = teams.filter((t) => t.courseId === courseFilter);
            students = students.filter((s) =>
                teams.some((t) => t.id === s.teamId)
            );
        }

        if (teamFilter !== "all") {
            teams = teams.filter((t) => t.id === teamFilter);
            students = students.filter((s) => s.teamId === teamFilter);
        }

        if (riskFilter !== "all") {
            teams = teams.filter((t) => t.riskLevel === riskFilter);
            const validTeamIds = teams.map((t) => t.id);
            students = students.filter((s) => validTeamIds.includes(s.teamId));
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            teams = teams.filter(
                (t) =>
                    t.name.toLowerCase().includes(q) ||
                    t.project.toLowerCase().includes(q)
            );
            students = students.filter((s) =>
                s.name.toLowerCase().includes(q)
            );
        }

        const totalCommits = teams.reduce((sum, t) => sum + t.commits, 0);
        const totalIssuesDone = teams.reduce((sum, t) => sum + t.issuesDone, 0);
        const totalIssues = teams.reduce((sum, t) => sum + t.issuesTotal, 0);
        const totalWarnings = teams.reduce((sum, t) => sum + t.warningCount, 0);
        const avgSprint =
            teams.length > 0
                ? Math.round(
                    teams.reduce((sum, t) => sum + t.sprintCompletion, 0) / teams.length
                )
                : 0;
        const avgSync =
            teams.length > 0
                ? Math.round(
                    teams.reduce(
                        (sum, t) => sum + (t.jiraCoverage + t.githubCoverage) / 2,
                        0
                    ) / teams.length
                )
                : 0;

        const topRiskTeams = [...teams]
            .sort((a, b) => b.warningCount - a.warningCount)
            .slice(0, 3);

        const weakestStudents = [...students]
            .sort((a, b) => a.contributionScore - b.contributionScore)
            .slice(0, 3);

        return {
            selectedCourse,
            teams,
            students,
            totalCommits,
            totalIssuesDone,
            totalIssues,
            totalWarnings,
            avgSprint,
            avgSync,
            topRiskTeams,
            weakestStudents,
        };
    }, [courseFilter, teamFilter, riskFilter, search]);

    const dashboardStats = useMemo(() => {
        const totalExports = MOCK_EXPORTS.length;
        const thisWeekExports = 3;
        const riskyTeams = MOCK_TEAMS.filter((t) => t.riskLevel === "High").length;
        const warningStudents = MOCK_STUDENTS.filter(
            (s) => s.status === "Warning" || s.status === "At Risk"
        ).length;
        const overdueTasks = MOCK_TEAMS.reduce((sum, t) => sum + t.overdueTasks, 0);
        const avgCompletion = Math.round(
            MOCK_TEAMS.reduce((sum, t) => sum + t.sprintCompletion, 0) / MOCK_TEAMS.length
        );

        return {
            totalExports,
            thisWeekExports,
            riskyTeams,
            warningStudents,
            overdueTasks,
            avgCompletion,
        };
    }, []);

    const handleExport = (format) => {
        const target =
            teamFilter !== "all"
                ? MOCK_TEAMS.find((t) => t.id === teamFilter)?.name
                : courseFilter !== "all"
                    ? `${MOCK_COURSES.find((c) => c.id === courseFilter)?.code} - ${MOCK_COURSES.find((c) => c.id === courseFilter)?.className}`
                    : "Toàn bộ dữ liệu phù hợp";

        success(
            `Đang tạo file ${format} cho "${selectedConfig.title}" • ${target} (demo)`
        );
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <span className="text-teal-700 font-semibold">Giảng viên</span>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-semibold">Báo cáo & Export</span>
            </nav>

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-800">
                        Báo cáo & Xuất dữ liệu
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Trung tâm tạo báo cáo học thuật cho lớp, nhóm, sinh viên và đối chiếu Jira ↔ GitHub
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="rounded-xl border-gray-200"
                        onClick={() => success("Đang tạo báo cáo tùy chỉnh... (demo)")}
                    >
                        <Filter size={14} className="mr-2" />
                        Báo cáo tùy chỉnh
                    </Button>
                    <Button
                        className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white"
                        onClick={() => success("Đang export nhanh báo cáo tổng quan... (demo)")}
                    >
                        <Download size={14} className="mr-2" />
                        Export nhanh
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
                {[
                    {
                        label: "Tổng báo cáo",
                        value: dashboardStats.totalExports,
                        icon: FileBarChart2,
                        cls: "bg-white border-gray-200 text-gray-700",
                    },
                    {
                        label: "Xuất tuần này",
                        value: dashboardStats.thisWeekExports,
                        icon: Download,
                        cls: "bg-teal-50 border-teal-100 text-teal-700",
                    },
                    {
                        label: "Nhóm rủi ro cao",
                        value: dashboardStats.riskyTeams,
                        icon: AlertTriangle,
                        cls: "bg-red-50 border-red-100 text-red-700",
                    },
                    {
                        label: "SV cần chú ý",
                        value: dashboardStats.warningStudents,
                        icon: ShieldAlert,
                        cls: "bg-amber-50 border-amber-100 text-amber-700",
                    },
                    {
                        label: "Overdue tasks",
                        value: dashboardStats.overdueTasks,
                        icon: Clock3,
                        cls: "bg-blue-50 border-blue-100 text-blue-700",
                    },
                    {
                        label: "TB sprint done",
                        value: `${dashboardStats.avgCompletion}%`,
                        icon: CheckCircle2,
                        cls: "bg-emerald-50 border-emerald-100 text-emerald-700",
                    },
                ].map((item) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.label}
                            className={`rounded-2xl border px-4 py-4 shadow-sm ${item.cls}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold">{item.label}</span>
                                <Icon size={15} />
                            </div>
                            <div className="mt-3 text-2xl font-bold">{item.value}</div>
                        </div>
                    );
                })}
            </div>

            {/* Filters */}
            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
                        <div className="xl:col-span-3 relative">
                            <Search
                                size={15}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm lớp, nhóm, project, sinh viên..."
                                className="w-full h-11 rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                            />
                        </div>

                        <div className="xl:col-span-2">
                            <select
                                value={semesterFilter}
                                onChange={(e) => setSemesterFilter(e.target.value)}
                                className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                            >
                                <option value="all">Tất cả học kỳ</option>
                                <option value="Spring 2026">Spring 2026</option>
                            </select>
                        </div>

                        <div className="xl:col-span-2">
                            <select
                                value={courseFilter}
                                onChange={(e) => {
                                    setCourseFilter(e.target.value);
                                    setTeamFilter("all");
                                }}
                                className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                            >
                                <option value="all">Tất cả lớp</option>
                                {courseOptions.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.code} - {course.className}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="xl:col-span-2">
                            <select
                                value={teamFilter}
                                onChange={(e) => setTeamFilter(e.target.value)}
                                className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                            >
                                <option value="all">Tất cả nhóm</option>
                                {teamOptions.map((team) => (
                                    <option key={team.id} value={team.id}>
                                        {team.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="xl:col-span-2">
                            <select
                                value={riskFilter}
                                onChange={(e) => setRiskFilter(e.target.value)}
                                className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                            >
                                <option value="all">Mọi mức rủi ro</option>
                                <option value="High">High risk</option>
                                <option value="Medium">Medium risk</option>
                                <option value="Low">Low risk</option>
                            </select>
                        </div>

                        <div className="xl:col-span-1">
                            <div className="h-11 rounded-xl border border-dashed border-teal-200 bg-teal-50/60 flex items-center justify-center text-xs font-semibold text-teal-700">
                                <Filter size={13} className="mr-1" />
                                {previewData.teams.length}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Export cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
                {EXPORT_TYPES.map((et) => {
                    const Icon = et.icon;
                    const active = selectedType === et.id;

                    return (
                        <Card
                            key={et.id}
                            onClick={() => setSelectedType(et.id)}
                            className={`border shadow-sm rounded-[24px] overflow-hidden bg-white transition-all duration-200 cursor-pointer hover:shadow-md ${active
                                    ? "border-teal-300 ring-4 ring-teal-500/10"
                                    : "border-gray-100"
                                }`}
                        >
                            <div className="h-1.5 bg-gradient-to-r from-teal-500 to-teal-600" />
                            <CardContent className="p-5 flex flex-col gap-4 h-full">
                                <div className={`w-12 h-12 rounded-2xl ${et.color} text-white flex items-center justify-center`}>
                                    <Icon size={22} />
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-800 mb-1">{et.title}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed">{et.desc}</p>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {et.fields.slice(0, 3).map((field) => (
                                        <span
                                            key={field}
                                            className="text-[10px] font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                                        >
                                            {field}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center gap-2 mt-auto">
                                    {et.formats.map((f) => (
                                        <button
                                            key={f}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedType(et.id);
                                                handleExport(f);
                                            }}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 rounded-xl px-3 py-1.5 transition-colors"
                                        >
                                            <Download size={11} />
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Preview + insight */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Preview panel */}
                <div className="xl:col-span-7">
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white h-full">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                                        <Eye size={15} className="text-teal-600" />
                                    </div>
                                    <CardTitle className="text-base font-semibold text-gray-800">
                                        Preview báo cáo
                                    </CardTitle>
                                </div>

                                <div className="flex items-center gap-2">
                                    {selectedConfig.formats.map((fmt) => (
                                        <Button
                                            key={fmt}
                                            variant="outline"
                                            className="rounded-xl border-gray-200"
                                            onClick={() => handleExport(fmt)}
                                        >
                                            <Download size={13} className="mr-2" />
                                            {fmt}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-5 space-y-5">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {selectedConfig.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                                        {selectedConfig.desc}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 min-w-[220px]">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                        Phạm vi dữ liệu
                                    </p>
                                    <p className="text-sm font-semibold text-gray-800 mt-1">
                                        {teamFilter !== "all"
                                            ? MOCK_TEAMS.find((t) => t.id === teamFilter)?.name
                                            : courseFilter !== "all"
                                                ? `${previewData.selectedCourse?.code} - ${previewData.selectedCourse?.className}`
                                                : "Toàn bộ dữ liệu phù hợp"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {semesterFilter === "all" ? "All semester" : semesterFilter}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    {
                                        label: "Nhóm",
                                        value: previewData.teams.length,
                                        icon: Users,
                                        cls: "text-teal-700 bg-teal-50 border-teal-100",
                                    },
                                    {
                                        label: "Commits",
                                        value: previewData.totalCommits,
                                        icon: GitBranch,
                                        cls: "text-blue-700 bg-blue-50 border-blue-100",
                                    },
                                    {
                                        label: "Issues done",
                                        value: `${previewData.totalIssuesDone}/${previewData.totalIssues}`,
                                        icon: FolderKanban,
                                        cls: "text-indigo-700 bg-indigo-50 border-indigo-100",
                                    },
                                    {
                                        label: "Cảnh báo",
                                        value: previewData.totalWarnings,
                                        icon: AlertTriangle,
                                        cls: "text-red-700 bg-red-50 border-red-100",
                                    },
                                ].map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            key={item.label}
                                            className={`rounded-2xl border px-4 py-4 ${item.cls}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold">{item.label}</span>
                                                <Icon size={15} />
                                            </div>
                                            <div className="mt-3 text-xl font-bold">{item.value}</div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <div className="rounded-2xl border border-gray-100 p-4">
                                    <h4 className="text-sm font-bold text-gray-800 mb-3">
                                        Trường dữ liệu chính
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedConfig.fields.map((field) => (
                                            <span
                                                key={field}
                                                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600"
                                            >
                                                {field}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-gray-100 p-4">
                                    <h4 className="text-sm font-bold text-gray-800 mb-3">
                                        Chỉ số tổng quan
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Average sprint completion</span>
                                            <span className="font-bold text-gray-800">
                                                {previewData.avgSprint}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Average Jira ↔ GitHub sync</span>
                                            <span className="font-bold text-gray-800">
                                                {previewData.avgSync}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Students included</span>
                                            <span className="font-bold text-gray-800">
                                                {previewData.students.length}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Time generated</span>
                                            <span className="font-bold text-gray-800">
                                                Real-time mock
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertTriangle size={16} className="text-red-600" />
                                        <h4 className="text-sm font-bold text-gray-800">
                                            Nhóm rủi ro nổi bật
                                        </h4>
                                    </div>

                                    <div className="space-y-3">
                                        {previewData.topRiskTeams.length === 0 ? (
                                            <p className="text-sm text-gray-400">Không có dữ liệu</p>
                                        ) : (
                                            previewData.topRiskTeams.map((team) => (
                                                <div
                                                    key={team.id}
                                                    className="rounded-xl bg-white border border-red-100 px-3 py-3"
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-800">
                                                                {team.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {team.project}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getRiskCls(
                                                                team.riskLevel
                                                            )}`}
                                                        >
                                                            {team.riskLevel}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-2 mt-3">
                                                        <div className="text-center rounded-lg bg-gray-50 py-2">
                                                            <p className="text-[10px] text-gray-400 font-semibold">Warnings</p>
                                                            <p className="text-sm font-bold text-gray-800">
                                                                {team.warningCount}
                                                            </p>
                                                        </div>
                                                        <div className="text-center rounded-lg bg-gray-50 py-2">
                                                            <p className="text-[10px] text-gray-400 font-semibold">Overdue</p>
                                                            <p className="text-sm font-bold text-gray-800">
                                                                {team.overdueTasks}
                                                            </p>
                                                        </div>
                                                        <div className="text-center rounded-lg bg-gray-50 py-2">
                                                            <p className="text-[10px] text-gray-400 font-semibold">Sprint</p>
                                                            <p className="text-sm font-bold text-gray-800">
                                                                {team.sprintCompletion}%
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <ShieldAlert size={16} className="text-amber-600" />
                                        <h4 className="text-sm font-bold text-gray-800">
                                            Sinh viên cần chú ý
                                        </h4>
                                    </div>

                                    <div className="space-y-3">
                                        {previewData.weakestStudents.length === 0 ? (
                                            <p className="text-sm text-gray-400">Không có dữ liệu</p>
                                        ) : (
                                            previewData.weakestStudents.map((student) => {
                                                const team = MOCK_TEAMS.find((t) => t.id === student.teamId);
                                                return (
                                                    <div
                                                        key={student.id}
                                                        className="rounded-xl bg-white border border-amber-100 px-3 py-3"
                                                    >
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-800">
                                                                    {student.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                    {team?.name}
                                                                </p>
                                                            </div>
                                                            <span
                                                                className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getStudentStatusCls(
                                                                    student.status
                                                                )}`}
                                                            >
                                                                {student.status}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-2 mt-3">
                                                            <div className="text-center rounded-lg bg-gray-50 py-2">
                                                                <p className="text-[10px] text-gray-400 font-semibold">Commits</p>
                                                                <p className="text-sm font-bold text-gray-800">
                                                                    {student.commits}
                                                                </p>
                                                            </div>
                                                            <div className="text-center rounded-lg bg-gray-50 py-2">
                                                                <p className="text-[10px] text-gray-400 font-semibold">Coverage</p>
                                                                <p className="text-sm font-bold text-gray-800">
                                                                    {student.sprintCoverage}%
                                                                </p>
                                                            </div>
                                                            <div className="text-center rounded-lg bg-gray-50 py-2">
                                                                <p className="text-[10px] text-gray-400 font-semibold">Score</p>
                                                                <p className="text-sm font-bold text-gray-800">
                                                                    {student.contributionScore}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right quick info */}
                <div className="xl:col-span-5 space-y-6">
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <CalendarDays size={15} className="text-indigo-600" />
                                </div>
                                <CardTitle className="text-base font-semibold text-gray-800">
                                    Mô tả báo cáo đang chọn
                                </CardTitle>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-5 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className={`w-12 h-12 rounded-2xl ${selectedConfig.color} text-white flex items-center justify-center`}>
                                    <selectedConfig.icon size={22} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {selectedConfig.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {selectedConfig.desc}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-gray-100 p-4">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                        Output
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        {selectedConfig.formats.map((f) => (
                                            <span
                                                key={f}
                                                className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getFormatBadgeCls(
                                                    f
                                                )}`}
                                            >
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-gray-100 p-4">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                        Filter hiện tại
                                    </p>
                                    <p className="text-sm font-semibold text-gray-800 mt-2">
                                        {previewData.teams.length} nhóm / {previewData.students.length} SV
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 p-4">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Use cases phù hợp
                                </p>
                                <div className="mt-3 space-y-2">
                                    {selectedType === "by-course" && (
                                        <>
                                            <p className="text-sm text-gray-700">• Tổng hợp tiến độ cả lớp</p>
                                            <p className="text-sm text-gray-700">• Báo cáo giữa kỳ / cuối kỳ</p>
                                            <p className="text-sm text-gray-700">• So sánh các nhóm trong một lớp</p>
                                        </>
                                    )}

                                    {selectedType === "by-group" && (
                                        <>
                                            <p className="text-sm text-gray-700">• Review nhóm cụ thể</p>
                                            <p className="text-sm text-gray-700">• Kiểm tra mất cân bằng task</p>
                                            <p className="text-sm text-gray-700">• Theo dõi health của project</p>
                                        </>
                                    )}

                                    {selectedType === "by-student" && (
                                        <>
                                            <p className="text-sm text-gray-700">• Hỗ trợ chấm điểm cá nhân</p>
                                            <p className="text-sm text-gray-700">• Xác định sinh viên ít đóng góp</p>
                                            <p className="text-sm text-gray-700">• Đối chiếu minh chứng hoạt động</p>
                                        </>
                                    )}

                                    {selectedType === "by-warning" && (
                                        <>
                                            <p className="text-sm text-gray-700">• Gửi cảnh báo sớm</p>
                                            <p className="text-sm text-gray-700">• Theo dõi nhóm có nguy cơ fail</p>
                                            <p className="text-sm text-gray-700">• Review lớp có nhiều vấn đề</p>
                                        </>
                                    )}

                                    {selectedType === "by-sync" && (
                                        <>
                                            <p className="text-sm text-gray-700">• Phát hiện lệch Jira / GitHub</p>
                                            <p className="text-sm text-gray-700">• Kiểm tra minh bạch quy trình</p>
                                            <p className="text-sm text-gray-700">• Highlight nhóm quản lý task chưa tốt</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {selectedConfig.formats.map((fmt) => (
                                    <Button
                                        key={fmt}
                                        className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white"
                                        onClick={() => handleExport(fmt)}
                                    >
                                        <Download size={14} className="mr-2" />
                                        Xuất {fmt}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                                    <ExternalLink size={15} className="text-gray-500" />
                                </div>
                                <CardTitle className="text-base font-semibold text-gray-800">
                                    Gợi ý xuất nhanh
                                </CardTitle>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-5 space-y-3">
                            <button
                                onClick={() => success("Đang tạo báo cáo cuối kỳ cho lớp... (demo)")}
                                className="w-full text-left rounded-2xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/50 p-4 transition-colors"
                            >
                                <p className="text-sm font-semibold text-gray-800">Báo cáo cuối kỳ theo lớp</p>
                                <p className="text-xs text-gray-500 mt-1">Dùng cho tổng hợp đánh giá toàn lớp</p>
                            </button>

                            <button
                                onClick={() => success("Đang tạo báo cáo warning teams... (demo)")}
                                className="w-full text-left rounded-2xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/50 p-4 transition-colors"
                            >
                                <p className="text-sm font-semibold text-gray-800">Báo cáo nhóm rủi ro cao</p>
                                <p className="text-xs text-gray-500 mt-1">Nhóm overdue, ít commit, sync thấp</p>
                            </button>

                            <button
                                onClick={() => success("Đang tạo báo cáo contribution thấp... (demo)")}
                                className="w-full text-left rounded-2xl border border-gray-100 hover:border-red-200 hover:bg-red-50/50 p-4 transition-colors"
                            >
                                <p className="text-sm font-semibold text-gray-800">Báo cáo SV đóng góp thấp</p>
                                <p className="text-xs text-gray-500 mt-1">Phù hợp cho review cá nhân</p>
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recent exports */}
            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <CardHeader className="border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Download size={15} className="text-gray-500" />
                        </div>
                        <CardTitle className="text-base font-semibold text-gray-800">
                            Lịch sử xuất file
                        </CardTitle>
                    </div>
                </CardHeader>

                <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-3">Loại báo cáo</div>
                    <div className="col-span-2">Đối tượng</div>
                    <div className="col-span-2">Bộ lọc</div>
                    <div className="col-span-1 text-center">Format</div>
                    <div className="col-span-2 text-center">Ngày tạo</div>
                    <div className="col-span-2 text-right">Thao tác</div>
                </div>

                <CardContent className="p-0">
                    {MOCK_EXPORTS.map((ex) => (
                        <div
                            key={ex.id}
                            className="grid grid-cols-12 gap-3 px-5 py-4 items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0"
                        >
                            <div className="col-span-3">
                                <p className="text-sm font-semibold text-gray-800">{ex.type}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">By {ex.createdBy}</p>
                            </div>

                            <div className="col-span-2 text-sm text-gray-600">{ex.target}</div>

                            <div className="col-span-2">
                                <p className="text-xs text-gray-500 leading-relaxed">{ex.filterSummary}</p>
                            </div>

                            <div className="col-span-1 text-center">
                                <span
                                    className={`text-[10px] font-bold px-2 py-1 rounded-md border ${getFormatBadgeCls(
                                        ex.format
                                    )}`}
                                >
                                    {ex.format}
                                </span>
                            </div>

                            <div className="col-span-2 text-center">
                                <p className="text-xs text-gray-500">{formatDate(ex.date)}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">{ex.size}</p>
                            </div>

                            <div className="col-span-2 flex items-center justify-end gap-2">
                                <button
                                    onClick={() => success(`Đang tải lại ${ex.type}... (demo)`)}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg px-3 py-1.5 border border-teal-100 transition-colors"
                                >
                                    <Download size={11} />
                                    Tải lại
                                </button>
                                <button
                                    onClick={() => success(`Đang export lại cùng cấu hình "${ex.type}"... (demo)`)}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200 transition-colors"
                                >
                                    <RefreshCcw size={11} />
                                    Lặp lại
                                </button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <p className="text-xs text-gray-400 text-center pt-2">
                * Đây là bản mock UI hoàn chỉnh. Các nút export hiện hiển thị toast demo thay vì tải file thực.
            </p>
        </div>
    );
}