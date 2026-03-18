import BaseLayout from "./BaseLayout.jsx";
import {
    LayoutDashboard, Library, Users,
    GitBranch, Bell, FileText,
} from "lucide-react";

const NAV = [
    {
        label: "Tổng quan",
        items: [
            { to: "/student", icon: LayoutDashboard, label: "Dashboard", end: true },
        ],
    },
    {
        label: "Học tập",
        items: [
            { to: "/student/courses", icon: Library, label: "Lớp của tôi" },
            { to: "/student/my-project", icon: GitBranch, label: "Nhóm của tôi" },
        ],
    },
    {
        label: "Theo dõi",
        items: [
            { to: "/student/contribution", icon: Users, label: "Đóng góp" },
            { to: "/student/alerts", icon: Bell, label: "Thông báo / Cảnh báo" },
        ],
    },
    {
        label: "Tài liệu",
        items: [
            { to: "/student/srs", icon: FileText, label: "SRS" },
        ],
    },
];

export default function StudentLayout({ children }) {
    return <BaseLayout navConfig={NAV}>{children}</BaseLayout>;
}
