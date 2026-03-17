import {
  Activity,
  Users,
  GitBranch,
  AlertTriangle,
  Download,
  ArrowLeft
} from "lucide-react";

import { Button } from "../components/ui/Button.jsx";
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";

// Local Components
import { ActivityHeatmap } from "./components/CourseAnalytics/ActivityHeatmap.jsx";
import { ContributionTrends } from "./components/CourseAnalytics/ContributionTrends.jsx";
import { JiraTaskDistribution } from "./components/CourseAnalytics/JiraTaskDistribution.jsx";
import { TeamAnalyticsSummary } from "./components/CourseAnalytics/TeamAnalyticsSummary.jsx";

// Hooks
import { useCourseAnalytics } from "./hooks/useCourseAnalytics.js";

export default function CourseAnalytics() {
  const {
    courseId,
    navigate,
    success,
    course,
    heatmapData,
    courseInactiveTeams,
    courseRankings,
    chartData,
    jiraData,
    integrationStats,
    loading
  } = useCourseAnalytics();

  if (loading) {
    return (
      <div className="space-y-8 p-8">
        <Skeleton className="h-20 w-3/4 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-[24px]" />)}
        </div>
        <div className="grid grid-cols-12 gap-8">
          <Skeleton className="col-span-12 h-64 rounded-[40px]" />
          <Skeleton className="col-span-8 h-96 rounded-[40px]" />
          <Skeleton className="col-span-4 h-96 rounded-[40px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Báo cáo Phân tích"
        subtitle={course ? `Lớp: ${course.code} — ${course.name}. Dữ liệu heatmap & xu hướng từ GitHub.` : "Tổng quan về hiệu suất và tiến độ của toàn lớp."}
        breadcrumb={["Giảng viên", "Thống kê", course?.code || "Lớp học"]}
        actions={[
          <Button key="back" variant="outline" onClick={() => navigate(-1)} className="rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest border-gray-100 hover:bg-gray-50 shadow-sm">
            <ArrowLeft size={14} className="mr-2" /> Quay lại
          </Button>,
          <Button key="export" onClick={() => success("Tính năng này đang được phát triển...")} className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-11 px-8 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-teal-100 border-0 transition-all">
            <Download size={16} className="mr-2" /> Xuất báo cáo PDF
          </Button>
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Nhóm dự án" value={course?.projectsCount || 0} icon={Users} variant="info" />
        <StatsCard label="Tổng sinh viên" value={course?.currentStudents || 0} icon={Activity} variant="success" />
        <StatsCard label="Tỷ lệ kết nối" value={`${Math.round(((courseRankings.length || 0) / (course?.projectsCount || 1)) * 100)}%`} icon={GitBranch} variant="indigo" />
        <StatsCard label="Cần chú ý" value={courseInactiveTeams.length || 0} icon={AlertTriangle} variant="danger" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <ActivityHeatmap heatmapData={heatmapData} />
        <ContributionTrends chartData={chartData} />
        <JiraTaskDistribution jiraData={jiraData} integrationStats={integrationStats} />
      </div>

      <TeamAnalyticsSummary
        courseRankings={courseRankings}
        courseInactiveTeams={courseInactiveTeams}
        navigate={navigate}
      />
    </div>
  );
}