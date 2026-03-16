import { useMemo, useState } from "react";
import {
    Download,
    FileSpreadsheet,
    FileText,
    CheckSquare,
    AlertTriangle,
    GitBranch,
    Eye,
    RefreshCcw,
    ShieldAlert,
    FileBarChart2,
    Clock3,
    CheckCircle2,
    Search,
    ChevronRight,
    Filter,
    SearchX
} from "lucide-react";

// Components UI
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { SelectField, InputField } from "../../components/shared/FormFields.jsx";
import { StatusBadge } from "../../components/shared/Badge.jsx";
import { Skeleton } from "../../components/ui/skeleton.jsx";

// Hooks
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";
import { useGetProjects } from "../../features/projects/hooks/useProjects.js";
import { useInactiveTeams } from "../../features/dashboard/hooks/useDashboard.js";

const EXPORT_TYPES = [
    { id: "by-course", icon: FileSpreadsheet, color: "bg-teal-500", title: "Báo cáo theo Lớp", desc: "Tổng hợp tiến độ tất cả nhóm trong một lớp học. Bao gồm: số nhóm, trạng thái GitHub/Jira, cảnh báo.", formats: ["PDF", "Excel"] },
    { id: "by-group", icon: FileText, color: "bg-blue-500", title: "Báo cáo theo Nhóm", desc: "Chi tiết hoạt động từng nhóm: commit, issue, member, deadline.", formats: ["PDF", "Excel"] },
    { id: "by-student", icon: CheckSquare, color: "bg-indigo-500", title: "Báo cáo theo Sinh viên", desc: "Đóng góp cá nhân: commits, issues, sprint coverage. Phù hợp dùng cho bảng điểm quá trình.", formats: ["PDF", "CSV"] },
    { id: "by-warning", icon: AlertTriangle, color: "bg-amber-500", title: "Báo cáo Cảnh báo", desc: "Nhóm/SV có rủi ro cao dựa trên phân tích AI/Hệ thống.", formats: ["PDF", "Excel"] },
    { id: "by-sync", icon: GitBranch, color: "bg-violet-500", title: "Đối chiếu Jira/GH", desc: "Phân tích khớp dữ liệu giữa Task Jira và Code Commits.", formats: ["PDF", "Excel"] }
];

const MOCK_EXPORTS = [
    { id: 1, type: "Báo cáo theo Lớp", target: "SWD392 - SE1841", format: "PDF", date: "2026-03-01T08:22:00", size: "1.8 MB", createdBy: "Lê Thị Mai" },
    { id: 2, type: "Báo cáo theo Nhóm", target: "Nhóm SE01-G1", format: "Excel", date: "2025-03-03T10:45:00", size: "890 KB" },
    { id: 3, type: "Báo cáo theo Sinh viên", target: "SE001 - K22", format: "CSV", date: "2025-03-05T14:30:00", size: "240 KB" },
];

export default function Reports() {
    const { success, info } = useToast();
    const [selectedType, setSelectedType] = useState("by-course");
    const [courseFilter, setCourseFilter] = useState("all");
    const [teamFilter, setTeamFilter] = useState("all");
    const [search, setSearch] = useState("");

    const { data: coursesData, isLoading: loadingCourses } = useGetCourses({ pageSize: 100 });
    const { data: projectsData, isLoading: loadingProjects } = useGetProjects({ 
        courseId: courseFilter === "all" ? undefined : courseFilter,
        pageSize: 100 
    });
    const { data: inactiveTeams = [] } = useInactiveTeams();

    const courses = coursesData?.items || [];
    const projects = projectsData?.items || [];

    const selectedConfig = EXPORT_TYPES.find(x => x.id === selectedType);

    const isLoading = loadingCourses || loadingProjects;

    const statsRecords = useMemo(() => ({
        totalExports: 42, 
        thisWeek: 5, 
        risky: inactiveTeams.filter(t => t.severity === 'high').length, 
        alertSV: 8, 
        overdue: 12, 
        avgSprint: 76
    }), [inactiveTeams]);

    const previewData = useMemo(() => {
        let teams = projects.map(p => ({
            id: p.id,
            courseId: p.courseId,
            name: p.teamName || p.name,
            project: p.name,
            riskLevel: inactiveTeams.find(it => String(it.projectId) === String(p.id))?.severity === 'high' ? 'High' : 'Low',
            warningCount: inactiveTeams.find(it => String(it.projectId) === String(p.id)) ? 3 : 0,
            commits: p.totalCommits || 0
        }));

        if (search) teams = teams.filter(t => (t.name || "").toLowerCase().includes(search.toLowerCase()) || (t.project || "").toLowerCase().includes(search.toLowerCase()));
        
        return {
            teams,
            totalCommits: teams.reduce((s,t) => s + (t.commits || 0), 0),
            warnings: teams.reduce((s,t) => s + (t.warningCount || 0), 0),
            avgSync: 82
        };
    }, [projects, inactiveTeams, search]);

    const handleExport = (format, typeTitle) => {
        info(`Đang yêu cầu tạo file ${format} cho "${typeTitle}"...`);
        // Simulating export success
        setTimeout(() => {
            success(`Xuất ${format} cho "${typeTitle}" thành công`);
        }, 1500);
    };

    if (isLoading) {
      return (
        <div className="space-y-8 p-8">
          <Skeleton className="h-12 w-1/3" />
          <div className="grid grid-cols-6 gap-4">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader 
                title="Trung tâm Báo cáo"
                subtitle="Trích xuất dữ liệu học thuật, đối chiếu tiến độ Jira/GitHub và đánh giá rủi ro."
                breadcrumb={["Giảng viên", "Báo cáo"]}
                actions={[
                    <Button key="custom" variant="outline" className="rounded-2xl border-gray-200 h-11 px-6 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                        <Filter size={16} className="mr-4" /> Tùy chỉnh
                    </Button>,
                    <Button key="export" className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-11 px-6 text-xs font-black uppercase tracking-widest border-0 shadow-lg shadow-teal-100" onClick={() => handleExport('PDF', 'Export nhanh')}>
                        <Download size={16} className="mr-4" /> Export nhanh
                    </Button>
                ]}
            />

            {/* Top Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatsCard label="Tổng báo cáo" value={statsRecords.totalExports} icon={FileBarChart2} variant="default" />
                <StatsCard label="Xuất tuần này" value={statsRecords.thisWeek} icon={Download} variant="success" />
                <StatsCard label="Nhóm rủi ro" value={statsRecords.risky} icon={AlertTriangle} variant="danger" />
                <StatsCard label="SV cần chú ý" value={statsRecords.alertSV} icon={ShieldAlert} variant="warning" />
                <StatsCard label="Overdue tasks" value={statsRecords.overdue} icon={Clock3} variant="info" />
                <StatsCard label="TB Sprint" value={`${statsRecords.avgSprint}%`} icon={CheckCircle2} variant="indigo" />
            </div>

            {/* Filters */}
            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                   <InputField placeholder="Tìm nhóm, dự án..." value={search} onChange={e => setSearch(e.target.value)} icon={Search} />
                   <SelectField value={courseFilter} onChange={e => setCourseFilter(e.target.value)}>
                        <option value="all">Tất cả lớp học</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                   </SelectField>
                   <SelectField value={teamFilter} onChange={e => setTeamFilter(e.target.value)}>
                        <option value="all">Tất cả nhóm</option>
                        {projects.map(t => <option key={t.id} value={t.id}>{t.teamName || t.name}</option>)}
                   </SelectField>
                   <div className="flex items-center justify-center bg-teal-50 rounded-xl text-[10px] font-black text-teal-700 uppercase tracking-widest border border-teal-100">
                      Tìm thấy {previewData.teams.length} mục
                   </div>
                </CardContent>
            </Card>

            {/* Báo cáo Types */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {EXPORT_TYPES.map(et => (
                    <div 
                        key={et.id} 
                        onClick={() => setSelectedType(et.id)}
                        className={`p-5 rounded-[24px] border transition-all text-left group flex flex-col justify-between h-full cursor-pointer ${selectedType === et.id ? 'border-teal-500 bg-teal-50/20 shadow-lg shadow-teal-100/50' : 'border-gray-100 bg-white hover:border-teal-200 hover:shadow-md'}`}
                    >
                        <div>
                            <div className={`w-12 h-12 rounded-2xl ${et.color} text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                <et.icon size={22} />
                            </div>
                            <h3 className="font-black text-gray-800 text-sm uppercase tracking-tight mb-2">{et.title}</h3>
                            <p className="text-[11px] text-gray-400 font-medium leading-relaxed">{et.desc}</p>
                        </div>
                        <div className="mt-6 flex gap-2">
                             {et.formats.map(f => (
                                <button key={f} onClick={(e) => { e.stopPropagation(); handleExport(f, et.title); }} className="flex-1 py-1.5 rounded-lg bg-white border border-gray-100 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-teal-600 hover:border-teal-200 transition-all">{f}</button>
                             ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Preview Content */}
                <Card className="lg:col-span-8 border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
                    <CardHeader className="border-b border-gray-50 py-6 px-8 flex flex-row items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center"><Eye size={18} className="text-teal-600"/></div>
                            <div>
                                <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Preview: {selectedConfig?.title}</CardTitle>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time Data Generation</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                             {selectedConfig?.formats.map(fmt => <Button key={fmt} variant="outline" size="sm" className="rounded-xl border-gray-100 text-[10px] font-black uppercase tracking-widest h-9" onClick={() => handleExport(fmt, selectedConfig.title)}><Download size={14} className="mr-2" />{fmt}</Button>)}
                         </div>
                    </CardHeader>
                    <CardContent className="p-8">
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                           <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100"><p className="text-[9px] font-black text-teal-600 uppercase mb-1">Teams</p><p className="text-xl font-black text-gray-800">{previewData.teams.length}</p></div>
                           <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100"><p className="text-[9px] font-black text-blue-600 uppercase mb-1">Commits</p><p className="text-xl font-black text-gray-800">{previewData.totalCommits}</p></div>
                           <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100"><p className="text-[9px] font-black text-indigo-600 uppercase mb-1">Avg Sync</p><p className="text-xl font-black text-gray-800">{previewData.avgSync}%</p></div>
                           <div className="p-4 rounded-2xl bg-red-50 border border-red-100"><p className="text-[9px] font-black text-red-600 uppercase mb-1">Warnings</p><p className="text-xl font-black text-gray-800">{previewData.warnings}</p></div>
                         </div>

                         <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Danh sách nhóm rủi ro</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {previewData.teams.filter(t => t.riskLevel === 'High' || t.riskLevel === 'Medium').map(t => (
                                  <div key={t.id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/30 flex justify-between items-center group hover:border-red-200 hover:bg-white transition-all">
                                     <div>
                                        <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold mt-1 truncate max-w-[150px]">{t.project}</p>
                                     </div>
                                     <StatusBadge status={t.riskLevel} variant={t.riskLevel === 'High' ? 'danger' : 'warning'} label={t.riskLevel} />
                                  </div>
                               ))}
                               {previewData.teams.filter(t => t.riskLevel === 'High' || t.riskLevel === 'Medium').length === 0 && (
                                 <p className="text-xs text-gray-400 italic">Không có nhóm rủi ro nào</p>
                               )}
                            </div>
                         </div>
                    </CardContent>
                </Card>

                {/* History Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 py-5 px-6">
                            <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Lịch sử xuất</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {MOCK_EXPORTS.map(ex => (
                                <div key={ex.id} className="p-5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-xs font-black text-gray-800 uppercase tracking-tight">{ex.type}</p>
                                        <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md uppercase">{ex.format}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{ex.target} • {ex.size}</p>
                                    <div className="mt-3 flex gap-2">
                                        <Button variant="ghost" className="h-8 rounded-lg text-teal-600 bg-teal-50 hover:bg-teal-100 text-[10px] font-black uppercase tracking-widest px-4 border-0" onClick={() => handleExport(ex.format, ex.type)}>Tải lại</Button>
                                    </div>
                                </div>
                            ))}
                            {MOCK_EXPORTS.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <SearchX size={32} className="text-gray-300" />
                                    <p className="text-sm text-gray-500 font-black uppercase tracking-widest text-[10px]">Chưa có lịch sử</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white p-8">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4"><RefreshCcw size={24} className="text-indigo-600 animate-spin-slow"/></div>
                            <h4 className="font-black text-gray-800 text-sm uppercase tracking-widest mb-2">Đồng bộ tự động</h4>
                            <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6">Dữ liệu được làm mới mỗi 15 phút từ Jira & GitHub.</p>
                            <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-100 border-0" onClick={() => success("Đã bắt đầu đồng bộ dữ liệu")}>Sync Now</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
