// My Courses — Lecturer "Lớp của tôi"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { ChevronRight, GraduationCap, Users, BookOpen, Settings2, Search } from "lucide-react";

// Feature Hooks
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";

function getCourseStudentCount(course) {
    if (Array.isArray(course?.enrolledStudents)) return course.enrolledStudents.length;
    if (Array.isArray(course?.enrollments)) return course.enrollments.length;
    if (Array.isArray(course?.students)) return course.students.length;
    return course?.studentCount ?? course?.currentStudents ?? 0;
}

function getCourseGroupCount(course) {
    if (typeof course?.projectsCount === "number") return course.projectsCount;
    if (typeof course?.projectCount === "number") return course.projectCount;
    if (Array.isArray(course?.groups)) return course.groups.length;
    return 0;
}

function lecturerPersonDisplayName(person) {
    if (!person || typeof person !== "object") return null;
    const raw = person.fullName ?? person.name;
    if (typeof raw !== "string" || raw.trim().length === 0) return null;
    const t = raw.trim();
    if (t.includes("GV (ID:")) return null;
    return t;
}

function cleanLecturerString(value) {
    if (typeof value !== "string") return null;
    const t = value.trim();
    if (!t || t.includes("GV (ID:")) return null;
    return t;
}

function getLecturerLabel(course) {
    const single = course?.lecturer;
    if (typeof single === "string") {
        const s = cleanLecturerString(single);
        if (s) return s;
    }
    if (single && !Array.isArray(single)) {
        const n = lecturerPersonDisplayName(single);
        if (n) return n;
    }
    const lecs = course?.lecturers;
    if (!Array.isArray(lecs) || lecs.length === 0) return null;
    const first = lecturerPersonDisplayName(lecs[0]);
    return first ?? null;
}

export default function MyCourses() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    const { data: coursesData = { items: [] }, isLoading } = useGetCourses({ pageSize: 100 });
    const courses = Array.isArray(coursesData?.items) ? coursesData.items : [];
    console.log("DEBUG_COURSES_UI", courses);

    const filtered = courses.filter((c) =>
        (c?.code?.toLowerCase?.() ?? "").includes(search.toLowerCase()) ||
        (c?.name?.toLowerCase?.() ?? "").includes(search.toLowerCase()) ||
        (c?.subjectName?.toLowerCase?.() ?? "").includes(search.toLowerCase())
    );

    const totalGroups = courses.reduce((a, c) => a + getCourseGroupCount(c), 0);
    const totalStudents = courses.reduce((a, c) => a + getCourseStudentCount(c), 0);

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
                <MiniStat label="Tổng nhóm" value={totalGroups} color="text-blue-700 bg-blue-50 border-blue-100" />
                <MiniStat label="Tổng sinh viên" value={totalStudents} color="text-indigo-700 bg-indigo-50 border-indigo-100" />
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" /></div>
            ) : filtered.length === 0 ? (
                <EmptyState message={search ? "Không tìm thấy lớp học phù hợp" : "Bạn chưa được giao lớp nào"} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map((course) => {
                        const cid = course?.id != null ? String(course.id) : "";
                        return (
                                <CourseCard
                                    key={course?.id}
                                    course={course}
                                    onManage={() => navigate(`/lecturer/course/${course?.id}/manage-groups`)}
                                />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function CourseCard({ course, onManage }) {
    const groupCount = getCourseGroupCount(course);
    const studentCount = getCourseStudentCount(course);
    const lecturerDisplayName = getLecturerLabel(course);
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
                        {course?.subjectCode ?? "—"}
                    </span>
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 leading-snug">{course?.code ?? "N/A"}</h3>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{course?.name ?? course?.subjectName ?? `Lớp (ID: ${course?.id ?? "N/A"})`}</p>
                    <p className="text-xs text-gray-400 mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="font-medium text-gray-500">GV phụ trách:</span>
                        {lecturerDisplayName ? (
                            <span className="text-gray-600">{lecturerDisplayName}</span>
                        ) : (
                            <span className="inline-flex items-center rounded-lg border border-gray-100 bg-white px-2 py-0.5 text-gray-400">
                                Chưa phân công
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Users size={11} />{studentCount} sinh viên</span>
                    <span className="flex items-center gap-1"><BookOpen size={11} />{groupCount} nhóm</span>
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
