// student-project.jsx — Enterprise SaaS Project Workspace
// Logic: giữ nguyên (useParams, useAuth, getProjectById, getCommitsByProject, getSrsReportsByProject...)
// UI: redesign theo design system Admin/Lecturer

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { Modal } from "../../components/ui/interactive.jsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/interactive.jsx";
import { useGetProjectById, useGetProjectMetrics, useLinkIntegration } from "../../features/projects/hooks/useProjects.js";
import { useGetProjectCommits } from "../../features/github/hooks/useGithub.js";
import { useToast } from "../../components/ui/toast.jsx";
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
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  
  const [githubUrl, setGithubUrl] = useState("");
  const [jiraUrl, setJiraUrl] = useState("");

  const { success, error: showError } = useToast();

  /* ── Data Fetching (Real API) ── */
  const { data: project, isLoading: loadingProject } = useGetProjectById(projectId);
  const { data: metrics, isLoading: loadingMetrics } = useGetProjectMetrics(projectId);
  const { data: commitData, isLoading: loadingCommits } = useGetProjectCommits(projectId, { pageSize: 50 });
  
  const { mutate: linkIntegrationMutate } = useLinkIntegration();

  const allCommits = commitData?.items || [];
  // Filter commits for current student using email or name if student_user is joined
  const myCommits = allCommits.filter(c => 
    c.authorName?.toLowerCase().includes(user?.fullName?.toLowerCase()) || 
    c.authorName?.toLowerCase().includes(user?.email?.split('@')[0].toLowerCase())
  );
  
  const srsReports = []; // TODO: Connect to Reports API when available

  const myTeamMember = project?.team?.find(m => m.studentUserId === user?.id);
  const myRole = myTeamMember?.role || "MEMBER";
  const isLeader = myRole === "LEADER";

  if (loadingProject || loadingMetrics) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
        <p className="text-sm text-gray-500 font-medium">Đang tải dữ liệu dự án...</p>
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
        <span className="text-gray-800 font-semibold truncate">{project.name}</span>
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
              <h2 className="text-xl font-black tracking-tight text-gray-800">{project.name}</h2>
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
          { label: "Thành viên", value: project.team?.length || 0, color: "bg-purple-500", icon: <Users size={18} /> },
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
                      <div key={commit.id} className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-gray-50/50 transition-colors">
                        <div className="col-span-2 font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
                          {commit.sha?.substring(0, 7)}
                        </div>
                        <div className="col-span-5 text-sm text-gray-700 font-medium truncate">{commit.message}</div>
                        <div className="col-span-2 text-center text-xs text-gray-500">
                          {new Date(commit.date).toLocaleDateString("vi-VN")}
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
                    {/* Mock issues for now as they are not mapped yet */}
                    <div className="space-y-2">
                      {[
                        { type: "TASK", title: "Implement user authentication", status: "Done", statusCls: "bg-green-50 text-green-700 border-green-100" },
                        { type: "BUG", title: "Fix login validation error", status: "In Progress", statusCls: "bg-orange-50 text-orange-700 border-orange-100" },
                        { type: "STORY", title: "Add payment gateway integration", status: "To Do", statusCls: "bg-gray-100 text-gray-500 border-gray-200" },
                      ].map((issue, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${issue.type === "BUG" ? "bg-red-50 text-red-700 border-red-100" :
                                issue.type === "STORY" ? "bg-purple-50 text-purple-700 border-purple-100" :
                                  "bg-blue-50 text-blue-700 border-blue-100"
                              }`}>{issue.type}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{issue.title}</p>
                              <p className="text-xs text-gray-400">Assignee: {user?.fullName}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${issue.statusCls}`}>{issue.status}</span>
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
              {(project.team || []).map(m => {
                const isMe = m.studentUserId === user?.id;
                const isLeadM = m.role === "LEADER";
                const contribution = metrics?.contributions?.find(c => c.studentCode === m.studentCode);
                const commitsCount = contribution?.commits || 0;
                
                return (
                  <div key={m.studentUserId} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isLeadM ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"}`}>
                      {m.studentName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-800">
                          {m.studentName}
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
                        <span className="flex items-center gap-1"><Clock size={10} />Nộp: {new Date(rpt.submittedDate).toLocaleDateString("vi-VN")}</span>
                        <span>Reviewer: {rpt.reviewedBy ? mockUsers?.lecturers?.find(l => l.id === rpt.reviewedBy)?.name || rpt.reviewedBy : "Chưa review"}</span>
                      </div>
                      {rpt.comments && <p className="text-xs text-gray-500 italic mt-1.5">"{rpt.comments}"</p>}
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

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsLinkModalOpen(false)} className="flex-1 rounded-xl border-gray-200 text-gray-600 h-10">Hủy</Button>
            <Button 
                onClick={() => {
                  if (!githubUrl.trim() || !jiraUrl.trim()) {
                    showError("Vui lòng nhập đầy đủ links!");
                    return;
                  }
                  linkIntegrationMutate({
                    projectId: projectId,
                    body: { githubUrl: githubUrl.trim(), jiraUrl: jiraUrl.trim() }
                  }, {
                    onSuccess: () => {
                      success("Đã gửi yêu cầu kết nối! Đang chờ giảng viên phê duyệt.");
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
