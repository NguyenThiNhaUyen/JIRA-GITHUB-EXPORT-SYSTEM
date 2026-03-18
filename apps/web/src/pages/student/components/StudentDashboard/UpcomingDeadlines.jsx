import { CalendarClock, ChevronRight, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card.jsx";
import { Skeleton } from "@/components/ui/Skeleton.jsx";
import { Button } from "@/components/ui/Button.jsx";

export function UpcomingDeadlines({ isLoading, upcomingDeadlines, onSeeAll }) {
    return (
        <Card className="border border-gray-100 shadow-sm rounded-[44px] overflow-hidden bg-white glass-card">
            <CardHeader className="border-b border-gray-50/50 py-8 px-10">
                <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-4 font-display">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shadow-inner">
                        <CalendarClock size={20} className="text-red-600 animate-bounce" />
                    </div>
                Upcoming Deadlines
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? (
                    <div className="p-10 space-y-6">
                        <Skeleton className="h-10 w-full rounded-2xl" />
                    </div>
                ) : upcomingDeadlines.length === 0 ? (
                    <div className="p-16 text-center space-y-8 bg-emerald-50/10">
                        <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center mx-auto shadow-inner border border-emerald-50">
                             <CheckCircle size={40} className="text-emerald-500" />
                        </div>
                        <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest italic opacity-60">Không có deadline sắp tới ✔️</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {upcomingDeadlines.slice(0, 4).map((item, idx) => (
                            <div key={idx} className="p-8 px-10 flex items-start gap-8 hover:bg-red-50/30 transition-all duration-300 group cursor-pointer animate-in slide-in-from-right-4" style={{ animationDelay: `${idx * 150}ms` }}>
                                <div className="w-14 h-14 rounded-[24px] bg-red-50 flex items-center justify-center shrink-0 border border-red-100 group-hover:bg-red-600 group-hover:text-white transition-all duration-500 shadow-sm group-hover:scale-110">
                                    <CalendarClock size={24} className="text-red-600 group-hover:text-white transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0 pr-4">
                                    <p className="text-sm font-black text-gray-800 leading-tight truncate font-display group-hover:text-red-700 transition-colors uppercase tracking-tight">{item.title}</p>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-2 opacity-60 group-hover:text-red-400 transition-colors">{item.due || item.dueDate || item.deadline || "TBA"}</p>
                                </div>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-gray-200 group-hover:text-red-400">
                                     <ChevronRight size={18} />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
                <Button 
                    variant="ghost" 
                    className="w-full h-16 rounded-none text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-teal-600 hover:bg-teal-50/30 border-t border-gray-50 group font-display transition-all" 
                    onClick={onSeeAll}
                >
                    Xem tất cả SRS Center <ChevronRight size={14} className="ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
            </CardContent>
        </Card>
    );
}






