import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Bell, Settings, LogOut, ChevronDown, Users, Check, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import db from "../../mock/db.js";

export function TopHeader() {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [invitations, setInvitations] = useState([]);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Load pending invitations for STUDENT users
    useEffect(() => {
        if (user?.role === "STUDENT" && user?.id) {
            loadInvitations();
        }
    }, [user]);

    const loadInvitations = () => {
        const pending = db.getPendingInvitationsForStudent(user.id);
        setInvitations(pending);
    };

    const handleAccept = (inv) => {
        db.acceptInvitation(inv.id, user.id);
        loadInvitations();
    };

    const handleDecline = (inv) => {
        db.declineInvitation(inv.id);
        loadInvitations();
    };

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

        // Lecturer pages
        if (path.includes("/lecturer/group")) return "Chi tiết Nhóm";
        if (path.includes("/lecturer/course")) return "Quản lý Nhóm";
        if (path === "/lecturer") return "Tổng quan Giảng viên";

        return "Dashboard";
    };

    const isRootPath = location.pathname === "/admin" || location.pathname === "/lecturer";
    const backPath = location.pathname.startsWith("/admin") ? "/admin" : location.pathname.startsWith("/lecturer") ? "/lecturer" : "/";

    const isStudent = user?.role === "STUDENT";
    const pendingCount = isStudent ? invitations.length : 0;

    const formatTime = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const h = Math.floor(diff / 3600000);
        if (h < 1) return "Vừa xong";
        if (h < 24) return `${h} giờ trước`;
        return `${Math.floor(h / 24)} ngày trước`;
    };

    return (
        <header className="h-[88px] flex-shrink-0 px-8 flex items-center justify-between border-b border-gray-100 relative z-20">
            <div className="flex items-center gap-4">
                {!isRootPath && (
                    <button
                        onClick={() => navigate(backPath)}
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
                        placeholder="Tìm kiếm..."
                        className="w-64 pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                </div>

                {/* 🔔 Notification Bell */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                        <Bell size={20} />
                        {pendingCount > 0 && (
                            <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                {pendingCount}
                            </span>
                        )}
                        {!isStudent && pendingCount === 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <>
                            <div
                                className="fixed inset-0 z-30"
                                onClick={() => setShowNotifications(false)}
                            />
                            <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-40">
                                <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
                                    <p className="font-bold text-gray-800">
                                        {isStudent ? "Lời mời nhóm" : "Thông báo"}
                                    </p>
                                    {isStudent && pendingCount > 0 && (
                                        <span className="text-xs font-semibold text-white bg-red-500 rounded-full px-2 py-0.5">
                                            {pendingCount} chờ xử lý
                                        </span>
                                    )}
                                </div>

                                <div className="max-h-[380px] overflow-y-auto">
                                    {/* STUDENT: show team invitations */}
                                    {isStudent && invitations.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
                                            <Users size={28} className="text-gray-300" />
                                            <p className="text-sm">Không có lời mời nào</p>
                                        </div>
                                    )}

                                    {isStudent && invitations.map((inv) => (
                                        <div key={inv.id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Users size={16} className="text-teal-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 leading-snug">{inv.groupName}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        <span className="text-teal-600 font-medium">{inv.invitedByName}</span> đã mời bạn tham gia
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{inv.courseName} · {formatTime(inv.createdAt)}</p>
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            onClick={() => handleAccept(inv)}
                                                            className="flex items-center gap-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg px-3 py-1.5 transition-colors"
                                                        >
                                                            <Check size={11} /> Đồng ý
                                                        </button>
                                                        <button
                                                            onClick={() => handleDecline(inv)}
                                                            className="flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-1.5 transition-colors"
                                                        >
                                                            <X size={11} /> Từ chối
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* NON-STUDENT: system notifications */}
                                    {!isStudent && (
                                        <>
                                            <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer transition-colors relative">
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>
                                                <p className="text-sm font-semibold text-gray-800">Cập nhật hệ thống</p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">Hệ thống đã được cập nhật lên phiên bản mới nhất với nhiều tính năng và cải thiện hiệu suất.</p>
                                                <p className="text-[10px] text-gray-400 mt-2">10 phút trước</p>
                                            </div>
                                            <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                                                <p className="text-sm font-semibold text-gray-600">Lớp học mới được tạo</p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">Lớp học PRN1821 vừa được tạo thành công trên hệ thống.</p>
                                                <p className="text-[10px] text-gray-400 mt-2">1 giờ trước</p>
                                            </div>
                                        </>
                                    )}
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
                            <p className="text-sm font-bold text-gray-700 leading-tight whitespace-nowrap">{user?.name || "User"}</p>
                            <p className="text-[11px] text-gray-500 font-medium">{user?.role === 'ADMIN' ? 'Quản trị viên' : user?.role === 'LECTURER' ? 'Giảng viên' : 'Sinh viên'}</p>
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
    );
}
