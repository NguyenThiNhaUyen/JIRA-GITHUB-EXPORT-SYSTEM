import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { BurndownChart } from '../../components/charts/burndown-chart.jsx';
import { CommitFrequencyChart } from '../../components/charts/commit-frequency-chart.jsx';
import { ContributorsChart } from '../../components/charts/contributors-chart.jsx';
import { WeeklyTrendsChart } from '../../components/charts/weekly-trends-chart.jsx';
import { BookOpen, Users, FolderKanban, AlertCircle, CheckCircle, FileText, Download, Printer } from 'lucide-react';
import { useGetCourses } from '../../features/courses/hooks/useCourses.js';
import { useGetSemesters } from '../../features/system/hooks/useSystem.js';
import {
  useGenerateCommitStats,
  useGenerateTeamRoster,
  useGenerateActivitySummary,
  useGenerateSrs
} from '../../features/admin/hooks/useReports.js';
import { useToast } from '../../components/ui/toast.jsx';

export default function AdminReports() {
  const { success, error } = useToast();
  // Filters state
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  // Fetch Data
  const { data: semestersData, isLoading: loadingSemesters } = useGetSemesters();
  const { data: coursesData, isLoading: loadingCourses } = useGetCourses({
    semesterId: selectedSemester || undefined,
    pageSize: 100
  });

  // Report Mutations
  const generateCommitStats = useGenerateCommitStats();
  const generateTeamRoster = useGenerateTeamRoster();
  const generateSrs = useGenerateSrs();

  const semesters = semestersData || [];
  const allCourses = coursesData?.items || [];

  // Filter courses based on local selection if needed
  const filteredCourses = selectedCourse
    ? allCourses.filter(c => c.id === selectedCourse)
    : allCourses;

  // Calculate overall stats dynamically
  const stats = {
    totalCourses: allCourses.length,
    totalStudents: allCourses.reduce((sum, c) => sum + (c.currentStudents || 0), 0),
    totalProjects: allCourses.reduce((sum, c) => sum + (c.projectsCount || 0), 0),
    activeCourses: allCourses.filter(c => c.status === 'ACTIVE').length
  };

  const projectStats = {
    totalProjects: stats.totalProjects,
    activeProjects: stats.totalProjects, // Fallback since status isn't clear for projects yet
    silentProjects: 0, // Placeholder
    projectsWithSrs: 0
  };

  const handleGenerateReport = async (type, id) => {
    try {
      let mutation;
      let params = {};

      if (type === 'COMMIT') {
        mutation = generateCommitStats;
        params = { courseId: id };
      } else if (type === 'ROSTER') {
        mutation = generateTeamRoster;
        params = { projectId: id }; // Note: roster usually by project
      } else if (type === 'SRS') {
        mutation = generateSrs;
        params = { projectId: id };
      }

      const res = await mutation.mutateAsync(params);
      success("Đã bắt đầu tạo báo cáo! Vui lòng kiểm tra danh sách báo cáo sau vài phút.");
    } catch (err) {
      error("Không thể tạo báo cáo. Vui lòng thử lại sau.");
    }
  };

  const loading = loadingSemesters || loadingCourses;

  // Prepare chart data (Note: commitTrends placeholder for now)
  const commitChartData = [];

  const projectDistribution = filteredCourses.map(course => ({
    name: course.code,
    projects: course.projectsCount || 0,
    students: course.currentStudents
  }));

  const srsStatusData = [
    { name: 'Draft', value: 0, color: '#64748b' },
    { name: 'Review', value: 0, color: '#f59e0b' },
    { name: 'Final', value: 0, color: '#22c55e' },
    { name: 'Rejected', value: 0, color: '#ef4444' }
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Đang tải báo cáo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Filters Card */}
      <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Học kỳ
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
              >
                <option value="">Tất cả học kỳ</option>
                {semesters.map(semester => (
                  <option key={semester.id} value={semester.id}>
                    {semester.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lớp học
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
              >
                <option value="">Tất cả lớp học</option>
                {allCourses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats (Edaca Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-inner">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tổng số lớp</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.totalCourses}</h3>
            <p className="text-xs text-green-600 mt-1">{stats.activeCourses} đang mở</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-inner">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tổng sinh viên</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.totalStudents}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-inner">
            <FolderKanban size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Số lượng dự án</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.totalProjects}</h3>
            <p className="text-xs text-blue-600 mt-1">{projectStats.activeProjects} đang hoạt động</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-red-400 text-white flex items-center justify-center shrink-0 shadow-inner">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Dự án cần chú ý</p>
            <h3 className="text-2xl font-bold text-gray-800">{projectStats.silentProjects}</h3>
            <p className="text-xs text-red-500 mt-1">Không có hoạt động trong 7 ngày qua</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commit Trends */}
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-lg text-gray-800 font-bold">Lịch sử Commit (30 ngày qua)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64">
              <WeeklyTrendsChart data={commitChartData} />
            </div>
          </CardContent>
        </Card>

        {/* SRS Status Distribution */}
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-lg text-gray-800 font-bold">Tình trạng Báo cáo SRS</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64">
              <ContributorsChart data={srsStatusData} />
            </div>
          </CardContent>
        </Card>

        {/* Project Distribution */}
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-lg text-gray-800 font-bold">Dự án theo Lớp học</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64">
              <CommitFrequencyChart data={projectDistribution} />
            </div>
          </CardContent>
        </Card>

        {/* Course Performance */}
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-lg text-gray-800 font-bold">Tiến độ Các môn học</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64">
              <BurndownChart
                data={filteredCourses.map(course => ({
                  name: course.code,
                  completed: 10, // Mock for status visualization
                  remaining: 5
                }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 gap-6 pb-8">
        {/* Course Details */}
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white h-full">
          <CardHeader className="border-b border-gray-50 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-gray-800 font-bold">Thông tin Lớp học & Báo cáo</CardTitle>
            <Button variant="outline" className="rounded-xl" onClick={() => navigate('/admin/my-reports')}>
              <FileText size={16} className="mr-2" />
              Xem LS Báo cáo
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lớp học</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Sinh viên</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Dự án</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Xuất Báo cáo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">{course.code}</div>
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{course.name}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-medium text-gray-700">{course.currentStudents}</span>
                        <span className="text-gray-400 text-xs ml-1">/{course.maxStudents}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-medium text-gray-700">{course.projectsCount || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider inline-block whitespace-nowrap ${course.status === 'ACTIVE' ? 'text-green-600 bg-green-50' :
                          course.status === 'UPCOMING' ? 'text-blue-600 bg-blue-50' :
                            'text-gray-600 bg-gray-100'
                          }`}>
                          {course.status === 'ACTIVE' ? 'ĐANG MỞ' : course.status === 'UPCOMING' ? 'SẮP MỞ' : 'ĐÃ ĐÓNG'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-orange-600 hover:bg-orange-50"
                          title="Báo cáo Commit"
                          onClick={() => handleGenerateReport('COMMIT', course.id)}
                        >
                          <Printer size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                          title="Báo cáo Team Roster"
                          onClick={() => handleGenerateReport('ROSTER', course.id)}
                        >
                          <Users size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-indigo-600 hover:bg-indigo-50"
                          title="Xuất SRS ISO (Giả lập)"
                          onClick={() => handleGenerateReport('SRS', course.id)}
                        >
                          <FileText size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredCourses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        Không có dữ liệu lớp học phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Silent Projects Alert */}
      {projectStats.silentProjects > 0 ? (
        <Card className="border border-red-100 shadow-sm rounded-[24px] overflow-hidden bg-red-50/30">
          <CardHeader className="border-b border-red-100 pb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-500" size={20} />
              <CardTitle className="text-lg text-red-700 font-bold">Cảnh báo Dự án</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4 h-full py-4">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-bold">{data.projectStats.silentProjects}</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 text-lg">Dự án chưa hoạt động</h4>
                <p className="text-sm text-gray-600 mt-1 max-w-xs mx-auto">
                  Các dự án này không có hoạt động cập nhật mã nguồn (commits) trong 7 ngày qua.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-green-100 shadow-sm rounded-[24px] overflow-hidden bg-green-50/30 flex items-center justify-center min-h-[250px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h4 className="font-semibold text-gray-800 text-lg">Tất cả dự án đang hoạt động</h4>
            <p className="text-sm text-gray-600 mt-1">Không có dự án nào bị bỏ trống tuần này</p>
          </div>
        </Card>
      )}
    </div>
  );
}
