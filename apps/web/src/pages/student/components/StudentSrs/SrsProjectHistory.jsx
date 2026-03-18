import { Activity, Clock, FileDown, FileText } from"lucide-react";
import { useGetProjectSrs } from"@/features/srs/hooks/useSrs.js";
import { Card, CardHeader, CardTitle, CardContent } from"@/components/ui/Card.jsx";
import { Skeleton } from"@/components/ui/Skeleton.jsx";
import { StatusBadge } from"@/components/shared/Badge.jsx";
import { Button } from"@/components/ui/Button.jsx";

export function SrsProjectHistory({ project, index }) {
 const { data: srsList = [], isLoading } = useGetProjectSrs(project.id);
 
 if (isLoading) return <Skeleton className="h-48 rounded-[48px]" />;

 return (
 <Card className="rounded-[56px] border border-gray-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 glass-card" style={{ animationDelay: `${index * 200}ms` }}>
 <CardHeader className="p-12 border-b border-gray-50 flex flex-row items-center justify-between bg-gray-50/20">
 <div className="space-y-3">
 <CardTitle className="text-xl font-black tracking-tighter text-gray-800 leading-none font-display mb-1">{project.name}</CardTitle>
 <p className="text-[10px] font-black text-gray-300 tracking-[0.3em] leading-none flex items-center gap-3">
 <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
 NhĂ³m há»“ sÆ¡ SRS hiá»‡n táº¡i
 </p>
 </div>
 <div className="flex items-center gap-4">
 <div className="bg-white px-6 py-3 rounded-[20px] flex items-center gap-3 border border-gray-100 shadow-sm transition-all group-hover:scale-105">
 <Activity size={16} className="text-teal-600" />
 <span className="text-[11px] font-black text-teal-700">{srsList.length} PHIĂN Báº¢N</span>
 </div>
 </div>
 </CardHeader>
 <CardContent className="p-0 divide-y-2 divide-dashed divide-gray-50">
 {srsList.length === 0 ? (
 <div className="p-24 text-center space-y-6">
 <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
 <FileText size={32} className="text-gray-200" />
 </div>
 <p className="text-[11px] font-black text-gray-300 tracking-[0.3em] italic opacity-60">Dá»± Ă¡n chÆ°a cĂ³ báº£n ná»™p Ä‘áº·c táº£ nĂ o</p>
 </div>
 ) : srsList.map((rpt, idx) => (
 <div key={rpt.id} className="p-10 flex items-center justify-between hover:bg-teal-50/20 transition-all duration-500 group relative overflow-hidden">
 <div className="absolute left-0 top-0 w-1 h-full bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
 
 <div className="flex gap-10 items-center">
 <div className="w-16 h-16 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 shadow-inner group-hover:bg-teal-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
 <FileText size={28}/>
 </div>
 <div className="space-y-3">
 <div className="flex items-center gap-6">
 <p className="text-lg font-black text-gray-800 tracking-tight font-display">Version {rpt.version || (idx + 1).toFixed(1)}</p>
 <StatusBadge status={rpt.status === 'FINAL' || rpt.status === 'APPROVED' ? 'success' : 'warning'} label={rpt.status === 'FINAL' || rpt.status === 'APPROVED' ? 'ÄĂ£ duyá»‡t' : 'Äang xá»­ lĂ½'} />
 </div>
 <div className="flex items-center gap-3 text-[10px] font-black text-gray-300 bg-gray-50/50 px-3 py-1 rounded-lg w-fit">
 <Clock size={12} className="text-teal-400" /> {new Date(rpt.submittedAt || rpt.createdAt).toLocaleString("vi-VN", { dateStyle: 'medium', timeStyle: 'short' })}
 </div>
 {rpt.feedback && (
 <div className="mt-4 p-5 bg-indigo-50/50 rounded-[24px] max-w-lg border border-indigo-100/30 group-hover:bg-white transition-colors shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
 <p className="text-[10px] font-black text-indigo-400 opacity-80">Pháº£n há»“i tá»« Giáº£ng viĂªn:</p>
 </div>
 <p className="text-sm font-bold text-indigo-900 leading-relaxed italic">{rpt.feedback}</p>
 </div>
 )}
 </div>
 </div>
 {rpt.fileUrl && (
 <Button 
 variant="outline" 
 className="rounded-[24px] h-14 px-8 text-[11px] font-black border-slate-100 text-slate-400 hover:text-teal-600 hover:bg-white hover:border-teal-200 shadow-sm transition-all active:scale-95 group-hover:scale-105 font-display" 
 onClick={() => window.open(rpt.fileUrl, '_blank')}
 >
 <FileDown size={18} className="mr-3"/> Táº£i tĂ i liá»‡u
 </Button>
 )}
 </div>
 ))}
 </CardContent>
 </Card>
 );
}

