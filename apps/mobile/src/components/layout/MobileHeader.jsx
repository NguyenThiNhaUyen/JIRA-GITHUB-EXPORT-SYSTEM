// MobileHeader - Top header for mobile
import { ArrowLeft, Bell, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../packages/shared/src/context/AuthContext.jsx";

export function MobileHeader({ title, showBack = false, onMenuClick }) {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <header className="fixed top-0 left-0 right-0 h-14 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md z-40 safe-top">
            <div className="h-full px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {showBack ? (
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 rounded-lg active:bg-blue-700 transition-colors btn-touch"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={onMenuClick}
                            className="p-2 -ml-2 rounded-lg active:bg-blue-700 transition-colors btn-touch"
                        >
                            <Menu size={20} />
                        </button>
                    )}
                    <h1 className="text-lg font-semibold truncate">{title}</h1>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg active:bg-blue-700 transition-colors btn-touch">
                        <Bell size={20} />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                </div>
            </div>
        </header>
    );
}
