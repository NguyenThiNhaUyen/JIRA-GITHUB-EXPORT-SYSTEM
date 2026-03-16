import { useState, useEffect, useMemo } from "react";
import { 
    ChevronRight, 
    FileText, 
    Eye, 
    CheckCircle, 
    MessageSquare, 
    ExternalLink, 
    Clock, 
    AlertTriangle, 
    FileDown,
    Search,
    Filter as FilterIcon
} from "lucide-react";

// Components UI
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { InputField } from "../../components/shared/FormFields.jsx";
import { StatusBadge } from "../../components/shared/Badge.jsx";

// Hooks & Auth
import { useAuth } from "../../context/AuthContext.jsx";
import { SRS_STATUS as STATUS_CONFIG } from "../../shared/permissions.js";
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";
import { useGetProjects } from "../../features/projects/hooks/useProjects.js";
import {
    useUpdateSrsStatus,
    useProvideSrsFeedback
} from "../../features/srs/hooks/useSrs.js";
import { getProjectSrs } from "../../features/srs/api/srsApi.js";

export default function SrsReports() {
    const { success, error: showError } = useToast();
    const { user } = useAuth();
    const [selected, setSelected] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [srsList, setSrsList] = useState([]);
    const [feedbackText, setFeedbackText] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isDataLoading, setIsDataLoading] = useState(false);

    const { data: coursesData } = useGetCourses({ pageSize: 100 });
    const { data: projectsData } = useGetProjects({ pageSize: 100 });

    const loadAllSrsData = async (projects, courses) => {
        if (!user || projects.length === 0) return;
        setIsDataLoading(true);
        try {
            // Fetch SRS for all projects in parallel
            const srsPromises = projects.map(p => getProjectSrs(p.id));
            const results = await Promise.all(srsPromises);

            const lecturerSrs = [];

            // Map and flatten the data
            for (let i = 0; i < projects.length; i++) {
                const project = projects[i];
                const course = courses.find(c => c.id === project.courseId);
                const srsOfProject = results[i] || [];

                for (const srs of srsOfProject) {
                    lecturerSrs.push({
                        id: srs.id,
                        group: project.teamName || project.name,
                        project: course?.code || `C-${project.courseId}`,
                        courseName: course?.name,
                        version: srs.version,
                        status: srs.status,
                        date: srs.submittedAt,
                        reviewer: srs.reviewerName || '—',
                        feedback: srs.feedback || '',
                        fileUrl: srs.fileUrl,
                        rawSrs: srs
                    });
                }
            }

            // sort by submitted at desc
            lecturerSrs.sort((a, b) => new Date(b.date) - new Date(a.date));
            setSrsList(lecturerSrs);
        } catch (err) {
            console.error("Failed to fetch SRS", err);
            showError("Không thể tải danh sách SRS");
        } finally {
            setIsDataLoading(false);
        }
    };

    useEffect(() => {
        if (coursesData?.items && projectsData?.items) {
            loadAllSrsData(projectsData.items, coursesData.items);
        }
    }, [coursesData, projectsData]);

    useEffect(() => {
        if (selected) {
            const s = srsList.find(s => s.id === selected);
            if (s) setFeedbackText(s.feedback || "");
        }
    }, [selected, srsList]);

    const updateStatusMutation = useUpdateSrsStatus();
    const feedbackMutation = useProvideSrsFeedback();

    const handleStatusUpdate = async (srsId, newStatus) => {
        try {
            await updateStatusMutation.mutateAsync({
                reportId: srsId,
                newStatus,
                feedback: feedbackText
            });
            success(`Đã chuyển trạng thái SRS sang ${newStatus}`);
            loadAllSrsData(projectsData?.items || [], coursesData?.items || []);
        } catch (err) {
            showError(err.message || "Thao tác thất bại");
        }
    };

    const handleFeedback = async (srsId) => {
        try {
            await feedbackMutation.mutateAsync({
                reportId: srsId,
                feedback: feedbackText
            });
            success("Đã ghi nhận nhận xét");
            loadAllSrsData(projectsData?.items || [], coursesData?.items || []);
        } catch (err) {
            showError(err.message || "Thao tác thất bại");
        }
    };

    const isUpdating = updateStatusMutation.isPending || feedbackMutation.isPending;

    const filtered = useMemo(() => {
        return srsList.filter(s => {
            const matchesStatus = statusFilter === "all" || s.status === statusFilter;
            const q = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                (s.group || "").toLowerCase().includes(q) || 
                (s.project || "").toLowerCase().includes(q) || 
                (s.courseName || "").toLowerCase().includes(q);
            return matchesStatus && matchesSearch;
        });
    }, [srsList, statusFilter, searchTerm]);

    const selectedSrs = srsList.find(s => s.id === selected);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader 
                title="Quản lý SRS"
                subtitle="Theo dõi và phê duyệt các tài liệu đặc tả yêu cầu phần mềm từ các nhóm dự án."
                breadcrumb={["Giảng viên", "SRS Reports"]}
                actions={[
                    <Button key="export" variant="outline" className="rounded-2xl border-gray-200 h-11 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                        <FileDown size={14} className="mr-2" /> Xuất báo cáo tổng hợp
                    </Button>
                ]}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard 
                    label="Tổng báo cáo" 
                    value={srsList.length} 
                    icon={FileText} 
                    variant="info" 
                />
                <StatsCard 
                    label="Bản Final" 
                    value={srsList.filter(s => s.status === "FINAL").length} 
                    icon={CheckCircle} 
                    variant="success" 
                />
                <StatsCard 
                    label="Đang Review" 
                    value={srsList.filter(s => s.status === "REVIEW").length} 
                    icon={Clock} 
                    variant="warning" 
                />
                <StatsCard 
                    label="Bản nháp" 
                    value={srsList.filter(s => s.status === "DRAFT").length} 
                    icon={FileText} 
                    variant="default" 
                />
            </div>

            {/* Filter Bar */}
            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2">
                        {["all", "FINAL", "REVIEW", "DRAFT"].map(f => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === f ? 'bg-teal-600 text-white shadow-lg shadow-teal-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                            >
                                {f === "all" ? "Tất cả" : f}
                            </button>
                        ))}
                    </div>
                    <div className="w-full md:w-80">
                        <InputField 
                            placeholder="Tìm dự án, nhóm, sinh viên..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            icon={Search} 
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* List Table */}
                <Card className="lg:col-span-8 border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Nhóm / Lớp</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Version</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Trạng thái</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isDataLoading ? (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang quét dữ liệu SRS...</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((srs) => {
                                        const config = STATUS_CONFIG[srs.status] || { label: srs.status, cls: "bg-gray-100 text-gray-500" };
                                        return (
                                            <tr 
                                                key={srs.id} 
                                                onClick={() => setSelected(srs.id)}
                                                className={`group hover:bg-teal-50/20 transition-colors cursor-pointer ${selected === srs.id ? 'bg-teal-50/40' : ''}`}
                                            >
                                                <td className="px-8 py-6">
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-sm">{srs.group}</p>
                                                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mt-0.5">{srs.project}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="text-xs font-mono text-gray-500">{srs.version}</span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${config.cls}`}>
                                                        {config.label}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-gray-100">
                                                            <Eye size={16} />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-gray-100" onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (srs.fileUrl) window.open(srs.fileUrl, '_blank');
                                                            else success("Không có file đính kèm");
                                                        }}>
                                                            <ExternalLink size={16} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {!isDataLoading && filtered.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText size={24} className="text-gray-300" />
                            </div>
                            <p className="text-gray-400 text-sm font-medium">Không tìm thấy báo cáo nào phù hợp.</p>
                        </div>
                    )}
                </Card>

                {/* Preview / Detail Panel */}
                <div className="lg:col-span-4">
                    <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white sticky top-4">
                        <CardHeader className="border-b border-gray-50 py-5 px-6">
                            <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                <FileText size={18} className="text-indigo-600" /> Chi tiết SRS
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            {!selectedSrs ? (
                                <div className="text-center py-20">
                                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                        <Eye size={24} className="text-gray-300" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chọn một bản SRS để xem chi tiết</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Phiên bản</p>
                                            <p className="text-sm font-mono font-bold text-gray-800">{selectedSrs.version}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Ngày nộp</p>
                                            <p className="text-sm font-bold text-gray-800">{new Date(selectedSrs.date).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Tài liệu</p>
                                        {selectedSrs.fileUrl ? (
                                            <a href={selectedSrs.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold hover:bg-teal-100 transition-all">
                                                <ExternalLink size={14} /> SRS Document File
                                            </a>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">Không có file đính kèm</p>
                                        )}
                                    </div>

                                    <div className="pt-6 border-t border-gray-50">
                                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-3">Nhận xét từ Giảng viên</label>
                                        <textarea 
                                            className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none text-sm transition-all min-h-[120px] resize-none"
                                            placeholder="Nhập phản hồi, góp ý cho nhóm..."
                                            value={feedbackText}
                                            onChange={(e) => setFeedbackText(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button 
                                                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-11 text-[10px] font-black uppercase tracking-widest border-0 shadow-lg shadow-teal-100"
                                                onClick={() => handleStatusUpdate(selectedSrs.id, 'FINAL')}
                                                disabled={isUpdating}
                                            >
                                                <CheckCircle size={14} className="mr-2"/> Phê duyệt
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                className="border-red-100 text-red-600 hover:bg-red-50 rounded-xl h-11 text-[10px] font-black uppercase tracking-widest"
                                                onClick={() => handleStatusUpdate(selectedSrs.id, 'DRAFT')}
                                                disabled={isUpdating}
                                            >
                                                Từ chối
                                            </Button>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            className="w-full h-11 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600"
                                            onClick={() => handleFeedback(selectedSrs.id)}
                                            disabled={isUpdating || !feedbackText}
                                        >
                                            <MessageSquare size={14} className="mr-2"/> Chỉ lưu nhận xét
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
