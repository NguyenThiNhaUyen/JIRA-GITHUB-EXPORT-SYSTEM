import { ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card.jsx";
import { Skeleton } from "../../../components/ui/Skeleton.jsx";
import { StatusBadge } from "../../../components/shared/Badge.jsx";

export function MyCoursesGrid({ isLoading, courses, onCourseNavigate, onSeeAll }) {
    return (
        <Card className="border border-gray-100 shadow-sm rounded-[40px] overflow-hidden bg-white glass-card group">
            <CardHeader className="border-b border-gray-50/50 py-8 px-10 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-black text-gray-800 uppercase tracking-[0.2em] font-display">Lớp học của tôi</CardTitle>
                <Button 
                    variant="ghost" 
                    className="text-[11px] font-black uppercase tracking-[0.2em] text-teal-600 hover:text-teal-700 bg-teal-50 px-6 h-12 rounded-[24px] border border-teal-100/50 transition-all font-display hover:scale-105"
                    onClick={onSeeAll}
                >
                    Xem tất cả <ChevronRight size={16} className="ml-2" />
                </Button>
            </CardHeader>
            <CardContent className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-44 rounded-[32px]" />
                            <Skeleton className="h-44 rounded-[32px]" />
                            <Skeleton className="h-44 rounded-[32px]" />
                        </>
                    ) : courses.map((course, idx) => (
                        <button
                            key={course.id}
                            onClick={() => onCourseNavigate(course.id)}
                            className="p-8 rounded-[40px] border-3 border-gray-50 bg-gray-50/30 transition-all duration-500 text-left group/item relative overflow-hidden active:scale-95 animate-in slide-in-from-bottom-4 hover:bg-white hover:border-teal-500 hover:shadow-2xl hover:shadow-teal-900/10"
                            style={{ animationDelay: `${idx * 150}ms` }}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-16 h-16 rounded-[24px] bg-white flex items-center justify-center shadow-xl text-teal-600 font-black text-lg group-hover/item:bg-teal-600 group-hover/item:text-white group-hover/item:scale-110 group-hover/item:rotate-6 transition-all duration-500 font-display uppercase">
                                    {course.code?.substring(0, 3)}
                                </div>
                                <StatusBadge status={course.status} label={course.status} variant={course.status === 'ACTIVE' ? 'success' : 'default'} />
                            </div>
                            
                            <p className="font-black text-gray-800 text-xl uppercase tracking-tighter leading-none mb-2 font-display">{course.code}</p>
                            <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] truncate mb-6 opacity-70 group-hover/item:text-teal-600 transition-colors">{course.name}</p>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between text-[9px] font-black text-gray-300 uppercase tracking-widest">
                                    <span>Lớp: {course.currentStudents || 0} SV</span>
                                    <span>Max: {course.maxStudents || 40} SV</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                                    <div 
                                        className="h-full bg-gradient-to-r from-teal-400 to-indigo-500 rounded-full shadow-lg transition-all duration-1000 ease-out" 
                                        style={{ width: `${Math.min((course.currentStudents / (course.maxStudents || 40)) * 100, 100)}%` }} 
                                    />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
                {courses.length === 0 && !isLoading && (
                    <div className="py-24 text-center space-y-8 bg-gray-50/30 rounded-[48px] border-2 border-dashed border-gray-100">
                        <RefreshCw size={48} className="text-gray-100 mx-auto" />
                        <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.4em] leading-relaxed">Bạn chưa đăng ký tham gia khóa học nào</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
