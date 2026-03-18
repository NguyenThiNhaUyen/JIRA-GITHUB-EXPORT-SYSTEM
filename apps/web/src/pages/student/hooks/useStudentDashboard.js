import { useAuth } from "../../../context/AuthContext.jsx";
import { useToast } from "../../../components/ui/Toast.jsx";
import {
  useStudentDeadlines,
  useStudentProjects,
  useStudentWarnings,
  useStudentCommits,
  useStudentMeCourses,
  useStudentGrades,
  useStudentStats,
  useStudentHeatmap,
  useStudentCommitActivity
} from "../../../features/dashboard/hooks/useDashboard.js";

export function useStudentDashboard() {
  const { user, logout } = useAuth();
  const { success } = useToast();

  const { data: stats, isLoading: statsLoading } = useStudentStats();
  const { data: heatmap } = useStudentHeatmap(21);
  const { data: commitActivity } = useStudentCommitActivity(7);
  const { data: deadlinesData } = useStudentDeadlines();
  const { data: courseData, isLoading: coursesLoading } = useStudentMeCourses();
  const { data: projectData, isLoading: projectsLoading } = useStudentProjects();
  const { data: warnings } = useStudentWarnings();
  const { data: recentCommits } = useStudentCommits({ pageSize: 5 });
  const { data: gradesData } = useStudentGrades();

  const handleLogout = () => { logout(); window.location.href = "/login"; };

  const courses = courseData?.items || [];
  const projects = projectData?.items || [];
  const upcomingDeadlines = deadlinesData?.items || deadlinesData || [];
  const studentWarnings = warnings || [];
  const commitsList = recentCommits?.items || [];
  const grades = gradesData?.items || gradesData || [];


  const studentKPI = {
    totalCommits: stats?.totalCommits || projects.reduce((sum, item) => sum + (item.commits || 0), 0),
    totalIssues: stats?.totalIssues || projects.reduce((sum, item) => sum + (item.issuesDone || 0), 0),
    totalPrs: stats?.totalPrs || projects.reduce((sum, item) => sum + (item.prsMerged || 0), 0),
    avgContrib: stats?.contributionPercent || (projects.length > 0
      ? Math.round(projects.reduce((sum, item) => sum + (item.myContribution || 0), 0) / projects.length)
      : 0)
  };

  const isLoading = statsLoading || coursesLoading || projectsLoading;

  return {
    user,
    isLoading,
    studentKPI,
    studentWarnings,
    courses,
    projects,
    upcomingDeadlines,
    commitsList,
    grades,
    commitActivity,
    heatmap,
    handleLogout,
    success
  };
}
