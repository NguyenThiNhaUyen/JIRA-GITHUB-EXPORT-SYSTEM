import BaseLayout from "./BaseLayout.jsx";
import {
    LayoutDashboard, CalendarDays, Library,
    Users, BookOpen, BarChart3,
} from "lucide-react";

const NAV = [
    {
        label: "Tổng quan",
        items: [
            { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
            { to: "/admin/reports", icon: BarChart3, label: "Phân tích hệ thống" },
        ],
    },
    {
        label: "Học vụ",
        items: [
            { to: "/admin/semesters", icon: CalendarDays, label: "Học kỳ" },
            { to: "/admin/subjects", icon: Library, label: "Môn học" },
            { to: "/admin/courses", icon: BookOpen, label: "Lớp học phần" },
            { to: "/admin/lecturer-assignment", icon: BookOpen, label: "Phân công giảng viên" },
            { to: "/admin/workload", icon: BarChart3, label: "Khối lượng giảng dạy" },
        ],
    },
    {
        label: "Người dùng",
        items: [
            { to: "/admin/users", icon: Users, label: "Tài khoản" },
        ],
    },
];

export default function AdminLayout({ children }) {
    return <BaseLayout navConfig={NAV}>{children}</BaseLayout>;
}
