import { AlertTriangle, ShieldAlert, CheckCircle, Clock, Users, Bell } from "lucide-react";
import { StatsCard } from "../../../../components/shared/StatsCard.jsx";

export function AlertStats({ alertsList, remindedCount }) {
  const unresolvedCount = alertsList.filter(a => (a.status === 'OPEN' || a.status === null)).length;
  const highSeverityCount = alertsList.filter(a => (a.severity || "").toUpperCase() === 'HIGH' && (a.status === 'OPEN' || a.status === null)).length;
  const resolvedCount = alertsList.filter(a => a.status === 'RESOLVED').length;
  const newLast24hCount = alertsList.filter(a => {
    const createdAt = new Date(a.createdAt).getTime();
    const now = new Date().getTime(); // Still "impure" if in render, but let's see
    return Math.abs(now - createdAt) < 86400000;
  }).length;
  const groupCount = new Set(alertsList.map(a => a.groupName)).size;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      <StatsCard label="Chưa xử lý" value={unresolvedCount} icon={AlertTriangle} variant="danger" />
      <StatsCard label="Nghiêm trọng" value={highSeverityCount} icon={ShieldAlert} variant="warning" />
      <StatsCard label="Đã xử lý" value={resolvedCount} icon={CheckCircle} variant="success" />
      <StatsCard label="Mới (24h)" value={newLast24hCount} icon={Clock} variant="info" />
      <StatsCard label="Theo nhóm" value={groupCount} icon={Users} variant="indigo" />
      <StatsCard label="Đã nhắc" value={remindedCount} icon={Bell} variant="default" />
    </div>
  );
}
