// Student placeholder pages — dùng chung 1 component
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export function StudentPlaceholder({ title, emoji = "🚧", desc = "Tính năng đang được phát triển." }) {
    const navigate = useNavigate();
    return (
        <div className="space-y-4">
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <span className="text-teal-700 font-semibold cursor-pointer hover:underline" onClick={() => navigate("/student")}>Sinh viên</span>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-semibold">{title}</span>
            </nav>
            <div className="flex flex-col items-center justify-center py-32 gap-5">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center shadow-inner">
                    <span className="text-4xl">{emoji}</span>
                </div>
                <div className="text-center space-y-1.5">
                    <h3 className="text-xl font-bold text-gray-700">{title}</h3>
                    <p className="text-sm text-gray-400 max-w-sm">{desc}</p>
                </div>
                <button
                    onClick={() => navigate("/student")}
                    className="text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 px-5 py-2 rounded-xl transition-colors"
                >
                    ← Quay lại Dashboard
                </button>
            </div>
        </div>
    );
}

export default function StudentCoursesPage() { return <StudentPlaceholder title="Lớp của tôi" emoji="📚" desc="Danh sách lớp học đầy đủ với filter và search." />; }
export function StudentMyProjectPage() { return <StudentPlaceholder title="Nhóm của tôi" emoji="👥" desc="Workspace nhóm với GitHub/Jira links." />; }
export function StudentContributionPage() { return <StudentPlaceholder title="Đóng góp" emoji="📊" desc="Analytics commit, issue cá nhân theo tuần." />; }
export function StudentAlertsPage() { return <StudentPlaceholder title="Thông báo / Cảnh báo" emoji="🔔" desc="Nhắc nhở từ giảng viên và cảnh báo không hoạt động." />; }
export function StudentSrsPage() { return <StudentPlaceholder title="SRS" emoji="📄" desc="Tài liệu đặc tả yêu cầu phần mềm theo nhóm." />; }
