import { Link2, Github, Star, RefreshCw, CheckCircle } from"lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from"@/components/ui/Card.jsx";
import { Badge } from"@/components/ui/Badge.jsx";
import { Button } from"@/components/ui/Button.jsx";

export function IntegrationPanel({ group, isLeader, githubInput, setGithubInput, jiraInput, setJiraInput, onLinkSubmit, isLinking }) {
 return (
 <Card className="border-0 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.08)] rounded-[48px] bg-white overflow-hidden glass-card">
 <CardHeader className="p-12 border-b border-gray-50 bg-gray-50/20 flex flex-row items-center justify-between">
 <CardTitle className="text-lg font-black text-gray-800 tracking-[0.2em] flex items-center gap-6 font-display">
 <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-inner">
 <Link2 size={24} className="text-indigo-600" />
 </div>
 TĂ­ch há»£p Jira & GitHub
 </CardTitle>
 <div className="flex items-center gap-3">
 <Badge variant="outline" className={`text-[9px] font-black px-5 py-2 rounded-full border shadow-sm tracking-[0.2em] ${group.integration?.syncStatus === 'SYNCED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-white text-gray-400 border-gray-100'}`}>
 {group.integration?.syncStatus ||"CHÆ¯A Äá»’NG Bá»˜"}
 </Badge>
 </div>
 </CardHeader>
 <CardContent className="p-14 space-y-14">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
 <div className="space-y-5 group/input">
 <label className="text-[11px] font-black text-gray-400 tracking-[0.3em] ml-4 flex items-center gap-2">
 <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
 GitHub Repository (org/repo)
 </label>
 <div className="relative">
 <div className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-teal-600 group-hover/input:text-teal-600 transition-all duration-500"><Github size={24} /></div>
 <input 
 disabled={!isLeader}
 className="w-full h-20 pl-20 pr-10 bg-gray-50 border border-gray-100 rounded-[32px] text-base font-black text-gray-700 focus:bg-white focus:border-teal-500 focus:ring-8 focus:ring-teal-500/10 transition-all outline-none placeholder:text-gray-200 placeholder:font-bold font-mono group-hover/input:border-teal-200"
 placeholder="facebook/react"
 value={githubInput}
 onChange={e => setGithubInput(e.target.value)}
 />
 </div>
 </div>
 <div className="space-y-5 group/input">
 <label className="text-[11px] font-black text-gray-400 tracking-[0.3em] ml-4 flex items-center gap-2">
 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
 Jira Project Key
 </label>
 <div className="relative">
 <div className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-indigo-600 group-hover/input:text-indigo-600 transition-all duration-500"><Star size={24} /></div>
 <input 
 disabled={!isLeader}
 className="w-full h-20 pl-20 pr-10 bg-gray-50 border border-gray-100 rounded-[32px] text-base font-black text-gray-700 focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/10 transition-all outline-none placeholder:text-gray-200 placeholder:font-bold group-hover/input:border-indigo-200"
 placeholder="SWD-2024-T1"
 value={jiraInput}
 onChange={e => setJiraInput(e.target.value)}
 />
 </div>
 </div>
 </div>

 {isLeader && (
 <div className="pt-10 border-t border-gray-50 flex justify-end">
 <Button 
 onClick={onLinkSubmit}
 disabled={isLinking}
 className="bg-slate-900 hover:bg-black text-white rounded-[32px] h-20 px-16 text-[12px] font-black tracking-[0.3em] shadow-[0_30px_60px_-10px_rgba(0,0,0,0.1)] transition-all active:scale-95 disabled:opacity-50 border-0 group/save hover:scale-[1.02] font-display"
 >
 {isLinking ? <RefreshCw className="animate-spin mr-3" size={24}/> : <CheckCircle size={24} className="mr-3 group-hover/save:scale-110 transition-transform" />} Cáº­p nháº­t liĂªn káº¿t tĂ­ch há»£p
 </Button>
 </div>
 )}
 </CardContent>
 </Card>
 );
}
