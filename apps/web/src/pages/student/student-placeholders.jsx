import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  GitBranch,
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  BookOpen,
  BarChart2,
  Users,
  Activity,
  FileDown,
  FolderKanban,
  Eye,
  RefreshCw,
  Upload,
  FileText,
  Target,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

/* ───────────────────────── MOCK DATA ───────────────────────── */

const MOCK_COURSES = [
  {
    id: "SE113",
    code: "SE113.SP25",
    name: "Software Engineering",
    lecturerNames: ["TS. Nguyễn Thanh Bình"],
    subject: { code: "SE113" },
    semester: "Spring 2025",
    status: "ACTIVE",
    credits: 3,
    totalStudents: 31,
    progress: 76,
    schedule: "Thứ 2, 7:30 - 9:30",
    room: "BE-204",
    description:
      "Môn học tập trung vào quy trình phát triển phần mềm, quản lý nhóm và tài liệu dự án.",
  },
  {
    id: "SWD392",
    code: "SWD392.SP25",
    name: "SWP Project",
    lecturerNames: ["ThS. Lê Hoàng"],
    subject: { code: "SWD392" },
    semester: "Spring 2025",
    status: "ACTIVE",
    credits: 3,
    totalStudents: 28,
    progress: 68,
    schedule: "Thứ 4, 13:00 - 15:00",
    room: "DE-302",
    description:
      "Môn project thực hành theo nhóm, kết hợp quản lý task và demo sprint định kỳ.",
  },
  {
    id: "PRU211",
    code: "PRU211.SP25",
    name: "C# Programming",
    lecturerNames: ["TS. Trần Minh Hà"],
    subject: { code: "PRU211" },
    semester: "Spring 2025",
    status: "ACTIVE",
    credits: 4,
    totalStudents: 36,
    progress: 84,
    schedule: "Thứ 6, 9:30 - 11:30",
    room: "AL-107",
    description:
      "Môn lập trình với C#, hướng đối tượng, xử lý dữ liệu và ứng dụng desktop/web cơ bản.",
  },
];

const MOCK_PROJECTS = [
  {
    id: "P1",
    courseId: "SE113",
    name: "Jira GitHub Export Tool",
    repositoryName: "jira-gh-export-tool",
    jiraProjectKey: "JGT",
    teamLeaderId: "SE123456",
    course: {
      name: "Software Engineering",
      subject: { code: "SE113" },
    },
    team: [
      { studentId: "SE123456", studentName: "Trần Thị B" },
      { studentId: "SE123111", studentName: "Nguyễn Văn A" },
      { studentId: "SE123222", studentName: "Lê Minh C" },
      { studentId: "SE123333", studentName: "Phạm Khánh D" },
      { studentId: "SE123444", studentName: "Hoàng Gia E" },
    ],
    status: "ACTIVE",
  },
  {
    id: "P2",
    courseId: "SWD392",
    name: "CV Review AI Platform",
    repositoryName: "jobie-cv-review",
    jiraProjectKey: "JOB",
    teamLeaderId: "SE999999",
    course: {
      name: "SWP Project",
      subject: { code: "SWD392" },
    },
    team: [
      { studentId: "SE123456", studentName: "Trần Thị B" },
      { studentId: "SE888111", studentName: "Nguyễn Văn H" },
      { studentId: "SE888222", studentName: "Lê Anh K" },
      { studentId: "SE888333", studentName: "Phạm Duy N" },
    ],
    status: "ACTIVE",
  },
  {
    id: "P3",
    courseId: "PRU211",
    name: "C# Library Management",
    repositoryName: "csharp-library-manager",
    jiraProjectKey: "LIB",
    teamLeaderId: "SE123456",
    course: {
      name: "C# Programming",
      subject: { code: "PRU211" },
    },
    team: [
      { studentId: "SE123456", studentName: "Trần Thị B" },
      { studentId: "SE777111", studentName: "Đỗ Gia P" },
      { studentId: "SE777222", studentName: "Trần Minh T" },
    ],
    status: "ACTIVE",
  },
];

const MOCK_PROJECT_METRICS = {
  P1: {
    totalCommits: 70,
    studentMetrics: [
      { studentId: "SE123456", commitCount: 24 },
      { studentId: "SE123111", commitCount: 18 },
      { studentId: "SE123222", commitCount: 12 },
      { studentId: "SE123333", commitCount: 9 },
      { studentId: "SE123444", commitCount: 7 },
    ],
  },
  P2: {
    totalCommits: 61,
    studentMetrics: [
      { studentId: "SE123456", commitCount: 16 },
      { studentId: "SE888111", commitCount: 22 },
      { studentId: "SE888222", commitCount: 13 },
      { studentId: "SE888333", commitCount: 10 },
    ],
  },
  P3: {
    totalCommits: 49,
    studentMetrics: [
      { studentId: "SE123456", commitCount: 19 },
      { studentId: "SE777111", commitCount: 17 },
      { studentId: "SE777222", commitCount: 13 },
    ],
  },
};

const MOCK_ALERTS = [
  {
    id: "A1",
    severity: "high",
    groupName: "Jira GitHub Export Tool",
    message:
      "Contribution tuần này của bạn thấp hơn tuần trước. Hãy cập nhật task Jira và push tiến độ mới.",
  },
  {
    id: "A2",
    severity: "medium",
    groupName: "CV Review AI Platform",
    message: "Sprint demo còn 3 ngày. Team đang còn 4 task chưa hoàn thành.",
  },
  {
    id: "A3",
    severity: "info",
    groupName: "C# Library Management",
    message: "Admin đã cập nhật trạng thái xử lý cho SRS gần nhất của nhóm bạn.",
  },
];

const MOCK_SRS = {
  P1: [
    {
      id: "S1",
      version: "1.0",
      status: "APPROVED",
      submittedAt: "2026-02-12T08:00:00",
      feedback: "Admin đã duyệt bản này. Tài liệu rõ ràng và đầy đủ.",
      fileUrl: "#",
      receiver: "Admin",
    },
    {
      id: "S2",
      version: "2.0",
      status: "UNDER_REVIEW",
      submittedAt: "2026-02-23T08:00:00",
      feedback: "Admin đang kiểm tra nội dung tài liệu.",
      fileUrl: "#",
      receiver: "Admin",
    },
    {
      id: "S3",
      version: "3.0",
      status: "NEEDS_REVISION",
      submittedAt: "2026-03-09T08:00:00",
      feedback: "Cần bổ sung phần scope và functional requirements trước khi duyệt.",
      fileUrl: "#",
      receiver: "Admin",
    },
  ],
  P2: [
    {
      id: "S4",
      version: "1.0",
      status: "APPROVED",
      submittedAt: "2026-02-18T08:00:00",
      feedback: "Admin đã ghi nhận bản SRS này.",
      fileUrl: "#",
      receiver: "Admin",
    },
    {
      id: "S5",
      version: "2.0",
      status: "SUBMITTED",
      submittedAt: "2026-03-04T08:00:00",
      feedback: "Tài liệu đã được gửi lên hệ thống và đang chờ admin tiếp nhận.",
      fileUrl: "#",
      receiver: "Admin",
    },
  ],
  P3: [
    {
      id: "S6",
      version: "1.0",
      status: "REJECTED",
      submittedAt: "2026-03-06T08:00:00",
      feedback: "File nộp thiếu một số phần bắt buộc, vui lòng upload lại bản hoàn chỉnh.",
      fileUrl: "#",
      receiver: "Admin",
    },
  ],
};

const SRS_STATUS_CLS = {
  SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  NEEDS_REVISION: "bg-red-50 text-red-700 border-red-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-slate-100 text-slate-700 border-slate-200",
};

const ALERT_SEVERITY = {
  high: { cls: "bg-red-50 border-red-100" },
  medium: { cls: "bg-orange-50 border-orange-100" },
  info: { cls: "bg-blue-50 border-blue-100" },
};

/* ───────────────────────── UI helpers ───────────────────────── */

function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-50">
        <Icon size={32} className="text-gray-300" />
      </div>
      <p className="font-semibold text-gray-700">{title}</p>
      {desc ? <p className="text-sm text-gray-400">{desc}</p> : null}
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-gray-800">{title}</h2>
      <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function SummaryCard({ icon: Icon, color, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${color} text-white`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );
}

function Breadcrumb({ title }) {
  const navigate = useNavigate();
  return (
    <nav className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
      <span
        className="cursor-pointer font-semibold text-teal-700 hover:underline"
        onClick={() => navigate("/student")}
      >
        Sinh viên
      </span>
      <ChevronRight size={12} />
      <span className="font-semibold text-gray-800">{title}</span>
    </nav>
  );
}

/* ═══════════ Courses Page ═══════════ */

export default function StudentCoursesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const coursesList = MOCK_COURSES;
  const projectsList = MOCK_PROJECTS;

  return (
    <div className="space-y-6">
      <Breadcrumb title="Lớp của tôi" />
      <SectionHeader
        title="Lớp học của tôi"
        subtitle="Tất cả lớp học phần bạn đang tham gia"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          icon={BookOpen}
          color="bg-teal-500"
          label="Tổng số lớp"
          value={coursesList.length}
        />
        <SummaryCard
          icon={FolderKanban}
          color="bg-blue-500"
          label="Project đang tham gia"
          value={projectsList.length}
        />
        <SummaryCard
          icon={Target}
          color="bg-emerald-500"
          label="Lớp đang hoạt động"
          value={coursesList.filter((c) => c.status === "ACTIVE").length}
        />
      </div>

      {coursesList.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Bạn chưa được đăng ký lớp nào"
          desc="Hiện chưa có khóa học nào hiển thị trong tài khoản này"
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {coursesList.map((course) => {
            const project = projectsList.find((p) => p.courseId === course.id);
            const isLeader = project?.teamLeaderId === user?.id;

            return (
              <Card
                key={course.id}
                className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="h-1 bg-gradient-to-r from-teal-500 to-blue-500" />
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="mb-1 inline-block rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-700">
                        {course.subject?.code || course.code}
                      </p>
                      <h4 className="text-base font-bold text-gray-800">{course.name}</h4>
                      <p className="mt-1 text-xs text-gray-500">
                        {course.lecturerNames?.join(", ") || "Chưa có GV"}
                      </p>
                    </div>

                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700">
                      {course.status}
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-gray-600">{course.description}</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-gray-50 p-3">
                      <p className="text-[11px] text-gray-500">Học kỳ</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">{course.semester}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-3">
                      <p className="text-[11px] text-gray-500">Số tín chỉ</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">{course.credits}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-3">
                      <p className="text-[11px] text-gray-500">Lịch học</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">{course.schedule}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-3">
                      <p className="text-[11px] text-gray-500">Phòng</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">{course.room}</p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                      <span>Tiến độ môn học</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-teal-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  {project ? (
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-800">{project.name}</p>
                          <p className="mt-1 text-[11px] text-gray-500">
                            Repo: {project.repositoryName}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Jira: {project.jiraProjectKey}
                          </p>
                        </div>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                            isLeader
                              ? "border-amber-100 bg-amber-50 text-amber-700"
                              : "border-gray-200 bg-white text-gray-500"
                          }`}
                        >
                          {isLeader ? "Leader" : "Member"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-400">
                      Chưa có project được gán cho lớp này
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => navigate("/student/my-project")}
                    >
                      <FolderKanban size={15} />
                      Nhóm của tôi
                    </Button>

                    {project ? (
                      <Button
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                        onClick={() => navigate(`/student/project/${project.id}`)}
                      >
                        <Eye size={15} />
                        Xem project
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => navigate("/student")}
                      >
                        <ExternalLink size={15} />
                        Về dashboard
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════ My Project Page ═══════════ */

export function StudentMyProjectPage() {
  const navigate = useNavigate();
  const { success } = useToast();
  const { user } = useAuth();

  const myProjects = MOCK_PROJECTS;

  return (
    <div className="space-y-6">
      <Breadcrumb title="Nhóm của tôi" />
      <SectionHeader
        title="Nhóm / Project của tôi"
        subtitle="Danh sách project bạn đang tham gia trong các môn học"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          icon={FolderKanban}
          color="bg-teal-500"
          label="Số project tham gia"
          value={myProjects.length}
        />
        <SummaryCard
          icon={Users}
          color="bg-blue-500"
          label="Vai trò Leader"
          value={myProjects.filter((p) => p.teamLeaderId === user?.id).length}
        />
        <SummaryCard
          icon={Activity}
          color="bg-green-500"
          label="Project đang hoạt động"
          value={myProjects.length}
        />
      </div>

      {myProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Bạn chưa tham gia project nào"
          desc="Khi được thêm vào nhóm, project sẽ hiển thị ở đây"
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {myProjects.map((project) => {
            const isLeader = project.teamLeaderId === user?.id;
            const memberCount = project.team?.length || 0;

            return (
              <Card
                key={project.id}
                className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm"
              >
                <div className="h-1 bg-gradient-to-r from-teal-500 to-blue-500" />
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">{project.name}</h4>
                      <p className="mt-1 text-xs text-gray-500">
                        {project.course?.name || "Lớp học"} · {project.course?.subject?.code || "COURSE"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${
                        isLeader
                          ? "border-amber-100 bg-amber-50 text-amber-700"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      }`}
                    >
                      {isLeader ? "Leader" : "Member"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-gray-50 p-3">
                      <p className="text-[11px] text-gray-500">Repository</p>
                      <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                        {project.repositoryName}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-3">
                      <p className="text-[11px] text-gray-500">Jira Project</p>
                      <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                        {project.jiraProjectKey}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-3">
                      <p className="text-[11px] text-gray-500">Team size</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {memberCount} thành viên
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-3">
                      <p className="text-[11px] text-gray-500">Trạng thái</p>
                      <p className="mt-1 text-sm font-semibold text-emerald-700">ACTIVE</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => navigate(`/student/project/${project.id}`)}
                    >
                      <Eye size={15} />
                      Xem chi tiết
                    </Button>

                    <Button
                      className="gap-2 bg-blue-600 hover:bg-blue-700"
                      onClick={() => success?.(`Đã đồng bộ mock commits cho project ${project.name}`)}
                    >
                      <RefreshCw size={15} />
                      Sync commits
                    </Button>

                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => success?.(`Mở mock upload SRS cho project ${project.name}`)}
                    >
                      <Upload size={15} />
                      Nộp SRS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════ Contribution Page ═══════════ */

export function StudentContributionPage() {
  const { user } = useAuth();
  const myGroups = MOCK_PROJECTS;

  const metricsMap = useMemo(() => {
    const result = {};
    myGroups.forEach((project) => {
      result[project.id] = MOCK_PROJECT_METRICS[project.id];
    });
    return result;
  }, [myGroups]);

  const totalMyCommits = useMemo(() => {
    return myGroups.reduce((sum, project) => {
      const metrics = metricsMap[project.id];
      const myMetric =
        metrics?.studentMetrics?.find((m) => String(m.studentId) === String(user?.id)) || {
          commitCount: 0,
        };
      return sum + myMetric.commitCount;
    }, 0);
  }, [metricsMap, myGroups, user?.id]);

  const activeGroups = useMemo(() => {
    return myGroups.filter((project) => (metricsMap[project.id]?.totalCommits || 0) > 0).length;
  }, [metricsMap, myGroups]);

  return (
    <div className="space-y-6">
      <Breadcrumb title="Đóng góp của tôi" />
      <SectionHeader
        title="Đóng góp của tôi"
        subtitle="Tổng quan commit và đóng góp cá nhân theo nhóm"
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <SummaryCard
          icon={GitBranch}
          color="bg-teal-500"
          label="Tổng commits của tôi"
          value={totalMyCommits}
        />
        <SummaryCard
          icon={Users}
          color="bg-blue-500"
          label="Nhóm tham gia"
          value={myGroups.length}
        />
        <SummaryCard
          icon={Activity}
          color="bg-green-500"
          label="Nhóm có hoạt động"
          value={activeGroups}
        />
      </div>

      {myGroups.length === 0 ? (
        <EmptyState
          icon={BarChart2}
          title="Bạn chưa tham gia nhóm nào"
          desc="Khi có project, contribution sẽ hiển thị ở đây"
        />
      ) : (
        myGroups.map((g) => (
          <ProjectContributionCard key={g.id} project={g} userId={user?.id} />
        ))
      )}
    </div>
  );
}

function ProjectContributionCard({ project, userId }) {
  const metrics = MOCK_PROJECT_METRICS[project.id];
  const members = project.team || [];

  if (!metrics) return null;

  const myMetric =
    metrics.studentMetrics?.find((m) => String(m.studentId) === String(userId)) || {
      commitCount: 0,
    };

  const maxCommits = Math.max(
    ...(metrics.studentMetrics?.map((m) => m.commitCount) || [1]),
    1
  );

  return (
    <Card className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
      <CardHeader className="border-b border-gray-50 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-800">
              {project.name}
            </CardTitle>
            <p className="mt-0.5 text-xs text-gray-400">{project.course?.name || "Lớp học"}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-lg font-bold text-teal-700">{myMetric.commitCount}</p>
              <p className="text-[10px] text-gray-400">My commits</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-700">{metrics.totalCommits || 0}</p>
              <p className="text-[10px] text-gray-400">Total</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-5 py-4">
        {metrics.studentMetrics?.map((m) => {
          const student =
            members.find((s) => String(s.studentId) === String(m.studentId)) || {
              studentName: "Unknown",
            };
          const isMe = String(m.studentId) === String(userId);

          return (
            <div key={m.studentId} className="flex items-center gap-3">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isMe ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {student.studentName?.charAt(0) || "U"}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-700">
                    {student.studentName}
                  </span>
                  {isMe && (
                    <span className="rounded-full border border-teal-100 bg-teal-50 px-1.5 py-0.5 text-[9px] font-bold text-teal-600">
                      Bạn
                    </span>
                  )}
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${isMe ? "bg-teal-500" : "bg-gray-300"}`}
                    style={{ width: `${(m.commitCount / maxCommits) * 100}%` }}
                  />
                </div>
              </div>

              <span className="shrink-0 text-xs font-bold text-gray-600">{m.commitCount}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/* ═══════════ Alerts Page ═══════════ */

export function StudentAlertsPage() {
  const alerts = MOCK_ALERTS;

  const sevCls = {
    high: {
      border: `${ALERT_SEVERITY.high?.cls || "bg-red-50 border-red-100"} border`,
      icon: "text-red-500",
      text: "text-red-800",
    },
    medium: {
      border: `${ALERT_SEVERITY.medium?.cls || "bg-orange-50 border-orange-100"} border`,
      icon: "text-orange-500",
      text: "text-orange-800",
    },
    info: {
      border: "border border-blue-100 bg-blue-50",
      icon: "text-blue-500",
      text: "text-blue-800",
    },
  };

  return (
    <div className="space-y-6">
      <Breadcrumb title="Cảnh báo" />
      <SectionHeader
        title="Cảnh báo cá nhân"
        subtitle="Nhắc nhở từ hệ thống liên quan đến các nhóm của bạn"
      />

      <div className="grid grid-cols-2 gap-4">
        <SummaryCard
          icon={Bell}
          color="bg-orange-400"
          label="Tổng cảnh báo"
          value={alerts.length}
        />
        <SummaryCard
          icon={AlertTriangle}
          color="bg-red-400"
          label="Cần xử lý ngay"
          value={alerts.filter((a) => String(a.severity).toLowerCase() === "high").length}
        />
      </div>

      <Card className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
        <CardContent className="p-0">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-green-50">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <p className="font-semibold text-gray-700">Không có cảnh báo nào!</p>
              <p className="text-sm text-gray-400">
                Tất cả nhóm của bạn đang hoạt động tốt 🎉
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {alerts.map((a, i) => {
                const severity = String(a.severity || "info").toLowerCase();
                const cls = sevCls[severity] || sevCls.info;

                return (
                  <div
                    key={a.id || i}
                    className={`flex items-start gap-3 px-5 py-4 ${cls.border} border-b last:border-0`}
                  >
                    <AlertTriangle size={15} className={`mt-0.5 shrink-0 ${cls.icon}`} />
                    <div className="flex-1">
                      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {a.groupName || "Nhóm"}
                      </p>
                      <p className={`text-sm ${cls.text}`}>{a.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════ SRS Page ═══════════ */

export function StudentSrsPage() {
  const { success } = useToast();
  const myGroups = MOCK_PROJECTS;

  const srsSummary = useMemo(() => {
    const summary = {
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      NEEDS_REVISION: 0,
      APPROVED: 0,
      REJECTED: 0,
    };

    Object.values(MOCK_SRS).forEach((items) => {
      items.forEach((item) => {
        const st = String(item.status || "SUBMITTED").toUpperCase();
        if (summary[st] !== undefined) summary[st] += 1;
      });
    });

    return summary;
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumb title="SRS Reports" />
      <SectionHeader
        title="SRS Reports của nhóm"
        subtitle="Xem lịch sử nộp SRS và phản hồi từ admin"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {["SUBMITTED", "UNDER_REVIEW", "NEEDS_REVISION", "APPROVED", "REJECTED"].map((s) => (
          <div
            key={s}
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${SRS_STATUS_CLS[s]}`}
          >
            <span className="text-[11px] font-semibold">{s}</span>
            <span className="text-xl font-bold">{srsSummary[s]}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => success?.("Mở mock form nộp SRS mới lên admin")}
        >
          <Upload size={16} />
          Nộp SRS mới
        </Button>
      </div>

      <Card className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
        <CardContent className="p-0">
          {myGroups.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Nhóm chưa có SRS nào được nộp"
              desc="Khi có file SRS, danh sách sẽ hiển thị ở đây"
            />
          ) : (
            <div className="divide-y divide-gray-50">
              {myGroups.map((g) => (
                <ProjectSrsRows key={g.id} project={g} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectSrsRows({ project }) {
  const { success } = useToast();
  const srsList = MOCK_SRS[project.id] || [];

  if (srsList.length === 0) return null;

  return (
    <>
      {srsList.map((rpt) => (
        <div
          key={rpt.id}
          className="flex items-center gap-4 border-b border-gray-50 px-5 py-4 transition-colors last:border-0 hover:bg-gray-50/50"
        >
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-gray-700">
                v{rpt.version}
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                  SRS_STATUS_CLS[String(rpt.status || "SUBMITTED").toUpperCase()] ||
                  SRS_STATUS_CLS.SUBMITTED
                }`}
              >
                {rpt.status}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {rpt.receiver || "Admin"}
              </span>
            </div>

            <p className="truncate text-xs text-gray-500">
              {project.name} · {project.course?.name || "Lớp"}
            </p>

            {rpt.feedback ? (
              <p className="mt-0.5 text-xs italic text-blue-600">
                Phản hồi admin: {rpt.feedback}
              </p>
            ) : null}

            <div className="mt-1.5 flex items-center justify-between">
              <p className="flex items-center gap-1 text-[10px] text-gray-400">
                <Clock size={9} />
                {new Date(rpt.submittedAt).toLocaleDateString("vi-VN")}
              </p>

              <div className="flex items-center gap-2">
                <a
                  href={rpt.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] font-bold text-teal-600 hover:underline"
                >
                  <FileDown size={10} />
                  Tải file
                </a>

                <button
                  type="button"
                  onClick={() => success?.(`Đã mở mock file SRS v${rpt.version}`)}
                  className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline"
                >
                  <Eye size={10} />
                  Xem
                </button>

                <button
                  type="button"
                  onClick={() => success?.(`Mở mock nộp lại SRS version mới cho ${project.name}`)}
                  className="flex items-center gap-1 text-[10px] font-bold text-orange-600 hover:underline"
                >
                  <Upload size={10} />
                  Nộp lại
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}