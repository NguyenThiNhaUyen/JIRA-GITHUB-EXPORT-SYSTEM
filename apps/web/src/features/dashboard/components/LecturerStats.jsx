import React from "react";
import { BookOpen, Users, GitBranch, AlertTriangle } from "lucide-react";
import { StatsCard } from "../../../components/shared/StatsCard.jsx";

export function LecturerStats({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        label="Lớp học"
        value={stats.courses}
        icon={BookOpen}
        variant="indigo"
      />
      <StatsCard
        label="Sinh viên"
        value={stats.students}
        icon={Users}
        variant="info"
      />
      <StatsCard
        label="GitHub Approved"
        value={stats.github}
        icon={GitBranch}
        variant="success"
      />
      <StatsCard
        label="Cần chú ý"
        value={stats.alerts}
        icon={AlertTriangle}
        variant="warning"
      />
    </div>
  );
}
