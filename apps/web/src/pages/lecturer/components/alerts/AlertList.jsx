import { Bell, RefreshCw, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/Card.jsx";
import { Button } from "../../../../components/ui/Button.jsx";
import { StatusBadge } from "../../../../components/shared/Badge.jsx";

const SEVERITY_STYLE = {
  HIGH: { dot: "bg-red-500", variant: "danger", label: "Nghiêm trọng" },
  MEDIUM: { dot: "bg-amber-500", variant: "warning", label: "Trung bình" },
  LOW: { dot: "bg-blue-500", variant: "info", label: "Nhẹ" }
};

export function AlertList({
  isLoading,
  filtered,
  selectedId,
  setSelectedId,
  handleRemind,
  handleResolve,
  resolving,
  remindedIds
}) {
  return (
    <Card className="xl:col-span-2 border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white min-h-[500px]">
      <CardHeader className="border-b border-gray-50 py-5 px-8">
        <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
          <Bell size={18} className="text-red-500" /> Danh sách Cảnh báo
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-20 text-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((a, idx) => {
              const severity = (a.severity || "MEDIUM").toUpperCase();
              const style = SEVERITY_STYLE[severity] || SEVERITY_STYLE.MEDIUM;
              return (
                <div
                  key={a.id || idx}
                  onClick={() => setSelectedId(a.id)}
                  className={`p-6 flex gap-6 cursor-pointer transition-all ${selectedId === a.id ? 'bg-teal-50/30' : 'hover:bg-gray-50/50'}`}
                >
                  <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${style.dot} shadow-lg shadow-current/20`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-black text-gray-800 text-sm uppercase tracking-tight">{a.targetName || a.groupName}</h3>
                      <StatusBadge status={style.variant} label={style.label} variant={style.variant} />
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest border border-gray-100 px-2 py-0.5 rounded-md">{a.courseCode}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed mb-4">{a.message}</p>
                    <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
                      <span className="bg-gray-50 text-gray-400 px-3 py-1 rounded-full">Commits: {a.metrics?.commits ?? 0}</span>
                      <span className="bg-gray-50 text-gray-400 px-3 py-1 rounded-full">Jira: {a.metrics?.jiraDone ?? 0}</span>
                      <span className="bg-gray-50 text-gray-400 px-3 py-1 rounded-full">Overdue: {a.metrics?.overdueTasks ?? 0}</span>
                      {remindedIds.has(a.id) && <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full">Đã nhắc nhở</span>}
                    </div>
                  </div>
                  {a.status !== 'RESOLVED' && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest"
                        onClick={(e) => { e.stopPropagation(); handleRemind(a); }}
                        disabled={remindedIds.has(a.id)}
                      >
                        <Bell size={12} className="mr-2" /> Nhắc nhở
                      </Button>
                      <Button
                        size="sm"
                        className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-teal-600 hover:bg-teal-700 text-white border-0"
                        onClick={(e) => { e.stopPropagation(); handleResolve(a.id); }}
                        disabled={resolving}
                      >
                        <CheckCircle size={12} className="mr-2" /> Xong
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && <div className="p-20 text-center text-gray-400">Không có cảnh báo nào.</div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
