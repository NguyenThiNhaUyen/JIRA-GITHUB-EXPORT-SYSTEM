import { Flame, Target } from"lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from"@/components/ui/Card.jsx";
import { Skeleton } from"@/components/ui/Skeleton.jsx";

export function WeeklyActivityCharts({ isLoading, commitActivity, heatmap }) {
 return (
 <Card className="border border-gray-100 shadow-sm rounded-[44px] overflow-hidden bg-white glass-card">
 <CardHeader className="border-b border-gray-50/50 py-10 px-12">
 <CardTitle className="text-xs font-black text-gray-400 flex items-center gap-4 font-display">
 <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shadow-inner">
 <Flame size={20} className="text-teal-600 animate-pulse" />
 </div>
 Táº§n suáº¥t hoáº¡t Ä‘á»™ng tuáº§n nĂ y
 </CardTitle>
 </CardHeader>
 <CardContent className="p-12">
 {isLoading ? (
 <div className="space-y-12">
 <Skeleton className="h-44 w-full rounded-[32px]" />
 <Skeleton className="h-28 w-full rounded-[32px]" />
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
 <div>
 <div className="flex items-center gap-4 mb-10 text-[10px] font-black text-gray-400 opacity-60">
 <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
 GitHub Commits (7 Days)
 </div>
 <div className="flex h-52 items-end justify-between gap-5 px-4 mb-4">
 {(commitActivity || Array(7).fill({count: 0})).map((item, i) => {
 const count = item?.commits ?? item?.count ?? (typeof item === 'number' ? item : 0);
 return (
 <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
 <div className="h-full w-full bg-teal-50/50 rounded-t-2xl relative overflow-hidden transition-all duration-700 hover:bg-teal-50">
 <div 
 className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-teal-500 to-indigo-500 rounded-t-xl transition-all duration-1000 ease-out group-hover/bar:scale-x-110 shadow-lg" 
 style={{ height: `${Math.min((count || 0) * 15, 100)}%` }} 
 />
 <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all bg-gray-900 text-white text-[10px] py-2 px-3 rounded-xl pointer-events-none font-black shadow-2xl">{count || 0}</div>
 </div>
 <span className="text-[9px] font-black text-gray-400">{item?.label || `D${i + 1}`}</span>
 </div>
 );
 })}
 </div>
 </div>

 <div className="flex flex-col justify-center border-l border-gray-100 md:pl-16">
 <div className="flex items-center gap-4 mb-10 text-[10px] font-black text-gray-400 opacity-60">
 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
 Contribution Radar (Heatmap)
 </div>
 <div className="grid grid-cols-7 gap-3 mb-8">
 {(heatmap || Array(21).fill(0)).slice(0, 21).map((val, i) => {
 const count = val?.count ?? val?.Count ?? (typeof val === 'number' ? val : 0);
 return (
 <div 
 key={i} 
 className={`aspect-square rounded-lg border border-transparent transition-all duration-700 hover:scale-125 hover:z-10 hover:shadow-xl group relative cursor-pointer ${count > 0 ? 'bg-teal-500' : 'bg-gray-100 hover:border-gray-200'}`} 
 style={{ opacity: count > 0 ? (0.2 + (Math.min(count, 5) / 5)) : 1 }}
 >
 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">{count} acts</div>
 </div>
 );
 })}
 </div>
 <div className="flex justify-between items-center text-[10px] font-black text-gray-400 tracking-[0.3em] bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
 <span className="opacity-60">Low</span>
 <div className="flex gap-1.5">
 {[0, 1, 2, 3, 4].map(l => (
 <div key={l} className="w-4 h-4 rounded-md border border-white shadow-sm" style={{ background: l === 0 ? '#f3f4f6' : '#14b8a6', opacity: l === 0 ? 1 : (0.2 + l / 5) }}></div>
 ))}
 </div>
 <span className="opacity-60 text-teal-600 font-black">High</span>
 </div>
 </div>
 </div>
 )}
 </CardContent>
 </Card>
 );
}
