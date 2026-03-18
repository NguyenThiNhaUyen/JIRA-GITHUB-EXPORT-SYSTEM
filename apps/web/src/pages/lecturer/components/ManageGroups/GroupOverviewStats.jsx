import { Users, UserPlus, Layers3, Activity, ShieldAlert, PenLine } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard.jsx";

export function GroupOverviewStats({ studentsLength, availableStudentsLength, groupsLength, groupsWithMetrics }) {
  const avgProgress = groupsWithMetrics.length
    ? Math.round(groupsWithMetrics.reduce((s, g) => s + g.progress, 0) / groupsWithMetrics.length)
    : 0;
  const riskCount = groupsWithMetrics.filter(g => g.riskScore > 50).length;
  const missingTopicCount = groupsWithMetrics.filter(g => !g.description).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <StatsCard label="Sinh viên" value={studentsLength} icon={Users} variant="default" />
      <StatsCard label="Chưa có nhóm" value={availableStudentsLength} icon={UserPlus} variant="warning" />
      <StatsCard label="Số nhóm" value={groupsLength} icon={Layers3} variant="info" />
      <StatsCard label="Tiến độ TB" value={`${avgProgress}%`} icon={Activity} variant="success" />
      <StatsCard label="Nhóm rủi ro" value={riskCount} icon={ShieldAlert} variant="danger" />
      <StatsCard label="Thiếu đề tài" value={missingTopicCount} icon={PenLine} variant="indigo" />
    </div>
  );
}






