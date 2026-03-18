import { AlertTriangle, ShieldAlert, CheckCircle, Clock, Users, Bell } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard.jsx";

export function AlertStats({ alertsList, remindedCount, now }) {
  const unresolvedCount = alertsList.filter(a => (a.status === 'OPEN' || a.status === null)).length;
  const highSeverityCount = alertsList.filter(a => (a.severity || "").toUpperCase() === 'HIGH' && (a.status === 'OPEN' || a.status === null)).length;
  const resolvedCount = alertsList.filter(a => a.status === 'RESOLVED').length;
  const newLast24hCount = alertsList.filter(a => {
    const createdAt = new Date(a.createdAt).getTime();
    return Math.abs(now - createdAt) < 86400000;
  }).length;
  const groupCount = new Set(alertsList.map(a => a.groupName)).size;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      <StatsCard label="ChÆ°a xá»­ lĂ½" value={unresolvedCount} icon={AlertTriangle} variant="danger" />
      <StatsCard label="NghiĂªm trá»ng" value={highSeverityCount} icon={ShieldAlert} variant="warning" />
      <StatsCard label="ÄĂ£ xá»­ lĂ½" value={resolvedCount} icon={CheckCircle} variant="success" />
      <StatsCard label="Má»›i (24h)" value={newLast24hCount} icon={Clock} variant="info" />
      <StatsCard label="Theo nhĂ³m" value={groupCount} icon={Users} variant="indigo" />
      <StatsCard label="ÄĂ£ nháº¯c" value={remindedCount} icon={Bell} variant="default" />
    </div>
  );
}

