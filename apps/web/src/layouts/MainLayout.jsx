// MainLayout: Layout chung (Sidebar + Header controls + Main content) - dùng useApp() để lấy state
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Home,
  LayoutDashboard,
  RefreshCw,
  Download,
  Search,
  Bell,
  User,
  LogOut,
  ChevronDown,
  ListTodo,
  GitBranch,
  Calendar,
  Activity,
} from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const linkActive = "bg-blue-500 text-white shadow-sm";
const linkIdle = "text-blue-700 hover:bg-blue-50";

// Control: Wrapper cho label + input trong header
function Control({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-blue-700 font-medium whitespace-nowrap">{label}</span>
      {children}
    </div>
  );
}

export default function MainLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    SEMESTERS,
    REPOSITORIES,
    semesterId,
    changeSemester,
    weeks,
    weekId,
    setWeekId,
    repoId,
    setRepoId,
  } = useApp();

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowUserMenu(false);
  };

  return (
    <div className="min-h-screen flex bg-blue-50/50">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={[
          "bg-gradient-to-b from-blue-100 to-blue-50 border-r border-blue-200/50 p-4 transition-all duration-200 shadow-sm",
          collapsed ? "w-20" : "w-64",
        ].join(" ")}
      >
        {/* Header sidebar + toggle button */}
        <div className="flex items-center justify-between mb-6">
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="font-bold text-lg text-blue-900 whitespace-nowrap">
                Jira-GitHub Export
              </div>
            </div>
          )}
          {collapsed && (
            <div className="font-bold text-lg text-blue-900 text-center w-full">
              JG
            </div>
          )}

          <button
            onClick={() => setCollapsed((v) => !v)}
            className="p-2 rounded-lg hover:bg-blue-200/50 text-blue-700 transition-colors"
            title={collapsed ? "Mở sidebar" : "Thu nhỏ sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
        </div>

        {!collapsed && (
          <div className="text-xs text-blue-600 mb-6 font-medium">Team reporting tool</div>
        )}

        {/* Menu */}
        <nav className="space-y-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              [
                "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                collapsed ? "justify-center" : "gap-3",
                isActive ? linkActive : linkIdle,
              ].join(" ")
            }
            title="Home"
          >
            <Home size={18} />
            {!collapsed && <span>Home</span>}
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              [
                "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                collapsed ? "justify-center" : "gap-3",
                isActive ? linkActive : linkIdle,
              ].join(" ")
            }
            title="Dashboard"
          >
            <LayoutDashboard size={18} />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink
            to="/task-overview"
            className={({ isActive }) =>
              [
                "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                collapsed ? "justify-center" : "gap-3",
                isActive ? linkActive : linkIdle,
              ].join(" ")
            }
            title="Task Overview"
          >
            <ListTodo size={18} />
            {!collapsed && <span>Task Overview</span>}
          </NavLink>

          <NavLink
            to="/commits"
            className={({ isActive }) =>
              [
                "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                collapsed ? "justify-center" : "gap-3",
                isActive ? linkActive : linkIdle,
              ].join(" ")
            }
            title="Commits"
          >
            <GitBranch size={18} />
            {!collapsed && <span>Commits</span>}
          </NavLink>

          <NavLink
            to="/deadlines"
            className={({ isActive }) =>
              [
                "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                collapsed ? "justify-center" : "gap-3",
                isActive ? linkActive : linkIdle,
              ].join(" ")
            }
            title="Deadlines"
          >
            <Calendar size={18} />
            {!collapsed && <span>Deadlines</span>}
          </NavLink>

          <NavLink
            to="/performance"
            className={({ isActive }) =>
              [
                "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                collapsed ? "justify-center" : "gap-3",
                isActive ? linkActive : linkIdle,
              ].join(" ")
            }
            title="Performance"
          >
            <Activity size={18} />
            {!collapsed && <span>Performance</span>}
          </NavLink>
        </nav>
      </aside>

      {/* ================= CONTENT ================= */}
      <div className="flex-1 flex flex-col">
        {/* Header / Command Bar */}
        <header className="h-16 bg-white border-b border-blue-100 shadow-sm">
          <div className="h-full px-6 flex items-center">
            <div className="w-full flex items-center gap-6">
              {/* Search bar */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    className="w-full pl-10 pr-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Center controls */}
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-end gap-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
                  <Control label="Kì học">
                    <select
                      value={semesterId}
                      onChange={(e) => changeSemester(e.target.value)}
                      className="bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all min-w-[180px]"
                    >
                      {SEMESTERS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.start}–{s.end})
                        </option>
                      ))}
                    </select>
                  </Control>

                  <div className="h-8 w-px bg-blue-200" />

                  <Control label="Tuần">
                    <select
                      value={weekId}
                      onChange={(e) => setWeekId(e.target.value)}
                      className="bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all min-w-[200px]"
                    >
                      {weeks.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.label}
                        </option>
                      ))}
                    </select>
                  </Control>

                  <div className="h-8 w-px bg-blue-200" />

                  <Control label="Repo">
                    <select
                      value={repoId}
                      onChange={(e) => setRepoId(e.target.value)}
                      className="bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all min-w-[150px]"
                    >
                      {REPOSITORIES.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </Control>
                </div>
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    console.log("Sync", { semesterId, weekId, repoId });
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                  title={`Sync dữ liệu cho ${semesterId} - ${weekId} - ${repoId}`}
                >
                  <RefreshCw size={16} />
                  <span>Sync</span>
                </button>

                <button
                  onClick={() => {
                    console.log("Export", { semesterId, weekId, repoId });
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow-sm transition-colors"
                  title={`Export dữ liệu cho ${semesterId} - ${weekId} - ${repoId}`}
                >
                  <Download size={16} />
                  <span>Export</span>
                </button>

                <button className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                  <Bell size={20} />
                </button>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    {!collapsed && (
                      <ChevronDown size={16} className={showUserMenu ? "rotate-180" : ""} />
                    )}
                  </button>

                  {/* Dropdown menu */}
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-blue-200 py-2 z-20">
                        <div className="px-4 py-3 border-b border-blue-100">
                          <p className="text-sm font-medium text-blue-900">{user?.name}</p>
                          <p className="text-xs text-blue-600">{user?.email}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main page content - Render children (Home hoặc Dashboard) */}
        <main className="flex-1 p-6 bg-blue-50/30">{children}</main>
      </div>
    </div>
  );
}
