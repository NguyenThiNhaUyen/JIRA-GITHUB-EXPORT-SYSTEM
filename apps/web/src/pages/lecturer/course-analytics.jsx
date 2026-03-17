import { useParams, useNavigate } from "react-router-dom";
import React, { useMemo } from "react";
import {
  Activity,
  BarChart3,
  Calendar,
  Users,
  GitBranch,
  AlertTriangle,
  TrendingUp,
  FileText,
  Download,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  PieChart as PieChartIcon,
  MousePointer2
} from "lucide-react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { subDays, format as formatDateFn } from "date-fns";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { Skeleton } from "../../components/ui/skeleton.jsx";
import { useToast } from "../../components/ui/toast.jsx";

// Hooks
import { useGetCourseById } from "../../features/courses/hooks/useCourses.js";
import { 
  useAnalyticsHeatmap, 
  useCommitTrends, 
  useTeamRankings,
  useInactiveTeams,
  useIntegrationStats
} from "../../features/dashboard/hooks/useDashboard.js";

const COLORS = ['#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function CourseAnalytics() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { success } = useToast();

  // Data fetching
  const { data: course, isLoading: loadingCourse } = useGetCourseById(courseId);
  const { data: heatmapData = [], isLoading: loadingHeatmap } = useAnalyticsHeatmap(90); 
  const { data: commitTrends = [], isLoading: loadingTrends } = useCommitTrends(14); // 2 weeks
  const { data: rankings = [], isLoading: loadingRankings } = useTeamRankings(10);
  const { data: inactiveTeams = [], isLoading: loadingInactive } = useInactiveTeams();
  const { data: integrationStats } = useIntegrationStats();

  // Filters
  const courseInactiveTeams = useMemo(() => (inactiveTeams || []).filter(t => String(t.courseId) === String(courseId)), [inactiveTeams, courseId]);
  const courseRankings = useMemo(() => (rankings || []).filter(t => String(t.courseId) === String(courseId)), [rankings, courseId]);

  const isLoading = loadingCourse || loadingHeatmap || loadingTrends || loadingRankings || loadingInactive;

  if (isLoading) {
    return (
      <div className="space-y-8 p-8">
        <Skeleton className="h-20 w-3/4 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-[24px]" />)}
        </div>
        <div className="grid grid-cols-12 gap-8">
           <Skeleton className="col-span-12 h-64 rounded-[40px]" />
           <Skeleton className="col-span-8 h-96 rounded-[40px]" />
           <Skeleton className="col-span-4 h-96 rounded-[40px]" />
        </div>
      </div>
    );
  }

  // Map BE trends to Recharts format
  const chartData = commitTrends.map(t => ({
    day: t.date ? formatDateFn(new Date(t.date), 'dd/MM') : t.label,
    commits: t.count ?? t.value ?? 0
  }));

  const jiraData = [
    { name: "Sẵn sàng", value: integrationStats?.jiraStats?.todo || 0, color: "#94a3b8" },
    { name: "Đang làm", value: integrationStats?.jiraStats?.inProgress || 0, color: "#6366f1" },
    { name: "Hoàn tất", value: integrationStats?.jiraStats?.done || 1, color: "#14b8a6" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Báo cáo Phân tích"
        subtitle={course ? `Lớp: ${course.code} — ${course.name}. Dữ liệu heatmap & xu hướng từ GitHub.` : "Tổng quan về hiệu suất và tiến độ của toàn lớp."}
        breadcrumb={["Giảng viên", "Thống kê", course?.code || "Lớp học"]}
        actions={[
          <Button key="back" variant="outline" onClick={() => navigate(-1)} className="rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest border-gray-100 hover:bg-gray-50 shadow-sm">
             <ArrowLeft size={14} className="mr-2"/> Quay lại
          </Button>,
          <Button key="export" onClick={() => success("Tính năng này đang được phát triển...")} className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-11 px-8 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-teal-100 border-0 transition-all">
            <Download size={16} className="mr-2" /> Xuất báo cáo PDF
          </Button>
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Nhóm dự án" value={course?.projectsCount || 0} icon={Users} variant="info" />
        <StatsCard label="Tổng sinh viên" value={course?.currentStudents || 0} icon={Activity} variant="success" />
        <StatsCard label="Tỷ lệ kết nối" value={`${Math.round(((courseRankings.length || 0) / (course?.projectsCount || 1)) * 100)}%`} icon={GitBranch} variant="indigo" />
        <StatsCard label="Cần chú ý" value={courseInactiveTeams.length || 0} icon={AlertTriangle} variant="danger" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <Card className="xl:col-span-12 border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 py-6 px-10 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center shadow-inner">
                <Calendar size={18} className="text-teal-600" />
              </div>
              <div>
                <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest leading-none">Cường độ hoạt động (90 ngày qua)</CardTitle>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5 opacity-70">Tổng số commit ghi nhận trên GitHub</p>
              </div>
            </div>
            <div className="flex gap-1">
               {[1,2,3,4].map(i => <div key={i} className={`w-3 h-3 rounded-sm color-scale-${i}`} />)}
               <span className="text-[9px] font-black text-gray-300 uppercase ml-2">High Activity</span>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <div className="heatmap-container overflow-x-auto pb-4 custom-scrollbar">
               <CalendarHeatmap
                startDate={subDays(new Date(), 90)}
                endDate={new Date()}
                values={heatmapData}
                classForValue={(value) => {
                  if (!value || !value.count) return "color-empty";
                  return `color-scale-${Math.min(value.count, 4)}`;
                }}
                tooltipDataAttrs={value => {
                  return {
                    'data-tip': `${value.date || ''}: ${value.count || 0} commits`,
                  };
                }}
                transformDayElement={(element, value, index) => {
                  return React.cloneElement(element, { key: value?.date || index });
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-8 border border-gray-100 shadow-xl shadow-slate-100/50 rounded-[40px] overflow-hidden bg-white">
           <CardHeader className="border-b border-gray-50 py-8 px-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-sm">
                <TrendingUp size={22} className="text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-black text-gray-800 uppercase tracking-widest leading-none">Xu hướng Đóng góp</CardTitle>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 opacity-70">Thống kê commit theo thời gian thức</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#cbd5e1'}} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#cbd5e1'}} dx={-10} />
                  <Tooltip 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '16px'}}
                  />
                  <Line
                    type="monotone"
                    dataKey="commits"
                    stroke="#14b8a6"
                    strokeWidth={5}
                    dot={{r: 4, fill: '#fff', strokeWidth: 3, stroke: '#14b8a6'}}
                    activeDot={{r: 7, strokeWidth: 0, fill: '#14b8a6'}}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-4 border border-gray-100 shadow-xl shadow-slate-100/50 rounded-[40px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 py-8 px-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shadow-sm">
                <PieChartIcon size={22} className="text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-black text-gray-800 uppercase tracking-widest leading-none">Phân bổ Jira</CardTitle>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 opacity-70">Tỷ lệ hoàn thành công việc</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={jiraData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {jiraData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                 <p className="text-2xl font-black text-gray-800 leading-none">
                    {Math.round((integrationStats?.jiraStats?.done / (Object.values(integrationStats?.jiraStats || {}).reduce((a,b)=>a+b,0) || 1)) * 100)}%
                 </p>
                 <p className="text-[8px] font-black text-gray-400 mt-1 uppercase tracking-widest">Done</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-8">
               {jiraData.map(item => (
                 <div key={item.name} className="text-center p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.name}</p>
                    <p className="text-sm font-black text-gray-800">{item.value}</p>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-6 border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 py-6 px-10 flex flex-row items-center justify-between">
             <CardTitle className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" /> Xếp hạng hiệu quả nhóm
             </CardTitle>
             <Badge className="bg-teal-50 text-teal-700 border-teal-100 rounded-lg text-[9px] font-black uppercase">🔥 Top 5</Badge>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-gray-50">
               {courseRankings.slice(0, 5).map((t, i) => (
                  <div key={t.id || i} className="flex items-center justify-between p-8 hover:bg-teal-50/20 transition-all group/item cursor-pointer" onClick={() => navigate(`/lecturer/group/${t.id}`)}>
                     <div className="flex items-center gap-5">
                        <span className="text-2xl font-black text-gray-100 group-hover/item:text-teal-200 transition-colors">0{i+1}</span>
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover/item:bg-white group-hover/item:border-teal-100 group-hover/item:text-teal-600 transition-all">
                           <Users size={20} />
                        </div>
                        <div>
                           <p className="font-black text-gray-800 uppercase tracking-tight text-sm">{t.name || t.teamName}</p>
                           <div className="flex items-center gap-3 mt-1.5">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><GitBranch size={10}/> {t.commits || t.count || 0} Commit</p>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><MousePointer2 size={10}/> Active</p>
                           </div>
                        </div>
                     </div>
                     <div className="text-right flex flex-col items-end gap-1">
                        <div className="px-4 py-1.5 bg-teal-50 rounded-xl text-teal-700 font-black text-[10px] uppercase border border-teal-100">
                           {t.score || 0}% Performance
                        </div>
                        <ChevronRight size={14} className="text-gray-200 group-hover/item:text-teal-400 mr-2" />
                     </div>
                  </div>
               ))}
               {courseRankings.length === 0 && <div className="py-24 text-center text-gray-300 font-black uppercase tracking-widest text-xs opacity-40">Chưa có dữ liệu xếp hạng</div>}
             </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-6 border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 py-6 px-10 flex flex-row items-center justify-between">
             <CardTitle className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" /> Nhóm cần hỗ trợ ngay
             </CardTitle>
             <Badge className="bg-red-50 text-red-700 border-red-100 rounded-lg text-[9px] font-black uppercase">Alerts</Badge>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-gray-50">
               {courseInactiveTeams.map((t, i) => (
                  <div key={t.id || i} className="flex items-center justify-between p-8 hover:bg-red-50/20 transition-all group/item">
                     <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${t.severity === 'high' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                           <AlertTriangle size={24} />
                        </div>
                        <div>
                           <p className="font-black text-gray-800 uppercase tracking-tight text-sm">{t.name || t.teamName}</p>
                           <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mt-1.5 flex items-center gap-1"><Clock size={12}/> {t.reason || 'Không có hoạt động commit > 7 ngày'}</p>
                        </div>
                     </div>
                     <Button variant="outline" className="h-11 px-6 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 border-red-100 rounded-2xl shadow-sm">Nhắc nhở</Button>
                  </div>
               ))}
               {courseInactiveTeams.length === 0 && (
                  <div className="py-24 text-center">
                     <CheckCircle size={40} className="mx-auto text-emerald-100 mb-4" />
                     <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Tất cả các nhóm đều hoạt động tốt</p>
                  </div>
               )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}