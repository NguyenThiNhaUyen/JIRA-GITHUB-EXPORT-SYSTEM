// Student Dashboard - Overview for STUDENT role
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import {
  Eye,
  RefreshCcw,
  Upload,
  PencilLine,
  Trash2,
  X,
  Loader2,
} from "lucide-react";

const MOCK_STUDENT = {
  name: "Nguyễn Văn A",
  studentCode: "SE2026001",
  id: "stu001",
};

const MOCK_COURSES = [
  {
    id: "course-1",
    code: "CS101.F25",
    name: "Lập trình cơ bản",
    status: "ACTIVE",
    lecturer: "TS. Nguyễn Thanh Bình",
  },
  {
    id: "course-2",
    code: "SE201.F25",
    name: "Kỹ thuật phần mềm",
    status: "ACTIVE",
    lecturer: "ThS. Lê Hoàng",
  },
  {
    id: "course-3",
    code: "IS303.F25",
    name: "Hệ thống thông tin quản lý",
    status: "ACTIVE",
    lecturer: "TS. Trần Minh Hà",
  },
];

const MOCK_PROJECTS = [
  {
    id: "proj-1",
    courseId: "course-1",
    name: "E-commerce Platform",
    description: "Xây dựng nền tảng thương mại điện tử đa kênh",
    status: "ACTIVE",
    jiraProjectKey: "ECOM",
    githubRepo: "https://github.com/university/ecommerce-platform",
    role: "LEADER",
    teamSize: 5,
    lastCommit: "2026-01-20",
  },
  {
    id: "proj-2",
    courseId: "course-1",
    name: "Smart Campus IoT",
    description: "Hệ thống quản lý cảm biến cho campus thông minh",
    status: "ACTIVE",
    jiraProjectKey: "IOT",
    githubRepo: "https://github.com/university/smart-campus",
    role: "MEMBER",
    teamSize: 4,
    lastCommit: "2026-01-19",
  },
  {
    id: "proj-3",
    courseId: "course-2",
    name: "Banking Mobile App",
    description: "Ứng dụng ngân hàng số cho sinh viên",
    status: "ACTIVE",
    jiraProjectKey: "BANK",
    githubRepo: "https://github.com/university/banking-app",
    role: "MEMBER",
    teamSize: 6,
    lastCommit: "2026-01-21",
  },
  {
    id: "proj-4",
    courseId: "course-3",
    name: "Data Insight Dashboard",
    description: "Dashboard phân tích KPI cho doanh nghiệp",
    status: "ACTIVE",
    jiraProjectKey: "DATA",
    githubRepo: "https://github.com/university/data-insight",
    role: "LEADER",
    teamSize: 5,
    lastCommit: "2026-01-22",
  },
];

const INITIAL_SRS_REPORTS = {
  "proj-1": [
    { id: "srs-1", version: "1.0", submittedAt: "2026-01-12", note: "Initial SRS" },
    { id: "srs-2", version: "1.1", submittedAt: "2026-01-18", note: "Update scope" },
  ],
  "proj-2": [{ id: "srs-3", version: "1.0", submittedAt: "2026-01-10", note: "Baseline" }],
  "proj-3": [],
  "proj-4": [{ id: "srs-4", version: "1.0", submittedAt: "2026-01-15", note: "Initial" }],
};

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { success } = useToast();

  const [courses] = useState(MOCK_COURSES);
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [selectedCourse, setSelectedCourse] = useState(MOCK_COURSES[0].id);
  const [selectedProject, setSelectedProject] = useState(null);
  const [syncingProjectId, setSyncingProjectId] = useState(null);
  const [srsReports, setSrsReports] = useState(INITIAL_SRS_REPORTS);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [uploadForm, setUploadForm] = useState({ version: "", note: "" });

  const student = user || MOCK_STUDENT;

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => project.courseId === selectedCourse);
  }, [projects, selectedCourse]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSync = async (projectId) => {
    setSyncingProjectId(projectId);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    success("Sync commits thành công!");
    setSyncingProjectId(null);
  };

  const openUploadModal = (project) => {
    setSelectedProject(project);
    setEditingReport(null);
    setUploadForm({ version: "", note: "" });
    setShowUploadModal(true);
  };

  const handleSaveReport = () => {
    if (!selectedProject) return;
    const reports = srsReports[selectedProject.id] || [];
    if (editingReport) {
      const updated = reports.map((report) =>
        report.id === editingReport.id
          ? { ...report, version: uploadForm.version, note: uploadForm.note }
          : report
      );
      setSrsReports({ ...srsReports, [selectedProject.id]: updated });
    } else {
      const newReport = {
        id: `srs-${Date.now()}`,
        version: uploadForm.version,
        note: uploadForm.note,
        submittedAt: new Date().toISOString().slice(0, 10),
      };
      setSrsReports({ ...srsReports, [selectedProject.id]: [...reports, newReport] });
    }
    setShowUploadModal(false);
  };

  const handleEditReport = (project, report) => {
    setSelectedProject(project);
    setEditingReport(report);
    setUploadForm({ version: report.version, note: report.note });
    setShowUploadModal(true);
  };

  const handleDeleteReport = (projectId, reportId) => {
    const updated = (srsReports[projectId] || []).filter((report) => report.id !== reportId);
    setSrsReports({ ...srsReports, [projectId]: updated });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600">Chào mừng, {student.name}!</p>
              <p className="text-sm text-gray-500">Mã SV: {student.studentCode}</p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="transition hover:scale-105">
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Khóa học của tôi</h2>
            <p className="text-sm text-gray-500">Chọn khóa học để lọc project bên dưới</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Card
                key={course.id}
                className={`transition hover:scale-105 cursor-pointer ${
                  selectedCourse === course.id ? "border-blue-500" : "border-transparent"
                }`}
                onClick={() => setSelectedCourse(course.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{course.code}</h3>
                      <p className="text-sm text-gray-600">{course.name}</p>
                    </div>
                    <Badge variant="success">{course.status}</Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Giảng viên: {course.lecturer}</p>
                    <p>Số project: {projects.filter((project) => project.courseId === course.id).length}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Project của tôi</h2>
            <Button
              size="sm"
              variant="outline"
              className="transition hover:scale-105"
              onClick={() => setSelectedProject(null)}
            >
              Xem tất cả
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map((project) => {
              const reports = srsReports[project.id] || [];
              const isSyncing = syncingProjectId === project.id;
              return (
                <Card key={project.id} className="transition hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{project.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                        <Badge variant={project.role === "LEADER" ? "primary" : "outline"}>
                          {project.role}
                        </Badge>
                      </div>
                      <Badge variant={project.status === "ACTIVE" ? "success" : "default"}>
                        {project.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Repository</p>
                        <a
                          href={project.githubRepo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          {project.githubRepo.split("/").pop()}
                        </a>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Jira Project</p>
                        <p className="text-sm font-medium">{project.jiraProjectKey}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Team Size</p>
                        <p className="text-sm font-medium">{project.teamSize} thành viên</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Commit cuối</p>
                        <p className="text-sm font-medium">
                          {new Date(project.lastCommit).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-500">SRS Reports</p>
                        <Badge variant="outline">{reports.length} phiên bản</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="transition hover:scale-105"
                          onClick={() => setSelectedProject(project)}
                        >
                          <Eye className="w-4 h-4 mr-1" /> Xem chi tiết
                        </Button>
                        <Button
                          size="sm"
                          className="transition hover:scale-105"
                          onClick={() => handleSync(project.id)}
                          disabled={isSyncing}
                        >
                          {isSyncing ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <RefreshCcw className="w-4 h-4 mr-1" />
                          )}
                          Sync commits
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="transition hover:scale-105"
                          onClick={() => openUploadModal(project)}
                        >
                          <Upload className="w-4 h-4 mr-1" /> Upload SRS
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {selectedProject && (
          <section className="mb-8">
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle>Chi tiết Project: {selectedProject.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant="outline">{selectedProject.jiraProjectKey}</Badge>
                  <Badge variant="success">{selectedProject.status}</Badge>
                  <Badge variant="secondary">Team {selectedProject.teamSize} thành viên</Badge>
                </div>
                <div className="space-y-3">
                  {(srsReports[selectedProject.id] || []).map((report) => (
                    <div key={report.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Version {report.version}</div>
                        <div className="text-sm text-gray-500">{report.note}</div>
                        <div className="text-xs text-gray-400">{report.submittedAt}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditReport(selectedProject, report)}>
                          <PencilLine className="w-4 h-4 mr-1" /> Sửa
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteReport(selectedProject.id, report.id)}>
                          <Trash2 className="w-4 h-4 mr-1" /> Xóa
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(srsReports[selectedProject.id] || []).length === 0 && (
                    <div className="text-sm text-gray-500">Chưa có phiên bản SRS nào.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingReport ? "Chỉnh sửa SRS" : "Upload SRS"}
              </h3>
              <Button size="icon" variant="ghost" onClick={() => setShowUploadModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Version</label>
                <input
                  value={uploadForm.version}
                  onChange={(event) => setUploadForm({ ...uploadForm, version: event.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  placeholder="Ví dụ: 1.2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Ghi chú</label>
                <textarea
                  value={uploadForm.note}
                  onChange={(event) => setUploadForm({ ...uploadForm, note: event.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Mô tả phiên bản"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={() => setShowUploadModal(false)}>
                Hủy
              </Button>
              <Button onClick={handleSaveReport} disabled={!uploadForm.version}>
                {editingReport ? "Cập nhật" : "Lưu"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
