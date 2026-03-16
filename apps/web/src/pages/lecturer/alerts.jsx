import { useMemo, useState, useEffect } from "react";
import {
  ChevronRight,
  Bell,
  CheckCircle,
  Clock,
  Filter,
  RefreshCw,
  AlertTriangle,
  ShieldAlert,
  Search,
  Eye,
  Mail,
  Users,
  GitBranch,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";

// Feature Hooks
import {
  useGetAlerts,
  useResolveAlert,
} from "../../features/system/hooks/useAlerts.js";

/* ----------------------------- HELPERS ----------------------------- */

const SEVERITY_META = {
  HIGH: {
    label: "Nghiêm trọng",
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 border-red-100",
    card: "border-red-100 bg-red-50",
  },
  MEDIUM: {
    label: "Trung bình",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    card: "border-amber-100 bg-amber-50",
  },
  LOW: {
    label: "Nhẹ",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-100",
    card: "border-blue-100 bg-blue-50",
  },
};

const TYPE_LABEL = {
  NO_COMMIT: "Chưa commit",
  LOW_BALANCE: "Mất cân bằng đóng góp",
  OVERDUE_TASKS: "Task quá hạn",
  LOW_ACTIVITY: "Ít hoạt động",
  INACTIVE_MEMBER: "Thành viên ít hoạt động",
  JIRA_GITHUB_MISMATCH: "Lệch Jira/GitHub",
};

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatDateTime(value) {
  if (!value) return "Chưa có dữ liệu";
  return new Date(value).toLocaleString("vi-VN");
}

function isWithin24Hours(value) {
  if (!value) return false;
  const diff = Date.now() - new Date(value).getTime();
  return diff <= 24 * 60 * 60 * 1000;
}

/* ----------------------------- MAIN COMPONENT ----------------------------- */

export default function Alerts() {
  const { success, error: showError } = useToast();

  const [filter, setFilter] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [remindedIds, setRemindedIds] = useState(new Set());
  
  const [selectedAlertId, setSelectedAlertId] = useState(null);

  const { data: alertsData, isLoading, refetch } = useGetAlerts({ pageSize: 100 });
  const { mutate: resolveMutate } = useResolveAlert();

  const realAlerts = alertsData?.items || [];
  const usingMockData = false;

  const alertsList = realAlerts;

  useEffect(() => {
    if (!selectedAlertId && alertsList.length > 0) {
      setSelectedAlertId(alertsList[0].id);
    }
  }, [alertsList, selectedAlertId]);

  const selectedAlert =
    alertsList.find((a) => String(a.id) === String(selectedAlertId)) || null;

  const resolve = (id) => {
    if (usingMockData) {
      setMockAlerts((prev) =>
        prev.map((alert) =>
          alert.id === id ? { ...alert, status: "RESOLVED" } : alert
        )
      );
      success("Đã đánh dấu là đã giải quyết");
      return;
    }

    resolveMutate(id, {
      onSuccess: () => success("Đã đánh dấu là đã giải quyết"),
      onError: (err) =>
        showError(err.message || "Không thể giải quyết cảnh báo"),
    });
  };

  const remind = (alert) => {
    setRemindedIds((prev) => new Set([...prev, alert.id]));
    success(`Đã gửi nhắc nhở đến ${alert.targetName || alert.groupName || "đối tượng"}`);
  };

  const refresh = () => {
    if (usingMockData) {
      setMockAlerts([...MOCK_ALERTS]);
      success("Đã làm mới dữ liệu mô phỏng");
      return;
    }

    refetch();
    success("Đã làm mới danh sách cảnh báo");
  };

  const filtered = useMemo(() => {
    return alertsList.filter((a) => {
      const keyword = searchKeyword.trim().toLowerCase();

      const matchesKeyword =
        !keyword ||
        a.groupName?.toLowerCase().includes(keyword) ||
        a.courseCode?.toLowerCase().includes(keyword) ||
        a.targetName?.toLowerCase().includes(keyword) ||
        a.message?.toLowerCase().includes(keyword) ||
        TYPE_LABEL[a.type]?.toLowerCase().includes(keyword);

      if (!matchesKeyword) return false;

      if (filter === "resolved") return a.status === "RESOLVED";
      if (filter === "all") return a.status === "OPEN";
      return a.status === "OPEN" && a.severity.toLowerCase() === filter.toLowerCase();
    });
  }, [alertsList, filter, searchKeyword]);

  const openCount = alertsList.filter((a) => a.status === "OPEN").length;
  const highCount = alertsList.filter(
    (a) => a.status === "OPEN" && a.severity === "HIGH"
  ).length;
  const resolvedCount = alertsList.filter((a) => a.status === "RESOLVED").length;
  const recentCount = alertsList.filter(
    (a) => a.status === "OPEN" && isWithin24Hours(a.createdAt)
  ).length;
  const groupAlertCount = alertsList.filter(
    (a) => a.status === "OPEN" && a.targetType === "group"
  ).length;
  const studentAlertCount = alertsList.filter(
    (a) => a.status === "OPEN" && a.targetType === "student"
  ).length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
        <span className="text-teal-700 font-semibold">Giảng viên</span>
        <ChevronRight size={12} />
        <span className="text-gray-800 font-semibold">Cảnh báo</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-800">
            Cảnh báo Nhóm
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Phát hiện sớm nhóm / sinh viên không hoạt động theo quy tắc hệ thống
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {usingMockData
              ? "Đang hiển thị dữ liệu mô phỏng để preview giao diện và luồng xử lý."
              : "Đồng bộ trực tiếp từ hệ thống cảnh báo Jira/GitHub."}
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

      {/* Top meta */}
      <Card className="border border-teal-100 bg-gradient-to-r from-teal-50 via-white to-emerald-50 rounded-[24px] shadow-sm overflow-hidden">
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700/80">
                Trung tâm xử lý cảnh báo
              </p>
              <h3 className="text-xl font-bold text-gray-800 mt-1">
                Lecturer Alert Operations
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Theo dõi trạng thái bất thường, ưu tiên case quan trọng và xử lý nhanh
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {usingMockData && (
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-amber-100 text-amber-700">
                  Dữ liệu mô phỏng
                </span>
              )}
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-teal-100 text-teal-700">
                Rule hoạt động: 6
              </span>
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-blue-100 text-blue-700">
                Mới trong 24h: {recentCount}
              </span>
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-purple-100 text-purple-700">
                Đã nhắc: {remindedIds.size}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
        <div className="rounded-2xl px-4 py-4 border border-red-100 bg-red-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700">Chưa giải quyết</span>
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-700 mt-2">{openCount}</p>
          <p className="text-[11px] text-red-600 mt-1">Case đang cần lecturer xử lý</p>
        </div>

        <div className="rounded-2xl px-4 py-4 border border-orange-100 bg-orange-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-orange-700">Nghiêm trọng</span>
            <ShieldAlert size={16} className="text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-700 mt-2">{highCount}</p>
          <p className="text-[11px] text-orange-600 mt-1">Ưu tiên kiểm tra trước</p>
        </div>

        <div className="rounded-2xl px-4 py-4 border border-green-100 bg-green-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-green-700">Đã giải quyết</span>
            <CheckCircle size={16} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-700 mt-2">{resolvedCount}</p>
          <p className="text-[11px] text-green-600 mt-1">Đã được follow up</p>
        </div>

        <div className="rounded-2xl px-4 py-4 border border-blue-100 bg-blue-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700">Theo nhóm</span>
            <Users size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-2">{groupAlertCount}</p>
          <p className="text-[11px] text-blue-600 mt-1">Mất cân bằng / tiến độ thấp</p>
        </div>

        <div className="rounded-2xl px-4 py-4 border border-indigo-100 bg-indigo-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700">Theo cá nhân</span>
            <Bell size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-indigo-700 mt-2">{studentAlertCount}</p>
          <p className="text-[11px] text-indigo-600 mt-1">Không commit / overdue</p>
        </div>

        <div className="rounded-2xl px-4 py-4 border border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">Mới 24h</span>
            <Clock size={16} className="text-gray-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-2">{recentCount}</p>
          <p className="text-[11px] text-gray-500 mt-1">Cảnh báo vừa phát sinh</p>
        </div>
      </div>

      {/* Search + Filter */}
      <Card className="border border-gray-100 shadow-sm rounded-[20px] bg-white overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter size={14} className="text-gray-400" />
                {["all", "high", "medium", "low", "resolved"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cx(
                      "text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                      filter === f
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-teal-400"
                    )}
                  >
                    {{
                      all: "Tất cả mở",
                      high: "Nghiêm trọng",
                      medium: "Trung bình",
                      low: "Nhẹ",
                      resolved: "Đã xử lý",
                    }[f]}
                  </button>
                ))}
              </div>

              <div className="relative w-full xl:w-[340px]">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Tìm theo nhóm, môn, sinh viên, loại cảnh báo..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Alerts list */}
        <Card className="xl:col-span-2 border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                <Bell size={15} className="text-red-600" />
              </div>
              <CardTitle className="text-base font-semibold text-gray-800">
                Danh sách cảnh báo
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading && !usingMockData ? (
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
                  const sev = SEVERITY_META[a.severity] || SEVERITY_META.MEDIUM;
                  const reminded = remindedIds.has(a.id);
                  const selected = String(selectedAlertId) === String(a.id);

                  return (
                    <div
                      key={a.id}
                      className={cx(
                        "px-5 py-4 transition-colors flex items-start gap-4 cursor-pointer",
                        selected ? "bg-teal-50/50" : "hover:bg-gray-50/50",
                        a.status === "RESOLVED" ? "opacity-60" : ""
                      )}
                      onClick={() => setSelectedAlertId(a.id)}
                    >
                      <div className={cx("w-2 h-2 mt-2 rounded-full shrink-0", sev.dot)} />

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-800">
                            {a.targetName || a.groupName} · {a.courseCode}
                          </p>

                          <span
                            className={cx(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                              sev.badge
                            )}
                          >
                            {sev.label}
                          </span>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-gray-50 text-gray-600 border-gray-200 uppercase tracking-wider">
                            {TYPE_LABEL[a.type] || a.type}
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

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {typeof a.metrics?.commits === "number" && (
                            <span className="text-[11px] px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600">
                              Commits: {a.metrics.commits}
                            </span>
                          )}
                          {typeof a.metrics?.jiraDone === "number" && (
                            <span className="text-[11px] px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600">
                              Jira: {a.metrics.jiraDone}
                            </span>
                          )}
                          {typeof a.metrics?.overdueTasks === "number" && (
                            <span className="text-[11px] px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600">
                              Overdue: {a.metrics.overdueTasks}
                            </span>
                          )}
                          {typeof a.metrics?.balance === "number" && (
                            <span className="text-[11px] px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600">
                              Balance: {a.metrics.balance}%
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                          <Clock size={9} /> {formatDateTime(a.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAlertId(a.id);
                          }}
                          className="flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors border text-gray-700 bg-white hover:bg-gray-50 border-gray-200"
                        >
                          <Eye size={11} />
                          Xem
                        </button>

                        {a.status === "OPEN" && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                remind(a);
                              }}
                              disabled={reminded}
                              className={cx(
                                "flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors border",
                                reminded
                                  ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                                  : "text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-100"
                              )}
                            >
                              <Bell size={11} />
                              {reminded ? "Đã nhắc" : "Nhắc nhở"}
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                resolve(a.id);
                              }}
                              className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg px-3 py-1.5 transition-colors border border-green-100"
                            >
                              <CheckCircle size={11} />
                              Đã xử lý
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right side */}
        <div className="space-y-6">
          <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-50 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Eye size={15} className="text-indigo-600" />
                </div>
                <CardTitle className="text-base font-semibold text-gray-800">
                  Chi tiết cảnh báo
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="pt-5">
              {!selectedAlert ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  Chọn một cảnh báo để xem chi tiết
                </p>
              ) : (
                <div className="space-y-4">
                  <div
                    className={cx(
                      "rounded-2xl border px-4 py-3",
                      (SEVERITY_META[selectedAlert.severity] || SEVERITY_META.MEDIUM).card
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {selectedAlert.targetName || selectedAlert.groupName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedAlert.groupName} • {selectedAlert.courseCode}
                        </p>
                      </div>
                      <span
                        className={cx(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                          (SEVERITY_META[selectedAlert.severity] || SEVERITY_META.MEDIUM).badge
                        )}
                      >
                        {(SEVERITY_META[selectedAlert.severity] || SEVERITY_META.MEDIUM).label}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">
                      Loại cảnh báo
                    </p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">
                      {TYPE_LABEL[selectedAlert.type] || selectedAlert.type}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">
                      Mô tả
                    </p>
                    <p className="text-sm text-gray-700 mt-1">{selectedAlert.message}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <p className="text-[11px] text-gray-400">Commits</p>
                      <p className="text-lg font-bold text-gray-800">
                        {selectedAlert.metrics?.commits ?? 0}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <p className="text-[11px] text-gray-400">Jira done</p>
                      <p className="text-lg font-bold text-gray-800">
                        {selectedAlert.metrics?.jiraDone ?? 0}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <p className="text-[11px] text-gray-400">Overdue</p>
                      <p className="text-lg font-bold text-gray-800">
                        {selectedAlert.metrics?.overdueTasks ?? 0}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <p className="text-[11px] text-gray-400">Score</p>
                      <p className="text-lg font-bold text-gray-800">
                        {selectedAlert.metrics?.score ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">
                      Hoạt động gần nhất
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      {formatDateTime(selectedAlert.lastActivityAt)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">
                      Gợi ý xử lý
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      {selectedAlert.suggestion || "Giảng viên nên kiểm tra thêm chi tiết tiến độ và đóng góp."}
                    </p>
                  </div>

                  {selectedAlert.status === "OPEN" && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => remind(selectedAlert)}
                        variant="outline"
                        className="rounded-xl border-orange-100 text-orange-700 hover:bg-orange-50"
                      >
                        <Bell size={14} className="mr-2" />
                        Nhắc nhở
                      </Button>

                      <Button
                        onClick={() => resolve(selectedAlert.id)}
                        className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        <CheckCircle size={14} className="mr-2" />
                        Đánh dấu đã xử lý
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-50 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Info size={15} className="text-amber-600" />
                </div>
                <CardTitle className="text-base font-semibold text-gray-800">
                  Rule hệ thống
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="pt-5 space-y-3">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-sm font-semibold text-gray-800">Không commit trong 7 ngày</p>
                <p className="text-xs text-gray-500 mt-1">
                  Flag sinh viên không có hoạt động code trong giai đoạn theo dõi
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-sm font-semibold text-gray-800">Từ 2 task Jira quá hạn</p>
                <p className="text-xs text-gray-500 mt-1">
                  Ưu tiên các case overdue kéo dài hoặc không cập nhật
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-sm font-semibold text-gray-800">Balance đóng góp dưới 55%</p>
                <p className="text-xs text-gray-500 mt-1">
                  Phát hiện nhóm có đóng góp lệch, một người làm quá nhiều
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-sm font-semibold text-gray-800">Jira / GitHub lệch bất thường</p>
                <p className="text-xs text-gray-500 mt-1">
                  Task cập nhật nhiều nhưng output code không tương xứng
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-50 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Mail size={15} className="text-purple-600" />
                </div>
                <CardTitle className="text-base font-semibold text-gray-800">
                  Gợi ý ưu tiên
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="pt-5 space-y-3 text-sm text-gray-600">
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                Ưu tiên xử lý cảnh báo <span className="font-semibold">nghiêm trọng</span> trước
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                Kiểm tra các nhóm có <span className="font-semibold">balance thấp</span> hoặc
                thành viên chưa commit
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                Đối chiếu Jira overdue với GitHub thấp để phát hiện case cập nhật ảo
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}