// SRS Reports — Lecturer
import { useState, useEffect } from "react";
import { ChevronRight, FileText, Eye, CheckCircle, MessageSquare, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { SRS_STATUS as STATUS } from "../../shared/permissions.js";
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";
import { useGetProjects } from "../../features/projects/hooks/useProjects.js";
import {
    useGetProjectSrs,
    useUpdateSrsStatus,
    useProvideSrsFeedback
} from "../../features/srs/hooks/useSrs.js";
import { useRemindOverdueSrs } from "../../features/admin/hooks/useReports.js";
import { getProjectSrs } from "../../features/srs/api/srsApi.js";


export default function SrsReports() {
    const { success, error: showError } = useToast();
    const { user } = useAuth();
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedProject, setSelectedProject] = useState("");
    
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState("all");
    const [srsList, setSrsList] = useState([]);
    const [loadingSrs, setLoadingSrs] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");

    const { data: coursesData } = useGetCourses({ pageSize: 100 });
    const { data: projectsData = { items: [] } } = useGetProjects(
        selectedCourse ? { courseId: selectedCourse, pageSize: 100 } : null
    );

    useEffect(() => {
        let isCancelled = false;
        if (selectedProject) {
             // Pass isCancelled check to avoid setting state if unmounted or project changed
             loadSrsData(selectedProject, isCancelled);
        } else {
            setSrsList([]);
        }
        return () => { isCancelled = true; };
    }, [selectedProject]);

    useEffect(() => {
        if (selected) {
            const s = srsList.find(s => s.id === selected);
            if (s) setFeedbackText(s.feedback || "");
        }
    }, [selected, srsList]);

    const loadSrsData = async (projectId, isCancelled = false) => {
        if (!user || !projectId) return;
        setLoadingSrs(true);
        try {
            const results = await getProjectSrs(projectId);
            if (isCancelled) return; // BUG-51: Race condition guard
            
            const project = projectsData.items.find(p => p.id === parseInt(projectId));
            const course = coursesData?.items.find(c => c.id === project?.courseId);

            const mappedSrs = results.map(srs => ({
                id: srs.id,
                group: project?.name || 'Nhóm',
                project: course?.code || `Project #${projectId}`,
                version: srs.version,
                status: srs.status,
                date: srs.submittedAt,
                reviewer: srs.reviewerName || '—',
                feedback: srs.feedback || '',
                fileUrl: srs.fileUrl,
                rawSrs: srs
            }));

            mappedSrs.sort((a, b) => new Date(b.date) - new Date(a.date));
            setSrsList(mappedSrs);
        } catch (err) {
            if (isCancelled) return;
            console.error("Failed to fetch SRS", err);
            setSrsList([]);
        } finally {
            if (!isCancelled) setLoadingSrs(false);
        }
    };


    const updateStatusMutation = useUpdateSrsStatus();
    const feedbackMutation = useProvideSrsFeedback();
    const remindSrsMutation = useRemindOverdueSrs();

    const handleStatusUpdate = async (srsId, newStatus) => {
        try {
            await updateStatusMutation.mutateAsync({
                reportId: srsId,
                newStatus,
                feedback: feedbackText
            });
            success(`Đã chuyển trạng thái SRS sang ${newStatus}`);
            loadSrsData(selectedProject);
        } catch (err) {
            showError(err.message || 'Cập nhật trạng thái SRS thất bại');
            console.error(err);
        }
    };

    const handleFeedback = async (srsId) => {
        try {
            await feedbackMutation.mutateAsync({
                reportId: srsId,
                feedback: feedbackText
            });
            success("Đã ghi nhận nhận xét");
            loadSrsData(selectedProject);
        } catch (err) {
            showError(err.message || 'Lưu nhận xét thất bại');
            console.error(err);
        }
    };

    const isUpdating = updateStatusMutation.isPending || feedbackMutation.isPending;

    const filtered = filter === "all" ? srsList : srsList.filter(s => s.status === filter);
    const selectedSrs = srsList.find(s => s.id === selected);

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <span className="text-teal-700 font-semibold">Giảng viên</span>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-semibold">SRS Reports</span>
            </nav>

            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-800">SRS Reports</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Tài liệu đặc tả yêu cầu phần mềm theo nhóm / project</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Lớp học</span>
                        <select 
                            value={selectedCourse}
                            onChange={(e) => { setSelectedCourse(e.target.value); setSelectedProject(""); }}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none min-w-[160px]"
                        >
                            <option value="">-- Chọn lớp --</option>
                            {coursesData?.items?.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nhóm</span>
                        <select 
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            disabled={!selectedCourse}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none min-w-[160px] disabled:opacity-50"
                        >
                            <option value="">-- Chọn nhóm --</option>
                            {projectsData.items.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div className="pt-5">
                        <button
                            onClick={() => remindSrsMutation.mutate(undefined, {
                                onSuccess: () => success('Đã gửi nhắc nhở SRS đến tất cả nhóm chưa nộp!'),
                                onError: (err) => showError(err.message || 'Không thể gửi nhắc nhở'),
                            })}
                            disabled={remindSrsMutation.isPending}
                            className="flex items-center gap-2 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl px-4 py-2 h-9 transition-colors disabled:opacity-50"
                        >
                            🔔 {remindSrsMutation.isPending ? 'Nhắn...': 'Nhắc nộp'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Final", count: srsList.filter(s => s.status === "FINAL").length, color: "text-green-700 bg-green-50 border-green-100" },
                    { label: "Review", count: srsList.filter(s => s.status === "REVIEW").length, color: "text-blue-700 bg-blue-50 border-blue-100" },
                    { label: "Draft", count: srsList.filter(s => s.status === "DRAFT").length, color: "text-gray-500 bg-gray-100 border-gray-200" },
                ].map(({ label, count, color }) => (
                    <div key={label} className={`rounded-2xl px-4 py-3 border flex items-center justify-between ${color}`}>
                        <span className="text-xs font-semibold">{label}</span>
                        <span className="text-xl font-bold">{count}</span>
                    </div>
                ))}
            </div>

            {/* Filter chips */}
            <div className="flex items-center gap-2">
                {["all", "FINAL", "REVIEW", "DRAFT"].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === f ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 border-gray-200 hover:border-teal-400"
                            }`}
                    >
                        {f === "all" ? "Tất cả" : f}
                    </button>
                ))}
            </div>

            {/* 2-column: list + preview */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* List */}
                <div className="lg:col-span-3">
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-4">Nhóm / Lớp</div>
                            <div className="col-span-2 text-center">Version</div>
                            <div className="col-span-2 text-center">Trạng thái</div>
                            <div className="col-span-4 text-right">Thao tác</div>
                        </div>
                        <CardContent className="p-0">
                             {loadingSrs ? (
                                <div className="p-10 space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-2">
                                    <FileText size={28} className="text-gray-200" />
                                    <p className="text-sm text-gray-400">Không có báo cáo nào</p>
                                </div>
                            ) : filtered.map((srs) => {
                                // BUG-53: Safe status mapping with fallback
                                const s = STATUS[srs.status] || { 
                                    label: srs.status || 'UNKNOWN', 
                                    cls: "bg-gray-50 text-gray-500 border-gray-100" 
                                };
                                return (
                                    <div
                                        key={srs.id}
                                        onClick={() => {
                                            // BUG-54: Check for unsaved feedback (Stress Test Protection)
                                            const originalFeedback = srsList.find(s => s.id === selected)?.feedback || "";
                                            if (selected && selected !== srs.id && feedbackText !== originalFeedback) {
                                                if (!window.confirm("Bạn có thay đổi nhận xét chưa lưu. Tiếp tục chuyển?")) return;
                                            }
                                            setSelected(srs.id === selected ? null : srs.id);
                                        }}
                                        className={`grid grid-cols-12 gap-2 px-5 py-3.5 items-center border-b border-gray-50 hover:bg-gray-50/60 transition-colors last:border-0 cursor-pointer ${selected === srs.id ? "bg-teal-50/40" : ""}`}
                                    >
                                        <div className="col-span-4">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{srs.group}</p>
                                            <p className="text-[11px] text-gray-400 truncate">{srs.project}</p>
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <span className="text-xs font-mono text-gray-600">{srs.version}</span>
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${s.cls}`}>
                                                {s.label}
                                            </span>
                                        </div>
                                        <div className="col-span-4 flex items-center justify-end gap-1 flex-wrap">
                                            <button
                                                onClick={e => { e.stopPropagation(); setSelected(srs.id); }}
                                                className="flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg px-2 py-1.5 border border-teal-100 transition-colors whitespace-nowrap"
                                            >
                                                <Eye size={11} />View
                                            </button>
                                            {srs.status === "REVIEW" && (
                                                <button
                                                    disabled={isUpdating}
                                                    onClick={e => { e.stopPropagation(); handleStatusUpdate(srs.id, 'FINAL'); }}
                                                    className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg px-2 py-1.5 border border-green-100 transition-colors whitespace-nowrap disabled:opacity-50"
                                                >
                                                    <CheckCircle size={11} />Approve
                                                </button>
                                            )}
                                            {srs.status === "REVIEW" && (
                                                <button
                                                    disabled={isUpdating}
                                                    onClick={e => { e.stopPropagation(); handleStatusUpdate(srs.id, 'DRAFT'); }}
                                                    className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg px-2 py-1.5 border border-red-100 transition-colors whitespace-nowrap disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>

                {/* Preview panel */}
                <div className="lg:col-span-2">
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white sticky top-4">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <FileText size={15} className="text-indigo-600" />
                                </div>
                                <CardTitle className="text-base font-semibold text-gray-800">Chi tiết SRS</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-5">
                            {!selectedSrs ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                                    <FileText size={32} className="text-gray-300" />
                                    <p className="text-sm text-gray-400">Chọn một SRS để xem chi tiết</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nhóm</label>
                                        <p className="text-sm font-semibold text-gray-800 mt-0.5">{selectedSrs.group}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Project</label>
                                        <p className="text-sm text-gray-700 mt-0.5">{selectedSrs.project}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phiên bản</label>
                                            <p className="text-sm font-mono text-gray-700 mt-0.5">{selectedSrs.version}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trạng thái</label>
                                            <div className="mt-0.5">
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${STATUS[selectedSrs.status].cls}`}>
                                                    {selectedSrs.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Người review</label>
                                        <p className="text-sm text-gray-700 mt-0.5">{selectedSrs.reviewer}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">File đính kèm</label>
                                        {selectedSrs.fileUrl ? (
                                            <a href={selectedSrs.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 mt-0.5">
                                                <ExternalLink size={14} /> Tải xuống / Xem file
                                            </a>
                                        ) : (
                                            <p className="text-sm text-gray-400 mt-0.5">Không có link file</p>
                                        )}
                                    </div>
                                    {/* Grading Form Section */}
                                    <div className="pt-4 border-t border-gray-100 bg-gray-50/50 -mx-6 px-6 pb-6 rounded-b-[24px]">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-6 h-6 rounded-lg bg-teal-100 flex items-center justify-center">
                                                <CheckCircle size={14} className="text-teal-600" />
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-800">Chấm bài & Nhận xét</h4>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                                                    Nhận xét của Giảng viên
                                                </label>
                                                <textarea
                                                    rows={4}
                                                    value={feedbackText}
                                                    onChange={(e) => setFeedbackText(e.target.value)}
                                                    placeholder="Nhập nội dung phản hồi cho nhóm..."
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none transition-all shadow-sm"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    disabled={isUpdating}
                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 text-xs font-bold border-0 shadow-sm"
                                                    onClick={() => handleStatusUpdate(selectedSrs.id, 'FINAL')}
                                                >
                                                    <CheckCircle size={14} className="mr-1" /> Duyệt Final
                                                </Button>
                                                <Button
                                                    disabled={isUpdating}
                                                    variant="outline"
                                                    className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl h-10 text-xs font-bold shadow-sm"
                                                    onClick={() => handleStatusUpdate(selectedSrs.id, 'DRAFT')}
                                                >
                                                    Từ chối (Reject)
                                                </Button>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                disabled={isUpdating || !feedbackText}
                                                className="w-full text-[11px] text-gray-500 hover:text-teal-600 hover:bg-teal-50 h-8 font-medium rounded-lg"
                                                onClick={() => handleFeedback(selectedSrs.id)}
                                            >
                                                <MessageSquare size={12} className="mr-1" /> Chỉ lưu nhận xét
                                            </Button>
                                        </div>
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
