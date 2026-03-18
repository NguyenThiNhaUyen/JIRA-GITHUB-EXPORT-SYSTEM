import { Github, CheckSquare, GitBranch, Target } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard.jsx";
import { Skeleton } from "@/components/ui/Skeleton.jsx";

export function DashboardKpiCards({ isLoading, studentKPI }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {isLoading ? (
                <>
                    <Skeleton className="h-28 rounded-3xl" />
                    <Skeleton className="h-28 rounded-3xl" />
                    <Skeleton className="h-28 rounded-3xl" />
                    <Skeleton className="h-28 rounded-3xl" />
                </>
            ) : (
                <>
                    <StatsCard label="Tá»•ng Commits" value={studentKPI.totalCommits} icon={Github} variant="success" hint="Tuáº§n nĂ y" description="Tá»”NG Sá» Láº¦N Äáº¨Y MĂƒ NGUá»’N" />
                    <StatsCard label="Issues HoĂ n thĂ nh" value={studentKPI.totalIssues} icon={CheckSquare} variant="info" description="TASKS ÄĂƒ XONG TRĂN JIRA" />
                    <StatsCard label="PRs Merged" value={studentKPI.totalPrs} icon={GitBranch} variant="indigo" description="PULL REQUESTS ÄĂƒ ÄÆ¯á»¢C CHáº¤P NHáº¬N" />
                    <StatsCard label="Contribution Score" value={`${studentKPI.avgContrib}%`} icon={Target} variant="warning" description="CHá»ˆ Sá» ÄĂ“NG GĂ“P QUA Há»† THá»NG" />
                </>
            )}
        </div>
    );
}

