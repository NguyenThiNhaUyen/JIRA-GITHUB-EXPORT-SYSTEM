import { Target, Github, Link2, RefreshCw, Clock, AlertTriangle, CheckCircle, ShieldAlert, Clock3, GitCommit } from "lucide-react";
import { Card, CardTitle, CardContent } from "@/components/ui/Card.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Skeleton } from "@/components/ui/Skeleton.jsx";
import { StatusBadge } from "@/components/shared/Badge.jsx";

export function ProjectSummarySidebar({ loadingProject, project, onSync, isSyncing, roadmapData }) {
    return (
        <div className="space-y-10 animate-in slide-in-from-right-4 duration-700">
            {/* Project Quick Overview */}
            <Card className="border border-gray-100 shadow-sm rounded-[44px] overflow-hidden bg-white group p-12 relative glass-card">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 pointer-events-none group-hover:opacity-60 transition-all duration-1000 animate-pulse"></div>
                
                <CardTitle className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center shadow-inner">
                        <Target size={16} className="text-teal-600" />
                    </div>
                    <span>Tóm tắt dự án</span>
                </CardTitle>

                <div className="space-y-12">
                    <div>
                        <h3 className="text-3xl font-black text-gray-800 tracking-tighter uppercase leading-tight mb-8 font-display group-hover:text-teal-600 transition-colors">
                            {loadingProject ? <Skeleton className="h-10 w-full rounded-2xl" /> : project.name}
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            {loadingProject ? (
                                <>
                                    <Skeleton className="h-40 rounded-[32px]" />
                                    <Skeleton className="h-40 rounded-[32px]" />
                                </>
                            ) : (
                                <>
                                    <div className="p-8 rounded-[36px] bg-gray-50/50 border border-gray-100 flex flex-col items-center justify-center gap-6 transition-all hover:bg-white hover:shadow-2xl hover:border-teal-100 group/item hover:-translate-y-2">
                                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-gray-300 group-hover/item:text-teal-600 group-hover/item:bg-teal-50 transition-all shadow-inner">
                                            <Github size={28} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 opacity-60">GitHub status</p>
                                            <StatusBadge status={project.integration?.githubStatus === 'ACTIVE' || project.integration?.githubStatus === 'APPROVED' ? 'success' : 'warning'} label={project.integration?.githubStatus || "CHƯA LIÊN KẾT"} />
                                        </div>
                                    </div>
                                    <div className="p-8 rounded-[36px] bg-gray-50/50 border border-gray-100 flex flex-col items-center justify-center gap-6 transition-all hover:bg-white hover:shadow-2xl hover:border-indigo-100 group/item hover:-translate-y-2">
                                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-gray-300 group-hover/item:text-indigo-600 group-hover/item:bg-indigo-50 transition-all shadow-inner">
                                            <Link2 size={28} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 opacity-60">Jira status</p>
                                            <StatusBadge status={project.integration?.jiraStatus === 'ACTIVE' || project.integration?.jiraStatus === 'APPROVED' ? 'success' : 'warning'} label={project.integration?.jiraStatus || "CHƯA LIÊN KẾT"} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                         <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                             Thông tin đề tài
                         </p>
                         <div className="p-10 bg-teal-50/20 rounded-[40px] border border-teal-100/50 relative overflow-hidden group/desc">
                            <div className="absolute top-0 left-0 w-2 h-full bg-teal-500 transition-all group-hover/desc:w-3" />
                            <p className="text-sm font-bold text-teal-800 tracking-tight leading-relaxed italic opacity-80">{project?.description || "Dự án đang trong quá trình thiết lập mục tiêu và phạm vi đề tài."}</p>
                         </div>
                    </div>

                    <Button 
                        onClick={onSync} 
                        disabled={isSyncing} 
                        className="w-full bg-slate-900 hover:bg-black text-white rounded-[28px] h-20 font-black uppercase tracking-widest shadow-2xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 border-0 group/sync"
                    >
                        {isSyncing ? (
                            <RefreshCw size={24} className="animate-spin mr-4" />
                        ) : (
                            <RefreshCw size={24} className="mr-4 group-hover/sync:rotate-180 transition-transform duration-500" />
                        )}
                        Sync activity from source
                    </Button>
                </div>
            </Card>

            {/* Academic Timeline Card */}
            <Card className="border border-gray-100 shadow-sm rounded-[44px] overflow-hidden bg-white p-12 glass-card">
                <CardTitle className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shadow-inner">
                        <AlertTriangle size={16} className="text-indigo-600" />
                    </div>
                    <span>Lộ trình học thuật</span>
                </CardTitle>
                
                <div className="space-y-4">
                    {(roadmapData?.items || []).length > 0 ? (
                        roadmapData.items.slice(0, 5).map((item, i) => (
                            <div key={item.id || i} className="flex gap-8 p-8 rounded-[32px] hover:bg-gray-50/50 transition-all border border-transparent hover:border-gray-50 group hover:-translate-x-1 animate-in slide-in-from-right-2" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className={`w-14 h-14 rounded-2xl bg-white border border-gray-50 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all ${item.status?.toUpperCase() === 'DONE' ? 'text-teal-500 bg-teal-50/10' : 'text-indigo-400'}`}>
                                    {item.status?.toUpperCase() === 'DONE' ? <CheckCircle size={24} /> : <Clock size={24} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap justify-between items-center gap-3 mb-2">
                                        <p className="text-sm font-black text-gray-800 tracking-tight uppercase truncate grow group-hover:text-teal-600 transition-colors font-display pr-2">{item.title}</p>
                                        <div className={`text-[8px] font-black uppercase px-3 py-1 rounded-full border ${item.status?.toUpperCase() === 'DONE' ? 'text-teal-500 border-teal-100 bg-teal-50/50' : 'text-indigo-500 border-indigo-100 bg-indigo-50/50'} opacity-80 transition-all shadow-sm`}>{item.status}</div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Clock size={12} className="text-gray-300" />
                                        {item.dueDate ? `Hạn chót: ${new Date(item.dueDate).toLocaleDateString("vi-VN")}` : "Xem chi tiết trên Jira"}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        [
                            { title: "Nộp SRS Final", due: "Chỉ còn 3 ngày", status: "Critical", icon: ShieldAlert, color: "text-red-500" },
                            { title: "Review Iteration 2", due: "Tuần sau", status: "Upcoming", icon: Clock3, color: "text-amber-500" },
                            { title: "Đóng Sprint 3", due: "Cuối tháng này", status: "Active", icon: GitCommit, color: "text-blue-500" }
                        ].map((d, i) => (
                            <div key={i} className="flex gap-8 p-8 rounded-[32px] hover:bg-gray-50/50 transition-all border border-transparent hover:border-gray-50 group hover:-translate-x-1">
                                <div className="w-14 h-14 rounded-2xl bg-white border border-gray-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all shadow-sm">
                                    <d.icon size={24} className={d.color} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-sm font-black text-gray-800 tracking-tight uppercase group-hover:text-teal-600 transition-colors font-display pr-2">{d.title}</p>
                                        <div className={`text-[8px] font-black uppercase px-3 py-1 rounded-full border ${d.color.replace('text-', 'border-')} bg-white shadow-sm opacity-80`}>{d.status}</div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{d.due}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
}






