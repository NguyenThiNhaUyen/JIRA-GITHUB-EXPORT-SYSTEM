// My Courses — Lecturer "Lớp của tôi"
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import db from "../../mock/db.js";
import { ChevronRight, GraduationCap, Users, BookOpen, Settings2, Search } from "lucide-react";

export default function MyCourses() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { error } = useToast();
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => { loadCourses(); }, []);

    const loadCourses = () => {
        try {
            setLoading(true);
            const allCourses = db.findMany("courses");
            const mine = allCourses.filter(c =>
                db.findMany("courseLecturers", { courseId: c.id, lecturerId: user?.id }).length > 0
            );
            // Enrich with subject + group count
            const enriched = mine.map(c => ({
                ...c,
                subject: db.findById("subjects", c.subjectId),
                groupCount: db.getCourseGroups(c.id).length,
                enrollments: db.findMany("courseEnrollments", { courseId: c.id }).length,
            }));
            setCourses(enriched);
        } catch { error("Không thể tải lớp học"); }
        finally { setLoading(false); }
    };

    const filtered = courses.filter(c =>
        c.code?.toLowerCase().includes(search.toLowerCase()) ||
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.subject?.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <span className="text-teal-700 font-semibold">Giảng viên</span>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-semibold">Lớp của tôi</span>
            </nav>

            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-800">Lớp của tôi</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Các lớp học bạn đang giảng dạy</p>
                </div>
                {/* Search */}
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Tìm kiếm lớp học..."
                        className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 w-56 transition-all"
                    />
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
                <MiniStat label="Tổng lớp" value={courses.length} color="text-teal-700 bg-teal-50 border-teal-100" />
                <MiniStat label="Tổng nhóm" value={courses.reduce((a, c) => a + c.groupCount, 0)} color="text-blue-700 bg-blue-50 border-blue-100" />
                <MiniStat label="Tổng sinh viên" value={courses.reduce((a, c) => a + c.enrollments, 0)} color="text-indigo-700 bg-indigo-50 border-indigo-100" />
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" /></div>
            ) : filtered.length === 0 ? (
                <EmptyState message={search ? "Không tìm thấy lớp học phù hợp" : "Bạn chưa được giao lớp nào"} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map(course => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            onManage={() => navigate(`/lecturer/course/${course.id}/manage-groups`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function CourseCard({ course, onManage }) {
    return (
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white hover:shadow-md transition-all duration-200 group">
            {/* Color bar */}
            <div className="h-1.5 bg-gradient-to-r from-teal-500 to-teal-600" />
            <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                        <GraduationCap size={18} className="text-teal-700" />
                    </div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {course.subject?.code || "—"}
                    </span>
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 leading-snug">{course.code}</h3>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{course.name || course.subject?.name}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Users size={11} />{course.enrollments} sinh viên</span>
                    <span className="flex items-center gap-1"><BookOpen size={11} />{course.groupCount} nhóm</span>
                </div>
                <Button
                    onClick={onManage}
                    className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 text-sm shadow-sm border-0 transition-all"
                >
                    <Settings2 size={13} />Quản lý nhóm
                </Button>
            </CardContent>
        </Card>
    );
}

function MiniStat({ label, value, color }) {
    return (
        <div className={`rounded-2xl px-4 py-3 border flex items-center justify-between ${color}`}>
            <span className="text-xs font-semibold opacity-80">{label}</span>
            <span className="text-xl font-bold">{value}</span>
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center">
                <GraduationCap size={28} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">{message}</p>
        </div>
    );
}
