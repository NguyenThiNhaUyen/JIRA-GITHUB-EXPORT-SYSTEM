import { LayoutList, Eye, Bell } from"lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/Card.jsx";
import { Button } from"@/components/ui/Button.jsx";
import { Badge } from"@/components/ui/Badge.jsx";

export function GroupTrackingTable({ groups, navigate, success }) {
 return (
 <Card className="lg:col-span-2 border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
 <CardHeader className="border-b border-gray-50 py-6 px-8 flex justify-between items-center">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg">
 <LayoutList size={18} className="text-white" />
 </div>
 <CardTitle className="text-sm font-black text-gray-800 leading-none">Bảng theo dõi nhóm</CardTitle>
 </div>
 <Badge className="bg-teal-50 border-teal-100 text-teal-700 rounded-full py-1.5 px-4 font-black text-[10px]">{groups.length} NHÓM</Badge>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead className="bg-gray-50/50">
 <tr>
 <th className="py-5 px-8 text-[10px] font-black text-gray-400 border-b border-gray-100">Nhóm & Đề tài</th>
 <th className="py-5 px-8 text-[10px] font-black text-gray-400 text-center border-b border-gray-100">Cấu hình Link</th>
 <th className="py-5 px-8 text-[10px] font-black text-gray-400 text-center border-b border-gray-100">Thành viên</th>
 <th className="py-5 px-8 text-[10px] font-black text-gray-400 text-right border-b border-gray-100">Hành động</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {groups.map(g => (
 <tr key={g.id} className="hover:bg-teal-50/10 transition-all border-none group">
 <td className="py-6 px-8">
 <p className="font-black text-gray-800 text-sm tracking-tight">{g.name}</p>
 <p className="text-[10px] text-gray-400 font-bold mt-1 truncate max-w-[200px]">{g.topic || g.description ||"Chưa đăng ký đề tài"}</p>
 </td>
 <td className="py-6 px-8 text-center">
 <div className="flex justify-center gap-2">
 <StatusBadge label="Git" active={g.integration?.githubStatus === 'APPROVED'} />
 <StatusBadge label="Jira" active={g.integration?.jiraStatus === 'APPROVED'} />
 </div>
 </td>
 <td className="py-6 px-8">
 <div className="flex -space-x-2 justify-center">
 {(g.team || []).slice(0, 3).map(s => (
 <div key={s.id} className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 border-2 border-white flex items-center justify-center text-white text-[10px] font-black shadow-sm" title={s.name}>{s.name?.charAt(0)}</div>
 ))}
 {g.team?.length > 3 && (
 <div className="w-8 h-8 rounded-xl bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-gray-500">+{g.team.length - 3}</div>
 )}
 </div>
 </td>
 <td className="py-6 px-8 text-right">
 <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
 <Button onClick={() => navigate(`/lecturer/group/${g.id}`)} variant="ghost" size="icon" className="w-10 h-10 rounded-2xl bg-white border border-transparent hover:border-teal-100 hover:text-teal-600 shadow-sm"><Eye size={16}/></Button>
 <Button onClick={() => success(`Đã nhắc nhở nhóm ${g.name}`)} variant="ghost" size="icon" className="w-10 h-10 rounded-2xl bg-white border border-transparent hover:border-amber-100 hover:text-amber-600 shadow-sm"><Bell size={16}/></Button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 );
}

function StatusBadge({ label, active }) {
 return (
 <span className={`px-2 py-0.5 rounded-lg font-black text-[9px] border transition-all ${
 active ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-300'
 }`}>
 {label} {active ? '✓' : '✗'}
 </span>
 );
}






