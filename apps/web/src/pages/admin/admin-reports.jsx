import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  FolderKanban, 
  CheckCircle, 
  FileText, 
  Download, 
  Printer, 
  TrendingUp,
  Activity,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';

// Components UI
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { useToast } from '../../components/ui/toast.jsx';
import { Badge } from '../../components/ui/badge.jsx';

// Charts
import { BurndownChart } from '../../components/charts/burndown-chart.jsx';
import { CommitFrequencyChart } from '../../components/charts/commit-frequency-chart.jsx';
import { ContributorsChart } from '../../components/charts/contributors-chart.jsx';
import { WeeklyTrendsChart } from '../../components/charts/weekly-trends-chart.jsx';

// Shared Components
import { PageHeader } from '../../components/shared/PageHeader.jsx';
import { StatsCard } from '../../components/shared/StatsCard.jsx';
import { SelectField } from '../../components/shared/FormFields.jsx';

// Hooks
import { useGetCourses } from '../../features/courses/hooks/useCourses.js';
import { useGetSemesters } from '../../features/system/hooks/useSystem.js';
import {
  useGenerateCommitStats,
  useGenerateTeamRoster,
  useGenerateSrs
} from '../../features/admin/hooks/useReports.js';

export default function AdminReports() {
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const { data: semestersData, isLoading: loadingSemesters } = useGetSemesters();
  const { data: coursesData, isLoading: loadingCourses } = useGetCourses({
    semesterId: selectedSemester || undefined,
    pageSize: 100
  });

  const generateCommitStats = useGenerateCommitStats();
  const generateTeamRoster = useGenerateTeamRoster();
  const generateSrs = useGenerateSrs();

  const semesters = semestersData || [];
  const allCourses = coursesData?.items || [];

  const filteredCourses = useMemo(() => {
    if (!selectedCourse) return allCourses;
    return allCourses.filter(c => String(c.id) === String(selectedCourse));
  }, [allCourses, selectedCourse]);

  const stats = useMemo(() => ({
    totalCourses: allCourses.length,
    totalStudents: allCourses.reduce((sum, c) => sum + (c.currentStudents || 0), 0),
    totalProjects: allCourses.reduce((sum, c) => sum + (c.projectsCount || 0), 0),
    activeCourses: allCourses.filter(c => c.status === 'ACTIVE').length
  }), [allCourses]);

  const handleGenerateReport = async (type, id) => {
    try {
      let mutation;
      let params = {};

      if (type === 'COMMIT') {
        mutation = generateCommitStats;
        params = { courseId: id };
      } else if (type === 'ROSTER') {
        mutation = generateTeamRoster;
        params = { courseId: id };
      } else if (type === 'SRS') {
        mutation = generateSrs;
        params = { courseId: id };
      }

      await mutation.mutateAsync(params);
      success("Đã bắt đầu tạo báo cáo! Vui lòng kiểm tra danh sách báo cáo sau vài phút.");
    } catch (err) {
      showError("Không thể tạo báo cáo. Vui lòng thử lại sau.");
    }
  };

  const handleExport = () => {
    try {
      const headers = ["Mã lớp", "Tên lớp", "Học kỳ", "Sinh viên", "Dự án", "Trạng thái"];
      const rows = allCourses.map(c => [
        c.code,
        c.name,
        c.semester?.name || "N/A",
        `${c.currentStudents}/${c.maxStudents}`,
        c.projectsCount || 0,
        c.status
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));

      const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `BaoCaoTongHop_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      success("Đã xuất báo cáo tổng hợp thành công!");
    } catch (err) {
      showError("Không thể xuất báo cáo.");
    }
  };

  if (loadingSemesters || loadingCourses) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Phân tích dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Trung tâm Báo cáo"
        subtitle="Tổng hợp dữ liệu, thống kê hiệu suất và xuất các báo cáo chuyên sâu."
        breadcrumb={["Admin", "Báo cáo"]}
        actions={[
          <Button key="print" variant="outline" className="rounded-2xl border-gray-200 h-11 px-6 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-all">
            <Printer size={16} className="mr-2" /> In báo cáo
          </Button>,
          <Button key="export" onClick={handleExport} className="rounded-2xl bg-teal-600 hover:bg-teal-700 text-white h-11 px-6 text-xs font-bold uppercase tracking-widest shadow-lg shadow-teal-100 border-0">
            <Download size={16} className="mr-2" /> Export Tổng hợp
          </Button>
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Tổng số lớp" value={stats.totalCourses} icon={BookOpen} variant="indigo" />
        <StatsCard label="Lớp đang mở" value={stats.activeCourses} icon={CheckCircle} variant="success" />
        <StatsCard label="Tổng sinh viên" value={stats.totalStudents} icon={Users} variant="info" />
        <StatsCard label="Dự án/Nhóm" value={stats.totalProjects} icon={FolderKanban} variant="warning" />
      </div>

      {/* Filters */}
      <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <SelectField label="Học kỳ" value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)}>
                <option value="">Tất cả học kỳ</option>
                {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
             </SelectField>
             <SelectField label="Lớp học" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
                <option value="">Tất cả lớp học</option>
                {allCourses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
             </SelectField>
             <div className="flex items-end">
                <Button className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-teal-100 border-0" onClick={() => success("Đã cập nhật bộ lọc")}>
                  <Filter size={16} className="mr-2" /> Áp dụng lọc
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Commit Trends */}
        <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 py-5 px-6 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
              <Activity size={18} className="text-blue-500" /> Commit Trends
            </CardTitle>
            <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest px-3 py-1 bg-gray-50">30 Ngày qua</Badge>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-64">
              <WeeklyTrendsChart data={[]} />
            </div>
          </CardContent>
        </Card>

        {/* Project Distribution */}
        <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 py-5 px-6 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
              <FolderKanban size={18} className="text-indigo-500" /> Phân bổ dự án
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-64">
              <CommitFrequencyChart data={filteredCourses.map(c => ({ name: c.code, projects: c.projectsCount || 0, students: c.currentStudents }))} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 py-6 px-8 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Thông tin Lớp học & Báo cáo</CardTitle>
          <Button variant="outline" className="rounded-xl border-gray-200 text-[10px] font-black uppercase tracking-widest h-9" onClick={() => navigate('/admin/my-reports')}>
            LS Báo cáo
          </Button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Lớp học</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Sinh viên</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Dự án</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Trạng thái</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Xuất báo cáo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div>
                      <p className="font-black text-gray-800 text-sm tracking-tight">{course.code}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[200px]">{course.name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <p className="text-sm font-black text-gray-700">{course.currentStudents}<span className="text-gray-300">/{course.maxStudents}</span></p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-sm font-black text-gray-700">{course.projectsCount || 0}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 ${course.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                      {course.status}
                    </Badge>
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 p-0 rounded-xl hover:bg-orange-50 text-orange-600 shadow-sm border border-transparent hover:border-orange-100"
                      onClick={() => handleGenerateReport('COMMIT', course.id)}
                      title="Báo cáo Commit"
                    >
                      <Activity size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 p-0 rounded-xl hover:bg-indigo-50 text-indigo-600 shadow-sm border border-transparent hover:border-indigo-100"
                      onClick={() => handleGenerateReport('ROSTER', course.id)}
                      title="Báo cáo Team Roster"
                    >
                      <Users size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 p-0 rounded-xl hover:bg-emerald-50 text-emerald-600 shadow-sm border border-transparent hover:border-emerald-100"
                      onClick={() => handleGenerateReport('SRS', course.id)}
                      title="Xuất SRS ISO"
                    >
                      <FileText size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredCourses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400 uppercase font-black text-xs tracking-widest">Không có dữ liệu lớp học phù hợp</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
