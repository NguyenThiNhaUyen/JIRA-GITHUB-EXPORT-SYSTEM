// Lecturer Dashboard - Full UI with CRUD sync actions
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { SimpleStatCard } from "../../components/ui/layout.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { Alert } from "../../components/ui/interactive.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { courseService } from "../../services/courseService.js";
import { projectService } from "../../services/projectService.js";
import { commitService } from "../../services/commitService.js";
// import { WeeklyTrendsChart } from "../../components/charts/weekly-trends-chart.jsx";
import { PerformanceTrendsChart } from "../../components/charts/performance-trends-chart.jsx";

const DEFAULT_PROGRESS = 65;
const FALLBACK_COURSE = {
  id: "fallback-course",
  code: "CS101.F21",
  name: "Lập trình cơ bản",
  title: "Lập trình cơ bản",
  students: [
    { id: "stu001", name: "Lê Văn C" },
    { id: "stu002", name: "Phạm Thị D" },
    { id: "stu003", name: "Hoàng Văn E" },
  ],
};
const FALLBACK_PROJECTS = [
  {
    id: "proj001",
    name: "E-commerce Website",
    description: "Xây dựng website thương mại điện tử",
    status: "ACTIVE",
    jiraProjectKey: "ECOM",
    githubRepo: "ecommerce",
    team: [{ id: "tm1" }, { id: "tm2" }],
    progress: 65,
  },
  {
    id: "proj002",
    name: "Mobile Banking App",
    description: "Ứng dụng ngân hàng di động",
    status: "ACTIVE",
    jiraProjectKey: "BANK",
    githubRepo: "banking-app",
    team: [{ id: "tm3" }, { id: "tm4" }, { id: "tm5" }],
    progress: 72,
  },
  {
    id: "proj003",
    name: "Data Analytics Dashboard",
    description: "Bảng điều khiển phân tích dữ liệu",
    status: "ACTIVE",
    jiraProjectKey: "DASH",
    githubRepo: "data-dashboard",
    team: [{ id: "tm6" }, { id: "tm7" }],
    progress: 58,
  },
  {
    id: "proj004",
    name: "E-learning Platform",
    description: "Nền tảng học trực tuyến",
    status: "ACTIVE",
    jiraProjectKey: "LEARN",
    githubRepo: "e-learning",
    team: [{ id: "tm8" }, { id: "tm9" }, { id: "tm10" }, { id: "tm11" }],
    progress: 81,
  },
  {
    id: "proj005",
    name: "Smart Campus IoT",
    description: "Hệ thống IoT cho campus",
    status: "ACTIVE",
    jiraProjectKey: "IOT",
    githubRepo: "smart-campus-iot",
    team: [{ id: "tm12" }, { id: "tm13" }, { id: "tm14" }],
    progress: 46,
  },
  {
    id: "proj006",
    name: "AI Tutor Assistant",
    description: "Trợ lý học tập AI",
    status: "ACTIVE",
    jiraProjectKey: "AITUTOR",
    githubRepo: "ai-tutor",
    team: [{ id: "tm15" }, { id: "tm16" }],
    progress: 69,
  },
];
const FALLBACK_WEEKLY_TRENDS = [
  { date: "Mon", commits: 48, issuesClosed: 24, tasksDone: 32 },
  { date: "Tue", commits: 52, issuesClosed: 18, tasksDone: 28 },
  { date: "Wed", commits: 61, issuesClosed: 30, tasksDone: 35 },
  { date: "Thu", commits: 43, issuesClosed: 20, tasksDone: 27 },
  { date: "Fri", commits: 72, issuesClosed: 34, tasksDone: 41 },
  { date: "Sat", commits: 38, issuesClosed: 16, tasksDone: 19 },
  { date: "Sun", commits: 29, issuesClosed: 12, tasksDone: 15 },
];
const FALLBACK_PERFORMANCE_TRENDS = [
  { week: "Week 1", commits: 210, issues: 95, tasks: 120 },
  { week: "Week 2", commits: 235, issues: 102, tasks: 140 },
  { week: "Week 3", commits: 260, issues: 120, tasks: 155 },
  { week: "Week 4", commits: 248, issues: 110, tasks: 148 },
];

export default function LecturerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseProjects, setCourseProjects] = useState([]);
  const [silentProjects, setSilentProjects] = useState([]);
  const [inactiveStudents, setInactiveStudents] = useState([]);
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [sortBy, setSortBy] = useState("recent");
  const [weeklyTrends, setWeeklyTrends] = useState([]);
  const [performanceTrends, setPerformanceTrends] = useState([]);

  useEffect(() => {
    loadLecturerCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadCourseData(selectedCourse);
    }
  }, [selectedCourse]);

  const loadLecturerCourses = async () => {
    try {
      setLoading(true);
      const allCourses = await courseService.getCourses();
      const myCourses = allCourses.filter((course) =>
        course.lecturers?.some((lecturer) => lecturer.id === user?.id)
      );
      if (myCourses.length === 0) {
        setCourses([FALLBACK_COURSE]);
        if (!selectedCourse) {
          setSelectedCourse(FALLBACK_COURSE.id);
        }
        return;
      }
      setCourses(myCourses);
      if (!selectedCourse && myCourses.length > 0) {
        setSelectedCourse(myCourses[0].id);
      }
    } catch (err) {
      error("Không thể tải danh sách course");
    } finally {
      setLoading(false);
    }
  };

  const loadCourseData = async (courseId) => {
    try {
      setLoading(true);
      if (courseId === FALLBACK_COURSE.id) {
        setCourseProjects(FALLBACK_PROJECTS);
        setSilentProjects(FALLBACK_PROJECTS);
        setInactiveStudents(FALLBACK_COURSE.students);
        setWeeklyTrends(FALLBACK_WEEKLY_TRENDS);
        setPerformanceTrends(FALLBACK_PERFORMANCE_TRENDS);
        return;
      }

      const projects = await projectService.getCourseProjects(courseId);
      const silent = await commitService.getSilentProjects(courseId, 7);
      const inactive = await commitService.getInactiveStudents(courseId, 14);

      setCourseProjects(projects);
      setSilentProjects(silent);
      setInactiveStudents(inactive);
      setWeeklyTrends(FALLBACK_WEEKLY_TRENDS);
      setPerformanceTrends(FALLBACK_PERFORMANCE_TRENDS);
    } catch (err) {
      error("Không thể tải dữ liệu course");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalProjects = courseProjects.length;
    const totalTeams = courseProjects.length;
    const totalStudents = courseProjects.reduce((acc, project) => acc + (project.team?.length || 0), 0);

    return {
      totalProjects,
      totalTeams,
      totalStudents,
    };
  }, [courseProjects]);

  const studentsById = useMemo(() => {
    const currentCourse = courses.find((course) => course.id === selectedCourse);
    const map = new Map();
    currentCourse?.students?.forEach((student) => map.set(student.id, student));
    return map;
  }, [courses, selectedCourse]);

  const sortedProjects = useMemo(() => {
    const projects = [...courseProjects];
    if (sortBy === "progress") {
      return projects.sort((a, b) => (b.progress || DEFAULT_PROGRESS) - (a.progress || DEFAULT_PROGRESS));
    }
    if (sortBy === "team") {
      return projects.sort((a, b) => (b.team?.length || 0) - (a.team?.length || 0));
    }
    if (sortBy === "name") {
      return projects.sort((a, b) => a.name.localeCompare(b.name));
    }
    return projects;
  }, [courseProjects, sortBy]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSyncCommits = async (projectId) => {
    try {
      const result = await commitService.syncCommits(projectId);
      setLastSyncAt(result.lastSyncAt);
      success(`Đã sync ${result.commitsAdded} commits`);
      loadCourseData(selectedCourse);
    } catch (err) {
      error("Sync commits thất bại");
    }
  };

  const handleViewProject = (projectId) => {
    navigate(`/lecturer/project/${projectId}`);
  };

  const handleViewProjectsOverview = () => {
    navigate(`/lecturer/course/${selectedCourse}/projects`);
  };

  const formatLastSync = () => {
    if (!lastSyncAt) return "Sync tốt";
    return new Date(lastSyncAt).toLocaleString("vi-VN");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50">
      {/* Premium Header with gradient */}
      <div className="bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">
                Bảng điều khiển Giảng viên
              </h1>
              <p className="text-green-100 text-lg">Xin chào, <span className="font-semibold">{user?.name}</span>!</p>
            </div>
            <Button
              onClick={handleLogout}
              className="bg-white bg-opacity-40 text-green-600 hover:bg-green-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Chọn Course</label>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedCourse}
              onChange={(event) => setSelectedCourse(event.target.value)}
              className="w-full md:w-72 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">-- Chọn Course --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.title || course.name}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="w-full md:w-60 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              disabled={!selectedCourse}
            >
              <option value="recent">Sort: Mới nhất</option>
              <option value="progress">Sort: Tiến độ cao</option>
              <option value="team">Sort: Team lớn</option>
              <option value="name">Sort: Tên A-Z</option>
            </select>
          </div>
        </div>

        {selectedCourse && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <SimpleStatCard
                title="Projects"
                value={stats.totalProjects}
                change={`${stats.totalProjects} projects trong course này`}
                changeType="neutral"
              />
              <SimpleStatCard
                title="Teams"
                value={stats.totalTeams}
                change="Đang hoạt động"
                changeType="positive"
              />
              <SimpleStatCard
                title="Students"
                value={stats.totalStudents}
                change={`${stats.totalStudents} sinh viên tổng cộng`}
                changeType="neutral"
              />
              <SimpleStatCard
                title="Last Sync"
                value={lastSyncAt ? "Vừa xong" : "2 phút"}
                change={formatLastSync()}
                changeType="success"
              />
            </div>

            <div className="space-y-4 mb-8">
              {silentProjects.length > 0 && (
                <Alert variant="warning">
                  <div>
                    <strong>Cảnh báo:</strong> {silentProjects.length} nhóm không có hoạt động commit trong 7 ngày qua.
                    <div className="mt-2 flex flex-wrap gap-2">
                      {silentProjects.map((project) => (
                        <Badge key={project.id} variant="warning" size="sm">
                          {project.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Alert>
              )}
              {inactiveStudents.length > 0 && (
                <Alert variant="error">
                  <div>
                    <strong>Cảnh báo:</strong> {inactiveStudents.length} sinh viên không có hoạt động commit trong 14 ngày qua.
                    <div className="mt-2 flex flex-wrap gap-2">
                      {inactiveStudents.map((student) => (
                        <Badge key={student.id} variant="error" size="sm">
                          {studentsById.get(student.id)?.name || student.name || student.id}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Alert>
              )}
            </div>

            <Card className="mb-8 border-0 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-cyan-100">
                <CardTitle className="text-3xl text-gray-800 font-bold">Danh sách Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sortedProjects.map((project) => {
                  const integration = project.integration || {};
                  const teamSize = project.team?.length || 0;
                  const jiraLabel = integration.jiraKey || project.jiraProjectKey || "N/A";
                  const jiraUrl = integration.jiraUrl || "#";
                  const githubRepo = integration.githubRepo || project.githubRepo || "N/A";
                  const githubUrl = integration.githubUrl || project.githubRepo || "#";

                  return (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold text-gray-900">{project.name}</div>
                          <div className="text-sm text-gray-600">{project.description}</div>
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-gray-500">Jira:</div>
                              <a href={jiraUrl} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                                {jiraLabel}
                              </a>
                            </div>
                            <div>
                              <div className="text-gray-500">Repo:</div>
                              <a href={githubUrl} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                                {githubRepo}
                              </a>
                            </div>
                            <div>
                              <div className="text-gray-500">Team:</div>
                              <div>{teamSize} thành viên</div>
                            </div>
                          </div>
                        </div>
                        <Badge variant={project.status === "ACTIVE" ? "success" : "secondary"} size="sm">
                          {project.status}
                        </Badge>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm text-gray-600">Tiến độ: {project.progress || DEFAULT_PROGRESS}%</div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewProject(project.id)}>
                            Xem chi tiết
                          </Button>
                          <Button size="sm" onClick={() => handleSyncCommits(project.id)}>
                            Sync commits
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {courseProjects.length === 0 && (
                  <div className="text-sm text-gray-500">Chưa có project nào trong course này.</div>
                )}
              </CardContent>
            </Card>

            {/* <div className="flex justify-end">
              <Button variant="outline" onClick={handleViewProjectsOverview}>
                Xem tất cả projects
              </Button>
            </div> */}

            {/* <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
              <WeeklyTrendsChart data={weeklyTrends} />
              <PerformanceTrendsChart data={performanceTrends} />
            </div> */}
          </>
        )}
      </div>
    </div>
  );
}
