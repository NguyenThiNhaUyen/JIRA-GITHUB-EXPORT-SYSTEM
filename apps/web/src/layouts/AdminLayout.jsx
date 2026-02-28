import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
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
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login");
        setShowUserMenu(false);
    };

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes("/admin/courses")) return "Quản lý Lớp học";
        if (path.includes("/admin/semesters")) return "Quản lý Học kỳ";
        if (path.includes("/admin/subjects")) return "Quản lý Môn học";
        if (path.includes("/admin/reports")) return "Báo cáo Admin";
        if (path === "/admin") return "Tổng quan";
        return "Admin Dashboard";
    };

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
                        <header className="h-[88px] flex-shrink-0 px-8 flex items-center justify-between border-b border-gray-100 relative z-20">
                            <div className="flex items-center gap-4">
                                {location.pathname !== "/admin" && (
                                    <button
                                        onClick={() => navigate("/admin")}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 mr-2"
                                        title="Trở về Tổng quan"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                    </button>
                                )}
                                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">{getPageTitle()}</h1>
                            </div>

                            {/* Right actions */}
                            <div className="flex items-center gap-5">
                                <div className="relative hidden md:block">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm lớp học, môn học..."
                                        className="w-64 pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                                    >
                                        <Bell size={20} />
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                    </button>

                                    {/* Notifications Dropdown */}
                                    {showNotifications && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-30"
                                                onClick={() => setShowNotifications(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-40">
                                                <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
                                                    <p className="font-bold text-gray-800">Thông báo</p>
                                                    <span className="text-xs text-blue-600 cursor-pointer hover:underline">Đánh dấu đã đọc</span>
                                                </div>
                                                <div className="max-h-[300px] overflow-y-auto">
                                                    <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer transition-colors relative">
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>
                                                        <p className="text-sm font-semibold text-gray-800">Cập nhật hệ thống</p>
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">Hệ thống đã được cập nhật lên phiên bản mới nhất với nhiều tính năng và cải thiện hiệu suất.</p>
                                                        <p className="text-[10px] text-gray-400 mt-2">10 phút trước</p>
                                                    </div>
                                                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                                                        <p className="text-sm font-semibold text-gray-800 text-gray-600">Lớp học mới được tạo</p>
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">Lớp học PRN1821 vừa được tạo thành công trên hệ thống. Hãy kiểm tra và phân công giảng viên.</p>
                                                        <p className="text-[10px] text-gray-400 mt-2">1 giờ trước</p>
                                                    </div>
                                                </div>
                                                <div className="px-4 py-2 border-t border-gray-50 text-center">
                                                    <span className="text-sm text-blue-600 font-medium cursor-pointer hover:underline">Xem tất cả</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="h-8 w-px bg-gray-200"></div>

                                {/* User menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold border border-teal-200">
                                            {user?.name?.charAt(0).toUpperCase() || "A"}
                                        </div>
                                        <div className="text-left hidden sm:block">
                                            <p className="text-sm font-bold text-gray-700 leading-tight whitespace-nowrap">{user?.name || "Admin"}</p>
                                            <p className="text-[11px] text-gray-500 font-medium">Quản trị viên</p>
                                        </div>
                                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown menu */}
                                    {showUserMenu && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-30"
                                                onClick={() => setShowUserMenu(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-40 transform opacity-100 scale-100">
                                                <div className="px-4 py-3 border-b border-gray-50">
                                                    <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                                </div>
                                                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                    <Settings size={16} className="text-gray-400" />
                                                    <span className="font-medium whitespace-nowrap">Cài đặt</span>
                                                </button>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut size={16} className="text-red-500" />
                                                    <span className="font-medium whitespace-nowrap">Đăng xuất</span>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </header>

                        {/* Sub-page content */}
                        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-transparent">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}
