import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { courseService } from '../../services/courseService.js';
import { commitService } from '../../services/commitService.js';
import { srsService } from '../../services/srsService.js';
import db from '../../mock/db.js';

// Import existing chart components
import { BurndownChart } from '../../components/charts/burndown-chart.jsx';
import { CommitFrequencyChart } from '../../components/charts/commit-frequency-chart.jsx';
import { ContributorsChart } from '../../components/charts/contributors-chart.jsx';
import { WeeklyTrendsChart } from '../../components/charts/weekly-trends-chart.jsx';
import { BookOpen, Users, FolderKanban, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminReports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [data, setData] = useState({
    stats: {},
    courses: [],
    commitTrends: [],
    srsStats: {},
    projectStats: {}
  });

  useEffect(() => {
    loadReportData();
  }, [selectedSemester, selectedCourse]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Get courses with filters
      const courseFilter = {};
      if (selectedSemester) courseFilter.semesterId = selectedSemester;
      if (selectedCourse) courseFilter.id = selectedCourse;

      const courses = await courseService.getCourses(courseFilter);

      // Calculate overall stats
      const stats = {
        totalCourses: courses.length,
        totalStudents: courses.reduce((sum, c) => sum + c.currentStudents, 0),
        totalProjects: courses.reduce((sum, c) => sum + (c.projects?.length || 0), 0),
        activeCourses: courses.filter(c => c.status === 'ACTIVE').length
      };

      // Get commit trends for all courses
      let commitTrends = [];
      if (courses.length > 0) {
        commitTrends = commitService.getActivityTrends(null, null, 30);
      }

      // Get SRS statistics
      let srsStats = {};
      if (courses.length > 0) {
        srsStats = srsService.getSrsStats();
      }

      // Get project statistics
      const projectStats = {
        totalProjects: 0,
        activeProjects: 0,
        silentProjects: 0,
        projectsWithSrs: 0
      };

      courses.forEach(course => {
        if (course.projects) {
          projectStats.totalProjects += course.projects.length;
          projectStats.activeProjects += course.projects.filter(p => p.status === 'ACTIVE').length;
          projectStats.projectsWithSrs += course.projects.filter(p =>
            srsService.hasFinalSrs(p.id)
          ).length;
        }
      });

      // Get silent projects
      const silentProjects = commitService.getSilentProjects(null, 7);
      projectStats.silentProjects = silentProjects.length;

      setData({
        stats,
        courses,
        commitTrends,
        srsStats,
        projectStats
      });
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const semesters = db.findMany('semesters');
  const allCourses = db.findMany('courses');

  // Prepare chart data
  const commitChartData = data.commitTrends.map(item => ({
    date: item.date,
    commits: item.commits
  }));

  const projectDistribution = data.courses.map(course => ({
    name: course.code,
    projects: course.projects?.length || 0,
    students: course.currentStudents
  }));

  const srsStatusData = [
    { name: 'Draft', value: data.srsStats.draft || 0, color: '#64748b' },
    { name: 'Review', value: data.srsStats.review || 0, color: '#f59e0b' },
    { name: 'Final', value: data.srsStats.final || 0, color: '#22c55e' },
    { name: 'Rejected', value: data.srsStats.rejected || 0, color: '#ef4444' }
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
            <h3 className="text-2xl font-bold text-gray-800">{data.stats.totalCourses}</h3>
            <p className="text-xs text-green-600 mt-1">{data.stats.activeCourses} đang mở</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-inner">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tổng sinh viên</p>
            <h3 className="text-2xl font-bold text-gray-800">{data.stats.totalStudents}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-inner">
            <FolderKanban size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Số lượng dự án</p>
            <h3 className="text-2xl font-bold text-gray-800">{data.stats.totalProjects}</h3>
            <p className="text-xs text-blue-600 mt-1">{data.projectStats.activeProjects} đang hoạt động</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-red-400 text-white flex items-center justify-center shrink-0 shadow-inner">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Dự án cần chú ý</p>
            <h3 className="text-2xl font-bold text-gray-800">{data.projectStats.silentProjects}</h3>
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
                data={data.courses.map(course => ({
                  name: course.code,
                  completed: course.projects?.filter(p => srsService.hasFinalSrs(p.id)).length || 0,
                  remaining: course.projects?.filter(p => !srsService.hasFinalSrs(p.id)).length || 0
                }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        {/* Course Details */}
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white h-full">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-lg text-gray-800 font-bold">Thông tin Lớp học</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Lớp học</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Sinh viên</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Dự án</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.courses.slice(0, 5).map((course, index) => (
                    <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-center">
                        <div className="font-semibold text-gray-800">{course.code}</div>
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{course.name}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-medium text-gray-700">{course.currentStudents}</span>
                        <span className="text-gray-400 text-xs ml-1">/{course.maxStudents}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-medium text-gray-700">{course.projects?.length || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider inline-block whitespace-nowrap ${course.status === 'ACTIVE' ? 'text-green-600 bg-green-50' :
                          course.status === 'UPCOMING' ? 'text-blue-600 bg-blue-50' :
                            'text-gray-600 bg-gray-100'
                          }`}>
                          {course.status === 'ACTIVE' ? 'ĐANG MỞ' : course.status === 'UPCOMING' ? 'SẮP MỞ' : 'ĐÃ ĐÓNG'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Silent Projects Alert */}
        {data.projectStats.silentProjects > 0 ? (
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
    </div>
  );
}
