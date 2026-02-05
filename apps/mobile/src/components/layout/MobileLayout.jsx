// MobileLayout - Main layout for mobile pages
import { MobileHeader } from "./MobileHeader.jsx";
import { MobileNav } from "./MobileNav.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../packages/shared/src/context/AuthContext.jsx";
import { LogOut, User, Settings } from "lucide-react";

export function MobileLayout({ children, title, showBack = false }) {
    const [showMenu, setShowMenu] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
            <MobileHeader
                title={title}
                showBack={showBack}
                onMenuClick={() => setShowMenu(true)}
            />

            {/* Main content with padding for header and bottom nav */}
            <main className="pt-14 pb-20 px-4 min-h-screen">
                <div className="max-w-2xl mx-auto py-4">
                    {children}
                </div>
            </main>

            <MobileNav />

            {/* Side menu overlay */}
            {showMenu && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl z-50 animate-slide-up">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-blue-100">
                                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-medium">
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                            </div>

                            <nav className="space-y-2">
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700">
                                    <User size={20} />
                                    <span>Thông tin cá nhân</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700">
                                    <Settings size={20} />
                                    <span>Cài đặt</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600"
                                >
                                    <LogOut size={20} />
                                    <span>Đăng xuất</span>
                                </button>
                            </nav>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
