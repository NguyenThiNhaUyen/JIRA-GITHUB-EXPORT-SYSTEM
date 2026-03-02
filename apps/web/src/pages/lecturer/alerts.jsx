// Alerts — Lecturer Cảnh báo (Advanced: Inactive Detection Logic)
import { useState, useEffect } from "react";
import { ChevronRight, AlertTriangle, Bell, CheckCircle, Clock, Filter, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import db from "../../mock/db.js";
import { INACTIVITY_RULES, ALERT_SEVERITY as SEV } from "../../shared/permissions.js";

// shorthand
const RULES = INACTIVITY_RULES;


function buildAlertsFromDB(lecturerId) {
    const assignments = db.findMany("courseLecturers", { lecturerId });
    const courseIds = assignments.map((a) => a.courseId);

    const alerts = [];
    let alertId = 1;

    for (const courseId of courseIds) {
        const course = db.findById("courses", courseId);
        const groups = db.getCourseGroups(courseId);

        for (const group of groups) {
            const project = db.findMany("projects", { courseId })[0];
            const commits = project ? db.findMany("commits", { projectId: project.id }) : [];

            for (const rule of RULES) {
                if (rule.check(group, commits)) {
                    alerts.push({
                        id: `${alertId++}`,
                        groupId: group.id,
                        group: `${group.name} — ${course?.code || courseId}`,
                        courseId,
                        rule: rule.label,
                        ruleId: rule.id,
                        severity: rule.severity,
                        resolved: false,
                        since: group.createdAt || new Date().toISOString(),
                    });
                }
            }
        }
    }

    return alerts;
}

export default function Alerts() {
    const { success } = useToast();
    const { user } = useAuth();
    const [alerts, setAlerts] = useState([]);
    const [filter, setFilter] = useState("all");
    const [resolvedIds, setResolvedIds] = useState(new Set());
    const [remindedIds, setRemindedIds] = useState(new Set());

    useEffect(() => {
        if (user?.id) {
            const generated = buildAlertsFromDB(user.id);
            setAlerts(generated);
        }
    }, [user]);

    const resolve = (id) => {
        setResolvedIds((prev) => new Set([...prev, id]));
        success("Đã đánh dấu là đã giải quyết");
    };

    const remind = (alert) => {
        setRemindedIds((prev) => new Set([...prev, alert.id]));
        // TODO: Call email/notification API with alert.groupId, alert.rule, alert.courseId
        success(`Đã gửi nhắc nhở đến ${alert.group.split("—")[0].trim()}`);
    };

    const refresh = () => {
        if (user?.id) {
            const generated = buildAlertsFromDB(user.id);
            setAlerts(generated);
            setResolvedIds(new Set());
            setRemindedIds(new Set());
            success("Đã làm mới danh sách cảnh báo");
        }
    };

    const enriched = alerts.map((a) => ({ ...a, resolved: resolvedIds.has(a.id) }));

    const filtered = enriched.filter((a) => {
        if (filter === "resolved") return a.resolved;
        if (filter === "all") return !a.resolved;
        return !a.resolved && a.severity === filter;
    });

    const openCount = enriched.filter((a) => !a.resolved).length;
    const highCount = enriched.filter((a) => !a.resolved && a.severity === "high").length;
    const resolvedCount = enriched.filter((a) => a.resolved).length;

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
                >
                    <RefreshCw size={14} />
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

            {/* Inactivity Rules Legend */}
            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <CardHeader className="border-b border-gray-50 pb-3">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={14} className="text-orange-500" />
                        <CardTitle className="text-sm font-semibold text-gray-700">
                            Quy tắc cảnh báo đang áp dụng
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="py-3 px-5">
                    <div className="flex flex-wrap gap-2">
                        {RULES.map((r) => (
                            <span
                                key={r.id}
                                className={`text-xs font-medium px-2.5 py-1 rounded-full border ${SEV[r.severity].badge}`}
                            >
                                {r.label}
                            </span>
                        ))}
                    </div>
                </CardContent>
            </Card>

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
                    {filtered.length === 0 ? (
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
                                const sev = SEV[a.severity];
                                const reminded = remindedIds.has(a.id);
                                return (
                                    <div
                                        key={a.id}
                                        className={`px-5 py-4 hover:bg-gray-50/50 transition-colors flex items-start gap-4 ${a.resolved ? "opacity-60" : ""
                                            }`}
                                    >
                                        <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${sev.dot}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <p className="text-sm font-semibold text-gray-800">{a.group}</p>
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${sev.cls}`}
                                                >
                                                    {sev.label}
                                                </span>
                                                {a.resolved && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-100 uppercase tracking-wider">
                                                        Đã xử lý
                                                    </span>
                                                )}
                                                {reminded && !a.resolved && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-100 uppercase tracking-wider">
                                                        Đã nhắc
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">{a.rule}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                                                <Clock size={9} /> Từ{" "}
                                                {new Date(a.since).toLocaleDateString("vi-VN")}
                                            </p>
                                        </div>
                                        {!a.resolved && (
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
