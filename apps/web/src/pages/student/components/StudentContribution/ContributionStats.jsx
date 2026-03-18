import { GitCommit, GitPullRequest, TrendingUp, Star } from "lucide-react";
import { StatsCard } from "../../../components/shared/StatsCard.jsx";

export function ContributionStats({ stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <StatsCard label="Tổng Commits" value={stats?.totalCommits || 0} icon={GitCommit} variant="success" hint="+12 tuần này" description="TỔNG SỐ LẦN ĐẨY MÃ NGUỒN" />
            <StatsCard label="PRs Đã Merged" value={stats?.totalPrs || 0} icon={GitPullRequest} variant="indigo" description="PULL REQUESTS ĐÃ ĐƯỢC CHẤP NHẬN" />
            <StatsCard label="Consistency" value={`${stats?.consistencyScore || 0}%`} icon={TrendingUp} variant="warning" description="CHỈ SỐ DUY TRÌ HOẠT ĐỘNG" />
            <StatsCard label="Thứ hạng lớp" value={`#${stats?.rank || 5}`} icon={Star} variant="info" description="VỊ TRÍ SO VỚI SINH VIÊN KHÁC" />
        </div>
    );
}
