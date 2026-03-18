import React from"react";
import { Users, Activity } from"lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/Card.jsx";

export function StudentContributionTable({ students, getStatusBadgeClass, onWarning, onEmail, sentMap, shouldWarnStudent }) {
 return (
 <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
 <CardHeader className="border-b border-gray-50 pb-4 px-6">
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
 <Activity size={15} className="text-indigo-600" />
 </div>
 <CardTitle className="text-base font-black text-gray-800">Xếp hạng đóng góp sinh viên</CardTitle>
 </div>
 </CardHeader>

 <div className="hidden xl:grid grid-cols-12 gap-2 px-6 py-3 bg-gray-50/50 text-[10px] font-bold text-gray-400 border-b border-gray-100">
 <div className="col-span-1">#</div>
 <div className="col-span-3">Sinh viên / Nhóm</div>
 <div className="col-span-1 text-center">Commit</div>
 <div className="col-span-1 text-center">Jira</div>
 <div className="col-span-1 text-center">PR</div>
 <div className="col-span-1 text-center">Review</div>
 <div className="col-span-1 text-center text-teal-600">Score</div>
 <div className="col-span-1 text-center">Status</div>
 <div className="col-span-2 text-right">Thao tác</div>
 </div>

 <CardContent className="p-0">
 {students.length === 0 ? (
 <div className="py-20 text-center text-gray-400 italic text-sm">Không có dữ liệu sinh viên</div>
 ) : (
 students.map((s, i) => (
 <div key={s.studentId} className="grid grid-cols-12 gap-2 px-6 py-4 items-center border-b border-gray-50 hover:bg-teal-50/30 transition-all last:border-0">
 <div className="col-span-1 text-xs font-black text-gray-300">#{i + 1}</div>
 <div className="col-span-3 min-w-0">
 <div className="flex items-center gap-2">
 <p className="text-sm font-bold text-gray-800 truncate">{s.name}</p>
 </div>
 <div className="flex items-center gap-1.5 mt-0.5">
 <span className="text-[10px] font-bold text-gray-400">{s.studentCode}</span>
 <span className="w-1 h-1 rounded-full bg-gray-300" />
 <span className="text-[10px] font-bold text-teal-600">{s.groupName}</span>
 </div>
 </div>
 <div className="col-span-1 text-center text-sm font-bold text-gray-700">{s.commits}</div>
 <div className="col-span-1 text-center text-sm font-bold text-gray-700">{s.jiraDone}</div>
 <div className="col-span-1 text-center text-sm font-bold text-gray-700">{s.prs}</div>
 <div className="col-span-1 text-center text-sm font-bold text-gray-700">{s.reviews}</div>
 <div className="col-span-1 text-center text-sm font-black text-teal-700">{s.score}</div>
 <div className="col-span-1 text-center">
 <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${getStatusBadgeClass(s.status)}`}>
 {s.status}
 </span>
 </div>
 <div className="col-span-2 flex justify-end gap-1">
 <button onClick={() => onWarning(s)} className="p-1.5 rounded-lg border border-amber-100 text-amber-600 hover:bg-amber-50" title="Nhắc nhở">
 Cần chú ý
 </button>
 </div>
 </div>
 ))
 )}
 </CardContent>
 </Card>
 );
}






