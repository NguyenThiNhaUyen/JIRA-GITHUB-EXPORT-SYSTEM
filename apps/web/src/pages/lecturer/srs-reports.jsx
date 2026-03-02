// SRS Reports — Lecturer
import { useState } from "react";
import { ChevronRight, FileText, Eye, CheckCircle, MessageSquare, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";

const MOCK_SRS = [
    { id: 1, group: "Nhóm SE01-G1", project: "JIRA-GitHub Export System", version: "v1.0", status: "Final", date: "2025-03-01", reviewer: "GV. Nguyễn" },
    { id: 2, group: "Nhóm SE01-G2", project: "Library Management System", version: "v2.1", status: "Review", date: "2025-03-05", reviewer: "GV. Trần" },
    { id: 3, group: "Nhóm SE01-G3", project: "E-Commerce Platform", version: "v1.0", status: "Draft", date: "2025-03-07", reviewer: "—" },
    { id: 4, group: "Nhóm SE02-G1", project: "HR Management System", version: "v1.2", status: "Final", date: "2025-02-28", reviewer: "GV. Lê" },
    { id: 5, group: "Nhóm SE02-G2", project: "Smart Parking App", version: "v0.9", status: "Draft", date: "2025-03-06", reviewer: "—" },
    { id: 6, group: "Nhóm SE02-G3", project: "Student Portal", version: "v1.1", status: "Review", date: "2025-03-04", reviewer: "GV. Phạm" },
];

const STATUS = {
    Final: { cls: "bg-green-50 text-green-700 border-green-100", label: "Final" },
    Review: { cls: "bg-blue-50 text-blue-700 border-blue-100", label: "Review" },
    Draft: { cls: "bg-gray-100 text-gray-500 border-gray-200", label: "Draft" },
};

export default function SrsReports() {
    const { success } = useToast();
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState("all");

    const filtered = filter === "all" ? MOCK_SRS : MOCK_SRS.filter(s => s.status === filter);
    const selectedSrs = MOCK_SRS.find(s => s.id === selected);

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
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Final", count: MOCK_SRS.filter(s => s.status === "Final").length, color: "text-green-700 bg-green-50 border-green-100" },
                    { label: "Review", count: MOCK_SRS.filter(s => s.status === "Review").length, color: "text-blue-700 bg-blue-50 border-blue-100" },
                    { label: "Draft", count: MOCK_SRS.filter(s => s.status === "Draft").length, color: "text-gray-500 bg-gray-100 border-gray-200" },
                ].map(({ label, count, color }) => (
                    <div key={label} className={`rounded-2xl px-4 py-3 border flex items-center justify-between ${color}`}>
                        <span className="text-xs font-semibold">{label}</span>
                        <span className="text-xl font-bold">{count}</span>
                    </div>
                ))}
            </div>

            {/* Filter chips */}
            <div className="flex items-center gap-2">
                {["all", "Final", "Review", "Draft"].map(f => (
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
                        <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-5">Nhóm / Project</div>
                            <div className="col-span-2 text-center">Phiên bản</div>
                            <div className="col-span-2 text-center">Trạng thái</div>
                            <div className="col-span-3 text-right">Thao tác</div>
                        </div>
                        <CardContent className="p-0">
                            {filtered.map((srs) => {
                                const s = STATUS[srs.status];
                                return (
                                    <div
                                        key={srs.id}
                                        onClick={() => setSelected(srs.id === selected ? null : srs.id)}
                                        className={`grid grid-cols-12 gap-3 px-5 py-3.5 items-center border-b border-gray-50 hover:bg-gray-50/60 transition-colors last:border-0 cursor-pointer ${selected === srs.id ? "bg-teal-50/40" : ""}`}
                                    >
                                        <div className="col-span-5">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{srs.group}</p>
                                            <p className="text-[11px] text-gray-400 truncate">{srs.project}</p>
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <span className="text-xs font-mono text-gray-600">{srs.version}</span>
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${s.cls}`}>
                                                {s.label}
                                            </span>
                                        </div>
                                        <div className="col-span-3 flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={e => { e.stopPropagation(); setSelected(srs.id); }}
                                                className="flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg px-2.5 py-1.5 border border-teal-100 transition-colors"
                                            >
                                                <Eye size={11} />View
                                            </button>
                                            {srs.status === "Review" && (
                                                <button
                                                    onClick={e => { e.stopPropagation(); success(`Đã phê duyệt SRS ${srs.group}`); }}
                                                    className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg px-2.5 py-1.5 border border-green-100 transition-colors"
                                                >
                                                    <CheckCircle size={11} />Approve
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
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ngày nộp</label>
                                        <p className="text-sm text-gray-700 mt-0.5">{new Date(selectedSrs.date).toLocaleDateString("vi-VN")}</p>
                                    </div>
                                    {/* Mock comment section */}
                                    <div className="pt-3 border-t border-gray-50">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                                            <MessageSquare size={10} /> Nhận xét
                                        </label>
                                        <textarea
                                            rows={3}
                                            placeholder="Thêm nhận xét..."
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none transition-all"
                                        />
                                        <Button
                                            className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-8 text-xs font-semibold border-0"
                                            onClick={() => success("Đã gửi nhận xét")}
                                        >
                                            Gửi nhận xét
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
