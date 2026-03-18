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
    { id: "by-course", icon: FileSpreadsheet, color: "bg-teal-500", title: "BĂ¡o cĂ¡o theo Lá»›p", desc: "Tá»•ng há»£p tiáº¿n Ä‘á»™ táº¥t cáº£ nhĂ³m trong má»™t lá»›p há»c. Bao gá»“m: sá»‘ nhĂ³m, tráº¡ng thĂ¡i GitHub/Jira, cáº£nh bĂ¡o.", formats: ["PDF", "Excel"] },
    { id: "by-group", icon: FileText, color: "bg-blue-500", title: "BĂ¡o cĂ¡o theo NhĂ³m", desc: "Chi tiáº¿t hoáº¡t Ä‘á»™ng tá»«ng nhĂ³m: commit, issue, member, deadline.", formats: ["PDF", "Excel"] },
    { id: "by-student", icon: CheckSquare, color: "bg-indigo-500", title: "BĂ¡o cĂ¡o theo Sinh viĂªn", desc: "ÄĂ³ng gĂ³p cĂ¡ nhĂ¢n: commits, issues, sprint coverage. PhĂ¹ há»£p dĂ¹ng cho báº£ng Ä‘iá»ƒm quĂ¡ trĂ¬nh.", formats: ["PDF", "CSV"] },
    { id: "by-warning", icon: AlertTriangle, color: "bg-amber-500", title: "BĂ¡o cĂ¡o Cáº£nh bĂ¡o", desc: "NhĂ³m/SV cĂ³ rá»§i ro cao dá»±a trĂªn phĂ¢n tĂ­ch AI/Há»‡ thá»‘ng.", formats: ["PDF", "Excel"] },
    { id: "by-sync", icon: GitBranch, color: "bg-violet-500", title: "Äá»‘i chiáº¿u Jira/GH", desc: "PhĂ¢n tĂ­ch khá»›p dá»¯ liá»‡u giá»¯a Task Jira vĂ  Code Commits.", formats: ["PDF", "Excel"] }
];

export function useReports() {
    const { success, info, error: showError } = useToast();
    const [selectedType, setSelectedType] = useState("by-course");
    const [courseFilter, setCourseFilter] = useState("all");
    const [teamFilter, setTeamFilter] = useState("all");
    const [search, setSearch] = useState("");

    const { data: coursesData, isLoading: loadingCourses } = useGetCourses({ pageSize: 100 });
    const { data: projectsData, isLoading: loadingProjects } = useGetProjects({
        courseId: courseFilter === "all" ? undefined : courseFilter,
        pageSize: 100
    });
    const { data: inactiveTeams = [] } = useInactiveTeams();
    const { data: myReports = [], isLoading: loadingMyReports } = useGetMyReports();

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
            info(`Äang yĂªu cáº§u táº¡o file ${format} cho "${typeTitle}"...`);
            let res;
            if (typeId === "by-course") {
                if (courseFilter === "all") throw new Error("Vui lĂ²ng chá»n má»™t lá»›p cá»¥ thá»ƒ Ä‘á»ƒ xuáº¥t bĂ¡o cĂ¡o lá»›p.");
                res = await commitStatsMutation.mutateAsync({ courseId: courseFilter, format });
            } else if (typeId === "by-group") {
                if (teamFilter === "all") throw new Error("Vui lĂ²ng chá»n má»™t nhĂ³m cá»¥ thá»ƒ Ä‘á»ƒ xuáº¥t bĂ¡o cĂ¡o nhĂ³m.");
                res = await teamRosterMutation.mutateAsync({ projectId: teamFilter, format });
            } else if (typeId === "by-sync") {
                if (teamFilter === "all") throw new Error("Vui lĂ²ng chá»n má»™t nhĂ³m Ä‘á»ƒ Ä‘á»‘i chiáº¿u.");
                res = await srsMutation.mutateAsync({ projectId: teamFilter, format });
            } else {
                success(`TĂ­nh nÄƒng xuáº¥t "${typeTitle}" sáº½ sá»›m kháº£ dá»¥ng.`);
                return;
            }

            if (res?.reportId) {
                success(`YĂªu cáº§u táº¡o "${typeTitle}" Ä‘Ă£ Ä‘Æ°á»£c ghi nháº­n (ID: ${res.reportId}). Vui lĂ²ng chá» trong giĂ¢y lĂ¡t.`);
            }
        } catch (err) {
            showError(err.message || "Lá»—i khi táº¡o bĂ¡o cĂ¡o");
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
        loading: loadingCourses || loadingProjects,
        handleExport,
        EXPORT_TYPES
    };
}

