import { Plus, BarChart2, FileText, ExternalLink } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { StatusBadge } from "../../../components/shared/Badge.jsx";

export function SrsSidebar({ groupSrs = [], loadingSrs, onSrsCenterNavigate }) {
    return (
        <Card className="border-0 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.12)] rounded-[56px] bg-slate-900 text-white overflow-hidden p-14 relative group animate-in slide-in-from-right-4 duration-700">
            <div className="absolute left-0 bottom-0 w-80 h-80 bg-teal-500 rounded-full blur-[140px] -ml-40 -mb-40 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500 rounded-full blur-[140px] -mr-40 -mt-40 opacity-10 pointer-events-none group-hover:opacity-30 transition-opacity" />
            
            <h4 className="text-[12px] font-black text-teal-500 uppercase tracking-[0.4em] mb-12 relative flex items-center gap-4">
                 <FileText size={18} className="text-teal-500" />
                 <span>SRS DOCUMENTS</span>
            </h4>
            
            <div className="space-y-6 relative mb-12">
                {loadingSrs ? (
                    <div className="py-20 text-center opacity-40">
                         <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                         <p className="text-[10px] font-black uppercase tracking-widest">Đang tải...</p>
                    </div>
                ) : groupSrs.length === 0 ? (
                    <div className="py-20 text-center space-y-6 bg-white/5 rounded-[40px] border border-white/5">
                        <FileText size={48} className="text-white/10 mx-auto" />
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] px-10 italic leading-relaxed opacity-60">Chưa có bản nộp SRS nào được ghi nhận cho dự án này</p>
                    </div>
                ) : (
                    groupSrs.slice(0, 3).map((srs, idx) => (
                        <div key={srs.id} className="p-8 bg-white/5 border border-white/10 rounded-[36px] flex items-center justify-between group/item hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer hover:-translate-y-1 active:scale-95 shadow-lg">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-teal-400 shadow-inner group-hover/item:scale-110 group-hover/item:text-teal-300 transition-all font-display">
                                    <BarChart2 size={24}/>
                                </div>
                                <div className="space-y-1.5">
                                   <p className="text-sm font-black uppercase tracking-widest font-display">{srs.fileName || `Version ${srs.version || "Alpha"}`}</p>
                                   <div className="flex items-center gap-3">
                                       <div className="w-1 h-1 rounded-full bg-teal-500 animate-pulse" />
                                       <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest opacity-80">Updated recently</p>
                                   </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <StatusBadge status={srs.status === 'FINAL' ? 'success' : 'warning'} label={srs.status === 'FINAL' ? 'Duyệt' : 'Draft'} />
                                <ExternalLink size={16} className="text-white/20 group-hover/item:text-white/60 transition-colors" />
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Button 
                onClick={onSrsCenterNavigate}
                className="w-full h-20 bg-teal-500 hover:bg-teal-400 text-white rounded-[32px] text-[12px] font-black uppercase tracking-[0.4em] transition-all border-0 shadow-2xl shadow-teal-500/20 active:scale-95 relative z-10 font-display group/manage overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/manage:translate-y-0 transition-all duration-500" />
                <span className="relative flex items-center justify-center gap-4">
                    <Plus size={24} className="grow-0" /> Quản lý SRS Center
                </span>
            </Button>
        </Card>
    );
}
