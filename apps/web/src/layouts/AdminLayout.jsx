import BaseLayout from "./BaseLayout.jsx";
import {
    LayoutDashboard, CalendarDays, Library,
    Users, BookOpen, BarChart3,
} from "lucide-react";

const NAV = [
    {
        label: "Tá»•ng quan",
        items: [
            { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
            { to: "/admin/reports", icon: BarChart3, label: "PhĂ¢n tĂ­ch há»‡ thá»‘ng" },
        ],
    },
    {
        label: "Há»c vá»¥",
        items: [
            { to: "/admin/semesters", icon: CalendarDays, label: "Há»c ká»³" },
            { to: "/admin/subjects", icon: Library, label: "MĂ´n há»c" },
            { to: "/admin/courses", icon: BookOpen, label: "Lá»›p há»c pháº§n" },
            { to: "/admin/lecturer-assignment", icon: BookOpen, label: "PhĂ¢n cĂ´ng giáº£ng viĂªn" },
            { to: "/admin/workload", icon: BarChart3, label: "Khá»‘i lÆ°á»£ng giáº£ng dáº¡y" },
        ],
    },
    {
        label: "NgÆ°á»i dĂ¹ng",
        items: [
            { to: "/admin/users", icon: Users, label: "TĂ i khoáº£n" },
        ],
    },
];

export default function AdminLayout({ children }) {
    return <BaseLayout navConfig={NAV}>{children}</BaseLayout>;
}

