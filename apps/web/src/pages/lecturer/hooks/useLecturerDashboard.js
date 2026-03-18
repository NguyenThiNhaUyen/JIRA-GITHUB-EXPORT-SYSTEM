import { useState, useMemo } from "react";
import { useToast } from "@/components/ui/Toast.jsx";
import { useAuth } from "@/context/AuthContext.jsx";
import {
  useGetSemesters,
  useGetSubjects
} from "@/features/system/hooks/useSystem.js";
import {
  useGetCourseById
} from "@/features/courses/hooks/useCourses.js";
import {
  useMyWorkload,
  useMyCourses,
  useLecturerActivityLogs,
  useAnalyticsRadar as useGroupRadarMetrics
} from "@/features/dashboard/hooks/useDashboard.js";
import {
  useApproveIntegration,
  useRejectIntegration
} from "@/features/projects/hooks/useProjects.js";
import {
  useGetAlerts,
  useResolveAlert
} from "@/features/system/hooks/useAlerts.js";
// Activity log icon helpers moved up if needed, but keeping them here for now
import { GitBranch, BookOpen, FileText, CheckCircle, Users } from "lucide-react";

const getActivityIconInfo = (type) => {
  switch (type) {
    case 'GITHUB_SYNC': return { icon: GitBranch, color: "text-teal-600 bg-teal-50" };
    case 'JIRA_SYNC': return { icon: BookOpen, color: "text-blue-600 bg-blue-50" };
    case 'SRS_SUBMIT': return { icon: FileText, color: "text-indigo-600 bg-indigo-50" };
    case 'INTEGRATION_APPROVED': return { icon: CheckCircle, color: "text-green-600 bg-green-50" };
    case 'NEW_USER': return { icon: Users, color: "text-blue-600 bg-blue-50" };
    case 'NEW_COURSE': return { icon: BookOpen, color: "text-indigo-600 bg-indigo-50" };
    default: return { icon: CheckCircle, color: "text-gray-600 bg-gray-50" };
  }
}

export function useLecturerDashboard() {
  const { success, error: showError } = useToast();
  const { user } = useAuth();

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(""); // Fixed missing state
  const [filter, setFilter] = useState("all");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const { data: semesters = [] } = useGetSemesters();
  const { data: workload } = useMyWorkload();
  const { data: subjectsData = { items: [] } } = useGetSubjects();
  const { data: coursesData = [] } = useMyCourses();
  const { data: course, isLoading: loadingCourse } = useGetCourseById(selectedCourse);
  const { data: alertsData } = useGetAlerts({ pageSize: 5 });

  const { data: radarMetricsData } = useGroupRadarMetrics(selectedCourse);
  const { data: activityLogsData, isLoading: loadingLogs } = useLecturerActivityLogs(5);

  const approveIntMutation = useApproveIntegration();
  const rejectIntMutation = useRejectIntegration();
  const resolveAlertMutation = useResolveAlert();

  const subjects = subjectsData?.items || [];
  const courses = useMemo(() => {
    const list = Array.isArray(coursesData) ? coursesData : (coursesData?.items || []);
    return selectedSubject ? list.filter(c => c.subjectId === parseInt(selectedSubject)) : list;
  }, [coursesData, selectedSubject]);

  const groups = course?.groups || [];

  const stats = useMemo(() => ({
    courses: workload?.courseCount || 0,
    students: workload?.studentCount || 0,
    github: groups.filter(g => g.integration?.githubStatus === "APPROVED").length,
    alerts: (alertsData?.items || []).filter(a => a.status === "OPEN").length,
  }), [workload, groups, alertsData]);

  const alertsList = useMemo(() => (alertsData?.items || []).filter(a => a.status === "OPEN").map(a => ({
    id: a.id,
    name: a.groupName || "Há»‡ thá»‘ng",
    msg: a.message,
    severity: a.severity?.toLowerCase() === "high" ? "error" : "warning"
  })), [alertsData]);

  const pendingIntegrations = groups.filter(
    g => g.integration?.githubStatus === "PENDING" || g.integration?.jiraStatus === "PENDING"
  );

  const radarData = useMemo(() => radarMetricsData || groups.map(group => ({
    groupName: group.name,
    commits: group.stats?.commitsCount || 0,
    srsDone: group.stats?.srsCompletionPercent || 0,
    teamSize: group.team?.length || 0,
    githubLinked: group.integration?.githubStatus === 'APPROVED' ? 100 : 0,
    jiraLinked: group.integration?.jiraStatus === 'APPROVED' ? 100 : 0,
  })), [radarMetricsData, groups]);

  const activities = useMemo(() => (activityLogsData?.items || []).map(act => {
    const { icon, color } = getActivityIconInfo(act.type);
    return {
      id: act.id,
      icon,
      color,
      msg: act.message || act.description || 'Hoáº¡t Ä‘á»™ng áº©n danh',
      time: act.time || new Date(act.timestamp || act.createdAt).toLocaleDateString("vi-VN")
    };
  }), [activityLogsData]);

  const handleApprovePending = async (groupId) => {
    try {
      await approveIntMutation.mutateAsync(groupId);
      success(`ÄĂ£ phĂª duyá»‡t tĂ­ch há»£p cá»§a nhĂ³m`);
    } catch (err) {
      showError(err.message || `Lá»—i phĂª duyá»‡t`);
    }
  };

  const handleRejectPending = async (projectId) => {
    const reason = prompt("Nháº­p lĂ½ do tá»« chá»‘i tĂ­ch há»£p:");
    if (!reason) return;
    try {
      await rejectIntMutation.mutateAsync({ projectId, reason });
      success(`ÄĂ£ tá»« chá»‘i tĂ­ch há»£p`);
    } catch (err) {
      showError(err.message || `Lá»—i khi tá»« chá»‘i`);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await resolveAlertMutation.mutateAsync(alertId);
      success("ÄĂ£ Ä‘Ă¡nh dáº¥u cáº£nh bĂ¡o Ä‘Ă£ hoĂ n táº¥t");
    } catch (err) {
      showError(err.message || "Xá»­ lĂ½ cáº£nh bĂ¡o tháº¥t báº¡i");
    }
  };

  return {
    user,
    selectedCourse, setSelectedCourse,
    selectedSubject, setSelectedSubject,
    filter, setFilter,
    isAlertModalOpen, setIsAlertModalOpen,
    semesters,
    workload,
    subjects,
    courses,
    course,
    loadingCourse,
    alertsList,
    radarData,
    activities,
    loadingLogs,
    pendingIntegrations,
    groups,
    stats,
    handleApprovePending,
    handleRejectPending,
    handleResolveAlert
  };
}

