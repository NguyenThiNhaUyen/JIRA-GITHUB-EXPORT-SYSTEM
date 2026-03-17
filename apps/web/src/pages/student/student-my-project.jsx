import { useNavigate } from "react-router-dom";
import { FolderKanban, Users, Activity, Target } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useStudentProjects } from "../../features/dashboard/hooks/useDashboard.js";

// Components UI
import { Card, CardContent } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { StatusBadge } from "../../components/shared/Badge.jsx";
import { Skeleton } from "../../components/ui/skeleton.jsx";

export default function StudentMyProjectPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: projectsData, isLoading: loadingProjects } = useStudentProjects();
    const myGroups = projectsData?.items || [];

    const leaderCount = myGroups.filter(g => g.team?.find(m => String(m.studentId) === String(user?.id))?.role === "LEADER").length;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader 
                title="Dự án của tôi"
                subtitle="Quản lý các nhóm và dự án bạn đang tham gia."
                breadcrumb={["Sinh viên", "Dự án"]}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loadingProjects ? (
                    <>
                        <Skeleton className="h-32 rounded-[32px]" />
                        <Skeleton className="h-32 rounded-[32px]" />
                        <Skeleton className="h-32 rounded-[32px]" />
                    </>
                ) : (
                    <>
                        <StatsCard label="Dự án tham gia" value={myGroups.length} icon={FolderKanban} variant="indigo" />
                        <StatsCard label="Vai trò Leader" value={leaderCount} icon={Users} variant="warning" />
                        <StatsCard label="Tiền độ TB" value="--" icon={Activity} variant="success" />
                    </>
                )}
            </div>

            {loadingProjects ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {[1, 2].map(i => <Skeleton key={i} className="h-48 rounded-[40px]" />)}
                </div>
            ) : myGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white/50 backdrop-blur-sm rounded-[40px] border border-dashed border-gray-200 shadow-sm animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200">
                        <FolderKanban size={40} />
                    </div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Bạn chưa tham gia dự án nào</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {myGroups.map((p, index) => {
                        const isLeader = p.team?.find(m => String(m.studentId) === String(user?.id))?.role === "LEADER";
                        return (
                            <Card key={p.id} 
                                className="rounded-[40px] border-0 shadow-sm overflow-hidden bg-white hover:shadow-2xl hover:shadow-indigo-500/10 transition-all animate-in fade-in slide-up duration-500"
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                <CardContent className="p-10 flex flex-wrap items-center justify-between gap-8">
                                    <div className="flex-1 min-w-0 space-y-6">
                                        <div className="flex items-center gap-4">
                                            <h3 className="font-black text-gray-800 text-2xl uppercase tracking-tighter truncate leading-none">{p.name}</h3>
                                            <StatusBadge status={isLeader ? 'warning' : 'info'} label={isLeader ? 'Leader' : 'Member'} variant={isLeader ? 'warning' : 'info'} />
                                        </div>
                                        <div className="flex gap-10">
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Lớp học</p>
                                                <p className="text-xs font-black text-gray-700 uppercase">{p.courseName || "Software Architecture"}</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Tiến độ</p>
                                                <p className="text-sm font-black text-teal-600">{p.progressPercent || 0}%</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        className="bg-slate-900 hover:bg-black text-white rounded-[24px] h-14 px-10 text-[10px] font-black uppercase tracking-[0.2em] border-0 shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95" 
                                        onClick={() => navigate(`/student/project/${p.id}`)}
                                    >
                                        Bảng điều khiển
                                    </Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
