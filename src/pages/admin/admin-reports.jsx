// Admin Reports Page - Charts and analytics
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { SimpleStatCard } from '../../components/ui/layout.jsx';
import { courseService } from '../../services/courseService.js';
import { commitService } from '../../services/commitService.js';
import { srsService } from '../../services/srsService.js';
import db from '../../mock/db.js';

// Import existing chart components
import { BurndownChart } from '../../components/charts/burndown-chart.jsx';
import { CommitFrequencyChart } from '../../components/charts/commit-frequency-chart.jsx';
import { ContributorsChart } from '../../components/charts/contributors-chart.jsx';
import { WeeklyTrendsChart } from '../../components/charts/weekly-trends-chart.jsx';

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
        const courseIds = courses.map(c => c.id);
        commitTrends = commitService.getActivityTrends(null, null, 30);
      }

      // Get SRS statistics
      let srsStats = {};
      if (courses.length > 0) {
        const courseIds = courses.map(c => c.id);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Reports</h1>
              <p className="text-gray-600">System analytics and insights</p>
            </div>
            <Button onClick={() => navigate('/admin')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Semesters</option>
                  {semesters.map(semester => (
                    <option key={semester.id} value={semester.id}>
                      {semester.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Courses</option>
                  {allCourses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <SimpleStatCard
            title="Total Courses"
            value={data.stats.totalCourses}
            change={`${data.stats.activeCourses} active`}
            changeType="positive"
          />
          <SimpleStatCard
            title="Total Students"
            value={data.stats.totalStudents}
            change="Enrolled this semester"
            changeType="neutral"
          />
          <SimpleStatCard
            title="Total Projects"
            value={data.stats.totalProjects}
            change={`${data.projectStats.activeProjects} active`}
            changeType="positive"
          />
          <SimpleStatCard
            title="Silent Projects"
            value={data.projectStats.silentProjects}
            change="No commits in 7 days"
            changeType="warning"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Commit Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Commit Activity (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <WeeklyTrendsChart data={commitChartData} />
              </div>
            </CardContent>
          </Card>

          {/* SRS Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>SRS Report Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ContributorsChart data={srsStatusData} />
              </div>
            </CardContent>
          </Card>

          {/* Project Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Projects per Course</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <CommitFrequencyChart data={projectDistribution} />
              </div>
            </CardContent>
          </Card>

          {/* Course Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <BurndownChart data={data.courses.map(course => ({
                  name: course.code,
                  completed: course.projects?.filter(p => srsService.hasFinalSrs(p.id)).length || 0,
                  remaining: course.projects?.filter(p => !srsService.hasFinalSrs(p.id)).length || 0
                }))} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Details */}
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projects</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.courses.slice(0, 5).map(course => (
                      <tr key={course.id}>
                        <td className="px-4 py-3 text-sm">
                          <div>
                            <div className="font-medium text-gray-900">{course.code}</div>
                            <div className="text-gray-500">{course.title}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {course.currentStudents}/{course.maxStudents}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {course.projects?.length || 0}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge 
                            variant={course.status === 'ACTIVE' ? 'success' : 'secondary'}
                            size="sm"
                          >
                            {course.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Silent Projects Alert */}
          {data.projectStats.silentProjects > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-warning-600">Silent Projects Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    {data.projectStats.silentProjects} projects haven't had commits in the last 7 days.
                  </p>
                  <Button 
                    variant="warning" 
                    size="sm"
                    onClick={() => navigate('/lecturer')}
                  >
                    Review Projects
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
