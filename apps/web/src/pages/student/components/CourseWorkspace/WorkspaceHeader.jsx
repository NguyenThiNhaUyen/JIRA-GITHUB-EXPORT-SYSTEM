import { Crown, RefreshCw, Users, MapPin } from"lucide-react";
import { Card, CardContent } from"@/components/ui/Card.jsx";
import { Button } from"@/components/ui/Button.jsx";

export function WorkspaceHeader({ course, group, isLeader, onSync, isSyncing, onBack }) {
 if (!course) return null;

 return (
 <div className="space-y-6">
 <button 
 onClick={onBack} 
 className="flex items-center gap-3 text-[10px] font-black tracking-[0.3em] text-teal-600 hover:text-teal-700 transition-all group font-display"
 >
 <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center group-hover:-translate-x-1 transition-transform">â†</div>
 Danh sĂ¡ch khĂ³a há»c cá»§a tĂ´i
 </button>

 <Card className="border border-gray-100 shadow-xl shadow-teal-900/5 rounded-[44px] overflow-hidden bg-white group hover:shadow-2xl transition-all duration-500 glass-card">
 <div className="h-2.5 bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-500 animate-gradient-x" />
 <CardContent className="p-10">
 <div className="flex flex-wrap items-center justify-between gap-10">
 <div className="flex gap-10 items-center">
 <div className="w-20 h-20 rounded-[32px] bg-gradient-to-br from-teal-50 to-indigo-50 text-teal-600 flex items-center justify-center font-black text-3xl shadow-inner border border-white group-hover:scale-110 transition-transform duration-500">
 {course.subject?.code?.charAt(0) || course.code?.charAt(0)}
 </div>
 <div>
 <div className="flex items-center gap-4 mb-4">
 <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-4 py-1.5 rounded-full border border-teal-100 tracking-[0.2em] shadow-sm">{course.subject?.code || course.code}</span>
 {isLeader && (
 <span className="flex items-center gap-2 text-[10px] font-black px-4 py-1.5 rounded-full border bg-amber-50 text-amber-600 border-amber-100 tracking-[0.2em] shadow-sm animate-pulse">
 <Crown size={14} className="fill-amber-600/20" /> Team Leader
 </span>
 )}
 </div>
 <h3 className="text-3xl font-black text-gray-800 tracking-tighter leading-none mb-3 font-display">{group?.name ||"Member Workspace"}</h3>
 <div className="flex items-center gap-6">
 <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] flex items-center gap-2.5">
 <Users size={14} className="text-gray-300" /> Giáº£ng viĂªn: <span className="text-gray-600">{course.lecturerNames?.join(",") ||"N/A"}</span>
 </p>
 <div className="w-1 h-1 rounded-full bg-gray-200" />
 <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] flex items-center gap-2.5">
 <MapPin size={14} className="text-gray-300" /> {course.semesterName ||"Há»c ká»³ hiá»‡n táº¡i"}
 </p>
 </div>
 </div>
 </div>

 {group && (
 <div className="relative group/sync">
 <Button 
 onClick={onSync}
 disabled={isSyncing}
 className="rounded-[28px] h-16 border-2 border-gray-100 bg-white text-gray-800 text-[11px] font-black tracking-[0.3em] px-12 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-all shadow-xl shadow-teal-900/5 active:scale-95 font-display disabled:opacity-50"
 >
 {isSyncing ? <RefreshCw className="animate-spin mr-3" size={20}/> : <RefreshCw size={20} className="mr-3 group-hover/sync:rotate-180 transition-transform duration-700" />} Sync Workspace
 </Button>
 </div>
 )}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
