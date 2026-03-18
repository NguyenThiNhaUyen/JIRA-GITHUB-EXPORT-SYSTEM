import { Badge } from"@/components/ui/Badge.jsx";
import { Card, CardHeader, CardTitle, CardContent } from"@/components/ui/Card.jsx";

export function StudentTeamList({ project, metrics, userId }) {
 const teamMembers = project?.team || [];
 
 return (
 <Card className="border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white">
 <CardHeader className="border-b border-gray-50 py-10 px-12 bg-gray-50/10">
 <CardTitle className="text-xs font-black text-gray-400 font-display">Danh sách thành viên & Chỉ số đóng góp</CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 {teamMembers.map((m, idx) => {
 const isMe = String(m.studentId) === String(userId);
 const isLead = m.role?.toUpperCase() ==="LEADER";
 const studentMetric = metrics?.contributions?.find(met => String(met.studentId) === String(m.studentId));
 
 return (
 <div key={m.studentId} className="flex items-center gap-10 px-12 py-10 border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-all group animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
 <div className={`w-16 h-16 rounded-[28px] flex items-center justify-center text-xl font-black text-white shrink-0 shadow-2xl transition-all group-hover:scale-110 group-hover:rotate-3 ${isLead ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-200' : 'bg-gradient-to-br from-teal-500 to-indigo-600 shadow-teal-200'}`}>
 {m.studentName?.charAt(0)}
 </div>
 
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-4 mb-4">
 <p className="text-lg font-black text-gray-800 tracking-tight font-display">{m.studentName}</p>
 <div className="flex gap-2">
 {isLead && <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 text-[9px] font-black px-4 py-1.5 rounded-full shadow-sm">⭐ Leader</Badge>}
 {isMe && <Badge variant="outline" className="bg-teal-50 border-teal-200 text-teal-700 text-[9px] font-black px-4 py-1.5 rounded-full shadow-sm">Bạn</Badge>}
 </div>
 </div>
 
 <div className="flex items-center gap-8">
 <div className="flex-1 h-3.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-0.5 shadow-inner grow">
 <div 
 className={`h-full rounded-full shadow-lg transition-all duration-1000 ease-out ${isLead ? 'bg-gradient-to-r from-amber-300 to-amber-500' : 'bg-gradient-to-r from-teal-400 to-indigo-500'}`} 
 style={{ width: `${m.contributionScore || 0}%` }} 
 />
 </div>
 <span className="text-[11px] font-black text-gray-700 shrink-0 w-32 text-right">{m.contributionScore || 0}% Đóng góp</span>
 </div>
 </div>
 
 <div className="hidden md:flex gap-12 shrink-0">
 <div className="text-center group/metric">
 <p className="text-[10px] font-black text-gray-300 mb-2 opacity-60 group-hover/metric:text-teal-500 transition-colors">Commits</p>
 <p className="font-black text-3xl text-teal-600 tracking-tighter leading-none">{studentMetric?.commits || 0}</p>
 </div>
 <div className="text-center group/metric">
 <p className="text-[10px] font-black text-gray-300 mb-2 opacity-60 group-hover/metric:text-indigo-400 transition-colors">Issues</p>
 <p className="font-black text-3xl text-indigo-500 tracking-tighter leading-none">{studentMetric?.issues || 0}</p>
 </div>
 </div>
 </div>
 );
 })}
 </CardContent>
 </Card>
 );
}






