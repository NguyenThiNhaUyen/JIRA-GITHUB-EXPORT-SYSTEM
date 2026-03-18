import { Clock, CheckCircle } from"lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from"@/components/ui/Card.jsx";
import { Badge } from"@/components/ui/Badge.jsx";

export function ProjectProgress({ cycleTime, metrics, roadmapData, agingWip, cfdData }) {
 return (
 <div className="space-y-10">
 {/* KPI Row */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 <Card className="border border-gray-100 shadow-sm rounded-[36px] bg-white p-8 relative overflow-hidden group">
 <div className="absolute top-0 left-0 w-2 h-full bg-teal-500 transition-all group-hover:w-4" />
 <p className="text-[10px] font-black text-gray-400 mb-6 ml-2">Cycle Time TB</p>
 <div className="flex items-end gap-3 ml-2">
 <span className="text-5xl font-black text-teal-600 tracking-tighter leading-none">{cycleTime?.averageDays || 0}</span>
 <span className="text-[11px] font-black text-gray-400 mb-1.5">Ngày</span>
 </div>
 <p className="text-[10px] text-gray-300 font-bold mt-4 tracking-[0.2em] ml-2">Gần 30 ngày qua</p>
 </Card>
 
 <Card className="border border-gray-100 shadow-sm rounded-[36px] bg-white p-8 relative overflow-hidden group">
 <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 transition-all group-hover:w-4" />
 <p className="text-[10px] font-black text-gray-400 mb-6 ml-2">Tốc độ hoàn thành</p>
 <div className="flex items-end gap-3 ml-2">
 <span className="text-5xl font-black text-indigo-500 tracking-tighter leading-none">{metrics?.velocity || roadmapData?.items?.filter(i => i.status === 'DONE').length || 0}</span>
 <span className="text-[11px] font-black text-gray-400 mb-1.5">Issues / Tuần</span>
 </div>
 <p className="text-[10px] text-gray-300 font-bold mt-4 tracking-[0.2em] ml-2">Theo Iteration</p>
 </Card>
 
 <Card className="border border-gray-100 shadow-sm rounded-[36px] bg-white p-8 relative overflow-hidden group">
 <div className="absolute top-0 left-0 w-2 h-full bg-amber-500 transition-all group-hover:w-4" />
 <p className="text-[10px] font-black text-gray-400 mb-6 ml-2">Aging Tasks (WIP)</p>
 <div className="flex items-end gap-3 ml-2">
 <span className="text-5xl font-black text-amber-500 tracking-tighter leading-none">{agingWip?.length || 0}</span>
 <span className="text-[11px] font-black text-gray-400 mb-1.5">Đang trễ</span>
 </div>
 <p className="text-[10px] text-gray-300 font-bold mt-4 tracking-[0.2em] ml-2">Cần tập trung xử lý</p>
 </Card>
 </div>

 <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
 {/* CFD Chart */}
 <Card className="border border-gray-100 shadow-sm rounded-[44px] overflow-hidden bg-white">
 <CardHeader className="border-b border-gray-50/50 py-10 px-12 bg-gray-50/10">
 <CardTitle className="text-xs font-black text-gray-400 font-display">Cumulative Flow Diagram (CFD)</CardTitle>
 </CardHeader>
 <CardContent className="p-12">
 <div className="h-72 w-full bg-gray-50/30 rounded-[40px] flex items-center justify-center border border-dashed border-gray-200 p-8">
 {cfdData?.buckets?.length > 0 ? (
 <div className="space-y-6 w-full">
 <div className="flex justify-between items-end gap-3 h-48">
 {cfdData.buckets.slice(-12).map((b, i) => (
 <div key={i} className="flex-1 flex flex-col justify-end gap-1.5 group relative hover:opacity-100 transition-all animate-in slide-inc-from-bottom-2" style={{ animationDelay: `${i * 100}ms` }}>
 <div className="w-full bg-teal-500/80 rounded-t-xl transition-all shadow-md group-hover:bg-teal-600" style={{ height: `${Math.max(b.done * 4, 10)}%` }}></div>
 <div className="w-full bg-indigo-400/30 rounded-t-md transition-all group-hover:bg-indigo-400/50" style={{ height: `${Math.max(b.inProgress * 4, 10)}%` }}></div>
 </div>
 ))}
 </div>
 <div className="flex justify-between text-[10px] font-black text-gray-400 opacity-60">
 <span>30 ngày trước</span>
 <span>Tình trạng hiện tại</span>
 </div>
 </div>
 ) : (
 <div className="text-center space-y-4">
 <Clock size={40} className="text-gray-100 mx-auto" />
 <p className="text-[11px] font-black text-gray-300">Dữ liệu CFD đang được cập nhật...</p>
 </div>
 )}
 </div>
 </CardContent>
 </Card>

 {/* Aging WIP List */}
 <Card className="border border-gray-100 shadow-sm rounded-[44px] overflow-hidden bg-white">
 <CardHeader className="border-b border-gray-50/50 py-10 px-12 bg-gray-50/10">
 <CardTitle className="text-xs font-black text-gray-400 font-display">Aging WIP - Công việc tồn đọng</CardTitle>
 </CardHeader>
 <CardContent className="p-0 max-h-[460px] overflow-y-auto custom-scrollbar">
 {agingWip?.length > 0 ? (
 <div className="divide-y divide-gray-50">
 {agingWip.map((task, i) => (
 <div key={task.id || i} className="p-10 px-12 flex items-center justify-between group hover:bg-gray-50/80 transition-all animate-in fade-in duration-500" style={{ animationDelay: `${i * 100}ms` }}>
 <div className="min-w-0 pr-6">
 <p className="text-base font-black text-gray-800 tracking-tight truncate group-hover:text-amber-600 transition-colors font-display">{task.title}</p>
 <div className="flex items-center gap-3 mt-3">
 <span className="text-[11px] text-gray-400 font-bold bg-gray-100 px-3 py-1 rounded-full border border-gray-50">Tồn tại {task.ageDays} ngày</span>
 <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
 </div>
 </div>
 <Badge className="bg-amber-50 text-amber-600 border-amber-200 h-8 px-5 rounded-2xl shadow-sm text-[10px] font-black">In Progress</Badge>
 </div>
 ))}
 </div>
 ) : (
 <div className="py-32 text-center space-y-6">
 <div className="w-24 h-24 bg-emerald-50 rounded-[40px] flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
 <CheckCircle size={40} className="text-emerald-500" />
 </div>
 <p className="text-[11px] font-black text-gray-300 leading-relaxed">Tuyệt vời! Không có công việc nào<br/>bị tồn đọng quá thời gian quy định</p>
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 </div>
 );
}






