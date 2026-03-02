import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { TopHeader } from "../components/layout/TopHeader.jsx";
import {
    Home,
    LayoutDashboard,
    BookOpen,
    CalendarDays,
    Library,
    Settings,
    Bell,
    LogOut,
    ChevronDown,
    Menu,
    FileBarChart,
    Search
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const linkActive = "bg-teal-800 text-white shadow-md font-semibold";
const linkIdle = "text-teal-100 hover:bg-teal-800/50 hover:text-white";

export default function AdminLayout({ children }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="h-screen flex relative overflow-hidden bg-teal-50">
            {/* Wavy Background Elements (EduPilot inspired) */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <svg
                    className="absolute w-full h-full opacity-30"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                    viewBox="0 0 1440 800"
                >
                    <path
                        fill="#d1fae5" // teal-100
                        d="M0 200c144 144 336 144 480 0s336-144 480 0 336 144 480 0v600H0V200z"
                    />
                    <path
                        fill="#a7f3d0" // teal-200
                        opacity="0.5"
                        d="M0 400c144 144 336 144 480 0s336-144 480 0 336 144 480 0v400H0V400z"
                    />
                </svg>
            </div>

            {/* ================= SIDEBAR (EduPilot Dark Teal) ================= */}
            <aside
                className={[
                    "bg-gradient-to-b from-[#134e4a] to-[#0f5864] border-r border-[#6f9aa3] p-4 transition-all duration-300 shadow-2xl z-20 flex flex-col relative",
                    collapsed ? "w-20" : "w-64",
                ].join(" ")}
            >
                {/* Header sidebar + toggle button */}
                <div className="flex items-center justify-between mb-8 px-2">
                    {!collapsed && (
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="bg-white p-2 rounded-lg">
                                <BookOpen size={20} className="text-teal-900 font-bold" />
                            </div>
                            <div className="font-bold text-xl text-white whitespace-nowrap tracking-wide">
                                Devora
                            </div>
                        </div>
                    )}
                    {collapsed && (
                        <div className="w-full flex justify-center">
                            <div className="bg-white p-2 rounded-lg">
                                <BookOpen size={20} className="text-teal-900 font-bold" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Menu */}
                <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden">
                    {!collapsed && <div className="text-xs text-teal-400 font-medium px-4 mb-2 uppercase tracking-wider whitespace-nowrap">Tổng quan</div>}

                    <NavLink
                        to="/admin"
                        end
                        className={({ isActive }) =>
                            [
                                "flex items-center rounded-xl px-4 py-3 text-sm transition-all duration-200",
                                collapsed ? "justify-center" : "gap-4",
                                isActive ? linkActive : linkIdle,
                            ].join(" ")
                        }
                        title="Tổng quan"
                    >
                        <LayoutDashboard size={20} />
                        {!collapsed && <span className="whitespace-nowrap">Tổng quan</span>}
                    </NavLink>

                    <NavLink
                        to="/admin/reports"
                        className={({ isActive }) =>
                            [
                                "flex items-center rounded-xl px-4 py-3 text-sm transition-all duration-200",
                                collapsed ? "justify-center" : "gap-4",
                                isActive ? linkActive : linkIdle,
                            ].join(" ")
                        }
                        title="Báo cáo"
                    >
                        <FileBarChart size={20} />
                        {!collapsed && <span className="whitespace-nowrap">Báo cáo</span>}
                    </NavLink>

                    {!collapsed && <div className="text-xs text-teal-400 font-medium px-4 mt-6 mb-2 uppercase tracking-wider whitespace-nowrap">Quản lý</div>}

                    <NavLink
                        to="/admin/semesters"
                        className={({ isActive }) =>
                            [
                                "flex items-center rounded-xl px-4 py-3 text-sm transition-all duration-200",
                                collapsed ? "justify-center" : "gap-4",
                                isActive ? linkActive : linkIdle,
                            ].join(" ")
                        }
                        title="Học kỳ"
                    >
                        <CalendarDays size={20} />
                        {!collapsed && <span className="whitespace-nowrap">Học kỳ</span>}
                    </NavLink>

                    <NavLink
                        to="/admin/subjects"
                        className={({ isActive }) =>
                            [
                                "flex items-center rounded-xl px-4 py-3 text-sm transition-all duration-200",
                                collapsed ? "justify-center" : "gap-4",
                                isActive ? linkActive : linkIdle,
                            ].join(" ")
                        }
                        title="Môn học"
                    >
                        <Library size={20} />
                        {!collapsed && <span className="whitespace-nowrap">Môn học</span>}
                    </NavLink>

                    <NavLink
                        to="/admin/courses"
                        className={({ isActive }) =>
                            [
                                "flex items-center rounded-xl px-4 py-3 text-sm transition-all duration-200",
                                collapsed ? "justify-center" : "gap-4",
                                isActive ? linkActive : linkIdle,
                            ].join(" ")
                        }
                        title="Lớp học"
                    >
                        <BookOpen size={20} />
                        {!collapsed && <span className="whitespace-nowrap">Lớp học</span>}
                    </NavLink>
                </nav>

                {/* Bottom actions */}
                <div className="mt-auto space-y-2 pt-4 border-t border-teal-800">
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

            {/* ================= CONTENT ================= */}
            <div className="flex-1 flex flex-col z-10 overflow-hidden relative">
                {/* Edaca Style Inner Container */}
                <div className="p-4 md:p-6 lg:p-8 flex-1 flex flex-col h-full overflow-y-auto w-full max-w-[1600px] mx-auto">

                    {/* Main White Card Enclosure (Edaca style overall wrapping) */}
                    <div className="bg-white/95 backdrop-blur-md rounded-[32px] shadow-xl flex-1 flex flex-col overflow-hidden border border-white/40">

                        {/* Header / Topbar inside the card */}
                        <TopHeader />

                        {/* Sub-page content */}
                        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-transparent ">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}
