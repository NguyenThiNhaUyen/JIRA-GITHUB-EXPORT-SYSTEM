// Alerts — Lecturer Cảnh báo
import { useState } from "react";
import { ChevronRight, AlertTriangle, Bell, CheckCircle, Clock, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";

const MOCK_ALERTS = [
    { id: 1, group: "Nhóm SE01-G1", student: null, rule: "Không commit > 14 ngày", severity: "high", resolved: false, since: "2025-03-01" },
    { id: 2, group: "Nhóm SE01-G3", student: "Nguyễn Văn C", rule: "Repo GitHub không update 7 ngày", severity: "medium", resolved: false, since: "2025-03-05" },
    { id: 3, group: "Nhóm SE02-G2", student: null, rule: "Jira board không có activity", severity: "medium", resolved: false, since: "2025-03-06" },
    { id: 4, group: "Nhóm SE02-G4", student: "Lê Văn E", rule: "0 task hoàn thành trong sprint", severity: "low", resolved: true, since: "2025-02-28" },
    { id: 5, group: "Nhóm SE03-G1", student: null, rule: "GitHub link chưa được submit", severity: "high", resolved: false, since: "2025-03-07" },
];

const SEV = {
    high: { label: "Nghiêm trọng", cls: "bg-red-50 text-red-700 border-red-100", dot: "bg-red-500" },
    medium: { label: "Trung bình", cls: "bg-orange-50 text-orange-600 border-orange-100", dot: "bg-orange-400" },
    low: { label: "Nhẹ", cls: "bg-yellow-50 text-yellow-700 border-yellow-100", dot: "bg-yellow-400" },
};

export default function Alerts() {
    const { success } = useToast();
    const [alerts, setAlerts] = useState(MOCK_ALERTS);
    const [filter, setFilter] = useState("all"); // all | high | medium | low | resolved

    const resolve = (id) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
        success("Đã đánh dấu là đã giải quyết");
    };

    const remind = (group) => success(`Đã gửi nhắc nhở đến ${group}`);

    const filtered = alerts.filter(a => {
        if (filter === "resolved") return a.resolved;
        if (filter === "all") return !a.resolved;
        return !a.resolved && a.severity === filter;
    });

    const openCount = alerts.filter(a => !a.resolved).length;
    const highCount = alerts.filter(a => !a.resolved && a.severity === "high").length;
    const resolvedCount = alerts.filter(a => a.resolved).length;

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <span className="text-teal-700 font-semibold">Giảng viên</span>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-semibold">Cảnh báo</span>
            </nav>

            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-800">Cảnh báo</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Nhóm / sinh viên không hoạt động theo quy tắc</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl px-4 py-3 border border-red-100 bg-red-50 flex items-center justify-between text-red-700">
                    <span className="text-xs font-semibold">Chưa giải quyết</span>
                    <span className="text-xl font-bold">{openCount}</span>
                </div>
                <div className="rounded-2xl px-4 py-3 border border-orange-100 bg-orange-50 flex items-center justify-between text-orange-600">
                    <span className="text-xs font-semibold">Nghiêm trọng</span>
                    <span className="text-xl font-bold">{highCount}</span>
                </div>
                <div className="rounded-2xl px-4 py-3 border border-green-100 bg-green-50 flex items-center justify-between text-green-700">
                    <span className="text-xs font-semibold">Đã giải quyết</span>
                    <span className="text-xl font-bold">{resolvedCount}</span>
                </div>
            </div>

            {/* Filter chips */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter size={14} className="text-gray-400" />
                {["all", "high", "medium", "low", "resolved"].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === f ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 border-gray-200 hover:border-teal-400"
                            }`}
                    >
                        {{ all: "Tất cả mở", high: "Nghiêm trọng", medium: "Trung bình", low: "Nhẹ", resolved: "Đã xử lý" }[f]}
                    </button>
                ))}
            </div>

            {/* Alerts list */}
            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <CardContent className="p-0">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-green-50 flex items-center justify-center">
                                <CheckCircle size={32} className="text-green-400" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-gray-700">Không có cảnh báo nào</p>
                                <p className="text-sm text-gray-400 mt-1">Tất cả nhóm đang hoạt động tốt 🎉</p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filtered.map(a => {
                                const sev = SEV[a.severity];
                                return (
                                    <div key={a.id} className={`px-5 py-4 hover:bg-gray-50/50 transition-colors flex items-start gap-4 ${a.resolved ? "opacity-60" : ""}`}>
                                        <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${sev.dot}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <p className="text-sm font-semibold text-gray-800">{a.group}</p>
                                                {a.student && <span className="text-xs text-gray-500">• {a.student}</span>}
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${sev.cls}`}>
                                                    {sev.label}
                                                </span>
                                                {a.resolved && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-100 uppercase tracking-wider">
                                                        Đã xử lý
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">{a.rule}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                                                <Clock size={9} /> Từ {new Date(a.since).toLocaleDateString("vi-VN")}
                                            </p>
                                        </div>
                                        {!a.resolved && (
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => remind(a.group)}
                                                    className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg px-3 py-1.5 transition-colors border border-orange-100"
                                                >
                                                    <Bell size={11} />Nhắc nhở
                                                </button>
                                                <button
                                                    onClick={() => resolve(a.id)}
                                                    className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg px-3 py-1.5 transition-colors border border-green-100"
                                                >
                                                    <CheckCircle size={11} />Đã xử lý
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
