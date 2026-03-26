// student-project.jsx — Enterprise SaaS Project Workspace
// Logic: giữ nguyên (useParams, useAuth, getProjectById, getCommitsByProject, getSrsReportsByProject...)
// UI: redesign theo design system Admin/Lecturer

import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { Modal } from "../../components/ui/interactive.jsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/interactive.jsx";
import { useLinkIntegration } from "../../features/projects/hooks/useProjects.js";
import { getProjectById, getProjectKanban, getProjectMetrics, getProjectCommits, getProjectRoadmap, getProjects } from "../../features/projects/api/projectApi.js";
import { getProjectSrs } from "../../features/srs/api/srsApi.js";
import { useToast } from "../../components/ui/toast.jsx";
import {
  ChevronRight, GitCommit, Link2, BarChart2,
  Users, FileText, ArrowLeft, Github, Upload,
  CheckCircle, Clock, Star, AlertCircle
} from "lucide-react";

export default function StudentProject() {
  const { projectId } = useParams();
  const projectIdParam = projectId == null ? null : String(projectId);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("commits");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [project, setProject] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [commitData, setCommitData] = useState(null);
  const [jiraBoard, setJiraBoard] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [srsReports, setSrsReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolvedProjectId, setResolvedProjectId] = useState(projectIdParam || String(user?.projectId ?? user?.project?.id ?? "") || null);
  
  const [githubUrl, setGithubUrl] = useState("");
  const [jiraUrl, setJiraUrl] = useState("");
  const [jiraToken, setJiraToken] = useState("");
  const [githubToken, setGithubToken] = useState("");

  const { success, error: showError } = useToast();

  const { mutate: linkIntegrationMutate } = useLinkIntegration();

  useEffect(() => {
    let isMounted = true;
    async function resolveProjectId() {
      const role = user?.role;
      if (role === "LECTURER") {
        const fromUrl = projectIdParam || searchParams.get("projectId");
        if (isMounted) setResolvedProjectId(fromUrl || null);
        return;
      }
      const fromUser = user?.projectId || user?.project?.id;
      if (fromUser) {
        if (isMounted) setResolvedProjectId(String(fromUser));
        return;
      }
      const courseId = searchParams.get("courseId");
      if (courseId) {
        try {
          const list = await getProjects({ courseId, pageSize: 100 });
          const first = list?.items?.[0];
          if (isMounted) setResolvedProjectId(first ? String(first.id) : null);
          return;
        } catch {
          if (isMounted) setResolvedProjectId(null);
          return;
        }
      }
      if (isMounted) setResolvedProjectId(projectIdParam || null);
    }
    resolveProjectId();
    return () => {
      isMounted = false;
    };
  }, [projectIdParam, searchParams, user]);

  useEffect(() => {
    let isMounted = true;
    async function loadProjectData() {
      if (!resolvedProjectId) {
        setIsLoading(false);
        setError("Không tìm thấy projectId phù hợp cho tài khoản hiện tại");
        return;
      }
      setIsLoading(true);
      setError("");
      try {
        const [projectRes, metricsRes, commitsRes, kanbanRes, roadmapRes, srsRes] = await Promise.all([
          getProjectById(resolvedProjectId),
          getProjectMetrics(resolvedProjectId),
          getProjectCommits(resolvedProjectId, { page: 1, pageSize: 50 }),
          getProjectKanban(resolvedProjectId),
          getProjectRoadmap(resolvedProjectId),
          getProjectSrs(resolvedProjectId),
        ]);
        if (!isMounted) return;
        setProject(projectRes);
        setMetrics(metricsRes);
        setCommitData(commitsRes);
        setJiraBoard(kanbanRes);
        setRoadmap(roadmapRes);
        setSrsReports(Array.isArray(srsRes) ? srsRes : []);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message || "Không thể tải dữ liệu project");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadProjectData();
    return () => {
      isMounted = false;
    };
  }, [resolvedProjectId]);

  const allCommits = Array.isArray(commitData?.items) ? commitData.items : [];
  // Filter commits for current student using email or name if student_user is joined
  const myCommits = allCommits.filter(c => {
    const author = c?.authorName?.toLowerCase?.() ?? "";
    const userName = (user?.name ?? user?.fullName ?? "").toLowerCase();
    const emailPrefix = (user?.email?.split?.("@")?.[0] ?? "").toLowerCase();
    return (userName && author.includes(userName)) || (emailPrefix && author.includes(emailPrefix));
  }
  );
  
  const jiraIssues = useMemo(() => {
    if (!jiraBoard) return [];
    const todo = Array.isArray(jiraBoard?.todo) ? jiraBoard.todo : [];
    const inProgress = Array.isArray(jiraBoard?.in_progress) ? jiraBoard.in_progress : [];
    const done = Array.isArray(jiraBoard?.done) ? jiraBoard.done : [];
    return [
      ...todo.map((x) => ({ ...x, _status: "To Do" })),
      ...inProgress.map((x) => ({ ...x, _status: "In Progress" })),
      ...done.map((x) => ({ ...x, _status: "Done" })),
    ];
  }, [jiraBoard]);
  const safeJiraIssues = Array.isArray(jiraIssues) ? jiraIssues : [];

  const myTeamMember = (Array.isArray(project?.team) ? project.team : []).find(
    (m) => String(m?.studentUserId ?? m?.studentId ?? m?.userId) === String(user?.id)
  );
  const myRole = myTeamMember?.role || "MEMBER";
  const isLeader = myRole === "LEADER";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
        <p className="text-sm text-gray-500 font-medium">Đang tải dữ liệu dự án...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <AlertCircle size={36} className="text-red-300" />
        <p className="text-sm text-red-600 font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 px-5 py-2 rounded-xl transition-colors">
          Tải lại
        </button>
      </div>
    );
  }

  /* ── Not found ── */
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertCircle size={36} className="text-gray-300" />
        <h3 className="text-lg font-bold text-gray-700">Project không tồn tại</h3>
        <button onClick={() => navigate("/student")} className="text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 px-5 py-2 rounded-xl transition-colors">
          ← Quay lại Dashboard
        </button>
      </div>
    );
  }

  /* ── Status helpers ── */
  const ghStatus = project.integration?.githubRepoName
    ? { cls: "bg-green-50 text-green-700 border-green-100", label: "Linked" }
    : { cls: "bg-gray-100 text-gray-400 border-gray-200", label: "Not linked" };
  const jiraStatus = project.integration?.jiraProjectKey
    ? { cls: "bg-blue-50 text-blue-700 border-blue-100", label: "Linked" }
    : { cls: "bg-gray-100 text-gray-400 border-gray-200", label: "Not linked" };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
        <span className="text-teal-700 font-semibold cursor-pointer hover:underline" onClick={() => navigate("/student")}>Sinh viên</span>
        <ChevronRight size={12} />
        <span className="text-gray-800 font-semibold truncate">{project?.name ?? `Project (ID: ${project?.id ?? "N/A"})`}</span>
      </nav>

      {/* ── A. Project Header ── */}
      <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
        <div className="h-1 bg-gradient-to-r from-teal-500 to-teal-600" />
        <CardContent className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${isLeader ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-teal-50 text-teal-700 border-teal-100"
                  }`}>
                  {isLeader ? "⭐ Team Leader" : "Team Member"}
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-gray-800">{project?.name ?? `Project (ID: ${project?.id ?? "N/A"})`}</h2>
              {project.description && <p className="text-sm text-gray-500 mt-0.5">{project.description}</p>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${ghStatus.cls}`}>
                <Github size={12} />GitHub: {ghStatus.label}
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${jiraStatus.cls}`}>
                <Link2 size={12} />Jira: {jiraStatus.label}
              </div>
              
              {isLeader && (project.integration?.githubStatus !== "APPROVED") && (
                <button
                  onClick={() => {
                    setGithubUrl(project.integration?.githubUrl || "");
                    setJiraUrl(project.integration?.jiraUrl || "");
                    setJiraToken("");
                    setGithubToken("");
                    setIsLinkModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <Link2 size={12} />Kết nối GitHub/Jira
                </button>
              )}

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 px-3 py-1.5 rounded-xl transition-colors"
              >
                <Upload size={12} />Upload SRS
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── B. Quick Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "My Commits", value: myCommits.length, color: "bg-blue-500", icon: <GitCommit size={18} /> },
          { label: "Total Commits", value: metrics?.githubStats?.totalCommits || 0, color: "bg-teal-500", icon: <BarChart2 size={18} /> },
          { label: "Issues Done", value: metrics?.jiraStats?.done || 0, color: "bg-indigo-500", icon: <Star size={18} /> },
          { label: "Thành viên", value: Array.isArray(project?.team) ? project.team.length : 0, color: "bg-purple-500", icon: <Users size={18} /> },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-all">
            <div className={`w-11 h-11 rounded-2xl ${color} text-white flex items-center justify-center shrink-0`}>{icon}</div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="text-xl font-bold text-gray-800 leading-none mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs: Commits / Jira / Team / SRS ── */}
      <Tabs defaultValue="commits" activeTab={activeTab} setActiveTab={setActiveTab}>
        <TabsList>
          <TabsTrigger key="commits" value="commits">Commits ({myCommits.length})</TabsTrigger>
          <TabsTrigger key="jira" value="jira">Jira Tasks</TabsTrigger>
          <TabsTrigger key="team" value="team">Nhóm</TabsTrigger>
          <TabsTrigger key="roadmap" value="roadmap">Roadmap</TabsTrigger>
          <TabsTrigger key="srs" value="srs">SRS</TabsTrigger>
        </TabsList>

        {/* ── Commits tab ── */}
        <TabsContent value="commits">
          <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-base font-semibold text-gray-800">Lịch sử Commits của tôi</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {myCommits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-2">
                  <GitCommit size={28} className="text-gray-300" />
                  <p className="text-sm text-gray-400">Bạn chưa có commit nào trong project này</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-2">SHA</div>
                    <div className="col-span-5">Message</div>
                    <div className="col-span-2 text-center">Ngày</div>
                    <div className="col-span-2 text-center">Thay đổi</div>
                    <div className="col-span-1 text-center">Files</div>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {myCommits.map((commit, idx) => (
                      <div key={commit.id} className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-gray-50/50 transition-colors">
                        <div className="col-span-2 font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
                          {commit.sha?.substring(0, 7)}
                        </div>
                        <div className="col-span-5 min-w-0">
                          <p className="text-sm text-gray-700 font-medium truncate">{commit?.message ?? commit?.commitMessage ?? `Commit #${commit?.id ?? idx + 1}`}</p>
                          <p className="text-[11px] text-gray-500 truncate">
                            {commit?.authorName ?? commit?.author?.name ?? commit?.author?.login ?? "Unknown Author"}
                          </p>
                        </div>
                        <div className="col-span-2 text-center text-xs text-gray-500">
                          {new Date(commit.date || commit.committedAt || Date.now()).toLocaleDateString("vi-VN")}
                        </div>
                        <div className="col-span-2 text-center text-xs">
                          <span className="text-green-600 font-semibold">+{commit.additions}</span>
                          <span className="text-red-500 font-semibold ml-1">-{commit.deletions}</span>
                        </div>
                        <div className="col-span-1 text-center text-xs text-gray-500">{commit.files?.length}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roadmap">
          <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-base font-semibold text-gray-800">Roadmap</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {!roadmap ? (
                <div className="text-sm text-gray-400 py-8 text-center">Không có dữ liệu roadmap cho project này</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase">Sprints</p>
                    {(roadmap.sprints || []).length === 0 ? (
                      <p className="text-sm text-gray-400 mt-2">Chưa có sprint</p>
                    ) : (roadmap.sprints || []).map((sp, i) => (
                      <div key={sp.id ?? i} className="mt-2 text-sm text-gray-700">
                        {sp.name ?? `Sprint ${i + 1}`}
                      </div>
                    ))}
                  </div>
                  <div className="border border-gray-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase">Milestones</p>
                    {(roadmap.milestones || []).length === 0 ? (
                      <p className="text-sm text-gray-400 mt-2">Chưa có milestone</p>
                    ) : (roadmap.milestones || []).map((ms, i) => (
                      <div key={ms.id ?? i} className="mt-2 text-sm text-gray-700">
                        {ms.name ?? `Milestone ${i + 1}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Jira tab ── */}
        <TabsContent value="jira">
          <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-base font-semibold text-gray-800">Jira Tasks</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {!metrics?.jiraStats ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Link2 size={28} className="text-gray-300" />
                  <p className="text-sm text-gray-400">Không có dữ liệu Jira cho project này</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Total Issues", value: metrics.jiraStats.totalIssues, color: "bg-orange-50 text-orange-700" },
                      { label: "Đã hoàn thành", value: metrics.jiraStats.done, color: "bg-green-50 text-green-700" },
                      { label: "Đang xử lý", value: metrics.jiraStats.inProgress, color: "bg-purple-50 text-purple-700" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className={`rounded-2xl p-4 text-center ${color}`}>
                        <p className="text-2xl font-bold">{value}</p>
                        <p className="text-xs font-medium mt-1">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-50 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-sm font-semibold text-gray-700">Project Key: {project.integration?.jiraProjectKey}</p>
                    </div>
                    <div className="space-y-2">
                      {safeJiraIssues.length === 0 && (
                        <div className="text-xs text-gray-400 py-2">Chưa có issue từ Jira/Kanban.</div>
                      )}
                      {safeJiraIssues.map((issue, i) => (
                        <div key={issue.id ?? i} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${issue.type === "BUG" ? "bg-red-50 text-red-700 border-red-100" :
                                issue.type === "STORY" ? "bg-purple-50 text-purple-700 border-purple-100" :
                                  "bg-blue-50 text-blue-700 border-blue-100"
                              }`}>{issue.type}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{issue?.title ?? issue?.summary ?? `Task #${issue?.id ?? i + 1}`}</p>
                              <p className="text-xs text-gray-400">Assignee: {issue.assigneeName || user?.fullName || "N/A"}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${issue._status === "Done" ? "bg-green-50 text-green-700 border-green-100" : issue._status === "In Progress" ? "bg-orange-50 text-orange-700 border-orange-100" : "bg-gray-100 text-gray-500 border-gray-200"}`}>{issue._status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Team tab ── */}
        <TabsContent value="team">
          <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-base font-semibold text-gray-800">Thành viên nhóm</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {(Array.isArray(project?.team) ? project.team : []).map((m, idx) => {
                const isMe = String(m?.studentUserId ?? m?.studentId ?? m?.userId) === String(user?.id);
                const isLeadM = m.role === "LEADER";
                const contribution = (Array.isArray(metrics?.contributions) ? metrics.contributions : []).find(
                  (c) => String(c?.studentUserId ?? c?.studentCode) === String(m?.studentUserId ?? m?.studentCode)
                );
                const commitsCount = contribution?.commits || 0;
                const displayName = m?.studentName
                  ?? m?.fullName
                  ?? m?.name
                  ?? m?.student?.name
                  ?? m?.student?.fullName
                  ?? "Sinh viên";
                
                return (
                  <div key={m?.studentUserId ?? m?.studentId ?? m?.userId ?? idx} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isLeadM ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"}`}>
                      {displayName?.charAt(0)?.toUpperCase() ?? "S"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-800">
                          {displayName}
                        </p>
                        {isLeadM && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Star size={8} />Leader</span>}
                        {isMe && <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded-full">Bạn</span>}
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-xs text-gray-500 flex items-center gap-1"><GitCommit size={10}/> {commitsCount} commits</span>
                         <span className="text-xs text-gray-500 flex items-center gap-1"><Link2 size={10}/> {contribution?.issues || 0} issues</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${commitsCount > 5 ? "bg-green-50 text-green-700 border-green-100" : "bg-orange-50 text-orange-600 border-orange-100"
                      }`}>
                      {commitsCount > 5 ? "Active" : "Low activity"}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SRS tab ── */}
        <TabsContent value="srs">
          <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-800">SRS Submissions</CardTitle>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <Upload size={12} />Upload SRS
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-3 pb-2">
              {srsReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <FileText size={28} className="text-gray-300" />
                  <p className="text-sm text-gray-400">Chưa có SRS report nào</p>
                  <button onClick={() => setIsUploadModalOpen(true)} className="text-xs font-semibold text-teal-700 hover:underline mt-1">Upload SRS đầu tiên</button>
                </div>
              ) : srsReports.map(rpt => {
                const statusCls = {
                  FINAL: "bg-green-50 text-green-700 border-green-100",
                  REVIEW: "bg-blue-50 text-blue-700 border-blue-100",
                  DRAFT: "bg-gray-100 text-gray-500 border-gray-200",
                }[rpt.status] || "bg-gray-100 text-gray-500 border-gray-200";

                return (
                  <div key={rpt.id} className="flex items-start gap-4 py-4 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-800 text-sm">{rpt.title}</h4>
                        <span className="text-xs font-mono text-gray-500">v{rpt.version}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${statusCls}`}>{rpt.status}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock size={10} />Nộp: {rpt.submittedAt ? new Date(rpt.submittedAt).toLocaleDateString("vi-VN") : "N/A"}</span>
                        <span>Reviewer: {rpt.reviewerName || "Chưa review"}</span>
                      </div>
                      {rpt.feedback && <p className="text-xs text-gray-500 italic mt-1.5">"{rpt.feedback}"</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button className="text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">Download</button>
                      {rpt.status === "DRAFT" && (
                        <button className="text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 px-2.5 py-1.5 rounded-lg transition-colors">Gửi review</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Upload SRS Modal ── */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload SRS Report"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Chọn file SRS</label>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center bg-gray-50">
              <Upload className="mx-auto text-gray-400 mb-2" size={24} />
              <p className="text-sm text-gray-500">Kéo file vào đây hoặc <button className="text-teal-600 hover:underline font-medium">chọn file</button></p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX (MAX. 10MB)</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phiên bản</label>
            <input
              type="text"
              placeholder="VD: 1.0, 1.1, 2.0"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Trạng thái</label>
            <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all">
              <option value="DRAFT">Draft</option>
              <option value="REVIEW">Gửi review</option>
              <option value="FINAL">Final</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ghi chú</label>
            <textarea
              rows={3}
              placeholder="Nhập ghi chú..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)} className="flex-1 rounded-xl border-gray-200 text-gray-600 h-10">Hủy</Button>
            <Button onClick={() => setIsUploadModalOpen(false)} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 border-0">Upload</Button>
          </div>
        </div>
      </Modal>

      {/* ── Link Integration Modal ── */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title="Kết nối GitHub & Jira"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 p-3 rounded-xl">
             💡 Vui lòng cung cấp URL chính xác để giảng viên có thể phê duyệt và hệ thống bắt đầu kéo dữ liệu (commits, issues).
          </p>
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">GitHub Repository URL</label>
            <div className="relative group">
               <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
               <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
               />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Jira Project URL / Key</label>
            <div className="relative group">
               <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
               <input
                type="text"
                value={jiraUrl}
                onChange={(e) => setJiraUrl(e.target.value)}
                placeholder="https://tenant.atlassian.net/browse/KEY"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
               />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Jira API Token</label>
            <input
              type="password"
              value={jiraToken}
              onChange={(e) => setJiraToken(e.target.value)}
              placeholder="Nhập Jira API token (optional)"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">GitHub Personal Access Token</label>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="Nhập GitHub PAT (optional)"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsLinkModalOpen(false)} className="flex-1 rounded-xl border-gray-200 text-gray-600 h-10">Hủy</Button>
            <Button 
                onClick={() => {
                  if (!githubUrl.trim() || !jiraUrl.trim()) {
                    showError("Vui lòng nhập đầy đủ links!");
                    return;
                  }
                  linkIntegrationMutate({
                    projectId: resolvedProjectId,
                    body: {
                      githubRepoUrl: githubUrl.trim(),
                      jiraSiteUrl: jiraUrl.trim(),
                      jiraProjectKey: extractJiraProjectKey(jiraUrl.trim()),
                      jiraToken: jiraToken.trim() || null,
                      githubToken: githubToken.trim() || null
                    }
                  }, {
                    onSuccess: () => {
                      success("Đã gửi yêu cầu kết nối! Đang chờ giảng viên phê duyệt.");
                      setProject((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          integration: {
                            ...(prev.integration || {}),
                            githubUrl: githubUrl.trim(),
                            jiraUrl: jiraUrl.trim(),
                            githubStatus: "PENDING",
                            jiraStatus: "PENDING",
                            approvalStatus: "PENDING",
                          },
                        };
                      });
                      setIsLinkModalOpen(false);
                    },
                    onError: (err) => showError(err.message || "Không thể gửi yêu cầu")
                  });
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 border-0 shadow-sm"
            >
                Xác nhận kết nối
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function extractJiraProjectKey(jiraInput) {
  if (!jiraInput) return "";
  try {
    const normalized = jiraInput.startsWith("http") ? jiraInput : `https://${jiraInput}`;
    const url = new URL(normalized);
    const segments = url.pathname.split("/").filter(Boolean);
    const browseIdx = segments.findIndex((s) => s.toLowerCase() === "browse");
    if (browseIdx >= 0 && segments[browseIdx + 1]) {
      return segments[browseIdx + 1].split("-")[0].toUpperCase();
    }
    const projectsIdx = segments.findIndex((s) => s.toLowerCase() === "projects");
    if (projectsIdx >= 0 && segments[projectsIdx + 1]) {
      return segments[projectsIdx + 1].split("-")[0].toUpperCase();
    }
  } catch {
    // Fallback below
  }

  const fallback = jiraInput.trim().split("/").filter(Boolean).pop() || "";
  return fallback.split("-")[0].toUpperCase();
}
