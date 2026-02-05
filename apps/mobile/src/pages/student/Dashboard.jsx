// Mobile Student Dashboard - Touch-optimized
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "../../components/layout/MobileLayout.jsx";
import { BookOpen, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "../../../../packages/shared/src/context/AuthContext.jsx";

// Mock data
const MOCK_COURSES = [
    {
        id: "course-1",
        code: "SWD392",
        name: "Software Development",
        lecturer: "Nguyễn Văn Nam",
        groupName: "Nhóm 3",
        status: "ACTIVE",
        progress: 75,
    },
    {
        id: "course-2",
        code: "PRJ301",
        name: "Java Web Application",
        lecturer: "Trần Thị Lan",
        groupName: "Nhóm 5",
        status: "ACTIVE",
        progress: 60,
    },
    {
        id: "course-3",
        code: "SWP391",
        name: "Software Engineering Project",
        lecturer: "Lê Văn Hùng",
        groupName: "Nhóm 7",
        status: "PENDING",
        progress: 20,
    },
];

function CourseCard({ course, onClick }) {
    const statusConfig = {
        ACTIVE: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Đang hoạt động" },
        PENDING: { color: "bg-yellow-100 text-yellow-700", icon: Clock, label: "Chờ setup" },
        INACTIVE: { color: "bg-gray-100 text-gray-700", icon: AlertCircle, label: "Không hoạt động" },
    };

    const config = statusConfig[course.status] || statusConfig.INACTIVE;
    const StatusIcon = config.icon;

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl shadow-md p-4 active:scale-95 transition-transform cursor-pointer"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <BookOpen className="text-white" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{course.code}</h3>
                        <p className="text-xs text-gray-500">{course.groupName}</p>
                    </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.color}`}>
                    <StatusIcon size={12} />
                    <span>{config.label}</span>
                </div>
            </div>

            {/* Course name */}
            <p className="text-sm text-gray-700 mb-2 line-clamp-2">{course.name}</p>

            {/* Lecturer */}
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <Users size={14} />
                <span>{course.lecturer}</span>
            </div>

            {/* Progress */}
            <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Tiến độ dự án</span>
                    <span className="font-semibold">{course.progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

export default function StudentDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courses] = useState(MOCK_COURSES);

    return (
        <MobileLayout title="Trang chủ">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white mb-6 shadow-lg">
                <h2 className="text-xl font-bold mb-1">Chào {user?.name?.split(" ").pop()}! 👋</h2>
                <p className="text-blue-100 text-sm">{user?.studentCode}</p>
                <p className="text-blue-100 text-sm">{user?.email}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{courses.length}</div>
                    <div className="text-sm text-gray-600">Môn học</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                        {courses.filter(c => c.status === "ACTIVE").length}
                    </div>
                    <div className="text-sm text-gray-600">Đang hoạt động</div>
                </div>
            </div>

            {/* Courses List */}
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen size={20} className="text-blue-600" />
                    Môn học của tôi
                </h3>
                <div className="space-y-3">
                    {courses.map((course) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            onClick={() => navigate(`/student/project/${course.id}`)}
                        />
                    ))}
                </div>
            </div>
        </MobileLayout>
    );
}
