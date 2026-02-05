// Mobile Lecturer Group Detail Page
import { MobileLayout } from "../../components/layout/MobileLayout.jsx";
import { GitBranch, Users } from "lucide-react";

export default function LecturerGroupDetail() {
    return (
        <MobileLayout title="Chi tiết nhóm" showBack={true}>
            <div className="space-y-4">
                <div className="bg-white rounded-xl shadow-md p-4">
                    <h2 className="font-bold text-lg text-gray-900 mb-2">Nhóm 1</h2>
                    <p className="text-sm text-gray-600 mb-4">E-commerce Platform</p>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <GitBranch size={16} className="text-blue-600" />
                            <span className="text-gray-700">github.com/team1/ecommerce</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Users size={16} className="text-purple-600" />
                            <span className="text-gray-700">5 thành viên</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Thành viên</h3>
                    <div className="space-y-2">
                        {["Nguyễn A (Leader)", "Trần B", "Lê C"].map((member, i) => (
                            <div key={i} className="flex items-center gap-3 py-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                                    {member.charAt(0)}
                                </div>
                                <span className="text-sm">{member}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
