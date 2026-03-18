import { useMemo } from"react";
import { Monitor, Eye, Trash2, PenLine, Users, Target, ShieldCheck, Zap, MoreHorizontal, UserPlus } from"lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/Card.jsx";
import { Button } from"@/components/ui/Button.jsx";
import { InputField, SelectField } from"@/components/shared/FormFields.jsx";
import { StatusBadge } from"@/components/shared/Badge.jsx";

export function GroupListPanel({
 groupSearch,
 setGroupSearch,
 groupFilter,
 setGroupFilter,
 groupsWithMetrics,
 visibleGroups,
 navigate,
 handleDeleteGroup,
 handleOpenForceAdd,
 isBusy
}) {

 return (
 <div className="lg:col-span-2 space-y-8 animate-in slide-in-from-right duration-700">
 <Card className="shadow-sm rounded-[40px] overflow-hidden bg-white border border-gray-100 p-2">
 <div className="bg-white rounded-[32px] border border-gray-50 overflow-hidden">
 <CardHeader className="border-b border-gray-50 flex flex-col md:flex-row items-center justify-between p-10 gap-6 bg-gray-50/20">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-100">
 <Users size={18} className="text-white" />
 </div>
 <CardTitle className="font-display">Danh SĂ¡ch NhĂ³m ({visibleGroups.length})</CardTitle>
 </div>
 <div className="flex gap-4 w-full md:w-auto">
 <InputField
 placeholder="TĂ¬m nhĂ³m..."
 value={groupSearch}
 onChange={e => setGroupSearch(e.target.value)}
 className="w-full md:w-56 h-12 text-[10px] bg-white border-gray-100 focus:bg-teal-50/10"
 icon={Zap}
 />
 <SelectField
 value={groupFilter}
 onChange={e => setGroupFilter(e.target.value)}
 className="w-full md:w-48 h-12 text-[10px] bg-white border-gray-100"
 >
 <option value="all">Táº¥t cáº£ tráº¡ng thĂ¡i</option>
 <option value="healthy">Äang á»•n Ä‘á»‹nh</option>
 <option value="critical">Rá»§i ro cao</option>
 <option value="missing-topic">ChÆ°a cĂ³ Ä‘á» tĂ i</option>
 </SelectField>
 </div>
 </CardHeader>
 <CardContent className="p-0">
 <div className="divide-y divide-gray-50">
 {visibleGroups.length === 0 ? (
 <div className="py-24 text-center bg-gray-50/10">
 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
 <Users size={24} className="text-gray-200" />
 </div>
 <p className="text-[10px] font-black text-gray-400 tracking-[0.2em]">KhĂ´ng tĂ¬m tháº¥y dá»¯ liá»‡u phĂ¹ há»£p</p>
 </div>
 ) : visibleGroups.map((group) => (
 <div key={group.id} className="p-10 hover:bg-teal-50/5 transition-all duration-500 group/item relative overflow-hidden">
 <div className="absolute top-0 right-0 p-8 opacity-0 group-hover/item:opacity-5 transition-opacity pointer-events-none">
 <Users size={120} />
 </div>
 
 <div className="flex flex-col xl:flex-row items-start justify-between gap-8 mb-8 relative z-10">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-4 mb-3">
 <h4 className="text-2xl font-black text-gray-800 tracking-tight font-display">{group.name}</h4>
 <StatusBadge status={group.state.toUpperCase()} className="rounded-xl px-3 py-1 text-[9px] border shadow-sm" />
 </div>
 <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 bg-gray-50 w-fit px-3 py-1 rounded-full group-hover/item:bg-white transition-colors border border-gray-100">
 <PenLine size={12} className="text-teal-500" /> 
 <span className="line-clamp-1 truncate max-w-[300px]">{group.description ||"ChÆ°a thiáº¿t láº­p Ä‘á» tĂ i dá»± Ă¡n"}</span>
 </div>
 </div>
 
 <div className="flex gap-3 shrink-0">
 <Button
 variant="outline"
 className="h-12 px-6 rounded-2xl border-gray-100 hover:border-teal-200 hover:text-teal-600 shadow-sm hover:shadow-md transition-all active:scale-95"
 onClick={() => navigate(`/lecturer/group/${group.id}`)}
 >
 Chi tiáº¿t <Eye size={16} className="ml-2" />
 </Button>
 <Button
 variant="outline"
 className="h-12 w-12 p-0 rounded-2xl border-gray-100 hover:border-red-200 hover:text-red-500 shadow-sm transition-all active:scale-90"
 onClick={() => handleDeleteGroup(group.id)}
 disabled={isBusy}
 >
 <Trash2 size={18} />
 </Button>
 </div>
 </div>

 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 relative z-10">
 <MetricCard label="ThĂ nh viĂªn" value={`${group.memberCount} SV`} icon={Users} color="teal">
 <button 
 onClick={() => handleOpenForceAdd(group.id)}
 className="mt-2 text-[8px] font-black text-teal-600 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-lg border border-teal-100 transition-all"
 >
 + ThĂªm
 </button>
 </MetricCard>
 <MetricCard label="Tiáº¿n Ä‘á»™" value={`${group.progress}%`} icon={Target} color="indigo" />
 <MetricCard label="NhĂ³m trÆ°á»Ÿng" value={group.leader ||"ChÆ°a cĂ³"} icon={ShieldCheck} color="amber" />
 <MetricCard label="Rá»§i ro Jira" value={`${group.riskScore}%`} icon={Zap} color={group.riskScore > 50 ? 'red' : 'emerald'} />
 </div>

 <div className="space-y-6 relative z-10">
 <div className="flex flex-wrap gap-2 pt-2">
 {(group.team || []).map((member, idx) => (
 <div key={member.studentUserId || member.studentId || idx} className="flex items-center gap-2.5 px-4 py-2 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-gray-700 tracking-tight shadow-sm hover:border-teal-200 hover:shadow-md transition-all cursor-default">
 <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
 {member.studentName}
 {member.role ==="LEADER" && <span className="text-[8px] bg-amber-500 text-white px-1.5 py-0.5 rounded-lg ml-1 font-black">LEADER</span>}
 </div>
 ))}
 </div>
 <div className="space-y-2">
 <div className="flex justify-between items-center px-1">
 <span className="text-[9px] font-black text-gray-300 tracking-[0.2em]">Project Velocity</span>
 <span className="text-[10px] font-black text-gray-800 font-display">{group.progress}%</span>
 </div>
 <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner p-0.5">
 <div 
 className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
 group.progress > 70 ? 'bg-gradient-to-r from-teal-400 to-teal-600' : 
 group.progress > 30 ? 'bg-gradient-to-r from-indigo-400 to-indigo-600' : 
 'bg-gradient-to-r from-orange-400 to-red-500'}`} 
 style={{ width: `${group.progress}%` }} 
 />
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </div>
 </Card>
 
 <div className="relative overflow-hidden p-10 bg-gradient-to-br from-gray-900 to-slate-900 rounded-[40px] shadow-2xl border border-white/5 group">
 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
 <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
 <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
 
 <div className="relative flex flex-col md:flex-row items-center justify-between gap-10">
 <div className="max-w-xl">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-md border border-white/10 shadow-xl">
 <Monitor size={24} />
 </div>
 <h4 className="text-xl font-black text-white tracking-[0.2em] font-display">Data Synchronization</h4>
 </div>
 <p className="text-sm text-gray-400 font-medium leading-relaxed">
 Äá»“ng bá»™ hĂ³a dá»¯ liá»‡u thá»i gian thá»±c giá»¯a Jira, GitHub vĂ  há»‡ thá»‘ng bĂ¡o cĂ¡o há»c táº­p. Äáº£m báº£o tĂ­nh nháº¥t quĂ¡n cá»§a metrics vĂ  tiáº¿n Ä‘á»™ dá»± Ă¡n.
 </p>
 </div>
 <Button className="bg-white text-gray-900 hover:bg-teal-50 rounded-2xl h-16 px-12 font-black tracking-[0.2em] shadow-2xl shadow-black/20 transition-all hover:scale-105 active:scale-95 border-0 text-[11px] font-display shrink-0">
 Sync Repository <Zap size={16} className="ml-2 fill-current" />
 </Button>
 </div>
 </div>
 </div>
 );
}

function MetricCard({ label, value, icon: Icon, color, children }) {
 const colors = {
 teal:"text-teal-600 bg-teal-50 border-teal-100",
 indigo:"text-indigo-600 bg-indigo-50 border-indigo-100",
 amber:"text-amber-600 bg-amber-50 border-amber-100",
 red:"text-red-500 bg-red-50 border-red-100",
 emerald:"text-emerald-600 bg-emerald-50 border-emerald-100"
 };
 return (
 <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center group/metric text-center">
 <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 border transition-transform group-hover/metric:scale-110 ${colors[color]}`}>
 <Icon size={18} strokeWidth={2.5} />
 </div>
 <p className="text-[9px] font-black text-gray-300 mb-1.5">{label}</p>
 <p className={`text-sm font-black tracking-tight font-display ${colors[color].split(' ')[0]}`}>{value}</p>
 {children}
 </div>
 );
}
