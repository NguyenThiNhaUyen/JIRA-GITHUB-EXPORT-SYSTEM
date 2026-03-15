import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Target,
  Download,
  MessageSquare,
} from "lucide-react";

// Components Shared
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { InputField } from "../../components/shared/FormFields.jsx";
import { useToast } from "../../components/ui/toast.jsx";

// Local Sub-components
import { ContributionStats } from "../../features/lecturer/components/contributions/ContributionStats.jsx";
import { StudentContributionTable } from "../../features/lecturer/components/contributions/StudentContributionTable.jsx";
import { WeeklyActivityChart } from "../../features/lecturer/components/contributions/WeeklyActivityChart.jsx";

// Hooks
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";

const MOCK_STUDENTS = [
  { id: "s1", name: "Nguyễn Văn An", role: "Leader", team: "Team Alpha", commits: 42, prs: 5, reviews: 8, score: 88, status: "stable" },
  { id: "s2", name: "Trần Thị Bình", role: "Member", team: "Team Alpha", commits: 38, prs: 4, reviews: 10, score: 85, status: "stable" },
  { id: "s3", name: "Lê Hoàng Long", role: "Member", team: "Team Alpha", commits: 12, prs: 1, reviews: 2, score: 45, status: "warning" },
  { id: "s4", name: "Phạm Minh Đức", role: "Member", team: "Team Beta", commits: 35, prs: 6, reviews: 4, score: 82, status: "stable" },
];

export default function Contributions() {
  const { success } = useToast();
  const [courseId, setCourseId] = useState("all");
  const [search, setSearch] = useState("");
  
  const { data: coursesData } = useGetCourses({ pageSize: 100 });
  const courses = coursesData?.items || [];

  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.team.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [search]);

  const weeklyCommits = [
    { name: "Mon", count: 24 },
    { name: "Tue", count: 32 },
    { name: "Wed", count: 18 },
    { name: "Thu", count: 45 },
    { name: "Fri", count: 38 },
    { name: "Sat", count: 12 },
    { name: "Sun", count: 5 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Theo dõi Đóng góp"
        subtitle="Phân tích chi tiết nỗ lực cá nhân của sinh viên qua Commits, Pull Requests và Code Reviews."
        breadcrumb={["Giảng viên", "Đóng góp"]}
        actions={[
          <Button key="export" className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-11 px-6 text-xs font-black uppercase tracking-widest border-0 shadow-lg shadow-teal-100">
            <Download size={16} className="mr-2" /> Xuất báo cáo đóng góp
          </Button>
        ]}
      />

      <ContributionStats 
        totalCommits={1215}
        activeStudents={filteredStudents.length}
        avgScore={82}
        totalPRs={142}
        totalReviews={89}
        riskGroupsCount={3}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
            <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Chi tiết sinh viên</h3>
              <div className="flex items-center gap-3">
                <select 
                  className="bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-gray-500 outline-none focus:ring-2 focus:ring-teal-100"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                >
                  <option value="all">Tất cả lớp học</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                </select>
                <div className="w-64">
                  <InputField 
                    placeholder="Tìm sinh viên, nhóm..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    size="sm"
                  />
                </div>
              </div>
            </div>
            <StudentContributionTable 
              students={filteredStudents} 
              onWarning={(s) => success(`Đã gửi cảnh báo tới ${s.name}`)}
            />
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white p-8">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-6">Hoạt động trong tuần</h3>
            <WeeklyActivityChart weeklyCommits={weeklyCommits} />
          </Card>

          <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white p-8">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Top Contributors</h3>
                <Target size={18} className="text-teal-600" />
             </div>
             <div className="space-y-6">
                {filteredStudents.slice(0, 3).map((s, i) => (
                   <div key={s.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-gray-400">0{i+1}</div>
                         <div>
                            <p className="text-sm font-bold text-gray-800">{s.name}</p>
                            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{s.team}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-black text-gray-800">{s.commits}</p>
                         <p className="text-[9px] font-bold text-gray-400 uppercase">Commits</p>
                      </div>
                   </div>
                ))}
             </div>
             <Button className="w-full mt-8 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl h-11 text-xs font-black uppercase tracking-widest border-0">Xem tất cả</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}