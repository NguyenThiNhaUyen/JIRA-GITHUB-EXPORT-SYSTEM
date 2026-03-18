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
                    <StatsCard label="Tổng Commits" value={studentKPI.totalCommits} icon={Github} variant="success" hint="Tuần này" description="TỔNG SỐ LẦN ĐẨY MÃ NGUỒN" />
                    <StatsCard label="Issues Hoàn thành" value={studentKPI.totalIssues} icon={CheckSquare} variant="info" description="TASKS ĐÃ XONG TRÊN JIRA" />
                    <StatsCard label="PRs Merged" value={studentKPI.totalPrs} icon={GitBranch} variant="indigo" description="PULL REQUESTS ĐÃ ĐƯỢC CHẤP NHẬN" />
                    <StatsCard label="Contribution Score" value={`${studentKPI.avgContrib}%`} icon={Target} variant="warning" description="CHỈ SỐ ĐÓNG GÓP QUA HỆ THỐNG" />
                </>
            )}
        </div>
    );
}






