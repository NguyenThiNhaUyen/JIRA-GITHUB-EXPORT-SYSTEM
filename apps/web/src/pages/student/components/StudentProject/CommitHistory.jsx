import { Github, GitBranch, Clock, ExternalLink, RefreshCw } from"lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from"@/components/ui/Card.jsx";
import { Button } from"@/components/ui/Button.jsx";

export function CommitHistory({ loadingCommits, myCommits, githubUrl }) {
 return (
 <Card className="border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white">
 <CardHeader className="border-b border-gray-50 py-10 px-12 bg-gray-50/20">
 <CardTitle className="font-display">DĂ²ng thá»i gian Ä‘Ă³ng gĂ³p trĂªn GitHub</CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 {loadingCommits ? (
 <div className="py-32 text-center space-y-4">
 <RefreshCw className="mx-auto text-teal-600 animate-spin" size={32} />
 <p className="text-[10px] font-black text-gray-400 animate-pulse">Äang táº£i lá»‹ch sá»­ Git...</p>
 </div>
 ) : myCommits.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-32 gap-6">
 <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200 border border-gray-100 shadow-inner">
 <Github size={32} />
 </div>
 <p className="text-[10px] font-black text-gray-300 text-center leading-relaxed">ChÆ°a cĂ³ báº£n ghi commit nĂ o<br/>Ä‘Æ°á»£c ghi nháº­n cho tĂ i khoáº£n nĂ y</p>
 </div>
 ) : (
 <div className="divide-y divide-gray-50">
 {myCommits.map(commit => (
 <div key={commit.id || commit.sha} className="p-8 px-12 hover:bg-gray-50/50 transition-all flex items-center justify-between group relative overflow-hidden">
 <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none">
 <GitBranch size={80} />
 </div>
 
 <div className="flex items-center gap-8 min-w-0 relative z-10">
 <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-all shadow-sm">
 <GitBranch size={24} />
 </div>
 <div className="min-w-0">
 <p className="text-base font-black text-gray-800 leading-tight truncate group-hover:text-teal-600 transition-colors tracking-tight font-display">{commit.message}</p>
 <div className="flex items-center gap-4 mt-3">
 <div className="flex items-center gap-2 bg-white border border-gray-100 px-3 py-1 rounded-xl shadow-sm">
 <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
 <span className="text-[11px] font-black text-teal-600 font-mono tracking-tighter">{String(commit.sha ||"0000000").substring(0, 7)}</span>
 </div>
 <span className="text-[10px] text-gray-400 font-black flex items-center gap-2">
 <Clock size={12} className="text-gray-300" /> 
 {new Date(commit.createdAt || commit.date).toLocaleString("vi-VN")}
 </span>
 </div>
 </div>
 </div>
 <Button 
 variant="outline" 
 size="icon" 
 className="h-12 w-12 rounded-2xl border-gray-100 text-gray-300 hover:text-teal-600 hover:bg-white hover:border-teal-200 shadow-sm scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all active:scale-95" 
 onClick={() => githubUrl && window.open(`${githubUrl}/commit/${commit.sha}`, '_blank')}
 >
 <ExternalLink size={18}/>
 </Button>
 </div>
 ))}
 </div>
 )}
 </CardContent>
 </Card>
 );
}

