import { AlertTriangle, CheckCircle, Activity, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useGetAlerts } from "../../features/system/hooks/useAlerts.js";

// Components UI
import { Card, CardContent } from "../../components/ui/card.jsx";
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { Skeleton } from "../../components/ui/skeleton.jsx";

export default function StudentAlertsPage() {
    const { user } = useAuth();
    const { data: alertsData, isLoading } = useGetAlerts();
    const alerts = alertsData?.items || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader 
                title="Thông báo & Cảnh báo" 
                subtitle="Các nhắc nhở về tiến độ từ hệ thống và Giảng viên hướng dẫn." 
                breadcrumb={["Sinh viên", "Cảnh báo"]} 
            />
            
            <Card className="rounded-[48px] border-0 bg-white overflow-hidden shadow-2xl shadow-slate-200/50">
                <CardContent className="p-0 divide-y divide-gray-50/50">
                    {isLoading ? (
                        <div className="p-10 space-y-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-8 animate-pulse">
                                    <Skeleton className="w-16 h-16 rounded-[28px]" />
                                    <div className="flex-1 space-y-4">
                                        <Skeleton className="w-32 h-6 rounded-lg" />
                                        <Skeleton className="w-full h-12 rounded-xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : alerts.length === 0 ? (
                        <div className="p-24 text-center animate-in zoom-in duration-500">
                            <div className="w-24 h-24 rounded-[40px] bg-emerald-50 flex items-center justify-center text-emerald-500 mx-auto mb-8 shadow-inner">
                                <CheckCircle size={40}/>
                            </div>
                            <h4 className="font-black text-gray-800 text-xl uppercase tracking-tighter mb-2">Hệ thống an toàn!</h4>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] opacity-60">Không có cảnh báo nào cho bạn trong lúc này.</p>
                        </div>
                    ) : (
                        alerts.map((a, i) => (
                            <div key={i} className="p-12 flex gap-10 hover:bg-gray-50/50 transition-all group animate-in slide-up duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className={`w-16 h-16 rounded-[28px] flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${a.severity === 'HIGH' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                                    <AlertTriangle size={32}/>
                                </div>
                                <div className="flex-1 min-w-0 space-y-4">
                                    <div className="flex items-center gap-6">
                                        <h4 className="font-black text-gray-800 text-lg uppercase tracking-widest">{a.severity === 'HIGH' ? 'Cảnh báo rủi ro' : 'Nhắc nhở nhẹ'}</h4>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">
                                            <Clock size={12} /> {new Date(a.createdAt).toLocaleString("vi-VN")}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 font-bold leading-relaxed max-w-3xl opacity-80">{a.message}</p>
                                    <div className="flex items-center gap-3">
                                        <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.15em]">Dự án: {a.groupName || "Phát triển hệ thống"}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
