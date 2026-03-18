import { History, GitBranch, RefreshCw } from"lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from"@/components/ui/Card.jsx";
import { Skeleton } from"@/components/ui/Skeleton.jsx";

export function RecentActivitySidebar({ isLoading, commitsList }) {
 return (
 <Card className="border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white glass-card">
 <CardHeader className="border-b border-gray-50/50 py-8 px-10 flex flex-row items-center justify-between">
 <CardTitle className="text-xs font-black text-gray-400 flex items-center gap-4 font-display">
 <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shadow-inner">
 <History size={18} className="text-teal-600" />
 </div>
 Hoáº¡t Ä‘á»™ng Git má»›i nháº¥t
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 {isLoading ? (
 <div className="p-10 space-y-6">
 <Skeleton className="h-14 w-full rounded-2xl" />
 <Skeleton className="h-14 w-full rounded-2xl" />
 <Skeleton className="h-14 w-full rounded-2xl" />
 </div>
 ) : commitsList.length === 0 ? (
 <div className="p-16 text-center space-y-6 bg-gray-50/20">
 <RefreshCw size={40} className="text-gray-100 mx-auto" />
 <p className="text-[10px] text-gray-300 font-black italic opacity-60">ChÆ°a cĂ³ commit nĂ o gáº§n Ä‘Ă¢y đŸƒ</p>
 </div>
 ) : (
 <div className="divide-y divide-gray-50">
 {commitsList.map((c, idx) => (
 <div key={idx} className="p-8 px-10 flex items-start gap-6 hover:bg-gray-50/50 transition-all duration-300 group cursor-pointer animate-in slide-in-from-right-4" style={{ animationDelay: `${idx * 100}ms` }}>
 <div className="w-12 h-12 rounded-[20px] bg-white flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm">
 <GitBranch size={18} className="text-gray-400 group-hover:text-white transition-colors" />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-xs font-black text-gray-800 leading-tight truncate font-display group-hover:text-teal-600 transition-colors tracking-tight">{c.message ||"Updated code baseline"}</p>
 <div className="flex items-center justify-between mt-3">
 <p className="text-[9px] text-teal-600 font-black bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
 {c.repositoryName || c.repoName ||"GitHub Repo"}
 </p>
 <p className="text-[9px] text-gray-400 font-bold opacity-60">{new Date(c.commitDate || c.Date).toLocaleDateString("vi-VN")}</p>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </CardContent>
 </Card>
 );
}
