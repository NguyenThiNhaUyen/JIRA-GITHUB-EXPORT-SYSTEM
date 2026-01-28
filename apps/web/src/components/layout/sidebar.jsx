// Sidebar - Desktop navigation
import { NavLink } from "react-router-dom";
import { Home, LayoutDashboard, ListTodo, GitBranch, Calendar, Activity } from "lucide-react";
import { cn } from "../../lib/utils.js";

const linkActive = "bg-blue-500 text-white shadow-sm";
const linkIdle = "text-blue-700 hover:bg-blue-50";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/home", icon: Home, label: "Home" },
  { to: "/tasks", icon: ListTodo, label: "Task Overview" },
  { to: "/commits", icon: GitBranch, label: "Commits" },
  { to: "/deadlines", icon: Calendar, label: "Deadlines" },
  { to: "/performance", icon: Activity, label: "Performance" },
];

export function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={cn(
        "bg-gradient-to-b from-blue-100 to-blue-50 border-r border-blue-200/50 p-4 transition-all duration-200 shadow-sm",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between mb-6">
        {!collapsed && (
          <div className="font-bold text-lg text-blue-900 whitespace-nowrap">Jira-GitHub Export</div>
        )}
        {collapsed && <div className="font-bold text-lg text-blue-900 text-center w-full">JG</div>}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-blue-200/50 text-blue-700 transition-colors"
          aria-label={collapsed ? "Mở sidebar" : "Thu nhỏ sidebar"}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  collapsed ? "justify-center" : "gap-3",
                  isActive ? linkActive : linkIdle
                )
              }
              title={item.label}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

