import React from "react";
import { 
  CalendarDays, 
  Library, 
  BookOpen, 
  UserCog, 
  GraduationCap, 
  FolderKanban,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard.jsx";

export function AdminStats({ stats, integrationStats, activeSemesters }) {
  return (
    <div className="space-y-6">
      {/* Hero Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard label="Há»c ká»³" value={stats.semesters} icon={CalendarDays} variant="indigo" trend={activeSemesters} />
        <StatsCard label="MĂ´n há»c" value={stats.subjects} icon={Library} variant="indigo" />
        <StatsCard label="Lá»›p há»c pháº§n" value={stats.courses} icon={BookOpen} variant="info" />
        <StatsCard label="Giáº£ng viĂªn" value={stats.lecturers} icon={UserCog} variant="info" />
        <StatsCard label="Sinh viĂªn" value={stats.students} icon={GraduationCap} variant="success" />
        <StatsCard label="NhĂ³m dá»± Ă¡n" value={stats.projects} icon={FolderKanban} variant="warning" />
      </div>

      {/* GitHub KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsCard label="Repo Connected" value={integrationStats.repoConnected} icon={FolderKanban} variant="success" />
        <StatsCard label="Missing Repo" value={integrationStats.repoMissing} icon={AlertCircle} variant="danger" />
        <StatsCard label="Jira Project" value={integrationStats.jiraConnected} icon={CheckCircle} variant="info" />
        <StatsCard label="Sync Errors" value={integrationStats.syncErrors} icon={AlertCircle} variant="warning" />
        <StatsCard label="Reports Exported" value={integrationStats.reportsExported} icon={TrendingUp} variant="indigo" />
      </div>
    </div>
  );
}

