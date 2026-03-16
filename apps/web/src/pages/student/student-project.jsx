// student-project.jsx — Enterprise SaaS Project Workspace
// Logic: Fetch API using Feature APIs via React Query
// UI: redesign theo design system Admin/Lecturer

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { Modal } from "../../components/ui/interactive.jsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/interactive.jsx";
import { getProjectById } from "../../features/projects/api/projectApi.js";
import { getProjectSrs } from "../../features/srs/api/srsApi.js";
import { useProjectCommits } from "../../hooks/use-api.js";
import {
  ChevronRight, GitCommit, Link2, BarChart2,
  Users, FileText, ArrowLeft, Github, Upload,
  CheckCircle, Clock, Star, AlertCircle
} from "lucide-react";

export default function StudentProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("commits");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  /* ── Data Fetching via React Query ── */
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectById(projectId),
    enabled: !!projectId,
  });

  const { data: commitsResponse, isLoading: isCommitsLoading } = useProjectCommits(projectId, 1, 100);
  const allCommits = commitsResponse?.items || [];
  
  // Filter my commits from all project commits based on user ID or student Code mapping
  const myCommits = allCommits.filter(c => c.authorStudentId === user?.id || c.authorStudentId === user?.studentCode);

  const { data: srsReports = [], isLoading: isSrsLoading } = useQuery({
    queryKey: ["project", projectId, "srs"],
    queryFn: () => getProjectSrs(projectId),
    enabled: !!projectId,
  });

  // TODO: Implement Jira Dashboard metrics fetching if Backend supports it. Currently mocking empty or generic structure.
  const jiraProject = project?.jiraProjectKey ? {
      issueCount: 0, completedIssues: 0, sprintCount: 0, currentSprint: "N/A", sprintStatus: "INACTIVE"
  } : null;

  /* ── Not found / Loading ── */
  if (isProjectLoading) {
    return <div className="flex justify-center items-center h-64 text-teal-600 font-semibold">Đang tải dữ liệu dự án...</div>;
  }

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

  const myTeamMember = project.teamMembers?.find(m => m.studentId === user?.id || String(m.studentUserId) === String(user?.id));
  const myRole = myTeamMember?.roleInTeam || myTeamMember?.role || "MEMBER";
  const isLeader = myRole === "LEADER";

  /* ── Status helpers ── */
  const ghStatus = project.githubRepo
    ? { cls: "bg-green-50 text-green-700 border-green-100", label: "Linked" }
    : { cls: "bg-gray-100 text-gray-400 border-gray-200", label: "Not linked" };
  const jiraStatus = project.jiraProjectKey
    ? { cls: "bg-blue-50 text-blue-700 border-blue-100", label: "Linked" }
    : { cls: "bg-gray-100 text-gray-400 border-gray-200", label: "Not linked" };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
        <span className="text-teal-700 font-semibold cursor-pointer hover:underline" onClick={() => navigate("/student")}>Sinh viên</span>
        <ChevronRight size={12} />
        <span className="text-gray-800 font-semibold truncate">{project.groupName || project.name || `Dự án ${project.id}`}</span>
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
              <h2 className="text-xl font-black tracking-tight text-gray-800">{project.groupName || project.name || `Dự án ${project.id}`}</h2>
              {project.description && <p className="text-sm text-gray-500 mt-0.5">{project.description}</p>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${ghStatus.cls}`}>
                <Github size={12} />GitHub: {ghStatus.label}
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${jiraStatus.cls}`}>
                <Link2 size={12} />Jira: {jiraStatus.label}
              </div>
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
          { label: "Total Commits", value: allCommits.length, color: "bg-teal-500", icon: <BarChart2 size={18} /> },
          { label: "Contribution", value: `${myTeamMember?.contributionScore || 0}%`, color: "bg-indigo-500", icon: <Star size={18} /> },
          { label: "Thành viên", value: project.teamMembers?.length || 0, color: "bg-purple-500", icon: <Users size={18} /> },
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
          <TabsTrigger value="commits">Commits ({myCommits.length})</TabsTrigger>
          <TabsTrigger value="jira">Jira Tasks</TabsTrigger>
          <TabsTrigger value="team">Nhóm</TabsTrigger>
          <TabsTrigger value="srs">SRS</TabsTrigger>
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
                    {myCommits.map(commit => (
                      <div key={commit.id || commit.sha} className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-gray-50/50 transition-colors">
                        <div className="col-span-2 font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
                          {commit.sha?.substring(0, 7)}
                        </div>
                        <div className="col-span-5 text-sm text-gray-700 font-medium truncate">{commit.message}</div>
                        <div className="col-span-2 text-center text-xs text-gray-500">
                          {new Date(commit.committedAt || commit.date).toLocaleDateString("vi-VN")}
                        </div>
                        <div className="col-span-2 text-center text-xs">
                          <span className="text-green-600 font-semibold">+{(commit.stats?.additions) || commit.additions || 0}</span>
                          <span className="text-red-500 font-semibold ml-1">-{(commit.stats?.deletions) || commit.deletions || 0}</span>
                        </div>
                        <div className="col-span-1 text-center text-xs text-gray-500">{commit.files?.length || 0}</div>
                      </div>
                    ))}
                  </div>
                </>
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
              {!jiraProject ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Link2 size={28} className="text-gray-300" />
                  <p className="text-sm text-gray-400">Không có dữ liệu thiết lập Jira cho project này hoặc backend chưa hỗ trợ metrics.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Total Issues", value: jiraProject.issueCount, color: "bg-orange-50 text-orange-700" },
                      { label: "Đã hoàn thành", value: jiraProject.completedIssues, color: "bg-green-50 text-green-700" },
                      { label: "Sprints", value: jiraProject.sprintCount, color: "bg-purple-50 text-purple-700" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className={`rounded-2xl p-4 text-center ${color}`}>
                        <p className="text-2xl font-bold">{value}</p>
                        <p className="text-xs font-medium mt-1">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-50 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-sm font-semibold text-gray-700">Current Sprint: {jiraProject.currentSprint}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${jiraProject.sprintStatus === "ACTIVE" ? "bg-green-50 text-green-700 border-green-100" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                        {jiraProject.sprintStatus}
                      </span>
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
              {(project.teamMembers || []).map(m => {
                const idMatch = m.studentId || m.studentUserId;
                const isMe = String(idMatch) === String(user?.id);
                const isLeadM = (m.roleInTeam || m.role) === "LEADER";
                const pct = Math.min(100, ((m.contributionScore || 0) / 40) * 100);
                return (
                  <div key={idMatch} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isLeadM ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"}`}>
                      {(m.studentName || m.studentCode || idMatch || "?").toString().charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-800">
                          {m.studentName || m.studentCode || idMatch}
                        </p>
                        {isLeadM && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Star size={8} />Leader</span>}
                        {isMe && <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded-full">Bạn</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-600 shrink-0">{m.contributionScore || 0}%</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${(m.contributionScore || 0) > 20 ? "bg-green-50 text-green-700 border-green-100" : "bg-orange-50 text-orange-600 border-orange-100"
                      }`}>
                      {(m.contributionScore || 0) > 20 ? "Active" : "Need attention"}
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
                  APPROVED: "bg-green-50 text-green-700 border-green-100",
                  REJECTED: "bg-red-50 text-red-700 border-red-100",
                }[rpt.status] || "bg-gray-100 text-gray-500 border-gray-200";

                return (
                  <div key={rpt.id} className="flex items-start gap-4 py-4 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-800 text-sm">{rpt.title || 'SRS Document'}</h4>
                        <span className="text-xs font-mono text-gray-500">v{rpt.version}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${statusCls}`}>{rpt.status}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock size={10} />Nộp: {new Date(rpt.submittedAt || rpt.submittedDate).toLocaleDateString("vi-VN")}</span>
                        <span>Reviewer: {rpt.reviewerName || "Chưa review"}</span>
                      </div>
                      {rpt.feedback && <p className="text-xs text-gray-500 italic mt-1.5">"{rpt.feedback}"</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {rpt.fileUrl && (
                        <a href={rpt.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">Download</a>
                      )}
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
        title="Upload SRS Report (Coming via Real API later)"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-700 mb-2">Chức năng upload hiện tại cần tích hợp formData submission...</div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)} className="flex-1 rounded-xl border-gray-200 text-gray-600 h-10">Đóng</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
