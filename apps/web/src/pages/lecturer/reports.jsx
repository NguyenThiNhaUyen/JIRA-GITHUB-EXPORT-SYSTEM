import {
    Download,
    AlertTriangle,
    ShieldAlert,
    FileBarChart2,
    Clock3,
    CheckCircle2,
    Search,
    Filter,
} from "lucide-react";

// Components UI
import { Card, CardContent } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";

// Shared Components
import { PageHeader } from "../components/shared/PageHeader.jsx";
import { StatsCard } from "../components/shared/StatsCard.jsx";
import { SelectField, InputField } from "../../components/shared/FormFields.jsx";

// Local Components
import { ReportPreview } from "./components/Reports/ReportPreview.jsx";
import { ReportHistory } from "./components/Reports/ReportHistory.jsx";

// Hooks
import { useReports } from "./hooks/useReports.js";

export default function Reports() {
    const { success } = useToast();
    const {
        selectedType, setSelectedType,
        courseFilter, setCourseFilter,
        teamFilter, setTeamFilter,
        search, setSearch,
        courses,
        projects,
        selectedConfig,
        statsRecords,
        previewData,
        myReports,
        loading,
        handleExport,
        EXPORT_TYPES
    } = useReports();

    if (loading) {
        return (
            <div className="space-y-8 p-8">
                <Skeleton className="h-12 w-1/3" />
                <div className="grid grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
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
                    <Button key="custom" variant="outline" className="rounded-2xl border-gray-100 h-11 px-6 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                        <Filter size={16} className="mr-4" /> Tùy chỉnh
                    </Button>,
                    <Button key="export" className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-11 px-6 text-xs font-black uppercase tracking-widest border-0 shadow-lg shadow-teal-100" onClick={() => handleExport('PDF', 'Export nhanh', 'Export nhanh')}>
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
                                <button key={f} onClick={(e) => { e.stopPropagation(); handleExport(f, et.id, et.title); }} className="flex-1 py-1.5 rounded-lg bg-white border border-gray-100 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-teal-600 hover:border-teal-200 transition-all">{f}</button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <ReportPreview
                    selectedConfig={selectedConfig}
                    previewData={previewData}
                    handleExport={handleExport}
                />

                <ReportHistory
                    myReports={myReports}
                    success={(msg) => success(msg)}
                />
            </div>
        </div>
    );
}
