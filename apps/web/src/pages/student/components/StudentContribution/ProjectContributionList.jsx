import { ChevronRight, Code2 } from "lucide-react";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Card } from "../../../components/ui/Card.jsx";
import { StatusBadge } from "../../../components/shared/Badge.jsx";

export function ProjectContributionList({ projects }) {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-1000">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em] ml-6 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shadow-inner">
                    <Code2 size={24} className="text-gray-300" />
                 </div>
                 Đóng góp chi tiết theo dự án ({projects.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {projects.map((p, i) => (
                    <Card key={p.id} className="border border-gray-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] rounded-[56px] overflow-hidden bg-white hover:shadow-2xl hover:shadow-teal-900/10 transition-all duration-700 group p-12 flex flex-col xl:flex-row gap-12 items-center cursor-pointer hover:-translate-y-2 relative glass-card">
                        <div className="absolute top-0 right-0 w-2 h-full bg-teal-500/0 group-hover:bg-teal-500 transition-all" />
                        
                        <div className="w-28 h-28 rounded-[40px] bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-teal-50 transition-all shadow-inner relative group-hover:scale-110 group-hover:rotate-6 duration-700">
                            <Code2 size={40} className="text-gray-300 group-hover:text-teal-600 transition-colors" />
                            <div className="absolute -bottom-4 -right-4 w-14 h-14 rounded-2xl bg-white shadow-2xl border-2 border-teal-50 flex items-center justify-center text-teal-600 font-black text-sm group-hover:scale-110 transition-transform">
                                {p.contributionScore || 25}%
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-center xl:justify-start gap-5 mb-5 text-center xl:text-left">
                                <h4 className="text-2xl font-black text-gray-800 uppercase tracking-tighter group-hover:text-teal-600 transition-colors truncate font-display grow">{p.name}</h4>
                                <StatusBadge status={p.integration?.githubStatus === 'ACTIVE' || p.integration?.githubStatus === 'APPROVED' ? 'success' : 'warning'} label="Synced" />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-10 mt-10 border-t-2 border-dashed border-gray-50 pt-10">
                                <div className="text-center group/metric">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 opacity-60 group-hover/metric:text-teal-500 transition-colors">Commits</p>
                                    <p className="font-black text-4xl text-teal-600 tracking-tighter leading-none">{p.commits || 0}</p>
                                </div>
                                <div className="text-center group/metric">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 opacity-60 group-hover/metric:text-indigo-500 transition-colors">Issues</p>
                                    <p className="font-black text-4xl text-indigo-500 tracking-tighter leading-none">{p.issuesDone || 0}</p>
                                </div>
                                <div className="text-center group/metric">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 opacity-60 group-hover/metric:text-amber-500 transition-colors">Impact</p>
                                    <p className="font-black text-2xl text-amber-500 tracking-tight leading-none pt-2 uppercase font-display">High</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="xl:block hidden group-hover:translate-x-3 transition-transform duration-500">
                             <ChevronRight size={48} className="text-gray-100 group-hover:text-teal-100" />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
