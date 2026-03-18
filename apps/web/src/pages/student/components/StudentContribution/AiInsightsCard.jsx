import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Card } from "@/components/ui/Card.jsx";
import { BrainCircuit, Sparkles, ChevronRight } from "lucide-react";

export function AiInsightsCard({ stats }) {
    return (
        <Card className="border-0 bg-slate-900 text-white rounded-[48px] p-12 shadow-[0_50px_100px_-20px_rgba(99,102,241,0.2)] group overflow-hidden relative animate-in slide-in-from-right-4 duration-700">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-teal-500 rounded-full blur-[140px] opacity-10 group-hover:opacity-30 transition-all duration-1000"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-all duration-1000"></div>
            
            <div className="relative z-10 space-y-10">
                <div className="flex items-center justify-between">
                    <Badge className="bg-white/10 text-teal-400 border-white/5 px-6 py-2 rounded-full font-black tracking-[0.3em] text-[10px] uppercase shadow-inner flex items-center gap-3">
                         <Sparkles size={14} className="animate-pulse" />
                         Antigravity AI
                    </Badge>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-teal-400 border border-white/5 shadow-2xl group-hover:scale-110 transition-transform">
                         <BrainCircuit size={28} />
                    </div>
                </div>
                
                <h4 className="text-3xl font-black uppercase tracking-tighter leading-tight font-display mb-6 group-hover:text-teal-400 transition-colors">AI Performance Insights</h4>
                
                <div className="p-8 bg-white/5 rounded-[40px] border border-white/5 shadow-inner group/advice hover:bg-white/10 transition-colors">
                    <div className="flex gap-4 mb-4">
                         <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse mt-1.5" />
                         <p className="text-[12px] text-slate-300 font-bold leading-relaxed italic opacity-90 group-hover/advice:text-white transition-colors">
                            "Bạn đang có phong độ commit rất tốt vào buổi tối. Tuy nhiên, việc phản hồi Issue trên Jira ({stats?.taskScore || 70}%) đang chậm hơn 20% so với trung bình nhóm. Hãy tập trung xử lý các task tồn đọng!"
                         </p>
                    </div>
                </div>

                <Button className="w-full h-20 bg-teal-500 hover:bg-teal-400 text-white rounded-[32px] font-black uppercase tracking-[0.4em] text-[12px] shadow-2xl shadow-teal-500/20 active:scale-95 transition-all relative overflow-hidden group/btn font-display group-hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-all duration-500" />
                    <span className="relative flex items-center justify-center gap-4">
                         Xem chi tiết tư vấn <ChevronRight size={20} />
                    </span>
                </Button>
            </div>
        </Card>
    );
}






