import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CheckSquare,
  Clock3,
  Download,
  Eye,
  FileText,
  FolderKanban,
  Github,
  GitPullRequest,
  Link2,
  RefreshCw,
  ShieldAlert,
  Target,
  Upload,
  Users,
  AlertTriangle,
  Bell,
} from "lucide-react";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import {
  getStudentProjectById,
  getStudentProjectDetailById,
} from "../../mock/student.mock.js";

function getStatusBadgeClass(status) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "DONE":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-200";
  }
}

function getTaskStatusClass(status) {
  switch (status) {
    case "Done":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "In Progress":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-200";
  }
}

function getSeverityClass(severity) {
  switch (severity) {
    case "high":
      return "bg-red-50 text-red-700 border-red-200";
    case "medium":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
}

function SectionCard({ title, subtitle, actions, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
          <div className="mt-1 text-xs text-slate-500">{hint}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
      </div>
    </div>
  );
}

export default function StudentProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [selectedTab, setSelectedTab] = useState("overview");

  const project = getStudentProjectById(projectId);
  const detail = getStudentProjectDetailById(projectId);

  const maxCommit = useMemo(() => {
    if (!detail?.weeklyCommits?.length) return 1;
    return Math.max(...detail.weeklyCommits.map((item) => item.value), 1);
  }, [detail]);

  if (!project || !detail) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="text-2xl font-bold text-slate-900">Không tìm thấy project</div>
          <p className="mt-2 text-slate-600">Project này không tồn tại trong mock data.</p>
          <Button className="mt-4" onClick={() => navigate("/student")}>
            Quay lại dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleSync = () => {
    success?.(`Đã đồng bộ ${Math.floor(Math.random() * 5) + 2} commits mới từ GitHub`);
  };

  const handleUploadSrs = () => {
    success?.("Upload SRS mock thành công. Phiên bản mới đã được thêm vào danh sách.");
  };

  const handleExport = () => {
    success?.("Export báo cáo project thành công");
  };

  const handleOpenRepo = () => {
    success?.(`Mở mock repository: ${project.repository}`);
  };

  const handleOpenJira = () => {
    success?.(`Mở mock Jira board: ${project.jiraKey}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => navigate("/student")}
                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại dashboard
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {project.role}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                  {project.courseCode}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(project.status)}`}>
                  {project.status}
                </span>
              </div>

              <h1 className="mt-4 text-2xl md:text-3xl font-bold text-slate-900">
                {project.title}
              </h1>
              <p className="mt-2 max-w-3xl text-sm md:text-base text-slate-600">
                {project.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                  Repository: <span className="font-semibold text-slate-900">{project.repository}</span>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                  Jira Key: <span className="font-semibold text-slate-900">{project.jiraKey}</span>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                  Branch: <span className="font-semibold text-slate-900">{project.branch}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="gap-2" onClick={handleOpenRepo}>
                <Github className="h-4 w-4" />
                Repository
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleOpenJira}>
                <FolderKanban className="h-4 w-4" />
                Jira Board
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Github} label="Commits" value={project.commits} hint="Tổng commit cá nhân" />
          <StatCard icon={CheckSquare} label="Issues Done" value={project.issuesDone} hint="Task Jira đã hoàn thành" />
          <StatCard icon={GitPullRequest} label="PR Merged" value={project.prsMerged} hint="Pull request đã merge" />
          <StatCard icon={Target} label="Contribution" value={`${project.myContribution}%`} hint="Điểm đóng góp cá nhân" />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: "overview", label: "Tổng quan" },
            { id: "tasks", label: "Task cá nhân" },
            { id: "team", label: "Team" },
            { id: "srs", label: "SRS" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedTab === tab.id
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {selectedTab === "overview" && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
              <SectionCard
                title="Milestones"
                subtitle="Các mốc chính của project hiện tại"
                actions={
                  <Button variant="outline" className="gap-2" onClick={handleSync}>
                    <RefreshCw className="h-4 w-4" />
                    Sync commits
                  </Button>
                }
              >
                <div className="space-y-4">
                  {detail.milestones.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-slate-900">{item.title}</div>
                          <div className="text-xs text-slate-500">{item.status}</div>
                        </div>
                        <div className="text-sm font-semibold text-slate-700">{item.progress}%</div>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-emerald-500"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Weekly Commit Activity" subtitle="Phân bổ commit 7 ngày gần nhất">
                <div className="flex h-56 items-end justify-between gap-3">
                  {detail.weeklyCommits.map((item) => (
                    <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                      <div className="text-xs font-medium text-slate-500">{item.value}</div>
                      <div className="flex h-44 items-end">
                        <div
                          className="w-8 rounded-t-xl bg-emerald-500"
                          style={{ height: `${(item.value / maxCommit) * 170 + 10}px` }}
                        />
                      </div>
                      <div className="text-xs text-slate-500">{item.label}</div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Hoạt động gần đây" subtitle="Timeline mock cho project">
                <div className="space-y-3">
                  {detail.activities.map((activity) => (
                    <div key={activity.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-slate-900">{activity.text}</div>
                          <div className="mt-1 text-sm text-slate-500">{activity.type.toUpperCase()}</div>
                        </div>
                        <div className="text-xs text-slate-500">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <div className="space-y-6">
              <SectionCard title="Thông tin project" subtitle="Tóm tắt nhanh">
                <div className="space-y-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-slate-500">Sprint completion</div>
                    <div className="mt-1 text-2xl font-bold text-slate-900">{project.sprintCompletion}%</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-slate-500">Open issues</div>
                      <div className="mt-1 font-bold text-slate-900">{project.openIssues}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-slate-500">Team size</div>
                      <div className="mt-1 font-bold text-slate-900">{project.teamSize}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-slate-500">Lines changed</div>
                      <div className="mt-1 font-bold text-slate-900">{project.linesChanged}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-slate-500">SRS versions</div>
                      <div className="mt-1 font-bold text-slate-900">{project.srsVersions}</div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-slate-500">Tech stack</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Deadlines" subtitle="Các việc cần ưu tiên">
                <div className="space-y-3">
                  {detail.deadlines.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-2xl border p-4 ${getSeverityClass(item.severity)}`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5" />
                        <div>
                          <div className="font-semibold">{item.title}</div>
                          <div className="mt-1 text-sm">{item.due}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Quick Actions" subtitle="Hành động demo nhanh">
                <div className="space-y-2">
                  <Button className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleSync}>
                    <RefreshCw className="h-4 w-4" />
                    Sync commits
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={handleUploadSrs}>
                    <Upload className="h-4 w-4" />
                    Upload SRS
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={handleExport}>
                    <Download className="h-4 w-4" />
                    Export báo cáo
                  </Button>
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {selectedTab === "tasks" && (
          <SectionCard
            title="Task cá nhân"
            subtitle="Danh sách task Jira được giao"
            actions={
              <Button variant="outline" className="gap-2" onClick={handleOpenJira}>
                <Link2 className="h-4 w-4" />
                Mở Jira board
              </Button>
            }
          >
            <div className="space-y-3">
              {detail.personalTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {task.key}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getTaskStatusClass(task.status)}`}>
                        {task.status}
                      </span>
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        {task.priority}
                      </span>
                    </div>
                    <div className="mt-2 font-semibold text-slate-900">{task.title}</div>
                    <div className="mt-1 text-sm text-slate-500">Assignee: {task.assignee}</div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Clock3 className="h-4 w-4" />
                      {task.due}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => success?.(`Đã mở mock task ${task.key}`)}
                    >
                      <Eye className="h-4 w-4" />
                      Xem
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {selectedTab === "team" && (
          <SectionCard title="Team Members" subtitle="So sánh đóng góp giữa các thành viên">
            <div className="space-y-3">
              {detail.teamMembers.map((member, index) => (
                <div key={member.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                          #{index + 1}
                        </span>
                        <div className="font-semibold text-slate-900">{member.name}</div>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                          {member.role}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 md:w-[420px]">
                      <div className="rounded-xl bg-slate-50 p-3 text-center">
                        <div className="text-xs text-slate-500">Commits</div>
                        <div className="mt-1 font-bold text-slate-900">{member.commits}</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3 text-center">
                        <div className="text-xs text-slate-500">Done Issues</div>
                        <div className="mt-1 font-bold text-slate-900">{member.issuesDone}</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3 text-center">
                        <div className="text-xs text-slate-500">Score</div>
                        <div className="mt-1 font-bold text-slate-900">{member.score}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {selectedTab === "srs" && (
          <SectionCard
            title="SRS Documents"
            subtitle="Danh sách phiên bản SRS của project"
            actions={
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={handleUploadSrs}>
                <Upload className="h-4 w-4" />
                Upload SRS
              </Button>
            }
          >
            <div className="space-y-3">
              {detail.srsFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-3">
                      <FileText className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{file.version}</div>
                      <div className="text-sm text-slate-500">Updated: {file.updatedAt}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                      {file.status}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => success?.(`Đã mở mock SRS ${file.version}`)}
                    >
                      <Eye className="h-4 w-4" />
                      Xem
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Tóm tắt nhanh</h3>
              <p className="mt-1 text-sm text-slate-600">
                Project đang ở mức {project.sprintCompletion}% sprint completion, contribution cá nhân {project.myContribution}%,
                còn {project.openIssues} open issues và {detail.deadlines.length} deadline cần theo dõi.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="gap-2" onClick={() => navigate("/student")}>
                <BookOpen className="h-4 w-4" />
                Về dashboard
              </Button>
              <Button className="gap-2 bg-slate-900 hover:bg-slate-800" onClick={handleSync}>
                <RefreshCw className="h-4 w-4" />
                Đồng bộ lần nữa
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}