import { Target, Star } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card.jsx";
import { Skeleton } from "../../../components/ui/Skeleton.jsx";

export function AcademicGradesCard({ isLoading, grades }) {
    return (
        <Card className="border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white glass-card">
            <CardHeader className="border-b border-gray-50/50 py-8 px-10 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-4 font-display">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shadow-inner">
                        <Target size={18} className="text-orange-500" />
                    </div>
                    Kết quả học tập mới nhất
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? (
                    <div className="p-10 space-y-6">
                        <Skeleton className="h-10 w-full rounded-2xl" />
                        <Skeleton className="h-10 w-full rounded-2xl" />
                    </div>
                ) : grades.length === 0 ? (
                    <div className="p-16 text-center space-y-6 bg-gray-50/10">
                        <Star size={40} className="text-gray-100 mx-auto" />
                        <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest italic opacity-60">Chưa có bảng điểm 🏆</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {grades.slice(0, 3).map((g, idx) => (
                            <div key={idx} className="p-8 px-10 flex items-center justify-between hover:bg-gray-50/50 transition-all group animate-in slide-in-from-right-2" style={{ animationDelay: `${idx * 150}ms` }}>
                                <div className="min-w-0 pr-8">
                                    <p className="text-sm font-black text-gray-800 uppercase tracking-tight font-display group-hover:text-orange-600 transition-colors truncate">{g.subjectName || g.Subject || g.category || "Evaluation"}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                         <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest opacity-60">{g.projectName || "General Study"}</p>
                                         <div className="w-1 h-1 rounded-full bg-gray-200" />
                                         <p className="text-[8px] text-orange-500 font-black uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100/50">{g.weight ? `${g.weight}%` : "Final"}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-teal-500 blur-lg opacity-0 group-hover:opacity-20 transition-opacity" />
                                        <p className="text-4xl font-black text-teal-600 tracking-tighter leading-none font-display mb-1 group-hover:scale-110 transition-transform origin-right">{g.score || g.Value || "N/A"}</p>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 opacity-60">SCORE INDEX</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
