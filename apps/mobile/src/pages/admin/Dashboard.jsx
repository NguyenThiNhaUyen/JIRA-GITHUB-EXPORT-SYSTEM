// Mobile Admin Dashboard
import { MobileLayout } from "../../components/layout/MobileLayout.jsx";
import { BookOpen, Calendar, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
    const navigate = useNavigate();

    return (
        <MobileLayout title="Admin Dashboard">
            <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-4 shadow-md text-center">
                        <div className="text-2xl font-bold text-blue-600">24</div>
                        <div className="text-xs text-gray-600 mt-1">Lớp học</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md text-center">
                        <div className="text-2xl font-bold text-green-600">3</div>
                        <div className="text-xs text-gray-600 mt-1">Kỳ học</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md text-center">
                        <div className="text-2xl font-bold text-purple-600">15</div>
                        <div className="text-xs text-gray-600 mt-1">Giảng viên</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md text-center">
                        <div className="text-2xl font-bold text-orange-600">120</div>
                        <div className="text-xs text-gray-600 mt-1">Sinh viên</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Quản lý</h3>

                    <div
                        onClick={() => navigate("/admin/courses")}
                        className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3 active:scale-95 transition-transform"
                    >
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <BookOpen className="text-white" size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Quản lý lớp học</h4>
                            <p className="text-sm text-gray-500">24 lớp học</p>
                        </div>
                    </div>

                    <div
                        onClick={() => navigate("/admin/semesters")}
                        className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3 active:scale-95 transition-transform"
                    >
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                            <Calendar className="text-white" size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Quản lý kỳ học</h4>
                            <p className="text-sm text-gray-500">3 kỳ học</p>
                        </div>
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
