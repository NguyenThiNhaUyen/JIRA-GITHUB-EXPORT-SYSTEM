// Alerts — Lecturer Cảnh báo (Real API Integration)
import { useState } from "react";
import { ChevronRight, Bell, CheckCircle, Clock, Filter, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { ALERT_SEVERITY as SEV } from "../../shared/permissions.js";

// Feature Hooks
import { useGetAlerts, useResolveAlert, useSendAlert } from "../../features/system/hooks/useAlerts.js";

// Xóa buildAlertsFromData cũ vì giờ đã có API trả về trực tiếp


export default function Alerts() {
    const { success, error: showError } = useToast();
    const [filter, setFilter] = useState("all");
    const [remindedIds, setRemindedIds] = useState(new Set());

    const { data: alertsData, isLoading, refetch } = useGetAlerts({ pageSize: 100 });
    const { mutate: resolveMutate } = useResolveAlert();
    const sendAlertMutation = useSendAlert();

    const alertsList = alertsData?.items || [];

    const resolve = (id) => {
        resolveMutate(id, {
            onSuccess: () => success("Đã đánh dấu là đã giải quyết"),
            onError: (err) => showError(err.message || "Không thể giải quyết cảnh báo")
        });
    };

    const remind = async (alert) => {
        // Nếu có projectId → gọi API thật, nếu không → fallback toast
        if (!alert.projectId) {
            setRemindedIds((prev) => new Set([...prev, alert.id]));
            success(`Đã gửi nhắc nhở đến ${alert.groupName || 'nhóm'}`);
            return;
        }
        const message = window.prompt(
            `Nhập nội dung nhắc nhở cho nhóm "${alert.groupName || 'nhóm'}":`,
            alert.message || 'Nhóm cần cập nhật tiến độ ngay!'
        );
        if (message === null) return; // User cancel
        sendAlertMutation.mutate(
            { projectId: alert.projectId, message, severity: alert.severity || 'MEDIUM' },
            {
                onSuccess: () => {
                    setRemindedIds((prev) => new Set([...prev, alert.id]));
                    success(`Đã gửi nhắc nhở đến nhóm "${alert.groupName || 'nhóm'}"`);
                },
                onError: (err) => showError(err.message || 'Không thể gửi nhắc nhở'),
            }
        );
    };

    const refresh = () => {
        refetch();
        success("Đã làm mới danh sách cảnh báo");
    };

    const filtered = alertsList.filter((a) => {
        if (filter === "resolved") return a.status === "RESOLVED";
        if (filter === "all") return a.status === "OPEN";
        return a.status === "OPEN" && a.severity.toLowerCase() === filter.toLowerCase();
    });

    const openCount = alertsList.filter((a) => a.status === "OPEN").length;
    const highCount = alertsList.filter((a) => a.status === "OPEN" && a.severity.toLowerCase() === "high").length;
    const resolvedCount = alertsList.filter((a) => a.status === "RESOLVED").length;

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
                    <h2 className="text-2xl font-bold tracking-tight text-gray-800">Cảnh báo Nhóm</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Phát hiện sớm nhóm / sinh viên không hoạt động theo quy tắc hệ thống
                    </p>
                </div>
                <Button
                    onClick={refresh}
                    variant="outline"
                    className="flex items-center gap-2 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl h-9 px-4 text-sm"
                    disabled={isLoading}
                >
                    <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                    Làm mới
                </Button>
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
                {["all", "high", "medium", "low", "resolved"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === f
                            ? "bg-teal-600 text-white border-teal-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-teal-400"
                            }`}
                    >
                        {{ all: "Tất cả mở", high: "Nghiêm trọng", medium: "Trung bình", low: "Nhẹ", resolved: "Đã xử lý" }[f]}
                    </button>
                ))}
            </div>

            {/* Alerts list */}
            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <RefreshCw size={32} className="text-teal-600 animate-spin" />
                            <p className="text-sm text-gray-400">Đang quét hệ thống...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-green-50 flex items-center justify-center">
                                <CheckCircle size={32} className="text-green-400" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-gray-700">Không có cảnh báo nào</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    {filter === "resolved"
                                        ? "Chưa có cảnh báo nào được giải quyết"
                                        : "Tất cả nhóm đang hoạt động tốt 🎉"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filtered.map((a) => {
                                const sev = SEV[a.severity.toLowerCase()] || SEV.medium;
                                const reminded = remindedIds.has(a.id);
                                return (
                                    <div
                                        key={a.id}
                                        className={`px-5 py-4 hover:bg-gray-50/50 transition-colors flex items-start gap-4 ${a.status === "RESOLVED" ? "opacity-60" : ""
                                            }`}
                                    >
                                        <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${sev.dot}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <p className="text-sm font-semibold text-gray-800">{a.groupName} · {a.courseCode}</p>
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${sev.cls}`}
                                                >
                                                    {a.severity}
                                                </span>
                                                {a.status === "RESOLVED" && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-100 uppercase tracking-wider">
                                                        Đã xử lý
                                                    </span>
                                                )}
                                                {reminded && a.status === "OPEN" && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-100 uppercase tracking-wider">
                                                        Đã nhắc
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">{a.message}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                                                <Clock size={9} /> {new Date(a.createdAt).toLocaleString("vi-VN")}
                                            </p>
                                        </div>
                                        {a.status === "OPEN" && (
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => remind(a)}
                                                    disabled={reminded}
                                                    className={`flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors border ${reminded
                                                        ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                                                        : "text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-100"
                                                        }`}
                                                >
                                                    <Bell size={11} />
                                                    {reminded ? "Đã nhắc" : "Nhắc nhở"}
                                                </button>
                                                <button
                                                    onClick={() => resolve(a.id)}
                                                    className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg px-3 py-1.5 transition-colors border border-green-100"
                                                >
                                                    <CheckCircle size={11} />
                                                    Đã xử lý
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
