// Reports & Export — Lecturer (FULLY AUDITED)
import { useState, useEffect } from "react";
import { ChevronRight, Download, FileSpreadsheet, FileText, Filter, Loader2, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";
import { useGetProjects } from "../../features/projects/hooks/useProjects.js";
import {
    useGenerateCommitStats,
    useGenerateTeamRoster,
    useGenerateSrs,
    useGetMyReports,
} from "../../features/admin/hooks/useReports.js";
import {
    downloadCommitStats,
    downloadTeamRoster,
    downloadSrs
} from "../../features/admin/api/reportApi.js";

/**
 * AUDITED: Danh sách loại report có thể xuất
 * action phải khớp chính xác với switch-case trong handleExport
 */
const EXPORT_TYPES = [
    {
        id: "by-course",
        icon: FileSpreadsheet,
        color: "bg-teal-500",
        title: "Thống kê Commit (Lớp)",
        desc: "Xuất file Excel/PDF thống kê số lượng commit của các nhóm trong lớp.",
        formats: ["PDF", "Excel"],
        action: "commit-stats",
        requiresGroup: false,
    },
    {
        id: "by-group",
        icon: FileText,
        color: "bg-blue-500",
        title: "Danh sách nhóm",
        desc: "Xuất danh sách thành viên và vai trò của một nhóm cụ thể.",
        formats: ["PDF", "Excel"],
        action: "team-roster",
        requiresGroup: true,
    },
    {
        id: "srs-report",
        icon: LinkIcon,
        color: "bg-indigo-500",
        title: "Báo cáo SRS (ISO 29148)",
        desc: "Xuất tài liệu SRS chuẩn ISO từ Jira theo Template mẫu (Word/PDF).",
        formats: ["PDF", "Word"],
        action: "srs",
        requiresGroup: true,
    },
];

/**
 * AUDITED: Map format từ UI label → giá trị BE nhận
 */
const FORMAT_MAP = {
    "PDF": "PDF",
    "Excel": "Excel",
    "Word": "DOCX",
};

/**
 * AUDITED: Tải file xuống. Dùng thẻ <a> ẩn thay vì window.location
 * để tránh điều hướng cả trang.
 */
function triggerDownload(url, filename) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    // Với URL bên ngoài, download attr chỉ hoạt động same-origin nên dùng target=_blank
    if (filename) a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function triggerBlobDownload(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `report_${Date.now()}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}

export default function Reports() {
    const { success, error, info } = useToast();
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedProject, setSelectedProject] = useState("");

    // === DATA QUERIES ===
    const { data: coursesData } = useGetCourses({ pageSize: 100 });
    const { data: projectsData = { items: [] } } = useGetProjects(
        selectedCourse ? { courseId: selectedCourse, pageSize: 100 } : null
    );
    const { data: myReports, refetch: refetchReports, isLoading: loadingHistory } = useGetMyReports();

    // Khi đổi lớp → reset nhóm đã chọn
    useEffect(() => {
        setSelectedProject("");
    }, [selectedCourse]);

    // === MUTATIONS ===
    const genCommitStats = useGenerateCommitStats();
    const genTeamRoster = useGenerateTeamRoster();
    const genSrs = useGenerateSrs();

    const isGenerating = genCommitStats.isPending || genTeamRoster.isPending || genSrs.isPending;

    /**
     * AUDITED handleExport:
     * - Guard check TRƯỚC khi vào try để lỗi toast hoạt động đúng
     * - err.message (đã được interceptor normalize) thay vì err.response.data.message
     * - FORMAT_MAP để convert "Word" → "DOCX"
     */
    const handleExport = async (action, formatLabel) => {
        if (!selectedCourse) {
            error("Vui lòng chọn lớp học trước");
            return;
        }
        const et = EXPORT_TYPES.find(x => x.action === action);
        if (et?.requiresGroup && !selectedProject) {
            error("Loại báo cáo này yêu cầu chọn nhóm");
            return;
        }

        const format = FORMAT_MAP[formatLabel] ?? formatLabel;

        try {
            info(`Đang tạo & tải báo cáo ${formatLabel}...`);

            if (action === "commit-stats") {
                const { blob, filename } = await downloadCommitStats(selectedCourse, format);
                triggerBlobDownload(blob, filename ?? `commit_statistics_${selectedCourse}_${Date.now()}.${format.toLowerCase() === "excel" ? "xlsx" : "pdf"}`);
            } else if (action === "team-roster") {
                const { blob, filename } = await downloadTeamRoster({ projectId: selectedProject, format });
                triggerBlobDownload(blob, filename ?? `team_roster_${selectedProject}_${Date.now()}.${format.toLowerCase() === "excel" ? "xlsx" : "pdf"}`);
            } else if (action === "srs") {
                const { blob, filename } = await downloadSrs({ projectId: selectedProject, format });
                triggerBlobDownload(blob, filename ?? `srs_iso_${selectedProject}_${Date.now()}.pdf`);
            }

            success("Đã tải file về. Lịch sử sẽ được cập nhật tự động.");
            setTimeout(() => refetchReports(), 2000);
            setTimeout(() => refetchReports(), 5000);
        } catch (err) {
            // interceptor đã normalize thành err.message (BUG-71)
            error("Lỗi khi tải báo cáo: " + (err?.message ?? "Vui lòng thử lại"));
        }
    };

    /**
     * AUDITED handleDownload:
     * - AUDITED: BE trả về { status, fileUrl, fileName } (lowercase)
     * - Dùng triggerDownload() thay vì window.location.assign (BUG-75)
     */
    const handleDownload = (report) => {
        // AUDITED: field là lowercase 'status' theo API response đã kiểm tra
        const status = report.status ?? report.Status;
        if (status !== "COMPLETED") {
            info("Báo cáo đang được xử lý, vui lòng thử lại sau vài giây.");
            return;
        }

        // AUDITED: field là lowercase 'fileUrl' theo API response đã kiểm tra
        const fileUrl = report.fileUrl ?? report.FileUrl;
        if (!fileUrl) {
            error("Không tìm thấy link tải file. Báo cáo có thể bị lỗi phía server.");
            return;
        }

        const fullUrl = fileUrl.startsWith("http")
            ? fileUrl
            : `${import.meta.env.VITE_API_URL ?? ""}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;

        // AUDITED: field là lowercase 'fileName' theo API response đã kiểm tra
        triggerDownload(fullUrl, report.fileName ?? report.FileName);
    };

    // AUDITED: safe defaults
    const courses = Array.isArray(coursesData?.items) ? coursesData.items : [];
    const projects = Array.isArray(projectsData?.items) ? projectsData.items : [];
    const history = Array.isArray(myReports) ? myReports : [];

    return (
        <div className="space-y-6">
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <span className="text-teal-700 font-semibold">Giảng viên</span>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-semibold">Báo cáo &amp; Export</span>
            </nav>

            {/* Header + Filters */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-800">Báo cáo &amp; Xuất dữ liệu</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Tạo báo cáo SRS, thống kê commit và danh sách nhóm</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Chọn lớp học</span>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none min-w-[180px]"
                        >
                            <option value="">-- Chọn lớp --</option>
                            {/* AUDITED: c.code, c.name — khớp với API course object */}
                            {courses.map((c) => <option key={c?.id} value={c?.id}>{c?.code ?? "N/A"} - {c?.name ?? `Lớp (ID: ${c?.id ?? "N/A"})`}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Chọn nhóm (nếu cần)</span>
                        <select
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            disabled={!selectedCourse}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none min-w-[180px] disabled:opacity-50"
                        >
                            <option value="">-- Chọn nhóm --</option>
                            {/* AUDITED: p.name — khớp với API project object */}
                            {projects.map((p) => <option key={p?.id} value={p?.id}>{p?.name ?? `Nhóm (ID: ${p?.id ?? "N/A"})`}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Export Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {EXPORT_TYPES.map(et => {
                    const Icon = et.icon;
                    return (
                        <Card key={et.id} className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white hover:shadow-md transition-all duration-200">
                            <div className="h-1.5 bg-gradient-to-r from-teal-500 to-teal-600" />
                            <CardContent className="p-5 flex flex-col gap-4">
                                <div className={`w-12 h-12 rounded-2xl ${et.color} text-white flex items-center justify-center`}>
                                    <Icon size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-1">{et.title}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed">{et.desc}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-auto">
                                    {et.formats.map(f => (
                                        <button
                                            key={f}
                                            disabled={isGenerating}
                                            onClick={() => handleExport(et.action, f)}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 rounded-xl px-3 py-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isGenerating ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Download History */}
            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <CardHeader className="border-b border-gray-50 pb-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Download size={15} className="text-gray-500" />
                        </div>
                        <CardTitle className="text-base font-semibold text-gray-800">Lịch sử xuất file mới nhất</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => refetchReports()} className="rounded-full h-8 w-8 p-0" title="Làm mới">
                        {loadingHistory ? <Loader2 size={14} className="animate-spin" /> : <Filter size={14} />}
                    </Button>
                </CardHeader>

                <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-4">Loại báo cáo</div>
                    <div className="col-span-3 text-center">Format</div>
                    <div className="col-span-3 text-center">Ngày tạo</div>
                    <div className="col-span-2 text-right">Thao tác</div>
                </div>

                <CardContent className="p-0">
                    {loadingHistory ? (
                        <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-teal-500" /></div>
                    ) : history.length === 0 ? (
                        <div className="py-10 text-center text-gray-400 text-sm">Chưa có lịch sử xuất file</div>
                    ) : (
                        history.slice(0, 10).map((ex, index) => {
                            // AUDITED: BE trả về { type, format, status, fileUrl, fileName, createdAt }
                            const reportStatus = ex.status ?? ex.Status ?? "";
                            const isCompleted = reportStatus === "COMPLETED";
                            const fmt = ex.format ?? ex.Format ?? "";

                            return (
                                <div key={ex.id ?? index} className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0">
                                    <div className="col-span-4 flex flex-col">
                                        <span className="text-sm font-medium text-gray-700">
                                            {/* AUDITED: field 'type' theo API response đã xác nhận */}
                                            {ex?.type ?? ex?.reportType ?? ex?.report_type ?? "Báo cáo"}
                                        </span>
                                        <span className="text-[10px] text-gray-400">#{ex.id ?? "—"}</span>
                                    </div>

                                    <div className="col-span-3 text-center">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${fmt === "DOCX" ? "text-indigo-700 bg-indigo-50 border-indigo-100" :
                                                fmt === "PDF" ? "text-red-700 bg-red-50 border-red-100" :
                                                    "text-green-700 bg-green-50 border-green-100"
                                            }`}>
                                            {fmt === "DOCX" ? "Word" : fmt}
                                        </span>
                                    </div>

                                    <div className="col-span-3 text-center text-xs text-gray-500">
                                        {/* AUDITED: field 'createdAt' theo API response đã xác nhận */}
                                        {ex?.createdAt ? new Date(ex.createdAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "—"}
                                    </div>

                                    <div className="col-span-2 text-right">
                                        <button
                                            onClick={() => handleDownload(ex)}
                                            disabled={!isCompleted}
                                            title={!isCompleted ? `Trạng thái: ${reportStatus || "Đang xử lý..."}` : "Tải file về"}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg px-3 py-1.5 border border-teal-100 transition-colors ml-auto disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <Download size={11} /> Tải về
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>

            <p className="text-xs text-gray-400 text-center pt-2 italic">
                Lưu ý: Báo cáo SRS yêu cầu đồ án phải có liên kết với Jira. Thống kê commit yêu cầu liên kết GitHub.
            </p>
        </div>
    );
}
