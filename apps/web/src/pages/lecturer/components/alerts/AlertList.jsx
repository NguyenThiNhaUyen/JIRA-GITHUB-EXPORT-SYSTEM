import { Bell, RefreshCw, CheckCircle, Zap, Activity, Info } from"lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/Card.jsx";
import { Button } from"@/components/ui/Button.jsx";
import { StatusBadge } from"@/components/shared/Badge.jsx";

const SEVERITY_STYLE = {
 HIGH: { dot:"bg-red-500", glow:"shadow-red-500/50", variant:"danger", label:"Nghiêm trọng", bg:"bg-red-500/5" },
 MEDIUM: { dot:"bg-amber-500", glow:"shadow-amber-500/50", variant:"warning", label:"Trung bình", bg:"bg-amber-500/5" },
 LOW: { dot:"bg-blue-500", glow:"shadow-blue-500/50", variant:"info", label:"Nhẹ", bg:"bg-blue-500/5" }
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
 <Card className="xl:col-span-2 shadow-sm rounded-[40px] overflow-hidden bg-white border border-gray-100 p-2 min-h-[500px]">
 <div className="bg-white rounded-[32px] border border-gray-50 overflow-hidden h-full flex flex-col">
 <CardHeader className="border-b border-gray-50 py-10 px-12 bg-gray-50/20">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
 <Bell size={18} className="text-red-500" />
 </div>
 <CardTitle className="font-display">Danh sách Cảnh báo</CardTitle>
 </div>
 </CardHeader>
 <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
 {isLoading ? (
 <div className="p-32 text-center space-y-4">
 <RefreshCw className="w-12 h-12 animate-spin text-teal-600 mx-auto" />
 <p className="text-[10px] font-black text-gray-400 animate-pulse">Đang đồng bộ dữ liệu cảnh báo...</p>
 </div>
 ) : (
 <div className="divide-y divide-gray-50">
 {filtered.map((a, idx) => {
 const severity = (a.severity ||"MEDIUM").toUpperCase();
 const style = SEVERITY_STYLE[severity] || SEVERITY_STYLE.MEDIUM;
 return (
 <div
 key={a.id || idx}
 onClick={() => setSelectedId(a.id)}
 className={`p-10 flex gap-8 cursor-pointer transition-all duration-500 relative group/item ${selectedId === a.id ? 'bg-teal-50/50 z-10 scale-[1.01] shadow-2xl shadow-teal-900/5 border-y border-teal-100' : 'hover:bg-gray-50/80 hover:z-10'}`}
 >
 <div className="flex flex-col items-center gap-4 mt-2 shrink-0">
 <div className={`w-3.5 h-3.5 rounded-full ${style.dot} shadow-[0_0_12px_rgba(0,0,0,0.1)] ring-4 ring-white ${style.glow} transition-transform group-hover/item:scale-125`} />
 <div className="w-[1px] flex-1 bg-gray-100 group-hover/item:bg-teal-100" />
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex flex-wrap items-center gap-4 mb-4">
 <h3 className="text-2xl font-black text-gray-800 tracking-tight font-display">{a.targetName || a.groupName}</h3>
 <StatusBadge status={style.variant} label={style.label} variant={style.variant} className="rounded-xl px-4 py-1 text-[8px] border-0 shadow-sm" />
 <div className="flex items-center gap-2 bg-white border border-gray-100 px-3 py-1.5 rounded-xl shadow-sm">
 <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
 <span className="text-[10px] font-black text-gray-400 leading-none">{a.courseCode}</span>
 </div>
 </div>
 <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8 max-w-2xl">{a.message}</p>
 <div className="flex flex-wrap gap-4">
 <MetricBadge icon={Activity} label="Commits" value={a.metrics?.commits ?? 0} />
 <MetricBadge icon={Zap} label="Jira" value={a.metrics?.jiraDone ?? 0} />
 <MetricBadge icon={Bell} label="Overdue" value={a.metrics?.overdueTasks ?? 0} />
 {remindedIds.has(a.id) && (
 <div className="bg-blue-600 text-white px-5 py-2 rounded-2xl text-[9px] font-black shadow-lg shadow-blue-100 animate-in zoom-in-95">
 Đã nhắc nhở
 </div>
 )}
 </div>
 </div>

 {a.status !== 'RESOLVED' && (
 <div className="flex flex-col justify-center gap-3 shrink-0">
 <Button
 variant="outline"
 className="h-12 px-6 rounded-2xl text-[10px] font-black border-gray-100 bg-white hover:border-teal-200 hover:text-teal-600 shadow-sm transition-all active:scale-95"
 onClick={(e) => { e.stopPropagation(); handleRemind(a); }}
 disabled={remindedIds.has(a.id)}
 >
 Nhắc nhở <Bell size={14} className="ml-3" />
 </Button>
 <Button
 className="h-12 px-6 rounded-2xl text-[10px] font-black bg-gray-900 hover:bg-black text-white border-0 shadow-lg shadow-black/10 transition-all active:scale-95"
 onClick={(e) => { e.stopPropagation(); handleResolve(a.id); }}
 disabled={resolving}
 >
 Hoàn tất <CheckCircle size={14} className="ml-3" />
 </Button>
 </div>
 )}
 </div>
 );
 })}
 {filtered.length === 0 && (
 <div className="p-32 text-center">
 <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
 <Info size={32} className="text-gray-200" />
 </div>
 <p className="text-[10px] font-black text-gray-300 tracking-[0.2em] leading-relaxed">Hệ thống hiện không ghi nhận<br />cảnh báo nào cần xử lý.</p>
 </div>
 )}
 </div>
 )}
 </CardContent>
 </div>
 </Card>
 );
}

function MetricBadge({ icon: Icon, label, value }) {
 return (
 <div className="flex items-center gap-3 px-4 py-2 bg-gray-50/80 border border-gray-100 rounded-2xl transition-all hover:bg-white hover:shadow-md hover:border-teal-100 cursor-default group/badge">
 <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover/badge:text-teal-500 shadow-sm transition-colors">
 <Icon size={14} />
 </div>
 <div className="flex flex-col justify-center">
 <span className="text-[8px] font-black text-gray-300 leading-none mb-1">{label}</span>
 <span className="text-xs font-black text-gray-700 font-display leading-none">{value}</span>
 </div>
 </div>
 );
}






