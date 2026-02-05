// Mobile Student Project Page
import { MobileLayout } from "../../components/layout/MobileLayout.jsx";
import { useParams } from "react-router-dom";
import { GitBranch, CheckCircle, Users, Calendar } from "lucide-react";

export default function StudentProject() {
    const { projectId } = useParams();

    return (
        <MobileLayout title="Chi tiết dự án" showBack={true}>
            <div className="space-y-4">
                {/* Project Info */}
                <div className="bg-white rounded-xl shadow-md p-4">
                    <h2 className="font-bold text-lg text-gray-900 mb-2">E-commerce Platform</h2>
                    <p className="text-sm text-gray-600 mb-4">Nhóm 3 - SWD392</p>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <GitBranch size={16} className="text-blue-600" />
                            <a href="#" className="text-blue-600">github.com/team3/ecommerce</a>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <CheckCircle size={16} className="text-green-600" />
                            <span className="text-gray-700">JIRA: team3.atlassian.net</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Users size={16} className="text-purple-600" />
                            <span className="text-gray-700">5 thành viên</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar size={16} className="text-orange-600" />
                            <span className="text-gray-700">Commit cuối: 2026-01-20</span>
                        </div>
                    </div>
                </div>

                {/* Progress */}
                <div className="bg-white rounded-xl shadow-md p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Tiến độ dự án</h3>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: "75%" }} />
                    </div>
                    <p className="text-sm text-gray-600">75% hoàn thành</p>
                </div>

                {/* Team Members */}
                <div className="bg-white rounded-xl shadow-md p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Thành viên nhóm</h3>
                    <div className="space-y-2">
                        {["Nguyễn Văn A (Leader)", "Trần Thị B", "Lê Văn C", "Phạm Thu D", "Hoàng Minh E"].map((member, i) => (
                            <div key={i} className="flex items-center gap-3 py-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                                    {member.charAt(0)}
                                </div>
                                <span className="text-sm text-gray-700">{member}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
