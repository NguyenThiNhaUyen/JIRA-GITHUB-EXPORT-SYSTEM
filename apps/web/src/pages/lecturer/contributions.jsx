import { useState, useMemo, useEffect } from "react";
import {
  Users,
  Target,
  Download,
  GitBranch,
  Activity,
  TrendingUp,
  Filter
} from "lucide-react";

// Components Shared
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { InputField } from "../../components/shared/FormFields.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";

// Local Sub-components
import { ContributionStats } from "../../features/lecturer/components/contributions/ContributionStats.jsx";
import { StudentContributionTable } from "../../features/lecturer/components/contributions/StudentContributionTable.jsx";
import { WeeklyActivityChart } from "../../features/lecturer/components/contributions/WeeklyActivityChart.jsx";

// Hooks
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";

export default function Contributions() {
    const { success } = useToast();
    const [selectedCourse, setSelectedCourse] = useState("");
    const [search, setSearch] = useState("");
    const [commitsByStudent, setCommitsByStudent] = useState({});
    const [weeklyCommits, setWeeklyCommits] = useState(new Array(12).fill(0).map((_, i) => ({ 
        name: `W${i + 1}`, 
        count: 0 
    })));

    const { data: coursesData = { items: [] }, isLoading: loadingCourses } = useGetCourses({ pageSize: 100 });
    const courses = coursesData.items || [];

    // Initialize selected course
    useEffect(() => {
        if (courses.length > 0 && !selectedCourse) {
            setSelectedCourse(String(courses[0].id));
        }
    }, [courses]);

    const currentCourse = courses.find(c => String(c.id) === selectedCourse);
    const groups = currentCourse?.groups || [];

    // Process data from selected course
    useEffect(() => {
        if (!currentCourse) return;

        // Collect all students in this course from groups
        const allStudents = [];
        groups.forEach(g => {
            (g.team || []).forEach(m => {
                if (!allStudents.find(s => s.studentId === m.studentId)) {
                    allStudents.push(m);
                }
            });
        });

        // Mock/Process commits per student (Keeping origin/main mock logic until real API supports per-student history)
        const byStudent = {};
        allStudents.forEach(s => {
            const mockCommits = Math.floor(Math.random() * 50);
            byStudent[s.studentId] = {
                id: s.studentId,
                name: s.studentName,
                studentCode: s.studentCode || s.studentId,
                team: groups.find(g => (g.team || []).some(m => m.studentId === s.studentId))?.name || "No Team",
                commits: mockCommits,
                prs: Math.floor(mockCommits / 5),
                reviews: Math.floor(mockCommits / 4),
                score: Math.min(100, 40 + mockCommits),
                status: mockCommits > 10 ? "stable" : "warning"
            };
        });
        setCommitsByStudent(byStudent);

        // Mock weekly data
        const mockWeekly = new Array(12).fill(0).map((_, i) => ({
            name: `W${i + 1}`,
            count: Math.floor(Math.random() * 50)
        }));
        setWeeklyCommits(mockWeekly);
    }, [selectedCourse, currentCourse, groups]);

    const filteredStudents = useMemo(() => {
        const studentList = Object.values(commitsByStudent);
        if (!search) return studentList;
        
        const q = search.toLowerCase();
        return studentList.filter(s => 
            (s.name || "").toLowerCase().includes(q) || 
            (s.team || "").toLowerCase().includes(q) ||
            (s.studentCode || "").toLowerCase().includes(q)
        );
    }, [commitsByStudent, search]);

    const stats = useMemo(() => {
        const list = Object.values(commitsByStudent);
        return {
            totalCommits: list.reduce((sum, s) => sum + (s.commits || 0), 0),
            activeStudents: list.filter(s => s.commits > 0).length,
            avgScore: list.length > 0 ? Math.round(list.reduce((sum, s) => sum + (s.score || 0), 0) / list.length) : 0,
            totalPRs: list.reduce((sum, s) => sum + (s.prs || 0), 0),
            totalReviews: list.reduce((sum, s) => sum + (s.reviews || 0), 0),
            riskGroupsCount: list.filter(s => s.status === 'warning').length
        };
    }, [commitsByStudent]);

    if (loadingCourses) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
                <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Đang tải dữ liệu đóng góp...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader 
                title="Theo dõi Đóng góp"
                subtitle="Phân tích chi tiết nỗ lực cá nhân của sinh viên qua Commits, Pull Requests và Code Reviews."
                breadcrumb={["Giảng viên", "Đóng góp"]}
                actions={[
                    <Button key="export" className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-11 px-6 text-xs font-black uppercase tracking-widest border-0 shadow-lg shadow-teal-100">
                        <Download size={16} className="mr-2" /> Xuất báo cáo
                    </Button>
                ]}
            />

            <ContributionStats 
                totalCommits={stats.totalCommits}
                activeStudents={stats.activeStudents}
                avgScore={stats.avgScore}
                totalPRs={stats.totalPRs}
                totalReviews={stats.totalReviews}
                riskGroupsCount={stats.riskGroupsCount}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest leading-none">Chi tiết sinh viên</h3>
                            <div className="flex items-center gap-3">
                                <select 
                                    className="bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-black text-gray-500 outline-none focus:ring-2 focus:ring-teal-100 uppercase tracking-widest"
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                >
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
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-6 leading-none">Hoạt động trong tuần</h3>
                        <WeeklyActivityChart weeklyCommits={weeklyCommits} />
                    </Card>

                    <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white p-8">
                         <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest leading-none">Top Contributors</h3>
                            <Target size={18} className="text-teal-600" />
                         </div>
                         <div className="space-y-6">
                            {filteredStudents.sort((a,b) => b.commits - a.commits).slice(0, 3).map((s, i) => (
                               <div key={s.id} className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-gray-400">0{i+1}</div>
                                     <div>
                                        <p className="text-sm font-black text-gray-800 truncate max-w-[120px]">{s.name}</p>
                                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{s.team}</p>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     <p className="text-sm font-black text-gray-800">{s.commits}</p>
                                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Commits</p>
                                  </div>
                               </div>
                            ))}
                            {filteredStudents.length === 0 && <p className="text-center text-[10px] font-black uppercase text-gray-400 tracking-widest py-4">Không có dữ liệu</p>}
                         </div>
                         <Button className="w-full mt-8 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl h-11 text-xs font-black uppercase tracking-widest border-0">Xem tất cả</Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
