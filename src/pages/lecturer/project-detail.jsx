// Project Detail - LECTurer project detail page
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { Alert } from "../../components/ui/interactive.jsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/interactive.jsx";
import { 
  getProjectById, 
  getCommitsByProject, 
  getSrsReportsByProject, 
  mockUsers,
  mockJiraProjects 
} from "../../mock/data.js";

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('team');

  const project = getProjectById(projectId);
  const commits = getCommitsByProject(projectId);
  const srsReports = getSrsReportsByProject(projectId);
  const jiraProject = mockJiraProjects.find(jp => jp.projectId === projectId);

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

  // Check for silent project (no commits in 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const isSilentProject = commits.length === 0 || new Date(commits[0]?.date) < sevenDaysAgo;

  // Check for inactive members (no commits in 14 days)
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const inactiveMembers = project.teamMembers?.filter(member => {
    const memberCommits = commits.filter(commit => commit.authorStudentId === member.studentId);
    return memberCommits.length === 0 || new Date(memberCommits[0]?.date) < fourteenDaysAgo;
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600">{project.description}</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">Export báo cáo</Button>
              <Button>Sync dữ liệu</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        <div className="space-y-4 mb-6">
          {isSilentProject && (
            <Alert variant="warning">
              <strong>Cảnh báo:</strong> Project này không có hoạt động commit trong 7 ngày qua.
            </Alert>
          )}
          
          {inactiveMembers.length > 0 && (
            <Alert variant="error">
              <strong>Cảnh báo:</strong> {inactiveMembers.length} thành viên không có hoạt động commit trong 14 ngày qua.
              <div className="mt-2">
                {inactiveMembers.map(member => {
                  const student = mockUsers.students.find(s => s.id === member.studentId);
                  return student ? (
                    <Badge key={member.studentId} variant="error" className="mr-2 mb-2">
                      {student.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </Alert>
          )}
        </div>

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
              <div className="text-sm text-gray-500">Team Size</div>
              <div className="font-semibold">{project.teamMembers?.length || 0} thành viên</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">Status</div>
              <Badge variant={project.status === 'ACTIVE' ? 'success' : 'default'}>
                {project.status}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="team" activeTab={activeTab} setActiveTab={setActiveTab}>
          <TabsList>
            <TabsTrigger value="team">Team Members</TabsTrigger>
            <TabsTrigger value="commits">Commits</TabsTrigger>
            <TabsTrigger value="jira">Jira Summary</TabsTrigger>
            <TabsTrigger value="srs">SRS Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Thành viên Team</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sinh viên</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Trách nhiệm</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Contribution</TableHead>
                      <TableHead>Số commits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.teamMembers?.map((member) => {
                      const student = mockUsers.students.find(s => s.id === member.studentId);
                      const memberCommits = commits.filter(c => c.authorStudentId === member.studentId);
                      
                      return (
                        <TableRow key={member.studentId}>
                          <TableCell className="font-medium">
                            {student?.name || 'N/A'}
                            <div className="text-sm text-gray-500">{student?.email}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={member.roleInTeam === 'LEADER' ? 'primary' : 'outline'}>
                              {member.roleInTeam}
                            </Badge>
                          </TableCell>
                          <TableCell>{member.responsibility}</TableCell>
                          <TableCell>
                            <Badge variant={member.status === 'ACTIVE' ? 'success' : 'default'}>
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-12 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ width: `${member.contributionScore}%` }}
                                ></div>
                              </div>
                              <span className="text-sm">{member.contributionScore}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{memberCommits.length}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commits">
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử Commits ({commits.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SHA</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Changes</TableHead>
                      <TableHead>Files</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commits.map((commit) => {
                      const student = mockUsers.students.find(s => s.id === commit.authorStudentId);
                      
                      return (
                        <TableRow key={commit.id}>
                          <TableCell className="font-mono text-sm">
                            {commit.sha.substring(0, 7)}
                          </TableCell>
                          <TableCell className="font-medium">{commit.message}</TableCell>
                          <TableCell>{student?.name || 'Unknown'}</TableCell>
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
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jira">
            <Card>
              <CardHeader>
                <CardTitle>Jira Summary</CardTitle>
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
                    
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-500">
                        Last sync: {new Date(jiraProject.lastSync).toLocaleString('vi-VN')}
                      </p>
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
                <CardTitle>SRS Reports</CardTitle>
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
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Người nộp:</span>
                          <p className="font-medium">{mockUsers.students.find(s => s.id === report.submittedBy)?.name}</p>
                        </div>
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
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
