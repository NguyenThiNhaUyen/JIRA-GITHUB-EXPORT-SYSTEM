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
      </div>
    );
  }

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
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload SRS Report"
        size="md"
      >
        <div className="space-y-4">
          <div>
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
              <option value="DRAFT">Draft</option>
              <option value="REVIEW">Gửi review</option>
              <option value="FINAL">Final</option>
            </select>
          </div>

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
          </div>
        </div>
      </Modal>
    </div>
  );
}
