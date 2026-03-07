<<<<<<< HEAD
// Student Project Detail - STUDENT project detail page
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/interactive.jsx";
import { Modal } from "../../components/ui/interactive.jsx";
import { 
  getProjectById, 
  getCommitsByProject, 
  getSrsReportsByProject, 
  getCommitsByStudent,
  mockUsers,
  mockJiraProjects 
} from "../../mock/data.js";

export default function StudentProject() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('commits');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const project = getProjectById(projectId);
  const allCommits = getCommitsByProject(projectId);
  const myCommits = getCommitsByStudent(user?.id).filter(commit => commit.projectId === projectId);
  const srsReports = getSrsReportsByProject(projectId);
  const jiraProject = mockJiraProjects.find(jp => jp.projectId === projectId);

  // Get my role in team
  const myTeamMember = project?.teamMembers?.find(member => member.studentId === user?.id);
  const myRole = myTeamMember?.roleInTeam || 'MEMBER';

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project không tồn tại</h2>
          <Button onClick={() => window.history.back()}>Quay lại</Button>
        </div>
=======
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
import {
  getProjectById,
  getCommitsByProject,
  getSrsReportsByProject,
  getCommitsByStudent,
  mockUsers,
  mockJiraProjects,
} from "../../mock/data.js";
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

  /* ── Data (logic unchanged) ── */
  const project = getProjectById(projectId);
  const allCommits = getCommitsByProject(projectId);
  const myCommits = getCommitsByStudent(user?.id).filter(c => c.projectId === projectId);
  const srsReports = getSrsReportsByProject(projectId);
  const jiraProject = mockJiraProjects.find(jp => jp.projectId === projectId);

  const myTeamMember = project?.teamMembers?.find(m => m.studentId === user?.id);
  const myRole = myTeamMember?.roleInTeam || "MEMBER";
  const isLeader = myRole === "LEADER";

  /* ── Not found ── */
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertCircle size={36} className="text-gray-300" />
        <h3 className="text-lg font-bold text-gray-700">Project không tồn tại</h3>
        <button onClick={() => navigate("/student")} className="text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 px-5 py-2 rounded-xl transition-colors">
          ← Quay lại Dashboard
        </button>
>>>>>>> recover-local-code
      </div>
    );
  }

<<<<<<< HEAD
  const handleUploadSrs = () => {
    setIsUploadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600">{project.description}</p>
              <Badge variant={myRole === 'LEADER' ? 'primary' : 'outline'} className="mt-2">
                {myRole}
              </Badge>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">Export báo cáo</Button>
              <Button onClick={handleUploadSrs}>Upload SRS</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">Jira Project</div>
              <div className="font-semibold">{project.jiraProjectKey}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">Repository</div>
              <div className="font-semibold text-blue-600 hover:underline cursor-pointer">
                {project.githubRepo?.split('/').pop()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">My Commits</div>
              <div className="font-semibold">{myCommits.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">Contribution</div>
              <div className="font-semibold">{myTeamMember?.contributionScore || 0}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="commits" activeTab={activeTab} setActiveTab={setActiveTab}>
          <TabsList>
            <TabsTrigger value="commits">My Commits ({myCommits.length})</TabsTrigger>
            <TabsTrigger value="jira">Jira Tasks</TabsTrigger>
            <TabsTrigger value="srs">SRS Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="commits">
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử Commits của tôi</CardTitle>
              </CardHeader>
              <CardContent>
                {myCommits.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SHA</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Changes</TableHead>
                        <TableHead>Files</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myCommits.map((commit) => (
                        <TableRow key={commit.id}>
                          <TableCell className="font-mono text-sm">
                            {commit.sha.substring(0, 7)}
                          </TableCell>
                          <TableCell className="font-medium">{commit.message}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{new Date(commit.date).toLocaleDateString('vi-VN')}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(commit.date).toLocaleTimeString('vi-VN')}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-green-600">+{commit.additions}</span>
                            <span className="text-red-600 ml-2">-{commit.deletions}</span>
                          </TableCell>
                          <TableCell>{commit.files.length} files</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Bạn chưa có commit nào trong project này.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jira">
            <Card>
              <CardHeader>
                <CardTitle>Jira Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {jiraProject ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{jiraProject.issueCount}</div>
                        <div className="text-sm text-gray-600">Total Issues</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{jiraProject.completedIssues}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{jiraProject.sprintCount}</div>
                        <div className="text-sm text-gray-600">Sprints</div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Current Sprint: {jiraProject.currentSprint}</h4>
                      <Badge variant={jiraProject.sprintStatus === 'ACTIVE' ? 'success' : 'default'}>
                        {jiraProject.sprintStatus}
                      </Badge>
                    </div>

                    {/* Mock Jira Issues */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">My Issues</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge variant="primary">TASK</Badge>
                            <div>
                              <p className="font-medium">Implement user authentication</p>
                              <p className="text-sm text-gray-500">Assignee: {user?.name}</p>
                            </div>
                          </div>
                          <Badge variant="success">Done</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge variant="warning">BUG</Badge>
                            <div>
                              <p className="font-medium">Fix login validation error</p>
                              <p className="text-sm text-gray-500">Assignee: {user?.name}</p>
                            </div>
                          </div>
                          <Badge variant="warning">In Progress</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge variant="primary">STORY</Badge>
                            <div>
                              <p className="font-medium">Add payment gateway integration</p>
                              <p className="text-sm text-gray-500">Assignee: {user?.name}</p>
                            </div>
                          </div>
                          <Badge variant="default">To Do</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Không có dữ liệu Jira cho project này.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="srs">
            <Card>
              <CardHeader>
                <CardTitle>SRS Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {srsReports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{report.title}</h4>
                          <p className="text-sm text-gray-600">Version {report.version}</p>
                        </div>
                        <Badge variant={report.status === 'FINAL' ? 'success' : report.status === 'REVIEW' ? 'warning' : 'default'}>
                          {report.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Ngày nộp:</span>
                          <p className="font-medium">{new Date(report.submittedDate).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Reviewer:</span>
                          <p className="font-medium">
                            {report.reviewedBy ? mockUsers.lecturers.find(l => l.id === report.reviewedBy)?.name : 'Chưa review'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Ngày review:</span>
                          <p className="font-medium">
                            {report.reviewedDate ? new Date(report.reviewedDate).toLocaleDateString('vi-VN') : 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      {report.comments && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 italic">"{report.comments}"</p>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          Download
                        </Button>
                        {report.status === 'DRAFT' && (
                          <Button size="sm">
                            Gửi review
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {srsReports.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Chưa có SRS report nào cho project này.
                    <div className="mt-4">
                      <Button onClick={handleUploadSrs}>Upload SRS đầu tiên</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload SRS Modal */}
=======
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
              {!jiraProject ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Link2 size={28} className="text-gray-300" />
                  <p className="text-sm text-gray-400">Không có dữ liệu Jira cho project này</p>
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
                    {/* Mock issues */}
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
                              <p className="text-xs text-gray-400">Assignee: {user?.name}</p>
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
              {(project.teamMembers || []).map(m => {
                const isMe = m.studentId === user?.id;
                const isLeadM = m.roleInTeam === "LEADER";
                const pct = Math.min(100, ((m.contributionScore || 0) / 40) * 100);
                return (
                  <div key={m.studentId} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isLeadM ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"}`}>
                      {(mockUsers?.students?.find(s => s.id === m.studentId)?.name || m.studentId || "?").charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-800">
                          {mockUsers?.students?.find(s => s.id === m.studentId)?.name || m.studentId}
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
>>>>>>> recover-local-code
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload SRS Report"
        size="md"
      >
        <div className="space-y-4">
          <div>
<<<<<<< HEAD
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn file SRS
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                Kéo file vào đây hoặc <button className="text-blue-600 hover:underline">chọn file</button>
              </p>
              <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 10MB)</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phiên bản
            </label>
            <input
              type="text"
              placeholder="VD: 1.0, 1.1, 2.0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
=======
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
>>>>>>> recover-local-code
              <option value="DRAFT">Draft</option>
              <option value="REVIEW">Gửi review</option>
              <option value="FINAL">Final</option>
            </select>
          </div>
<<<<<<< HEAD

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              rows={3}
              placeholder="Nhập ghi chú cho report này..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => setIsUploadModalOpen(false)}>
              Upload
            </Button>
=======
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
>>>>>>> recover-local-code
          </div>
        </div>
      </Modal>
    </div>
  );
}
