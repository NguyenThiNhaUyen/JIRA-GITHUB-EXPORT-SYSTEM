// Mobile Lecturer Dashboard
import { MobileLayout } from "../../components/layout/MobileLayout.jsx";
import { BookOpen, Users, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MOCK_COURSES = [
    { id: "c1", code: "SWD392", name: "Software Development", groups: 8, students: 40 },
    { id: "c2", code: "PRJ301", name: "Java Web Application", groups: 6, students: 30 },
];

export default function LecturerDashboard() {
    const navigate = useNavigate();

    return (
        <MobileLayout title="Giảng viên">
            <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl p-4 shadow-md text-center">
                        <div className="text-2xl font-bold text-blue-600">{MOCK_COURSES.length}</div>
                        <div className="text-xs text-gray-600 mt-1">Môn dạy</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md text-center">
                        <div className="text-2xl font-bold text-green-600">14</div>
                        <div className="text-xs text-gray-600 mt-1">Nhóm</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md text-center">
                        <div className="text-2xl font-bold text-purple-600">70</div>
                        <div className="text-xs text-gray-600 mt-1">Sinh viên</div>
                    </div>
                </div>

                {/* Courses */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Môn học</h3>
                    <div className="space-y-3">
                        {MOCK_COURSES.map((course) => (
                            <div
                                key={course.id}
                                onClick={() => navigate(`/lecturer/course/${course.id}/groups`)}
                                className="bg-white rounded-xl shadow-md p-4 active:scale-95 transition-transform"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                        <BookOpen className="text-white" size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900">{course.code}</h4>
                                        <p className="text-sm text-gray-600 mb-2">{course.name}</p>
                                        <div className="flex gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Users size={12} />
                                                {course.groups} nhóm
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <TrendingUp size={12} />
                                                {course.students} SV
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
