// Reports & Export — Lecturer
import { ChevronRight, Download, FileSpreadsheet, FileText, Filter, CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";

const EXPORT_TYPES = [
    {
        id: "by-course",
        icon: FileSpreadsheet,
        color: "bg-teal-500",
        title: "Báo cáo theo Lớp",
        desc: "Tổng hợp tiến độ tất cả nhóm trong một lớp học. Bao gồm: số nhóm, trạng thái GitHub/Jira, cảnh báo.",
        formats: ["PDF", "Excel"],
    },
    {
        id: "by-group",
        icon: FileText,
        color: "bg-blue-500",
        title: "Báo cáo theo Nhóm",
        desc: "Chi tiết hoạt động từng nhóm: commit, issue, member, deadline.",
        formats: ["PDF", "Excel"],
    },
    {
        id: "by-student",
        icon: CheckSquare,
        color: "bg-indigo-500",
        title: "Báo cáo theo Sinh viên",
        desc: "Đóng góp cá nhân: commits, issues, sprint coverage. Phù hợp dùng cho bảng điểm quá trình.",
        formats: ["PDF", "CSV"],
    },
];

const MOCK_EXPORTS = [
    { id: 1, type: "Báo cáo theo Lớp", target: "SE001 - K22", format: "PDF", date: "2025-03-01", size: "1.2 MB" },
    { id: 2, type: "Báo cáo theo Nhóm", target: "Nhóm SE01-G1", format: "Excel", date: "2025-03-03", size: "890 KB" },
    { id: 3, type: "Báo cáo theo Sinh viên", target: "SE001 - K22", format: "CSV", date: "2025-03-05", size: "240 KB" },
];

export default function Reports() {
    const { success } = useToast();

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <span className="text-teal-700 font-semibold">Giảng viên</span>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-semibold">Báo cáo & Export</span>
            </nav>

            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-800">Báo cáo & Xuất dữ liệu</h2>
                <p className="text-sm text-gray-500 mt-0.5">Xuất báo cáo theo lớp, nhóm, hoặc sinh viên (PDF / Excel / CSV)</p>
            </div>

            {/* Export type cards */}
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
                                            onClick={() => success(`Đang tạo file ${f}... (chức năng demo)`)}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 rounded-xl px-3 py-1.5 transition-colors"
                                        >
                                            <Download size={11} />{f}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Recent exports table */}
            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <CardHeader className="border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Download size={15} className="text-gray-500" />
                        </div>
                        <CardTitle className="text-base font-semibold text-gray-800">Lịch sử xuất file</CardTitle>
                    </div>
                </CardHeader>

                <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-4">Loại báo cáo</div>
                    <div className="col-span-3">Đối tượng</div>
                    <div className="col-span-1 text-center">Format</div>
                    <div className="col-span-2 text-center">Ngày tạo</div>
                    <div className="col-span-2 text-right">Thao tác</div>
                </div>

                <CardContent className="p-0">
                    {MOCK_EXPORTS.map(ex => (
                        <div key={ex.id} className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0">
                            <div className="col-span-4 text-sm font-medium text-gray-700">{ex.type}</div>
                            <div className="col-span-3 text-sm text-gray-600">{ex.target}</div>
                            <div className="col-span-1 text-center">
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                                    {ex.format}
                                </span>
                            </div>
                            <div className="col-span-2 text-center text-xs text-gray-500">
                                {new Date(ex.date).toLocaleDateString("vi-VN")}
                            </div>
                            <div className="col-span-2 text-right">
                                <button
                                    onClick={() => success(`Đang tải ${ex.format}... (demo)`)}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg px-3 py-1.5 border border-teal-100 transition-colors ml-auto"
                                >
                                    <Download size={11} />Tải lại
                                </button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <p className="text-xs text-gray-400 text-center pt-2">
                * Chức năng export đang phát triển. Demo hiển thị toast thay vì tải file thực.
            </p>
        </div>
    );
}
