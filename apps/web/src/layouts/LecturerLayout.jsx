import BaseLayout from "./BaseLayout.jsx";
import {
    LayoutDashboard, GraduationCap, Users,
    BarChart3, AlertTriangle, FileText, Download,
} from "lucide-react";

const NAV = [
    {
        label: "Tổng quan",
        items: [
            { to: "/lecturer", icon: LayoutDashboard, label: "Dashboard", end: true },
        ],
    },
    {
        label: "Quản lý",
        items: [
            { to: "/lecturer/my-courses", icon: GraduationCap, label: "Lớp của tôi" },
            { to: "/lecturer/groups", icon: Users, label: "Theo dõi nhóm" },
            { to: "/lecturer/projects", icon: GraduationCap, label: "Tổng quan dự án" },
        ],
    },
    {
        label: "Theo dõi",
        items: [
            { to: "/lecturer/contributions", icon: BarChart3, label: "Đóng góp" },
            { to: "/lecturer/alerts", icon: AlertTriangle, label: "Cảnh báo" },
        ],
    },
    {
        label: "Tài liệu",
        items: [
            { to: "/lecturer/srs", icon: FileText, label: "SRS Reports" },
            { to: "/lecturer/reports", icon: Download, label: "Báo cáo & Export" },
        ],
    },
];

export default function LecturerLayout({ children }) {
    return <BaseLayout navConfig={NAV}>{children}</BaseLayout>;
}
