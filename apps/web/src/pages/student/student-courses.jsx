import { useNavigate } from "react-router-dom";
import { BookOpen, Target, Users, Activity, FolderKanban, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";
import { useStudentProjects } from "../../features/dashboard/hooks/useDashboard.js";

// Components UI
import { Card, CardContent } from "../../components/ui/card.jsx";
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { StatusBadge } from "../../components/shared/Badge.jsx";
import { Skeleton } from "../../components/ui/skeleton.jsx";

export default function StudentCoursesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: coursesData, isLoading: loadingCourses } = useGetCourses();
    const { data: projectsData, isLoading: loadingProjects } = useStudentProjects();

    const coursesList = coursesData?.items || [];
    const projectsList = projectsData?.items || [];
    const isLoading = loadingCourses || loadingProjects;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader 
                title="Khóa học của tôi"
                subtitle="Danh sách các lớp học phần bạn đang tham gia trong học kỳ này."
                breadcrumb={["Sinh viên", "Lớp học"]}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? (
                    <>
                        <Skeleton className="h-32 rounded-[32px]" />
                        <Skeleton className="h-32 rounded-[32px]" />
                        <Skeleton className="h-32 rounded-[32px]" />
                    </>
                ) : (
                    <>
                        <StatsCard label="Tổng số lớp" value={coursesList.length} icon={BookOpen} variant="info" />
                        <StatsCard label="Đang hoạt động" value={coursesList.filter(c => c.status === 'ACTIVE').length} icon={Target} variant="success" />
                        <StatsCard label="Dự án nhóm" value={projectsList.length} icon={Users} variant="warning" />
                    </>
                )}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-[40px]" />)}
                </div>
            ) : coursesList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white/50 backdrop-blur-sm rounded-[40px] border border-dashed border-gray-200 shadow-sm animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200">
                        <BookOpen size={40} />
                    </div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Bạn chưa được đăng ký lớp nào</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coursesList.map((c, index) => {
                        const project = projectsList.find(p => p.courseId === c.id);
                        const isLeader = project?.team?.find(m => String(m.studentId) === String(user?.id))?.role === "LEADER";
                        return (
                            <Card key={c.id}
                                className="border-0 shadow-sm rounded-[40px] overflow-hidden bg-white hover:shadow-2xl hover:shadow-teal-500/10 transition-all cursor-pointer group animate-in fade-in slide-up duration-500"
                                style={{ animationDelay: `${index * 100}ms` }}
                                onClick={() => navigate("/student")}
                            >
                                <div className="h-2 bg-gradient-to-r from-teal-500 to-indigo-500" />
                                <CardContent className="p-10 space-y-8">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-teal-600 bg-teal-50 px-4 py-1.5 rounded-full inline-block uppercase tracking-widest">{c.subject?.code || c.code || "SWD392"}</p>
                                        <h4 className="font-black text-gray-800 text-xl tracking-tighter group-hover:text-teal-600 transition-colors uppercase leading-tight">{c.name}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                            <Users size={12} /> GV: {c.lecturerNames?.join(", ") || "Chưa có GV"}
                                        </p>
                                    </div>
                                    
                                    <div className="pt-6 border-t border-gray-50">
                                        {project ? (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                                        <FolderKanban size={16}/>
                                                    </div>
                                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest truncate max-w-[120px]">{project.name}</span>
                                                </div>
                                                <StatusBadge status={isLeader ? 'warning' : 'info'} label={isLeader ? 'Leader' : 'Member'} variant={isLeader ? 'warning' : 'info'} />
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between opacity-40">
                                                <p className="text-[10px] font-black text-gray-300 uppercase italic tracking-widest">Chưa phân nhóm</p>
                                                <ChevronRight size={14} className="text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
