// SRS Reports — Lecturer
import { useState, useEffect } from "react";
import { ChevronRight, FileText, Eye, CheckCircle, MessageSquare, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import db from "../../mock/db.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { SRS_STATUS as STATUS } from "../../shared/permissions.js";


export default function SrsReports() {
    const { success } = useToast();
    const { user } = useAuth();
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState("all");
    const [srsList, setSrsList] = useState([]);
    const [feedbackText, setFeedbackText] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selected) {
            const s = srsList.find(s => s.id === selected);
            if (s) setFeedbackText(s.feedback);
        }
    }, [selected, srsList]);

    const loadData = () => {
        if (!user) return;
        const assignments = db.findMany('courseLecturers', { lecturerId: user.id });
        const courseIds = assignments.map(a => a.courseId);

        const allSrs = db.findMany('srsReports');
        const lecturerSrs = allSrs.filter(srs => {
            const project = db.findById('projects', srs.projectId);
            return project && courseIds.includes(project.courseId);
        }).map(srs => {
            const project = db.findById('projects', srs.projectId);
            // Find the group for this project via courseId (each project belongs to a course;
            // each course has one or more groups — find the first group in that course)
            const courseGroups = db.findMany('groups', { courseId: project.courseId });
            // Prefer locating the group whose teamLeaderId or studentIds match the submitter;
            // fall back to first group in the course; final fallback to project name
            const group =
                courseGroups.find(g => g.teamLeaderId === srs.submittedByStudentId) ||
                courseGroups.find(g => g.studentIds?.includes(srs.submittedByStudentId)) ||
                courseGroups[0] ||
                { name: project.name };
            return {
                id: srs.id,
                group: group.name,
                project: project.name,
                version: srs.version,
                status: srs.status,
                date: srs.submittedAt,
                reviewer: srs.reviewedByLecturerId
                    ? db.findById('users.lecturers', srs.reviewedByLecturerId)?.name || 'GV'
                    : '—',
                feedback: srs.feedback || ''
            };
        });
        setSrsList(lecturerSrs);
    };


    const handleStatusUpdate = (srsId, newStatus) => {
        db.update('srsReports', srsId, {
            status: newStatus,
            reviewedByLecturerId: user.id,
            updatedAt: new Date().toISOString()
        });
        success(`Đã chuyển trạng thái SRS sang ${newStatus}`);
        loadData();
    };

    const handleFeedback = (srsId) => {
        db.update('srsReports', srsId, {
            feedback: feedbackText,
            updatedAt: new Date().toISOString()
        });
        success("Đã lưu nhận xét");
        loadData();
    };

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
                            <div className="col-span-4">Nhóm / Project</div>
                            <div className="col-span-2 text-center">Phiên bản</div>
                            <div className="col-span-2 text-center">Trạng thái</div>
                            <div className="col-span-4 text-right">Thao tác</div>
                        </div>
                        <CardContent className="p-0">
                            {filtered.map((srs) => {
                                const s = STATUS[srs.status];
                                return (
                                    <div
                                        key={srs.id}
                                        onClick={() => setSelected(srs.id === selected ? null : srs.id)}
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
                                                    onClick={e => { e.stopPropagation(); handleStatusUpdate(srs.id, 'FINAL'); }}
                                                    className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg px-2 py-1.5 border border-green-100 transition-colors whitespace-nowrap"
                                                >
                                                    <CheckCircle size={11} />Approve
                                                </button>
                                            )}
                                            {srs.status === "REVIEW" && (
                                                <button
                                                    onClick={e => { e.stopPropagation(); handleStatusUpdate(srs.id, 'DRAFT'); }}
                                                    className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg px-2 py-1.5 border border-red-100 transition-colors whitespace-nowrap"
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
                                            value={feedbackText}
                                            onChange={(e) => setFeedbackText(e.target.value)}
                                            placeholder="Thêm nhận xét..."
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none transition-all"
                                        />
                                        <Button
                                            className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-8 text-xs font-semibold border-0"
                                            onClick={() => handleFeedback(selectedSrs.id)}
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
