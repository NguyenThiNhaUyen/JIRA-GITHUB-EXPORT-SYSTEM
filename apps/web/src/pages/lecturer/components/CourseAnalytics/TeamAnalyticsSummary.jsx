import { Sparkles, Users, GitBranch, MousePointer2, ChevronRight, AlertTriangle, Clock, CheckCircle } from"lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/Card.jsx";
import { Badge } from"@/components/ui/Badge.jsx";
import { Button } from"@/components/ui/Button.jsx";

export function TeamAnalyticsSummary({
 courseRankings,
 courseInactiveTeams,
 navigate
}) {
 return (
 <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full mt-8">
 <Card className="border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white">
 <CardHeader className="border-b border-gray-50 py-6 px-10 flex flex-row items-center justify-between">
 <CardTitle className="text-sm font-black text-gray-800 flex items-center gap-2">
 <Sparkles size={16} className="text-amber-500" /> Xáº¿p háº¡ng hiá»‡u quáº£ nhĂ³m
 </CardTitle>
 <Badge className="bg-teal-50 text-teal-700 border-teal-100 rounded-lg text-[9px] font-black">đŸ”¥ Top 5</Badge>
 </CardHeader>
 <CardContent className="p-0">
 <div className="divide-y divide-gray-50">
 {courseRankings.slice(0, 5).map((t, i) => (
 <div key={t.id || i} className="flex items-center justify-between p-8 hover:bg-teal-50/20 transition-all group/item cursor-pointer" onClick={() => navigate(`/lecturer/group/${t.id}`)}>
 <div className="flex items-center gap-5">
 <span className="text-2xl font-black text-gray-100 group-hover/item:text-teal-200 transition-colors">0{i + 1}</span>
 <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover/item:bg-white group-hover/item:border-teal-100 group-hover/item:text-teal-600 transition-all">
 <Users size={20} />
 </div>
 <div>
 <p className="font-black text-gray-800 tracking-tight text-sm">{t.name || t.teamName}</p>
 <div className="flex items-center gap-3 mt-1.5">
 <p className="text-[10px] font-black text-gray-400 flex items-center gap-1"><GitBranch size={10} /> {t.commits || t.count || 0} Commit</p>
 <p className="text-[10px] font-black text-gray-400 flex items-center gap-1"><MousePointer2 size={10} /> Active</p>
 </div>
 </div>
 </div>
 <div className="text-right flex flex-col items-end gap-1">
 <div className="px-4 py-1.5 bg-teal-50 rounded-xl text-teal-700 font-black text-[10px] border border-teal-100">
 {t.score || 0}% Performance
 </div>
 <ChevronRight size={14} className="text-gray-200 group-hover/item:text-teal-400 mr-2" />
 </div>
 </div>
 ))}
 {courseRankings.length === 0 && <div className="py-24 text-center text-gray-300 font-black text-xs opacity-40">ChÆ°a cĂ³ dá»¯ liá»‡u xáº¿p háº¡ng</div>}
 </div>
 </CardContent>
 </Card>

 <Card className="border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white">
 <CardHeader className="border-b border-gray-50 py-6 px-10 flex flex-row items-center justify-between">
 <CardTitle className="text-sm font-black text-gray-800 flex items-center gap-2">
 <AlertTriangle size={16} className="text-red-500" /> NhĂ³m cáº§n há»— trá»£ ngay
 </CardTitle>
 <Badge className="bg-red-50 text-red-700 border-red-100 rounded-lg text-[9px] font-black">Alerts</Badge>
 </CardHeader>
 <CardContent className="p-0">
 <div className="divide-y divide-gray-50">
 {courseInactiveTeams.map((t, i) => (
 <div key={t.id || i} className="flex items-center justify-between p-8 hover:bg-red-50/20 transition-all group/item">
 <div className="flex items-center gap-5">
 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${t.severity === 'high' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
 <AlertTriangle size={24} />
 </div>
 <div>
 <p className="font-black text-gray-800 tracking-tight text-sm">{t.name || t.teamName}</p>
 <p className="text-[10px] font-black text-red-400 mt-1.5 flex items-center gap-1"><Clock size={12} /> {t.reason || 'KhĂ´ng cĂ³ hoáº¡t Ä‘á»™ng commit > 7 ngĂ y'}</p>
 </div>
 </div>
 <Button variant="outline" className="h-11 px-6 text-[10px] font-black text-red-600 hover:bg-red-50 border-red-100 rounded-2xl shadow-sm">Nháº¯c nhá»Ÿ</Button>
 </div>
 ))}
 {courseInactiveTeams.length === 0 && (
 <div className="py-24 text-center">
 <CheckCircle size={40} className="mx-auto text-emerald-100 mb-4" />
 <p className="text-xs font-black text-gray-300">Táº¥t cáº£ cĂ¡c nhĂ³m Ä‘á»u hoáº¡t Ä‘á»™ng tá»‘t</p>
 </div>
 )}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
