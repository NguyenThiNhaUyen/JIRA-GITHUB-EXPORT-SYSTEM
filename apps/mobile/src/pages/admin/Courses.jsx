// Mobile Admin Courses Page
import { MobileLayout } from "../../components/layout/MobileLayout.jsx";
import { BookOpen } from "lucide-react";

const MOCK_COURSES = [
    { id: "c1", code: "SWD392", name: "Software Development", lecturer: "Nguyễn Văn Nam" },
    { id: "c2", code: "PRJ301", name: "Java Web Application", lecturer: "Trần Thị Lan" },
];

export default function AdminCourses() {
    return (
        <MobileLayout title="Quản lý lớp học" showBack={true}>
            <div className="space-y-3">
                {MOCK_COURSES.map((course) => (
                    <div key={course.id} className="bg-white rounded-xl shadow-md p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <BookOpen className="text-white" size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{course.code}</h4>
                                <p className="text-sm text-gray-600">{course.name}</p>
                                <p className="text-xs text-gray-500">GV: {course.lecturer}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </MobileLayout>
    );
}
