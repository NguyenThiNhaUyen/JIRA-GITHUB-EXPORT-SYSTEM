import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { format as formatDateFn } from "date-fns";
import { useToast } from "@/components/ui/Toast.jsx";
import { useGetCourseById } from "@/features/courses/hooks/useCourses.js";
import {
  useAnalyticsHeatmap,
  useCommitTrends,
  useTeamRankings,
  useInactiveTeams,
  useIntegrationStats
} from "@/features/dashboard/hooks/useDashboard.js";

export function useCourseAnalytics() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { success } = useToast();

  const { data: course, isLoading: loadingCourse } = useGetCourseById(courseId);
  const { data: heatmapData = [], isLoading: loadingHeatmap } = useAnalyticsHeatmap(90);
  const { data: commitTrends = [], isLoading: loadingTrends } = useCommitTrends(14);
  const { data: rankings = [], isLoading: loadingRankings } = useTeamRankings(10);
  const { data: inactiveTeams = [], isLoading: loadingInactive } = useInactiveTeams();
  const { data: integrationStats } = useIntegrationStats();

  const courseInactiveTeams = useMemo(() => (inactiveTeams || []).filter(t => String(t.courseId) === String(courseId)), [inactiveTeams, courseId]);
  const courseRankings = useMemo(() => (rankings || []).filter(t => String(t.courseId) === String(courseId)), [rankings, courseId]);

  const chartData = useMemo(() => commitTrends.map(t => ({
    day: t.date ? formatDateFn(new Date(t.date), 'dd/MM') : t.label,
    commits: t.count ?? t.value ?? 0
  })), [commitTrends]);

  const jiraData = useMemo(() => [
    { name: "Sẵn sàng", value: integrationStats?.jiraStats?.todo || 0, color: "#94a3b8" },
    { name: "Đang làm", value: integrationStats?.jiraStats?.inProgress || 0, color: "#6366f1" },
    { name: "Hoàn tất", value: integrationStats?.jiraStats?.done || 1, color: "#14b8a6" }
  ], [integrationStats]);

  const loading = loadingCourse || loadingHeatmap || loadingTrends || loadingRankings || loadingInactive;

  return {
    courseId,
    navigate,
    success,
    course,
    heatmapData,
    commitTrends,
    rankings,
    inactiveTeams,
    integrationStats,
    courseInactiveTeams,
    courseRankings,
    chartData,
    jiraData,
    loading
  };
}






