import { GitBranch, BookOpen, TrendingUp } from"lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/Card.jsx";

export function IntegrationApproval({ pendingIntegrations, handleApprovePending }) {
 if (pendingIntegrations.length === 0) return null;

 return (
 <Card className="border border-indigo-100 shadow-sm rounded-[32px] overflow-hidden bg-indigo-50/30">
 <CardHeader className="border-b border-indigo-100 py-6 px-8">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md">
 <TrendingUp size={18} className="text-white" />
 </div>
 <CardTitle className="text-sm font-black text-gray-800 leading-none">PhĂª duyá»‡t Link</CardTitle>
 </div>
 </CardHeader>
 <CardContent className="p-6 space-y-4">
 {pendingIntegrations.map(g => (
 <div key={g.id} className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-sm">
 <p className="text-xs font-black text-gray-800 mb-3">{g.name}</p>
 <div className="flex flex-col gap-2">
 {g.integration?.githubStatus === 'PENDING' && (
 <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-xl">
 <div className="flex items-center gap-2 overflow-hidden">
 <GitBranch size={14} className="text-gray-400 shrink-0"/>
 <span className="text-[10px] font-bold text-blue-600 truncate">{g.integration.githubUrl}</span>
 </div>
 <button onClick={() => handleApprovePending(g.id)} className="shrink-0 text-[10px] font-black text-teal-600 hover:underline">Duyá»‡t</button>
 </div>
 )}
 {g.integration?.jiraStatus === 'PENDING' && (
 <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-xl">
 <div className="flex items-center gap-2 overflow-hidden">
 <BookOpen size={14} className="text-gray-400 shrink-0"/>
 <span className="text-[10px] font-bold text-blue-600 truncate">{g.integration.jiraUrl}</span>
 </div>
 <button onClick={() => handleApprovePending(g.id)} className="shrink-0 text-[10px] font-black text-teal-600 hover:underline">Duyá»‡t</button>
 </div>
 )}
 </div>
 </div>
 ))}
 </CardContent>
 </Card>
 );
}

