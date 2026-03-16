import { ChevronRight } from "lucide-react";

export default function Reports() {
    return (
        <div className="space-y-6">
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <span className="text-teal-700 font-semibold">Giảng viên</span>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-semibold">Báo cáo & Export</span>
            </nav>

            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-800">
                        Báo cáo & Xuất dữ liệu
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Trung tâm tạo báo cáo học thuật cho lớp, nhóm, sinh viên và đối chiếu Jira ↔ GitHub
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border shadow-sm mt-8">
                <div className="text-xl font-bold text-gray-800 mb-2">Chưa hỗ trợ API</div>
                <p className="text-gray-500">Chức năng Reports hiện chưa có dữ liệu từ backend.</p>
            </div>
        </div>
    );
}