import { useParams } from "react-router-dom";
import React from "react";
import {
  Activity,
  BarChart3,
  Calendar,
  Users,
  GitBranch,
  AlertTriangle,
  TrendingUp,
  FileText
} from "lucide-react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { subDays } from "date-fns";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { Skeleton } from "../../components/ui/skeleton.jsx";

// Hooks
import { useGetCourseById } from "../../features/courses/hooks/useCourses.js";
import { 
  useAnalyticsHeatmap, 
  useCommitTrends, 
  useTeamRankings,
  useInactiveTeams,
  useIntegrationStats
} from "../../features/dashboard/hooks/useDashboard.js";

export default function CourseAnalytics() {
  const { courseId } = useParams();

  // Data fetching
  const { data: course, isLoading: loadingCourse } = useGetCourseById(courseId);
  const { data: heatmapData = [], isLoading: loadingHeatmap } = useAnalyticsHeatmap(90); 
  const { data: commitTrends = [], isLoading: loadingTrends } = useCommitTrends(7);
  const { data: rankings = [], isLoading: loadingRankings } = useTeamRankings(5);
  const { data: inactiveTeams = [], isLoading: loadingInactive } = useInactiveTeams();
  const { data: integrationStats } = useIntegrationStats();

  // Filters
  const courseInactiveTeams = (inactiveTeams || []).filter(t => String(t.courseId) === String(courseId));
  const courseRankings = (rankings || []).filter(t => String(t.courseId) === String(courseId));

  const isLoading = loadingCourse || loadingHeatmap || loadingTrends || loadingRankings || loadingInactive;

  if (isLoading) {
    return (
      <div className="space-y-8 p-8">
        <Skeleton className="h-20 w-3/4 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-[24px]" />)}
        </div>
        <Skeleton className="h-64 rounded-[32px]" />
      </div>
    );
  }

  // Map BE trends to Recharts format
  const chartData = commitTrends.map(t => ({
    day: t.date ? new Date(t.date).toLocaleDateString('vi-VN', { weekday: 'short' }) : t.label,
    commits: t.count ?? t.value ?? 0
  }));

  const finalChartData = chartData.length > 0 ? chartData : [
    { day: "T2", commits: 0 }, { day: "T3", commits: 0 }, { day: "T4", commits: 0 },
    { day: "T5", commits: 0 }, { day: "T6", commits: 0 }, { day: "T7", commits: 0 }, { day: "CN", commits: 0 }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Phân tích Lớp học"
        subtitle={course ? `Lớp: ${course.code} — ${course.name}. Dữ liệu cập nhật từ GitHub & Jira.` : "Tổng quan về hiệu suất và tiến độ của toàn lớp."}
        breadcrumb={["Giảng viên", "Thống kê", course?.code || "Lớp học"]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Nhóm dự án" value={course?.projectsCount || 0} icon={Users} variant="info" />
        <StatsCard label="Tổng sinh viên" value={course?.currentStudents || 0} icon={Activity} variant="success" />
        <StatsCard label="Đã kết nối Repo" value={courseRankings.length || 0} icon={GitBranch} variant="indigo" />
        <StatsCard label="Cần chú ý" value={courseInactiveTeams.length || 0} icon={AlertTriangle} variant="danger" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <Card className="xl:col-span-12 border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 py-5 px-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                <Calendar size={15} className="text-teal-600" />
              </div>
              <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Biểu đồ đóng góp (90 ngày)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="heatmap-container overflow-x-auto pb-4">
               <CalendarHeatmap
                startDate={subDays(new Date(), 90)}
                endDate={new Date()}
                values={heatmapData}
                classForValue={(value) => {
                  if (!value || !value.count) return "color-empty";
                  return `color-scale-${Math.min(value.count, 4)}`;
                }}
                transformDayElement={(element, value, index) => {
                  return React.cloneElement(element, { key: value?.date || index });
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-8 border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
           <CardHeader className="border-b border-gray-50 py-5 px-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                <TrendingUp size={15} className="text-indigo-600" />
              </div>
              <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Xu hướng Commit trong tuần</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={finalChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#9ca3af'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#9ca3af'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                  />
                  <Line
                    type="monotone"
                    dataKey="commits"
                    stroke="#14b8a6"
                    strokeWidth={4}
                    dot={{r: 6, fill: '#14b8a6', strokeWidth: 2, stroke: '#fff'}}
                    activeDot={{r: 8, strokeWidth: 0}}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-4 border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 py-5 px-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <BarChart3 size={15} className="text-blue-600" />
              </div>
              <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Trạng thái Jira Issues</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { status: "Todo", value: integrationStats?.jiraStats?.todo || 0 },
                  { status: "In Progress", value: integrationStats?.jiraStats?.inProgress || 0 },
                  { status: "Done", value: integrationStats?.jiraStats?.done || 0 }
                ]}>
                  <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="value" fill="#14b8a6" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-6 border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 py-5 px-8">
             <CardTitle className="text-sm font-black text-gray-800 uppercase tracking-widest">Nhóm tích cực nhất</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-gray-50">
               {courseRankings.map((t, i) => (
                  <div key={t.id || i} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                     <div className="flex items-center gap-4">
                        <span className="text-lg font-black text-teal-100">0{i+1}</span>
                        <div>
                           <p className="font-bold text-gray-800">{t.name || t.teamName || t.projectName}</p>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.commits || t.count || 0} Total commits</p>
                        </div>
                     </div>
                     <div className="text-right px-4 py-1.5 bg-teal-50 rounded-xl text-teal-700 font-black text-xs">
                        {t.score || 0}% SCORE
                     </div>
                  </div>
               ))}
               {courseRankings.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">Chưa có dữ liệu xếp hạng</div>}
             </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-6 border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 py-5 px-8">
             <CardTitle className="text-sm font-black text-gray-800 uppercase tracking-widest">Nhóm cần chú ý</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-gray-50">
               {courseInactiveTeams.map((t, i) => (
                  <div key={t.id || i} className="flex items-center justify-between p-6 hover:bg-red-50/30 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.severity === 'high' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                           <AlertTriangle size={20} />
                        </div>
                        <div>
                           <p className="font-bold text-gray-800">{t.name || t.teamName}</p>
                           <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">{t.reason || 'Không có hoạt động commit'}</p>
                        </div>
                     </div>
                     <Button variant="ghost" className="text-[10px] font-black uppercase text-teal-600 hover:bg-teal-50 rounded-xl">Nhắc nhở</Button>
                  </div>
               ))}
               {courseInactiveTeams.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">Tất cả các nhóm đều hoạt động tốt</div>}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}