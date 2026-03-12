// SRS Reports — Lecturer (Mock Data Ready)
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

/* --------------------------------- MOCK --------------------------------- */

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

const COURSES = [
  { id: "c1", code: "SWD392", name: "Software Architecture & Design" },
  { id: "c2", code: "PRU211", name: "C# Programming" },
];

const PROJECTS = [
  {
    id: "p1",
    courseId: "c1",
    teamName: "Team Alpha",
    projectName: "Dormitory Issue Tracker",
    leader: "Nguyễn Văn An",
    members: ["An", "Bình", "Hà", "Minh", "Linh"],
    jiraUrl: "https://jira.example.com/alpha",
    githubUrl: "https://github.com/example/team-alpha",
  },
  {
    id: "p2",
    courseId: "c1",
    teamName: "Team Beta",
    projectName: "FPTU Club Event Hub",
    leader: "Trần Mỹ Duyên",
    members: ["Duyên", "Khánh", "Phong", "Trang"],
    jiraUrl: "https://jira.example.com/beta",
    githubUrl: "https://github.com/example/team-beta",
  },
  {
    id: "p3",
    courseId: "c1",
    teamName: "Team Gamma",
    projectName: "Lab Asset Booking",
    leader: "Lê Hoàng Long",
    members: ["Long", "Nhi", "Vũ", "Thảo", "Phát"],
    jiraUrl: "https://jira.example.com/gamma",
    githubUrl: "https://github.com/example/team-gamma",
  },
  {
    id: "p4",
    courseId: "c1",
    teamName: "Team Delta",
    projectName: "Medical Appointment Queue",
    leader: "Phạm Quốc Huy",
    members: ["Huy", "Loan", "Tú", "Yến"],
    jiraUrl: "https://jira.example.com/delta",
    githubUrl: "https://github.com/example/team-delta",
  },
  {
    id: "p5",
    courseId: "c1",
    teamName: "Team Epsilon",
    projectName: "Student Complaint Portal",
    leader: "Đinh Gia Hân",
    members: ["Hân", "Dũng", "Hương", "Nhật"],
    jiraUrl: "https://jira.example.com/epsilon",
    githubUrl: "https://github.com/example/team-epsilon",
  },
  {
    id: "p6",
    courseId: "c1",
    teamName: "Team Zeta",
    projectName: "Canteen Smart Ordering",
    leader: "Võ Thành Công",
    members: ["Công", "Uyên", "Thảo", "Hiếu", "Kha"],
    jiraUrl: "https://jira.example.com/zeta",
    githubUrl: "https://github.com/example/team-zeta",
  },
];

const MOCK_SRS = [
  {
    id: "srs-001",
    projectId: "p1",
    version: "v2.1",
    status: "FINAL",
    milestone: "Final SRS",
    submittedAt: "2026-03-10T08:30:00",
    updatedAt: "2026-03-10T10:15:00",
    deadline: "2026-03-12T23:59:00",
    reviewer: "Lê Thị Mai",
    feedback:
      "Tài liệu khá đầy đủ, actors và use cases rõ ràng. Cần giữ consistency giữa mục non-functional requirements và backlog Jira.",
    score: 9.0,
    checklist: {
      introduction: "pass",
      stakeholders: "pass",
      functional: "pass",
      nonFunctional: "warning",
      useCases: "pass",
      consistency: "pass",
    },
    jiraMapped: 18,
    githubCoverage: 76,
    commentsCount: 7,
    fileUrl: "#",
    summary:
      "Hệ thống quản lý phản ánh ký túc xá với các chức năng gửi phản ánh, xử lý yêu cầu, theo dõi tiến độ và dashboard cho quản trị viên.",
    notes: [
      "NFR cần mô tả rõ response time.",
      "Một số acceptance criteria có thể tách nhỏ hơn.",
    ],
    history: [
      { version: "v1.0", date: "2026-03-03 09:00", author: "Nguyễn Văn An" },
      { version: "v1.1", date: "2026-03-05 14:20", author: "Nguyễn Văn An" },
      { version: "v2.0", date: "2026-03-08 20:40", author: "Nguyễn Văn An" },
      { version: "v2.1", date: "2026-03-10 08:30", author: "Nguyễn Văn An" },
    ],
  },
  {
    id: "srs-002",
    projectId: "p2",
    version: "v1.4",
    status: "REVIEW",
    milestone: "SRS Round 2",
    submittedAt: "2026-03-10T13:20:00",
    updatedAt: "2026-03-10T13:20:00",
    deadline: "2026-03-12T23:59:00",
    reviewer: "Lê Thị Mai",
    feedback:
      "Đã cải thiện so với bản trước. Cần mô tả rõ hơn phân quyền giữa club admin và member.",
    score: 8.1,
    checklist: {
      introduction: "pass",
      stakeholders: "pass",
      functional: "warning",
      nonFunctional: "pass",
      useCases: "pass",
      consistency: "warning",
    },
    jiraMapped: 15,
    githubCoverage: 58,
    commentsCount: 5,
    fileUrl: "#",
    summary:
      "Nền tảng quản lý sự kiện CLB, đăng ký tham gia, check-in QR và quản lý truyền thông.",
    notes: [
      "Thiếu alternate flow cho huỷ đăng ký.",
      "Backlog Jira có 2 story chưa phản ánh trong SRS.",
    ],
    history: [
      { version: "v1.0", date: "2026-03-01 08:10", author: "Trần Mỹ Duyên" },
      { version: "v1.2", date: "2026-03-06 11:45", author: "Trần Mỹ Duyên" },
      { version: "v1.4", date: "2026-03-10 13:20", author: "Trần Mỹ Duyên" },
    ],
  },
  {
    id: "srs-003",
    projectId: "p3",
    version: "v1.1",
    status: "NEED_REVISION",
    milestone: "SRS Round 1",
    submittedAt: "2026-03-08T09:00:00",
    updatedAt: "2026-03-08T09:00:00",
    deadline: "2026-03-09T23:59:00",
    reviewer: "Lê Thị Mai",
    feedback:
      "Cần bổ sung non-functional requirements, đặc biệt là concurrency và audit log. Use case chưa đủ chi tiết.",
    score: 6.4,
    checklist: {
      introduction: "pass",
      stakeholders: "warning",
      functional: "warning",
      nonFunctional: "fail",
      useCases: "fail",
      consistency: "warning",
    },
    jiraMapped: 9,
    githubCoverage: 34,
    commentsCount: 8,
    fileUrl: "#",
    summary:
      "Hệ thống đặt lịch mượn thiết bị phòng lab, phê duyệt yêu cầu và thống kê sử dụng tài sản.",
    notes: [
      "Thiếu boundary condition cho double booking.",
      "Chưa có traceability requirement -> issue.",
    ],
    history: [
      { version: "v1.0", date: "2026-03-04 15:00", author: "Lê Hoàng Long" },
      { version: "v1.1", date: "2026-03-08 09:00", author: "Lê Hoàng Long" },
    ],
  },
  {
    id: "srs-004",
    projectId: "p4",
    version: "v0.9",
    status: "DRAFT",
    milestone: "SRS Round 1",
    submittedAt: "2026-03-10T17:45:00",
    updatedAt: "2026-03-10T17:45:00",
    deadline: "2026-03-12T23:59:00",
    reviewer: "—",
    feedback: "",
    score: 0,
    checklist: {
      introduction: "warning",
      stakeholders: "warning",
      functional: "warning",
      nonFunctional: "warning",
      useCases: "warning",
      consistency: "warning",
    },
    jiraMapped: 5,
    githubCoverage: 11,
    commentsCount: 0,
    fileUrl: "#",
    summary:
      "Ứng dụng xếp hàng khám bệnh và đặt lịch, hỗ trợ quản lý bệnh nhân và theo dõi lượt khám.",
    notes: ["Bản nháp, chưa submit review."],
    history: [{ version: "v0.9", date: "2026-03-10 17:45", author: "Phạm Quốc Huy" }],
  },
  {
    id: "srs-005",
    projectId: "p5",
    version: "v1.0",
    status: "OVERDUE",
    milestone: "SRS Round 1",
    submittedAt: "2026-03-07T10:10:00",
    updatedAt: "2026-03-07T10:10:00",
    deadline: "2026-03-08T23:59:00",
    reviewer: "—",
    feedback: "Nhóm chưa resubmit sau khi được nhắc nhở.",
    score: 0,
    checklist: {
      introduction: "fail",
      stakeholders: "fail",
      functional: "fail",
      nonFunctional: "fail",
      useCases: "fail",
      consistency: "fail",
    },
    jiraMapped: 3,
    githubCoverage: 4,
    commentsCount: 1,
    fileUrl: "#",
    summary:
      "Cổng tiếp nhận phản ánh sinh viên với phân loại khiếu nại, xử lý ticket và theo dõi phản hồi.",
    notes: [
      "Trễ deadline.",
      "SRS chưa đạt mức tối thiểu để review.",
    ],
    history: [{ version: "v1.0", date: "2026-03-07 10:10", author: "Đinh Gia Hân" }],
  },
  {
    id: "srs-006",
    projectId: "p6",
    version: "v1.3",
    status: "SUBMITTED",
    milestone: "SRS Round 2",
    submittedAt: "2026-03-10T19:30:00",
    updatedAt: "2026-03-10T19:30:00",
    deadline: "2026-03-12T23:59:00",
    reviewer: "Chưa phân công",
    feedback: "",
    score: 0,
    checklist: {
      introduction: "pass",
      stakeholders: "pass",
      functional: "warning",
      nonFunctional: "warning",
      useCases: "pass",
      consistency: "warning",
    },
    jiraMapped: 13,
    githubCoverage: 49,
    commentsCount: 0,
    fileUrl: "#",
    summary:
      "Hệ thống đặt món căn tin thông minh, thanh toán nhanh và dự đoán thời gian nhận món.",
    notes: [
      "Mới submit, chưa vào vòng review.",
    ],
    history: [
      { version: "v1.0", date: "2026-03-05 09:35", author: "Võ Thành Công" },
      { version: "v1.2", date: "2026-03-08 21:15", author: "Võ Thành Công" },
      { version: "v1.3", date: "2026-03-10 19:30", author: "Võ Thành Công" },
    ],
  },
];

/* -------------------------------- HELPERS -------------------------------- */

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
  const { success } = useToast();

  const [srsList, setSrsList] = useState([]);
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [milestoneFilter, setMilestoneFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [feedbackText, setFeedbackText] = useState("");

  useEffect(() => {
    const merged = MOCK_SRS.map((srs) => {
      const project = PROJECTS.find((p) => p.id === srs.projectId);
      const course = COURSES.find((c) => c.id === project?.courseId);

      return {
        ...srs,
        teamName: project?.teamName || "Unknown Team",
        projectName: project?.projectName || "Unknown Project",
        leader: project?.leader || "—",
        members: project?.members || [],
        jiraUrl: project?.jiraUrl || "#",
        githubUrl: project?.githubUrl || "#",
        courseCode: course?.code || "—",
        courseName: course?.name || "—",
      };
    });

    setSrsList(merged);
    if (merged.length) setSelected(merged[0].id);
  }, []);

  useEffect(() => {
    const current = srsList.find((item) => item.id === selected);
    setFeedbackText(current?.feedback || "");
  }, [selected, srsList]);

  const stats = useMemo(() => {
    const totalGroups = PROJECTS.length;
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
  }, [srsList]);

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
    return [...new Set(srsList.map((x) => x.milestone))];
  }, [srsList]);

  const handleSaveFeedback = () => {
    if (!selectedSrs) return;

    setSrsList((prev) =>
      prev.map((item) =>
        item.id === selectedSrs.id
          ? {
              ...item,
              feedback: feedbackText,
              commentsCount: (item.commentsCount || 0) + 1,
              reviewer: item.reviewer === "—" ? "Lê Thị Mai" : item.reviewer,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );

    success("Đã lưu nhận xét cho nhóm");
  };

  const handleStatusUpdate = (id, newStatus) => {
    setSrsList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
              feedback: feedbackText || item.feedback,
              reviewer:
                item.reviewer === "—" || item.reviewer === "Chưa phân công"
                  ? "Lê Thị Mai"
                  : item.reviewer,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );

    const label = STATUS_META[newStatus]?.label || newStatus;
    success(`Đã cập nhật trạng thái sang "${label}"`);
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
            onClick={() => success("Mock export báo cáo thành công")}
          >
            <Download size={14} className="mr-2" />
            Export
          </Button>
          <Button
            className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white"
            onClick={() => success("Đã gửi nhắc nhở cho các nhóm overdue")}
          >
            <MessageSquare size={14} className="mr-2" />
            Nhắc nhóm trễ hạn
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
                {COURSES.map((course) => (
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

                        {(item.status === "OVERDUE" ||
                          item.status === "NEED_REVISION") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              success(`Đã gửi nhắc nhở cho ${item.teamName}`);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-amber-100 bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100"
                          >
                            <MessageSquare size={11} />
                            Nhắc
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Bottom insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="rounded-[24px] border border-gray-100 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-gray-800">
                  Cảnh báo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {srsList
                  .filter((x) => ["OVERDUE", "NEED_REVISION"].includes(x.status))
                  .slice(0, 3)
                  .map((x) => (
                    <div
                      key={x.id}
                      className="rounded-2xl border border-red-100 bg-red-50/70 p-3"
                    >
                      <p className="text-sm font-semibold text-gray-800">
                        {x.teamName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {x.status === "OVERDUE"
                          ? "Đã quá hạn nộp hoặc resubmit"
                          : "Cần chỉnh sửa và nộp lại"}
                      </p>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border border-gray-100 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-gray-800">
                  Jira coverage thấp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[...srsList]
                  .sort((a, b) => a.jiraMapped - b.jiraMapped)
                  .slice(0, 3)
                  .map((x) => (
                    <div
                      key={x.id}
                      className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3"
                    >
                      <p className="text-sm font-semibold text-gray-800">
                        {x.teamName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Mapped Jira issues: {x.jiraMapped}
                      </p>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border border-gray-100 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-gray-800">
                  GitHub coverage tốt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[...srsList]
                  .sort((a, b) => b.githubCoverage - a.githubCoverage)
                  .slice(0, 3)
                  .map((x) => (
                    <div
                      key={x.id}
                      className="rounded-2xl border border-green-100 bg-green-50/70 p-3"
                    >
                      <p className="text-sm font-semibold text-gray-800">
                        {x.teamName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Coverage: {x.githubCoverage}%
                      </p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
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
                      <p className="text-xs text-gray-500 mt-2">
                        {selectedSrs.jiraMapped} issues được map từ SRS
                      </p>
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
                      <p className="text-xs text-gray-500 mt-2">
                        Coverage thực thi: {selectedSrs.githubCoverage}%
                      </p>
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

                    {selectedSrs.notes?.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {selectedSrs.notes.map((note, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2 text-xs text-amber-800"
                          >
                            {note}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* checklist */}
                  <div className="rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldAlert size={16} className="text-amber-600" />
                      <h4 className="text-sm font-bold text-gray-800">
                        Review checklist
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {[
                        ["Giới thiệu & phạm vi", selectedSrs.checklist.introduction],
                        ["Stakeholders / actors", selectedSrs.checklist.stakeholders],
                        ["Functional requirements", selectedSrs.checklist.functional],
                        ["Non-functional requirements", selectedSrs.checklist.nonFunctional],
                        ["Use cases / flows", selectedSrs.checklist.useCases],
                        ["Consistency với Jira/GitHub", selectedSrs.checklist.consistency],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2.5"
                        >
                          <span className="text-sm text-gray-700">{label}</span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${checklistBadge(
                              value
                            )}`}
                          >
                            {checklistLabel(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* version history */}
                  <div className="rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock3 size={16} className="text-sky-600" />
                      <h4 className="text-sm font-bold text-gray-800">
                        Lịch sử version
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {selectedSrs.history.map((h, idx) => (
                        <div
                          key={`${h.version}-${idx}`}
                          className="flex items-center justify-between rounded-xl bg-gray-50/70 border border-gray-100 px-3 py-2.5"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {h.version}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {h.author}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">{h.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* review form */}
                  <div className="rounded-2xl border border-teal-100 bg-teal-50/40 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare size={16} className="text-teal-600" />
                      <h4 className="text-sm font-bold text-gray-800">
                        Chấm bài & nhận xét
                      </h4>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="rounded-xl bg-white border border-gray-100 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Reviewer
                        </p>
                        <p className="text-sm font-semibold text-gray-800 mt-1">
                          {selectedSrs.reviewer}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white border border-gray-100 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Submitted
                        </p>
                        <p className="text-sm font-semibold text-gray-800 mt-1">
                          {formatDate(selectedSrs.submittedAt)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white border border-gray-100 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Feedbacks
                        </p>
                        <p className="text-sm font-semibold text-gray-800 mt-1">
                          {selectedSrs.commentsCount}
                        </p>
                      </div>
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

                      <Button
                        variant="outline"
                        className="rounded-xl h-11 border-blue-200 text-blue-700 bg-white hover:bg-blue-50"
                        onClick={() => handleStatusUpdate(selectedSrs.id, "REVIEW")}
                      >
                        <Eye size={14} className="mr-2" />
                        Chuyển review
                      </Button>

                      <Button
                        variant="outline"
                        className="rounded-xl h-11 border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                        onClick={handleSaveFeedback}
                      >
                        <MessageSquare size={14} className="mr-2" />
                        Chỉ lưu nhận xét
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button
                        variant="outline"
                        className="rounded-xl h-10 border-red-200 text-red-700 bg-white hover:bg-red-50"
                        onClick={() => handleStatusUpdate(selectedSrs.id, "OVERDUE")}
                      >
                        <AlertTriangle size={14} className="mr-2" />
                        Đánh dấu quá hạn
                      </Button>

                      <Button
                        variant="outline"
                        className="rounded-xl h-10 border-teal-200 text-teal-700 bg-white hover:bg-teal-50"
                        onClick={() =>
                          success(`Đã gửi thông báo cho ${selectedSrs.teamName}`)
                        }
                      >
                        <MessageSquare size={14} className="mr-2" />
                        Gửi thông báo nhóm
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

                    <Button
                      variant="outline"
                      className="rounded-xl border-gray-200 bg-white"
                      onClick={() =>
                        success(`Mock tải xuống file của ${selectedSrs.teamName}`)
                      }
                    >
                      <Download size={14} />
                    </Button>
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