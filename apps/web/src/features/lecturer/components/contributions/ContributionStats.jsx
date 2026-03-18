import React from "react";
import { GitBranch, Users, Target, GitPullRequest, ShieldAlert } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard.jsx";

export function ContributionStats({ 
  totalCommits, 
  activeStudents, 
  avgScore, 
  totalPRs, 
  totalReviews, 
  riskGroupsCount 
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      <StatsCard
        label="Tá»•ng commits"
        value={totalCommits}
        icon={GitBranch}
        variant="indigo"
      />
      <StatsCard
        label="Sinh viĂªn tĂ­ch cá»±c"
        value={activeStudents}
        icon={Users}
        variant="success"
      />
      <StatsCard
        label="Äiá»ƒm trung bĂ¬nh"
        value={`${avgScore}/100`}
        icon={Target}
        variant="info"
      />
      <StatsCard
        label="Pull requests"
        value={totalPRs}
        icon={GitPullRequest}
        variant="default"
        trend={Math.round((totalReviews / (totalPRs || 1)) * 100)}
      />
      <StatsCard
        label="NhĂ³m rá»§i ro"
        value={riskGroupsCount}
        icon={ShieldAlert}
        variant="warning"
      />
    </div>
  );
}

