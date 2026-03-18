import BaseLayout from "./BaseLayout.jsx";
import {
    LayoutDashboard, Library, Users,
    GitBranch, Bell, FileText,
} from "lucide-react";

const NAV = [
    {
        label: "Tá»•ng quan",
        items: [
            { to: "/student", icon: LayoutDashboard, label: "Dashboard", end: true },
        ],
    },
    {
        label: "Há»c táº­p",
        items: [
            { to: "/student/courses", icon: Library, label: "Lá»›p cá»§a tĂ´i" },
            { to: "/student/my-project", icon: GitBranch, label: "NhĂ³m cá»§a tĂ´i" },
        ],
    },
    {
        label: "Theo dĂµi",
        items: [
            { to: "/student/contribution", icon: Users, label: "ÄĂ³ng gĂ³p" },
            { to: "/student/alerts", icon: Bell, label: "ThĂ´ng bĂ¡o / Cáº£nh bĂ¡o" },
        ],
    },
    {
        label: "TĂ i liá»‡u",
        items: [
            { to: "/student/srs", icon: FileText, label: "SRS" },
        ],
    },
];

export default function StudentLayout({ children }) {
    return <BaseLayout navConfig={NAV}>{children}</BaseLayout>;
}
