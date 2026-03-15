import React, { useState } from 'react';
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
  Activity
} from 'lucide-react';

// Components UI
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { useToast } from '../../components/ui/toast.jsx';

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
  const { success, error } = useToast();
  const navigate = useNavigate();
  
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const { data: semestersData } = useGetSemesters();
  const { data: coursesData } = useGetCourses({
    semesterId: selectedSemester || undefined,
    pageSize: 100
  });

  const generateCommitStats = useGenerateCommitStats();
  const generateTeamRoster = useGenerateTeamRoster();
  const generateSrs = useGenerateSrs();

  const semesters = semestersData || [];
  const allCourses = coursesData?.items || [];

  const stats = {
    totalCourses: allCourses.length,
    totalStudents: allCourses.reduce((sum, c) => sum + (c.currentStudents || 0), 0),
    totalProjects: allCourses.reduce((sum, c) => sum + (c.projectsCount || 0), 0),
    activeCourses: allCourses.filter(c => c.status === 'ACTIVE').length
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
        params = { projectId: id };
      } else if (type === 'SRS') {
        mutation = generateSrs;
        params = { projectId: id };
      }

      await mutation.mutateAsync(params);
      success("Đã bắt đầu tạo báo cáo! Vui lòng kiểm tra email hoặc danh sách báo cáo sau vài phút.");
    } catch (err) {
      error("Không thể tạo báo cáo. Vui lòng thử lại sau.");
    }
  };

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
          <Button key="export" className="rounded-2xl bg-teal-600 hover:bg-teal-700 text-white h-11 px-6 text-xs font-bold uppercase tracking-widest shadow-lg shadow-teal-100 border-0">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Filters & Quick Reports */}
        <Card className="lg:col-span-2 border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 py-5 px-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                <TrendingUp size={15} className="text-teal-600" />
              </div>
              <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Tạo báo cáo nhanh</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <SelectField label="Học kỳ" value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)}>
                <option value="">Tất cả học kỳ</option>
                {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </SelectField>
              <SelectField label="Lớp học" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
                <option value="">Tất cả lớp học</option>
                {allCourses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
              </SelectField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => selectedCourse && handleGenerateReport('COMMIT', selectedCourse)}
                disabled={!selectedCourse}
                className="flex flex-col items-center justify-center p-6 rounded-[20px] bg-gray-50 border border-gray-100 hover:border-teal-500 hover:bg-white hover:shadow-lg hover:shadow-teal-100 transition-all group disabled:opacity-50"
              >
                <Activity className="text-gray-400 group-hover:text-teal-600 mb-3" size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-900">Commit Stats</span>
              </button>
              <button 
                onClick={() => selectedCourse && handleGenerateReport('ROSTER', selectedCourse)}
                disabled={!selectedCourse}
                className="flex flex-col items-center justify-center p-6 rounded-[20px] bg-gray-50 border border-gray-100 hover:border-indigo-500 hover:bg-white hover:shadow-lg hover:shadow-indigo-100 transition-all group disabled:opacity-50"
              >
                <Users className="text-gray-400 group-hover:text-indigo-600 mb-3" size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-900">Team Roster</span>
              </button>
              <button 
                onClick={() => selectedCourse && handleGenerateReport('SRS', selectedCourse)}
                disabled={!selectedCourse}
                className="flex flex-col items-center justify-center p-6 rounded-[20px] bg-gray-50 border border-gray-100 hover:border-emerald-500 hover:bg-white hover:shadow-lg hover:shadow-emerald-100 transition-all group disabled:opacity-50"
              >
                <FileText className="text-gray-400 group-hover:text-emerald-600 mb-3" size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-900">SRS Quality</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* System Activity Summary */}
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 py-5 px-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                <FileText size={15} className="text-orange-600" />
              </div>
              <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Báo cáo gần đây</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:bg-indigo-50 transition-colors">
                      <FileText size={16} className="text-gray-400 group-hover:text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-700">Course_Stats_SWD392_{i}.pdf</p>
                      <p className="text-[10px] text-gray-400 font-medium tracking-tight">Cập nhật 2 giờ trước</p>
                    </div>
                    <Download size={14} className="ml-auto text-gray-300 group-hover:text-teal-600" />
                  </div>
                ))}
                <Button variant="ghost" className="w-full text-xs font-bold text-gray-400 hover:text-teal-600 transition-all pt-4">Xem kho lưu trữ →</Button>
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
