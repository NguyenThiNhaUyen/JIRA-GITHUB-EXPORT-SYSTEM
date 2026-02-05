// MobileNav - Bottom navigation bar
import { NavLink } from "react-router-dom";
import { Home, LayoutDashboard, Users, Settings } from "lucide-react";
import { useAuth } from "../../../packages/shared/src/context/AuthContext.jsx";

export function MobileNav() {
    const { userRole } = useAuth();

    // Different nav items based on role
    const getNavItems = () => {
        if (userRole === "STUDENT") {
            return [
                { to: "/student", icon: Home, label: "Trang chủ" },
                { to: "/student/projects", icon: LayoutDashboard, label: "Dự án" },
            ];
        }
        if (userRole === "LECTURER") {
            return [
                { to: "/lecturer", icon: Home, label: "Trang chủ" },
                { to: "/lecturer/groups", icon: Users, label: "Nhóm" },
            ];
        }
        if (userRole === "ADMIN") {
            return [
                { to: "/admin", icon: Home, label: "Trang chủ" },
                { to: "/admin/courses", icon: LayoutDashboard, label: "Lớp học" },
                { to: "/admin/semesters", icon: Settings, label: "Kỳ học" },
            ];
        }
        return [];
    };

    const navItems = getNavItems();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-blue-200 shadow-lg z-50 safe-bottom">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center flex-1 h-full transition-colors btn-touch ${isActive ? "text-blue-600" : "text-blue-400"
                                }`
                            }
                        >
                            <Icon size={22} />
                            <span className="text-xs mt-1">{item.label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
}
