import { useState, useMemo } from "react";
import { useToast } from "@/components/ui/Toast.jsx";
import {
    useGetMyReports,
    useGenerateCommitStats,
    useGenerateTeamRoster,
    useGenerateSrs,
    useGenerateActivitySummary
} from "@/features/admin/hooks/useReports.js";
import { useGetCourses } from "@/features/courses/hooks/useCourses.js";
import { useGetProjects } from "@/features/projects/hooks/useProjects.js";
import { useInactiveTeams } from "@/features/dashboard/hooks/useDashboard.js";
import {
    FileSpreadsheet,
    FileText,
    CheckSquare,
    AlertTriangle,
    GitBranch
} from "lucide-react";

const EXPORT_TYPES = [
    { id: "by-course", icon: FileSpreadsheet, color: "bg-teal-500", title: "Báo cáo theo Lớp", desc: "Tổng hợp tiến độ tất cả nhóm trong một lớp học. Bao gồm: số nhóm, trạng thái GitHub/Jira, cảnh báo.", formats: ["PDF", "Excel"] },
    { id: "by-group", icon: FileText, color: "bg-blue-500", title: "Báo cáo theo Nhóm", desc: "Chi tiết hoạt động từng nhóm: commit, issue, member, deadline.", formats: ["PDF", "Excel"] },
    { id: "by-student", icon: CheckSquare, color: "bg-indigo-500", title: "Báo cáo theo Sinh viên", desc: "Đóng góp cá nhân: commits, issues, sprint coverage. Phù hợp dùng cho bảng điểm quá trình.", formats: ["PDF", "CSV"] },
    { id: "by-warning", icon: AlertTriangle, color: "bg-amber-500", title: "Báo cáo Cảnh báo", desc: "Nhóm/SV có rủi ro cao dựa trên phân tích AI/Hệ thống.", formats: ["PDF", "Excel"] },
    { id: "by-sync", icon: GitBranch, color: "bg-violet-500", title: "Đối chiếu Jira/GH", desc: "Phân tích khớp dữ liệu giữa Task Jira và Code Commits.", formats: ["PDF", "Excel"] }
];

export function useReports() {
    const { success, info, error: showError } = useToast();
    const [selectedType, setSelectedType] = useState("by-course");
    const [courseFilter, setCourseFilter] = useState("all");
    const [teamFilter, setTeamFilter] = useState("all");
    const [search, setSearch] = useState("");

    // Switch back to the stable /api/courses which also supports Lecturers
    const { data: coursesData, isLoading: loadingCourses, isError: errorCourses } = useGetCourses({ pageSize: 100 });
    const { data: projectsData, isLoading: loadingProjects, isError: errorProjects } = useGetProjects({
        courseId: courseFilter === "all" ? undefined : courseFilter,
        pageSize: 100
    });
    
    // Gracefully handle potentially restricted analytics
    const { data: inactiveTeams = [], isError: errorInactive } = useInactiveTeams();
    const { data: myReports = [], isLoading: loadingMyReports, isError: errorReports } = useGetMyReports();

    // Mutations
    const commitStatsMutation = useGenerateCommitStats();
    const teamRosterMutation = useGenerateTeamRoster();
    const srsMutation = useGenerateSrs();
    const activitySummaryMutation = useGenerateActivitySummary();

    const courses = coursesData?.items || [];
    const projects = projectsData?.items || [];

    const selectedConfig = EXPORT_TYPES.find(x => x.id === selectedType);

    const statsRecords = useMemo(() => ({
        totalExports: myReports.length,
        thisWeek: myReports.filter(r => new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
        risky: inactiveTeams.filter(t => t.severity === 'high').length,
        alertSV: 8,
        overdue: 12,
        avgSprint: 76
    }), [inactiveTeams, myReports]);

    const previewData = useMemo(() => {
        let teams = projects.map(p => ({
            id: p.id,
            courseId: p.courseId,
            name: p.teamName || p.name,
            project: p.name,
            riskLevel: inactiveTeams.find(it => String(it.projectId) === String(p.id))?.severity === 'high' ? 'High' : 'Low',
            warningCount: inactiveTeams.find(it => String(it.projectId) === String(p.id)) ? 3 : 0,
            commits: p.totalCommits || 0
        }));

        if (search) teams = teams.filter(t => (t.name || "").toLowerCase().includes(search.toLowerCase()) || (t.project || "").toLowerCase().includes(search.toLowerCase()));

        return {
            teams,
            totalCommits: teams.reduce((s, t) => s + (t.commits || 0), 0),
            warnings: teams.reduce((s, t) => s + (t.warningCount || 0), 0),
            avgSync: 82
        };
    }, [projects, inactiveTeams, search]);

    const handleExport = async (format, typeId, typeTitle) => {
        try {
            info(`Đang yêu cầu tạo file ${format} cho "${typeTitle}"...`);
            let res;
            if (typeId === "by-course") {
                if (courseFilter === "all") throw new Error("Vui lòng chọn một lớp cụ thể để xuất báo cáo lớp.");
                res = await commitStatsMutation.mutateAsync({ courseId: courseFilter, format });
            } else if (typeId === "by-group") {
                if (teamFilter === "all") throw new Error("Vui lòng chọn một nhóm cụ thể để xuất báo cáo nhóm.");
                res = await teamRosterMutation.mutateAsync({ projectId: teamFilter, format });
            } else if (typeId === "by-sync") {
                if (teamFilter === "all") throw new Error("Vui lòng chọn một nhóm để đối chiếu.");
                res = await srsMutation.mutateAsync({ projectId: teamFilter, format });
            } else {
                success(`Tính năng xuất "${typeTitle}" sẽ sớm khả dụng.`);
                return;
            }

            if (res?.reportId) {
                success(`Yêu cầu tạo "${typeTitle}" đã được ghi nhận (ID: ${res.reportId}). Vui lòng chờ trong giây lát.`);
            }
        } catch (err) {
            showError(err.message || "Lỗi khi tạo báo cáo");
        }
    };

    return {
        selectedType, setSelectedType,
        courseFilter, setCourseFilter,
        teamFilter, setTeamFilter,
        search, setSearch,
        courses,
        projects,
        selectedConfig,
        statsRecords,
        previewData,
        myReports,
        loading: (loadingCourses && !errorCourses) || (loadingProjects && !errorProjects),
        handleExport,
        EXPORT_TYPES
    };
}






