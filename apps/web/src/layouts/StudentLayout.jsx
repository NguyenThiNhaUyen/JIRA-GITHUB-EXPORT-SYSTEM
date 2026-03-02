// StudentLayout — Enterprise SaaS App Shell (đồng bộ Admin/Lecturer)
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { TopHeader } from "../components/layout/TopHeader.jsx";
import {
    BookOpen, LayoutDashboard, Library, Users,
    GitBranch, Bell, FileText, Menu,
} from "lucide-react";

const linkActive = "bg-teal-800 text-white shadow-md font-semibold";
const linkIdle = "text-teal-100 hover:bg-teal-800/50 hover:text-white";

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
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="h-screen flex relative overflow-hidden bg-teal-50">
            {/* Wavy Background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <svg className="absolute w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1440 800">
                    <path fill="#d1fae5" d="M0 200c144 144 336 144 480 0s336-144 480 0 336 144 480 0v600H0V200z" />
                    <path fill="#a7f3d0" opacity="0.5" d="M0 400c144 144 336 144 480 0s336-144 480 0 336 144 480 0v400H0V400z" />
                </svg>
            </div>

            {/* ════ SIDEBAR ════ */}
            <aside className={[
                "bg-gradient-to-b from-[#134e4a] to-[#0f5864] border-r border-[#6f9aa3] p-4 transition-all duration-300 shadow-2xl z-20 flex flex-col relative",
                collapsed ? "w-20" : "w-64",
            ].join(" ")}>
                {/* Logo */}
                <div className="flex items-center justify-between mb-8 px-2">
                    {!collapsed && (
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="bg-white p-2 rounded-lg"><BookOpen size={20} className="text-teal-900" /></div>
                            <span className="font-bold text-xl text-white whitespace-nowrap tracking-wide">Devora</span>
                        </div>
                    )}
                    {collapsed && (
                        <div className="w-full flex justify-center">
                            <div className="bg-white p-2 rounded-lg"><BookOpen size={20} className="text-teal-900" /></div>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden">
                    {NAV.map((section) => (
                        <div key={section.label} className="mb-4">
                            {!collapsed && (
                                <div className="text-xs text-teal-400 font-medium px-4 mb-2 uppercase tracking-wider whitespace-nowrap">
                                    {section.label}
                                </div>
                            )}
                            <div className="space-y-1">
                                {section.items.map(({ to, icon: Icon, label, end }) => (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        end={end}
                                        className={({ isActive }) => [
                                            "flex items-center rounded-xl px-4 py-3 text-sm transition-all duration-200",
                                            collapsed ? "justify-center" : "gap-4",
                                            isActive ? linkActive : linkIdle,
                                        ].join(" ")}
                                        title={label}
                                    >
                                        <Icon size={20} />
                                        {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Collapse toggle */}
                <div className="mt-auto pt-4 border-t border-teal-800">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center justify-center p-3 rounded-xl text-teal-100 hover:bg-teal-800/50 hover:text-white transition-colors"
                        title={collapsed ? "Mở rộng" : "Thu gọn"}
                    >
                        <Menu size={20} />
                        {!collapsed && <span className="ml-3 text-sm whitespace-nowrap">Thu gọn menu</span>}
                    </button>
                </div>
            </aside>

            {/* ════ CONTENT ════ */}
            <div className="flex-1 flex flex-col z-10 overflow-hidden relative">
                <div className="p-4 md:p-6 lg:p-8 flex-1 flex flex-col h-full overflow-y-auto w-full max-w-[1600px] mx-auto">
                    <div className="bg-white/95 backdrop-blur-md rounded-[32px] shadow-xl flex-1 flex flex-col overflow-hidden border border-white/40">
                        <TopHeader />
                        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-transparent">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}
