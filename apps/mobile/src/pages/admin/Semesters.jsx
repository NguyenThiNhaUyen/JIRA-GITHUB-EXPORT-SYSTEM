// Mobile Admin Semesters Page
import { MobileLayout } from "../../components/layout/MobileLayout.jsx";
import { Calendar } from "lucide-react";

const MOCK_SEMESTERS = [
    { id: "s1", name: "2026 Spring", start: "2026-01-05", end: "2026-04-20" },
    { id: "s2", name: "2025 Fall", start: "2025-09-01", end: "2025-12-31" },
];

export default function AdminSemesters() {
    return (
        <MobileLayout title="Quản lý kỳ học" showBack={true}>
            <div className="space-y-3">
                {MOCK_SEMESTERS.map((sem) => (
                    <div key={sem.id} className="bg-white rounded-xl shadow-md p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                <Calendar className="text-white" size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{sem.name}</h4>
                                <p className="text-sm text-gray-600">{sem.start} → {sem.end}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </MobileLayout>
    );
}
