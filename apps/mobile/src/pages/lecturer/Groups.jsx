// Mobile Lecturer Groups Page
import { MobileLayout } from "../../components/layout/MobileLayout.jsx";
import { Users, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MOCK_GROUPS = [
    { id: "g1", name: "Nhóm 1", topic: "E-commerce Platform", members: 5, status: "ACTIVE" },
    { id: "g2", name: "Nhóm 2", topic: "Banking Mobile App", members: 5, status: "ACTIVE" },
    { id: "g3", name: "Nhóm 3", topic: "Healthcare System", members: 5, status: "PENDING" },
];

export default function LecturerGroups() {
    const navigate = useNavigate();

    return (
        <MobileLayout title="Danh sách nhóm" showBack={true}>
            <div className="space-y-3">
                {MOCK_GROUPS.map((group) => (
                    <div
                        key={group.id}
                        onClick={() => navigate(`/lecturer/group/${group.id}`)}
                        className="bg-white rounded-xl shadow-md p-4 active:scale-95 transition-transform"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                    <Users className="text-white" size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{group.name}</h4>
                                    <p className="text-xs text-gray-500">{group.members} thành viên</p>
                                </div>
                            </div>
                            {group.status === "ACTIVE" ? (
                                <CheckCircle className="text-green-600" size={20} />
                            ) : (
                                <Clock className="text-yellow-600" size={20} />
                            )}
                        </div>
                        <p className="text-sm text-gray-700">{group.topic}</p>
                    </div>
                ))}
            </div>
        </MobileLayout>
    );
}
