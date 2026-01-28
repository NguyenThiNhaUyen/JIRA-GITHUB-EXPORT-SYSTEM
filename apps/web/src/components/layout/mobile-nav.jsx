// MobileNav - Bottom navigation cho mobile
import { NavLink } from "react-router-dom";
import { Home, LayoutDashboard, ListTodo, GitBranch, Calendar, Activity } from "lucide-react";
import { cn } from "../../lib/utils.js";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/home", icon: Home, label: "Home" },
  { to: "/tasks", icon: ListTodo, label: "Tasks" },
  { to: "/commits", icon: GitBranch, label: "Commits" },
  { to: "/deadlines", icon: Calendar, label: "Deadlines" },
  { to: "/performance", icon: Activity, label: "Perf" },
];

export function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-blue-100 shadow-lg z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                  isActive ? "text-blue-600" : "text-blue-400"
                )
              }
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

