import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/Card.jsx";
import { Clock, Activity } from"lucide-react";

export function AgingWipTable({ agingWipData, loadingAgingWip }) {
 return (
 <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
 <CardHeader className="border-b border-gray-50 py-6 px-8 flex flex-row items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm"><Clock size={20} /></div>
 <CardTitle className="text-base font-black text-gray-800">Aging WIP Analysis</CardTitle>
 </div>
 <span className="text-[10px] font-black text-blue-600 bg-blue-50 rounded-full px-4 py-1.5 border border-blue-100">
 {agingWipData?.items?.length || 0} tasks đang ngâm
 </span>
 </CardHeader>
 <CardContent className="p-0">
 {loadingAgingWip ? (
 <div className="p-20 text-center"><Activity className="animate-spin inline mr-2 text-blue-600" /> Đang tính toán...</div>
 ) : !agingWipData?.items || agingWipData.items.length === 0 ? (
 <div className="p-20 text-center text-[10px] font-black text-gray-300">Không có task nào bị trễ tiến độ 🎉</div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead className="bg-gray-50/50">
 <tr>
 <th className="py-5 px-8 text-[10px] font-black text-gray-400 border-b border-gray-100">Task Title</th>
 <th className="py-5 px-8 text-[10px] font-black text-gray-400 border-b border-gray-100 text-center">Status</th>
 <th className="py-5 px-8 text-[10px] font-black text-gray-400 border-b border-gray-100 text-center">Assignee</th>
 <th className="py-5 px-8 text-[10px] font-black text-gray-400 border-b border-gray-100 text-right">Aging Days</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {agingWipData.items.map((task, idx) => (
 <tr key={idx} className="hover:bg-gray-50/50 transition-all">
 <td className="py-6 px-8">
 <p className="text-sm font-black text-gray-800 truncate max-w-sm tracking-tight">{task.title}</p>
 <p className="text-[10px] text-gray-400 font-bold mt-1">{task.key}</p>
 </td>
 <td className="py-6 px-8 text-center">
 <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[9px] font-black">{task.status}</span>
 </td>
 <td className="py-6 px-8 text-center">
 <p className="text-[10px] font-black text-gray-600">{task.assigneeName ||"Unassigned"}</p>
 </td>
 <td className="py-6 px-8 text-right font-black text-red-500 text-sm">{task.agingDays} ngày</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </CardContent>
 </Card>
 );
}






