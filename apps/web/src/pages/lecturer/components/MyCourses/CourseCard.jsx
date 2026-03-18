import { GraduationCap, Users, BookOpen, GitBranch, AlertTriangle, ChevronRight } from"lucide-react";
import { ResponsiveContainer, LineChart, Line } from"recharts";
import { Card, CardContent } from"@/components/ui/Card.jsx";
import { Button } from"@/components/ui/Button.jsx";

export function CourseCard({ course, onNavigate }) {
 const groupCount = course.projects?.length || 0;
 const alerts = course.alertsCount || 0;
 const activeTeams = course.activeTeams || 0;
 const jiraConnected = course.jiraConnected || 0;

 const semester =
 course.semesterName ||
 course.semester?.name ||
 course.semester ||"N/A";

 const progress = Math.min(100, Math.round((activeTeams / (groupCount || 1)) * 100));
 const lastCommit = course.lastActivityAt ? new Date(course.lastActivityAt).toLocaleDateString('vi-VN') :"â€”";

 let status ="ACTIVE";
 if (activeTeams === 0 && groupCount > 0) {
 status ="NO REPO";
 } else if (activeTeams < groupCount / 2) {
 status ="LOW";
 }
 if (course.status ==="COMPLETED") {
 status ="ARCHIVED";
 }

 return (
 <Card 
 className="group relative border-0 overflow-visible transition-all duration-700 hover:shadow-premium hover:-translate-y-2 bg-white rounded-[40px] p-2"
 onClick={() => onNavigate(`/lecturer/course/${course.id}/dashboard`)}
 >
 <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-indigo-500/5 rounded-[38px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
 
 <div className="relative bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden h-full">
 <div className="h-24 bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 relative overflow-hidden">
 <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4">
 <GraduationCap size={120} strokeWidth={1} className="text-white" />
 </div>
 <div className="absolute top-6 left-6">
 <StatusBadge status={status} />
 </div>
 </div>

 <CardContent className="p-8 pt-0 -mt-6 space-y-6">
 <div className="flex items-start justify-between">
 <div className="w-16 h-16 rounded-3xl bg-white border border-gray-100 shadow-xl flex items-center justify-center -mt-8 relative z-10 transition-transform group-hover:rotate-6">
 <span className="text-lg font-black text-teal-600 font-display">
 {course.subject?.code?.substring(0, 3) || course.subjectCode?.substring(0, 3) ||"Lá»›p"}
 </span>
 </div>
 {alerts > 0 && (
 <div className="mt-4 flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100 animate-pulse">
 <AlertTriangle size={12} strokeWidth={3} />
 <span className="text-[10px] font-black">{alerts} Cáº£nh bĂ¡o</span>
 </div>
 )}
 </div>

 <div>
 <h3 className="text-xl font-black text-gray-800 leading-tight font-display mb-1 group-hover:text-teal-600 transition-colors">{course.code}</h3>
 <p className="text-xs font-bold text-gray-400">{course.name || course.subject?.name || course.subjectName}</p>
 <div className="flex items-center gap-2 mt-4 text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full w-fit">
 Semester {semester}
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <StatMini label="Sinh viĂªn" value={course.currentStudents || 0} icon={Users} color="teal" />
 <StatMini label="NhĂ³m dá»± Ă¡n" value={groupCount} icon={BookOpen} color="indigo" />
 </div>

 <div className="space-y-3 pt-2">
 <div className="flex justify-between items-end">
 <span className="text-[10px] font-black text-gray-400">Tiáº¿n Ä‘á»™ tĂ­ch há»£p</span>
 <span className="text-lg font-black text-gray-800 font-display">{progress}%</span>
 </div>
 <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner flex">
 <div 
 className="h-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-1000 ease-out" 
 style={{ width: `${progress}%` }} 
 />
 </div>
 </div>

 <div className="pt-4 flex flex-col gap-3">
 <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 group-hover:bg-white group-hover:border-teal-100 transition-all">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-teal-600 shadow-sm">
 <GitBranch size={14} />
 </div>
 <div>
 <p className="text-[9px] font-black text-gray-400">GitHub Repos</p>
 <p className="text-xs font-black text-gray-800">{activeTeams}/{groupCount}</p>
 </div>
 </div>
 <div className="text-right">
 <p className="text-[9px] font-black text-gray-400">Cuá»‘i cĂ¹ng</p>
 <p className="text-[10px] font-bold text-gray-500">{lastCommit}</p>
 </div>
 </div>
 </div>

 <div className="flex justify-between gap-3 pt-2">
 <Button 
 variant="outline" 
 className="flex-1 h-12 rounded-2xl border-gray-100 hover:border-teal-200 hover:text-teal-600 hover:bg-teal-50/30 text-[10px]"
 onClick={(e) => { e.stopPropagation(); onNavigate(`/lecturer/course/${course.id}/alerts`); }}
 >
 Cáº£nh bĂ¡o
 </Button>
 <Button 
 className="flex-1 h-12 rounded-2xl bg-gray-900 hover:bg-black text-white shadow-xl shadow-gray-200 border-0 text-[10px]"
 onClick={(e) => { e.stopPropagation(); onNavigate(`/lecturer/course/${course.id}/manage-groups`); }}
 >
 Chi tiáº¿t <ChevronRight size={14} className="ml-2" />
 </Button>
 </div>
 </CardContent>
 </div>
 </Card>
 );
}

function StatMini({ label, value, icon: Icon, color }) {
 const colors = {
 teal:"text-teal-600 bg-teal-50 border-teal-100",
 indigo:"text-indigo-600 bg-indigo-50 border-indigo-100"
 };
 return (
 <div className="flex items-center gap-3">
 <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${colors[color]}`}>
 <Icon size={14} strokeWidth={2.5} />
 </div>
 <div>
 <p className="text-[9px] font-black text-gray-400 tracking-[0.1em]">{label}</p>
 <p className="text-sm font-black text-gray-800 font-display leading-tight">{value}</p>
 </div>
 </div>
 );
}

function StatusBadge({ status }) {
 const map = {
 ACTIVE:"bg-white/90 text-emerald-600 border-white/20",
 LOW:"bg-amber-400/90 text-white border-white/20","NO REPO":"bg-red-500/90 text-white border-white/20",
 ARCHIVED:"bg-gray-400/90 text-white border-white/20"
 };
 return (
 <span className={`text-[10px] font-black tracking-[0.2em] px-3 py-1.5 rounded-xl backdrop-blur-md border shadow-lg ${map[status] || map.ACTIVE}`}>
 {status}
 </span>
 );
}

