import BaseLayout from "./BaseLayout.jsx";
import {
    LayoutDashboard, GraduationCap, Users,
    BarChart3, AlertTriangle, FileText, Download,
} from "lucide-react";

const NAV = [
    {
        label: "Tá»•ng quan",
        items: [
            { to: "/lecturer", icon: LayoutDashboard, label: "Dashboard", end: true },
        ],
    },
    {
        label: "Quáº£n lĂ½",
        items: [
            { to: "/lecturer/my-courses", icon: GraduationCap, label: "Lá»›p cá»§a tĂ´i" },
            { to: "/lecturer/groups", icon: Users, label: "Theo dĂµi nhĂ³m" },
            { to: "/lecturer/projects", icon: GraduationCap, label: "Tá»•ng quan dá»± Ă¡n" },
        ],
    },
    {
        label: "Theo dĂµi",
        items: [
            { to: "/lecturer/contributions", icon: BarChart3, label: "ÄĂ³ng gĂ³p" },
            { to: "/lecturer/alerts", icon: AlertTriangle, label: "Cáº£nh bĂ¡o" },
        ],
    },
    {
        label: "TĂ i liá»‡u",
        items: [
            { to: "/lecturer/srs", icon: FileText, label: "SRS Reports" },
            { to: "/lecturer/reports", icon: Download, label: "BĂ¡o cĂ¡o & Export" },
        ],
    },
];

export default function LecturerLayout({ children }) {
    return <BaseLayout navConfig={NAV}>{children}</BaseLayout>;
}

