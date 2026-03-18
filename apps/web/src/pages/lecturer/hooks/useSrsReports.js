import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/components/ui/Toast.jsx";
import { useGetCourses } from "@/features/courses/hooks/useCourses.js";
import { useGetReports } from "@/features/admin/hooks/useReports.js";
import { useSendAlert } from "@/features/system/hooks/useAlerts.js";
import { useGenerateCommitStats } from "@/features/projects/hooks/useReports.js";
import { useReviewSrs } from "@/features/srs/hooks/useSrs.js";

const STATUS_META = {
  NOT_SUBMITTED: { label: "Chưa nộp", variant: "secondary", color: "text-gray-500 bg-gray-50 border-gray-100" },
  DRAFT: { label: "Bản nháp", variant: "outline", color: "text-slate-500 bg-slate-50 border-slate-100" },
  SUBMITTED: { label: "Đã nộp", variant: "info", color: "text-sky-600 bg-sky-50 border-sky-100" },
  REVIEW: { label: "Đang review", variant: "info", color: "text-blue-600 bg-blue-50 border-blue-100" },
  NEED_REVISION: { label: "Cần sửa", variant: "warning", color: "text-amber-600 bg-amber-50 border-amber-100" },
  APPROVED: { label: "Đã duyệt", variant: "success", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  FINAL: { label: "Hoàn tất", variant: "success", color: "text-green-600 bg-green-50 border-green-100" },
  OVERDUE: { label: "Quá hạn", variant: "danger", color: "text-red-600 bg-red-50 border-red-100" },
};

export function useSrsReports() {
  const { success, error: showError } = useToast();

  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [feedbackText, setFeedbackText] = useState("");
  const [scoreValue, setScoreValue] = useState(0);

  const reviewMutation = useReviewSrs();
  const { mutate: sendAlert, isPending: isSendingAlert } = useSendAlert();

  const { data: coursesData = { items: [] } } = useGetCourses({ pageSize: 100 });
  const realCourses = coursesData?.items || [];
  const currentCourse = realCourses.find(c => c.code === courseFilter || c.id === courseFilter);

  const { data: srsResponse, isLoading: loadingReports } = useGetReports({
    courseId: currentCourse?.id,
    type: "SRS"
  }, {
    enabled: !!currentCourse?.id || courseFilter === 'all'
  });

  const allProjects = useMemo(() => {
    const projs = [];
    realCourses.forEach(c => {
      (c.projects || []).forEach(p => {
        projs.push({ ...p, courseCode: c.code, courseName: c.name });
      });
    });
    return projs;
  }, [realCourses]);

  const srsList = useMemo(() => {
    if (!srsResponse?.items) return [];
    return srsResponse.items.map(rpt => {
      const p = allProjects.find(px => px.id === rpt.projectId);
      return {
        ...rpt,
        teamName: p?.name || "Unknown Team",
        projectName: p?.description || "Unknown Project",
        leaderName: p?.team?.find(m => m.role === 'LEADER')?.studentName || "N/A",
        courseCode: p?.courseCode || "—",
        score: rpt.score || 0
      };
    });
  }, [srsResponse, allProjects]);

  const filtered = useMemo(() => {
    return srsList.filter(item => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesCourse = courseFilter === "all" || item.courseCode === courseFilter;
      const q = search.toLowerCase();
      const matchesSearch = !search ||
        item.teamName.toLowerCase().includes(q) ||
        item.projectName.toLowerCase().includes(q) ||
        item.leaderName.toLowerCase().includes(q);
      return matchesStatus && matchesCourse && matchesSearch;
    });
  }, [srsList, statusFilter, courseFilter, search]);

  const selectedSrs = useMemo(() => filtered.find(s => s.id === selectedId) || (filtered.length > 0 ? filtered[0] : null), [filtered, selectedId]);

  useEffect(() => {
    if (selectedSrs) {
      setFeedbackText(selectedSrs.feedback || "");
      setScoreValue(selectedSrs.score || 0);
    }
  }, [selectedSrs]);

  const handleReview = async (status) => {
    if (!selectedSrs) return;
    try {
      await reviewMutation.mutateAsync({
        reportId: selectedSrs.id,
        status,
        feedback: feedbackText,
        score: parseFloat(scoreValue)
      });
      success(`Đã cập nhật đánh giá cho ${selectedSrs.teamName}`);
    } catch (err) {
      showError(err.message || "Đánh giá thất bại");
    }
  };

  const handleExportCsv = () => {
    if (filtered.length === 0) return showError("Không có dữ liệu để xuất");

    try {
      const headers = ["Nhóm", "Dự án", "Lớp", "Phiên bản", "Trạng thái", "Điểm", "Ngày nộp", "Feedback"];
      const rows = filtered.map(item => [
        item.teamName,
        item.projectName,
        item.courseCode,
        item.version,
        STATUS_META[item.status]?.label || item.status,
        item.score || 0,
        new Date(item.submittedAt || item.createdAt).toLocaleDateString("vi-VN"),
        (item.feedback || "").replace(/"/g, '""')
      ].map(val => `"${val}"`).join(","));

      const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `SRS_Reports_Export_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      success("Đã xuất bảng điểm thành công!");
    } catch (err) {
      showError("Lỗi khi xuất file");
    }
  };

  const handleSyncAlerts = () => {
    const overdue = filtered.filter(s => s.status === 'OVERDUE' || s.status === 'NEED_REVISION');
    if (overdue.length === 0) return success("Không có nhóm nào cần nhắc nhở");

    overdue.forEach(v => {
      sendAlert({
        groupId: v.projectId,
        message: "Nhắc nhở: Vui lòng cập nhật tài liệu SRS theo yêu cầu của Giảng viên.",
        severity: "MEDIUM"
      });
    });
    success(`Đã gửi nhắc nhở cho ${overdue.length} nhóm`);
  };

  return {
    selectedId, setSelectedId,
    search, setSearch,
    statusFilter, setStatusFilter,
    courseFilter, setCourseFilter,
    feedbackText, setFeedbackText,
    scoreValue, setScoreValue,
    realCourses,
    srsList,
    filtered,
    selectedSrs,
    loadingReports,
    isSendingAlert,
    reviewMutation,
    handleReview,
    handleExportCsv,
    handleSyncAlerts,
    STATUS_META
  };
}






