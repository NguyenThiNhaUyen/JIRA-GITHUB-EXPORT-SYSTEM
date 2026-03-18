import { GitCommit, GitPullRequest, TrendingUp, Star } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard.jsx";

export function ContributionStats({ stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <StatsCard label="Tá»•ng Commits" value={stats?.totalCommits || 0} icon={GitCommit} variant="success" hint="+12 tuáº§n nĂ y" description="Tá»”NG Sá» Láº¦N Äáº¨Y MĂƒ NGUá»’N" />
            <StatsCard label="PRs ÄĂ£ Merged" value={stats?.totalPrs || 0} icon={GitPullRequest} variant="indigo" description="PULL REQUESTS ÄĂƒ ÄÆ¯á»¢C CHáº¤P NHáº¬N" />
            <StatsCard label="Consistency" value={`${stats?.consistencyScore || 0}%`} icon={TrendingUp} variant="warning" description="CHá»ˆ Sá» DUY TRĂŒ HOáº T Äá»˜NG" />
            <StatsCard label="Thá»© háº¡ng lá»›p" value={`#${stats?.rank || 5}`} icon={Star} variant="info" description="Vá» TRĂ SO Vá»I SINH VIĂN KHĂC" />
        </div>
    );
}

