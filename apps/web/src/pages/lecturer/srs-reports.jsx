// SRS Reports — Lecturer
import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  FileText,
  Eye,
  CheckCircle,
  MessageSquare,
  ExternalLink,
  Search,
  Filter,
  Clock3,
  AlertTriangle,
  GitBranch,
  FolderKanban,
  Users,
  CalendarDays,
  Upload,
  CheckCheck,
  ShieldAlert,
  RefreshCcw,
  Download,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";
import { useCourseProjectReports, useUpdateReportStatus } from "../../features/admin/hooks/useReports.js";
import { useSendAlert } from "../../features/system/hooks/useAlerts.js";
import { useGenerateCommitStats } from "../../features/projects/hooks/useReports.js";

/* -------------------------------- HELPERS -------------------------------- */
const STATUS_META = {
  NOT_SUBMITTED: {
    label: "Chưa nộp",
    chip: "bg-gray-100 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  },
  DRAFT: {
    label: "Draft",
    chip: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
  SUBMITTED: {
    label: "Đã nộp",
    chip: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
  },
  REVIEW: {
    label: "Đang review",
    chip: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  NEED_REVISION: {
    label: "Cần chỉnh sửa",
    chip: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  APPROVED: {
    label: "Approved",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  FINAL: {
    label: "Final",
    chip: "bg-green-50 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  OVERDUE: {
    label: "Quá hạn",
    chip: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

function formatDate(date) {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateShort(date) {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("vi-VN");
}

function getDaysDiff(deadline) {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function checklistBadge(type) {
  if (type === "pass") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (type === "warning") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

function checklistLabel(type) {
  if (type === "pass") return "Đạt";
  if (type === "warning") return "Lưu ý";
  return "Thiếu";
}

function getScoreColor(score) {
  if (score >= 8.5) return "text-green-700 bg-green-50 border-green-200";
  if (score >= 7) return "text-blue-700 bg-blue-50 border-blue-200";
  if (score > 0) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-gray-500 bg-gray-100 border-gray-200";
}

/* ------------------------------- COMPONENT ------------------------------- */

export default function SrsReports() {
  const { success, error } = useToast();

  const [srsList, setSrsList] = useState([]);
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [milestoneFilter, setMilestoneFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [feedbackText, setFeedbackText] = useState("");

  const updateStatusMutation = useUpdateReportStatus();
  const { mutate: sendAlert, isPending: isSendingAlert } = useSendAlert();
  const generateStatsMutation = useGenerateCommitStats();
  
  const { data: coursesData = { items: [] } } = useGetCourses({ pageSize: 100 });
  const realCourses = coursesData?.items || [];

  const allProjectsList = useMemo(() => {
    if (realCourses.length > 0) {
      let projs = [];
      realCourses.forEach(c => {
        const groups = c.groups || c.projects || [];
        groups.forEach(g => {
           projs.push({
             ...g,
             courseId: c.id,
             courseCode: c.code,
             courseName: c.name,
             teamName: g.name,
             projectName: g.description || "Unknown Project", 
             leader: g.members?.find(m => m.teamRole === "LEADER")?.studentName || "—",
             members: g.members?.map(m => m.studentName) || [],
             jiraUrl: g.integration?.jiraProjectUrl || "#",
             githubUrl: g.integration?.githubRepoUrl || "#",
           });
        });
      });
      return projs;
    }
    return []; 
  }, [realCourses]);

  const reportQueries = useCourseProjectReports(realCourses.length ? allProjectsList.map(p => p.id) : [], "SRS");

  useEffect(() => {
    if (!realCourses.length) {
      setSrsList([]);
      return;
    }

    let merged = [];
    allProjectsList.forEach((project, index) => {
       const query = reportQueries[index];
       if (query?.data && Array.isArray(query.data)) {
          query.data.forEach(rpt => {
             merged.push({
                ...rpt,
                id: rpt.id || rpt.reportId,
                projectId: project.id,
                teamName: project.teamName || "Unknown Team",
                projectName: project.projectName || "Unknown Project",
                leader: project.leader,
                members: project.members || [],
                jiraUrl: project.jiraUrl || "#",
                githubUrl: project.githubUrl || "#",
                courseCode: project.courseCode || "—",
                courseName: project.courseName || "—",
                score: rpt.score || 0,
                githubCoverage: rpt.githubCoverage || 0,
                fileUrl: rpt.fileUrl || "#",
                submittedAt: rpt.submittedAt || rpt.updatedAt,
                version: rpt.version || "1.0",
                summary: rpt.summary || "No summary provided.",
                notes: rpt.notes || [],
                checklist: rpt.checklist || {
                  introduction: "fail",
                  stakeholders: "fail",
                  functional: "fail",
                  nonFunctional: "fail",
                  useCases: "fail",
                  consistency: "fail"
                },
                history: rpt.history || []
             });
          });
       }
    });

    if (merged.length > 0) {
      setSrsList(merged);
      if (!selected) setSelected(merged[0].id || merged[0].reportId);
    }
  }, [realCourses.length, allProjectsList, reportQueries.map(q => q.dataUpdatedAt).join(',')]);

  useEffect(() => {
    const current = srsList.find((item) => item.id === selected);
    setFeedbackText(current?.feedback || "");
  }, [selected, srsList]);

  const stats = useMemo(() => {
    const totalGroups = allProjectsList.length;
    const submitted = srsList.filter((x) =>
      ["SUBMITTED", "REVIEW", "NEED_REVISION", "APPROVED", "FINAL", "OVERDUE"].includes(x.status)
    ).length;

    return {
      totalGroups,
      submitted,
      notSubmitted: totalGroups - submitted,
      review: srsList.filter((x) => x.status === "REVIEW").length,
      revision: srsList.filter((x) => x.status === "NEED_REVISION").length,
      final: srsList.filter((x) => x.status === "FINAL").length,
      overdue: srsList.filter((x) => x.status === "OVERDUE").length,
    };
  }, [srsList, allProjectsList.length]);

  const filtered = useMemo(() => {
    let data = [...srsList];

    if (statusFilter !== "all") {
      data = data.filter((item) => item.status === statusFilter);
    }

    if (courseFilter !== "all") {
      data = data.filter((item) => item.courseCode === courseFilter);
    }

    if (milestoneFilter !== "all") {
      data = data.filter((item) => item.milestone === milestoneFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (item) =>
          item.teamName.toLowerCase().includes(q) ||
          item.projectName.toLowerCase().includes(q) ||
          item.courseCode.toLowerCase().includes(q) ||
          item.leader.toLowerCase().includes(q)
      );
    }

    data.sort((a, b) => {
      if (sortBy === "latest") return new Date(b.updatedAt) - new Date(a.updatedAt);
      if (sortBy === "deadline") return new Date(a.deadline) - new Date(b.deadline);
      if (sortBy === "score") return (b.score || 0) - (a.score || 0);
      if (sortBy === "coverage") return (b.githubCoverage || 0) - (a.githubCoverage || 0);
      return 0;
    });

    return data;
  }, [srsList, search, statusFilter, courseFilter, milestoneFilter, sortBy]);

  const selectedSrs = useMemo(
    () => srsList.find((item) => item.id === selected),
    [srsList, selected]
  );

  const milestoneOptions = useMemo(() => {
    return [...new Set(srsList.map((x) => x.milestone).filter(Boolean))];
  }, [srsList]);

  const handleSaveFeedback = () => {
    if (!selectedSrs) return;
    success("Đã lưu nhận xét cho nhóm (Local UI Update)");
  };

  const handleStatusUpdate = (id, newStatus) => {
    updateStatusMutation.mutate({ reportId: id, status: newStatus }, {
      onSuccess: () => {
        setSrsList((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: newStatus,
                  updatedAt: new Date().toISOString(),
                }
              : item
          )
        );
        const label = STATUS_META[newStatus]?.label || newStatus;
        success(`Đã cập nhật trạng thái sang "${label}"`);
      },
      onError: (err) => {
         error(`Lỗi cập nhật trạng thái: ${err.message}`);
      }
    });
  };

  const renderStatusChip = (status) => {
    const meta = STATUS_META[status] || STATUS_META.DRAFT;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${meta.chip}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
        {meta.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
        <span className="text-teal-700 font-semibold">Giảng viên</span>
        <ChevronRight size={12} />
        <span className="text-gray-800 font-semibold">SRS Reports</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-800">
            SRS Reports
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý, review và theo dõi tiến độ tài liệu đặc tả yêu cầu phần mềm theo nhóm / project
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl border-gray-200"
            disabled={generateStatsMutation.isPending || courseFilter === 'all'}
            onClick={() => {
              generateStatsMutation.mutate(
                { courseId: realCourses.find(c => c.code === courseFilter)?.id, format: "PDF" },
                {
                  onSuccess: () => success("Đã bắt đầu tạo báo cáo tổng hợp cho lớp."),
                  onError: (err) => error("Lỗi: " + err.message)
                }
              );
            }}
          >
            <Download size={14} className="mr-2" />
            {generateStatsMutation.isPending ? "Đang xử lý..." : "Export Lớp"}
          </Button>
          <Button
            className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white"
            disabled={isSendingAlert}
            onClick={() => {
              const overdueGroups = srsList.filter(s => s.status === 'NOT_SUBMITTED' || s.status === 'NEED_REVISION' || s.status === 'OVERDUE');
              if (overdueGroups.length === 0) {
                success("Không có nhóm nào cần nhắc nhở.");
                return;
              }
              
              overdueGroups.forEach(group => {
                sendAlert({
                   groupId: Number(group.projectId),
                   message: "Nhắc nhở: Tài liệu SRS của nhóm đang trễ hạn hoặc cần chỉnh sửa. Vui lòng cập nhật sớm.",
                   severity: "MEDIUM"
                });
              });
              success(`Đã gửi nhắc nhở cho ${overdueGroups.length} nhóm.`);
            }}
          >
            <MessageSquare size={14} className="mr-2" />
            {isSendingAlert ? "Đang gửi..." : "Nhắc nhóm trễ hạn"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
        {[
          {
            label: "Tổng nhóm",
            value: stats.totalGroups,
            icon: Users,
            cls: "bg-white border-gray-200 text-gray-700",
          },
          {
            label: "Đã nộp",
            value: stats.submitted,
            icon: Upload,
            cls: "bg-sky-50 border-sky-200 text-sky-700",
          },
          {
            label: "Đang review",
            value: stats.review,
            icon: Eye,
            cls: "bg-blue-50 border-blue-200 text-blue-700",
          },
          {
            label: "Cần chỉnh sửa",
            value: stats.revision,
            icon: RefreshCcw,
            cls: "bg-amber-50 border-amber-200 text-amber-700",
          },
          {
            label: "Final",
            value: stats.final,
            icon: CheckCheck,
            cls: "bg-green-50 border-green-200 text-green-700",
          },
          {
            label: "Quá hạn",
            value: stats.overdue,
            icon: AlertTriangle,
            cls: "bg-red-50 border-red-200 text-red-700",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`rounded-2xl border px-4 py-4 shadow-sm ${item.cls}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{item.label}</span>
                <Icon size={15} />
              </div>
              <div className="mt-3 text-2xl font-bold">{item.value}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="rounded-[24px] border border-gray-100 shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
            <div className="xl:col-span-4 relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo nhóm, project, leader, course..."
                className="w-full h-11 rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
              />
            </div>

            <div className="xl:col-span-2">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
              >
                <option value="all">Tất cả môn</option>
                {realCourses.map((course) => (
                  <option key={course.id} value={course.code}>
                    {course.code}
                  </option>
                ))}
              </select>
            </div>

            <div className="xl:col-span-2">
              <select
                value={milestoneFilter}
                onChange={(e) => setMilestoneFilter(e.target.value)}
                className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
              >
                <option value="all">Tất cả milestone</option>
                {milestoneOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="xl:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
              >
                <option value="latest">Mới cập nhật</option>
                <option value="deadline">Sắp đến hạn</option>
                <option value="score">Điểm review</option>
                <option value="coverage">GitHub coverage</option>
              </select>
            </div>

            <div className="xl:col-span-2">
              <div className="h-11 rounded-xl border border-dashed border-teal-200 bg-teal-50/60 flex items-center justify-center gap-2 text-xs font-semibold text-teal-700">
                <Filter size={14} />
                {filtered.length} bản ghi
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-4">
            {[
              { key: "all", label: "Tất cả" },
              { key: "FINAL", label: "Final" },
              { key: "REVIEW", label: "Review" },
              { key: "SUBMITTED", label: "Submitted" },
              { key: "NEED_REVISION", label: "Need Revision" },
              { key: "DRAFT", label: "Draft" },
              { key: "OVERDUE", label: "Overdue" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setStatusFilter(item.key)}
                className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  statusFilter === item.key
                    ? "bg-teal-600 border-teal-600 text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left side */}
        <div className="xl:col-span-7 space-y-6">
          <Card className="rounded-[24px] border border-gray-100 shadow-sm bg-white overflow-hidden">
            <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <div className="col-span-4">Nhóm / Project</div>
              <div className="col-span-1 text-center">Ver</div>
              <div className="col-span-2 text-center">Trạng thái</div>
              <div className="col-span-2 text-center">Hạn nộp</div>
              <div className="col-span-1 text-center">Điểm</div>
              <div className="col-span-2 text-right">Thao tác</div>
            </div>

            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <FileText size={34} className="text-gray-300" />
                  <p className="text-sm text-gray-400 mt-3">
                    Không có SRS nào khớp bộ lọc hiện tại
                  </p>
                </div>
              ) : (
                filtered.map((item) => {
                  const daysLeft = getDaysDiff(item.deadline);
                  const isDanger = item.status === "OVERDUE" || daysLeft < 0;
                  const isWarn = daysLeft <= 2 && daysLeft >= 0;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelected(item.id)}
                      className={`grid grid-cols-12 gap-3 px-5 py-4 items-center border-b border-gray-50 last:border-0 hover:bg-gray-50/70 cursor-pointer transition-colors ${
                        selected === item.id ? "bg-teal-50/40" : ""
                      }`}
                    >
                      <div className="col-span-4 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
                            <FileText size={16} className="text-teal-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {item.teamName}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {item.projectName}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">
                                {item.courseCode}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                                {item.milestone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-1 text-center">
                        <span className="text-xs font-mono text-gray-700">
                          {item.version}
                        </span>
                      </div>

                      <div className="col-span-2 text-center">
                        {renderStatusChip(item.status)}
                      </div>

                      <div className="col-span-2 text-center">
                        <div className="text-xs font-medium text-gray-700">
                          {formatDateShort(item.deadline)}
                        </div>
                        <div
                          className={`text-[10px] mt-1 font-semibold ${
                            isDanger
                              ? "text-red-600"
                              : isWarn
                              ? "text-amber-600"
                              : "text-gray-400"
                          }`}
                        >
                          {isDanger
                            ? "Đã quá hạn"
                            : isWarn
                            ? `${daysLeft} ngày nữa`
                            : "Đúng hạn"}
                        </div>
                      </div>

                      <div className="col-span-1 text-center">
                        <span
                          className={`inline-flex items-center justify-center min-w-[44px] h-7 px-2 rounded-lg border text-xs font-bold ${getScoreColor(
                            item.score
                          )}`}
                        >
                          {item.score ? item.score.toFixed(1) : "—"}
                        </span>
                      </div>

                      <div className="col-span-2 flex items-center justify-end gap-1 flex-wrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(item.id);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-teal-100 bg-teal-50 text-teal-700 text-xs font-semibold hover:bg-teal-100"
                        >
                          <Eye size={11} />
                          View
                        </button>

                        {["SUBMITTED", "REVIEW"].includes(item.status) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(item.id);
                              handleStatusUpdate(item.id, "FINAL");
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-green-100 bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100"
                          >
                            <CheckCircle size={11} />
                            Final
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right side detail */}
        <div className="xl:col-span-5">
          <Card className="rounded-[24px] border border-gray-100 shadow-sm bg-white sticky top-4 overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <FileText size={18} className="text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-gray-800">
                    Chi tiết SRS
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Xem, review và cập nhật trạng thái tài liệu
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              {!selectedSrs ? (
                <div className="py-14 text-center">
                  <FileText size={34} className="text-gray-300 mx-auto" />
                  <p className="text-sm text-gray-400 mt-3">
                    Chọn một SRS để xem chi tiết
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* top info */}
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {selectedSrs.teamName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedSrs.projectName}
                        </p>
                      </div>
                      {renderStatusChip(selectedSrs.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="rounded-xl bg-white border border-gray-100 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Version
                        </p>
                        <p className="text-sm font-mono text-gray-700 mt-1">
                          {selectedSrs.version}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white border border-gray-100 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Điểm review
                        </p>
                        <p className="text-sm font-semibold text-gray-700 mt-1">
                          {selectedSrs.score ? selectedSrs.score.toFixed(1) : "Chưa chấm"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* meta */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-gray-100 p-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users size={15} className="text-teal-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                          Leader
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mt-2">
                        {selectedSrs.leader}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedSrs.members.length} thành viên
                      </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 p-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <CalendarDays size={15} className="text-indigo-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                          Deadline
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mt-2">
                        {formatDateShort(selectedSrs.deadline)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Cập nhật: {formatDate(selectedSrs.updatedAt)}
                      </p>
                    </div>
                  </div>

                  {/* links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <a
                      href={selectedSrs.jiraUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl border border-gray-100 p-4 hover:border-teal-200 hover:bg-teal-50/40 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FolderKanban size={16} className="text-teal-600" />
                        <span className="text-sm font-semibold text-gray-800">
                          Jira Board
                        </span>
                        <ExternalLink size={13} className="text-gray-400 ml-auto" />
                      </div>
                    </a>

                    <a
                      href={selectedSrs.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl border border-gray-100 p-4 hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <GitBranch size={16} className="text-indigo-600" />
                        <span className="text-sm font-semibold text-gray-800">
                          GitHub Repo
                        </span>
                        <ExternalLink size={13} className="text-gray-400 ml-auto" />
                      </div>
                    </a>
                  </div>

                  {/* summary */}
                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Tóm tắt tài liệu
                    </p>
                    <p className="text-sm text-gray-700 leading-6 mt-2">
                      {selectedSrs.summary}
                    </p>
                  </div>

                  {/* review form */}
                  <div className="rounded-2xl border border-teal-100 bg-teal-50/40 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare size={16} className="text-teal-600" />
                      <h4 className="text-sm font-bold text-gray-800">
                        Chấm bài & nhận xét
                      </h4>
                    </div>

                    <textarea
                      rows={5}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Nhập nội dung phản hồi cho nhóm..."
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none resize-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                    />

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Button
                        className="rounded-xl h-11 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleStatusUpdate(selectedSrs.id, "FINAL")}
                      >
                        <CheckCircle size={14} className="mr-2" />
                        Duyệt Final
                      </Button>

                      <Button
                        variant="outline"
                        className="rounded-xl h-11 border-amber-200 text-amber-700 bg-white hover:bg-amber-50"
                        onClick={() =>
                          handleStatusUpdate(selectedSrs.id, "NEED_REVISION")
                        }
                      >
                        <RefreshCcw size={14} className="mr-2" />
                        Yêu cầu sửa
                      </Button>
                    </div>
                  </div>

                  {/* file actions */}
                  <div className="flex items-center gap-2">
                    <a
                      href={selectedSrs.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-gray-200 bg-white"
                      >
                        <ExternalLink size={14} className="mr-2" />
                        Xem file SRS
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}