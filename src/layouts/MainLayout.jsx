// MainLayout: Layout chung (Sidebar + Header controls + Main content) - dùng useApp() để lấy state
import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Home,
  LayoutDashboard,
  RefreshCw,
  Download,
} from "lucide-react";
import { useApp } from "../context/AppContext.jsx";

const linkActive = "bg-white/10 text-white";
const linkIdle = "text-white/80 hover:bg-white/10 hover:text-white";

// Control: Wrapper cho label + input trong header
function Control({ label, children }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/70 whitespace-nowrap">{label}</span>
      {children}
    </div>
  );
}

export default function MainLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
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

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={[
          "bg-slate-900 text-white p-4 transition-all duration-200",
          collapsed ? "w-20" : "w-64",
        ].join(" ")}
      >
        {/* Header sidebar + toggle button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="font-bold text-lg whitespace-nowrap">
              {collapsed ? "JG" : "Jira-GitHub Export"}
            </div>
          </div>

          <button
            onClick={() => setCollapsed((v) => !v)}
            className="p-2 rounded-lg hover:bg-white/10"
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
          <div className="text-xs text-white/60 mt-1">Team reporting tool</div>
        )}

        {/* Menu */}
        <nav className="mt-6 space-y-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              [
                "flex items-center rounded-lg px-3 py-2 text-sm transition",
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
                "flex items-center rounded-lg px-3 py-2 text-sm transition",
                collapsed ? "justify-center" : "gap-3",
                isActive ? linkActive : linkIdle,
              ].join(" ")
            }
            title="Dashboard"
          >
            <LayoutDashboard size={18} />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
        </nav>
      </aside>

      {/* ================= CONTENT ================= */}
      <div className="flex-1 flex flex-col">
        {/* Header / Command Bar */}
        <header className="h-20 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-b border-white/10">
          <div className="h-full px-6 flex items-center">
            <div className="w-full max-w-6xl mx-auto flex items-center gap-6">
              {/* Left brand */}
              <div className="flex items-center gap-3 min-w-[220px]">
                <div className="font-semibold text-sm text-white/90">
                  Semester Tool
                  <div className="text-xs font-normal text-white/60">
                    Jira + GitHub reporting
                  </div>
                </div>
              </div>

              {/* Center controls */}
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <Control label="Kì học">
                    <select
                      value={semesterId}
                      onChange={(e) => changeSemester(e.target.value)}
                      className="bg-slate-800/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    >
                      {SEMESTERS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.start}–{s.end})
                        </option>
                      ))}
                    </select>
                  </Control>

                  <div className="h-6 w-px bg-white/20" />

                  <Control label="Tuần">
                    <select
                      value={weekId}
                      onChange={(e) => setWeekId(e.target.value)}
                      className="bg-slate-800/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    >
                      {weeks.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.label}
                        </option>
                      ))}
                    </select>
                  </Control>

                  <div className="h-6 w-px bg-white/20" />

                  <Control label="Repo">
                    <select
                      value={repoId}
                      onChange={(e) => setRepoId(e.target.value)}
                      className="bg-slate-800/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
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

              {/* Divider */}
              <div className="h-10 w-px bg-white/20 mx-2" />

              {/* Right actions */}
              <div className="flex items-center gap-3 min-w-[220px] justify-end">
                <button
                  onClick={() => {
                    // TODO: Implement sync functionality
                    console.log("Sync", { semesterId, weekId, repoId });
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors"
                  title={`Sync dữ liệu cho ${semesterId} - ${weekId} - ${repoId}`}
                >
                  <RefreshCw size={16} />
                  <span>Sync</span>
                </button>

                <button
                  onClick={() => {
                    // TODO: Implement export functionality
                    console.log("Export", { semesterId, weekId, repoId });
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow transition-colors"
                  title={`Export dữ liệu cho ${semesterId} - ${weekId} - ${repoId}`}
                >
                  <Download size={16} />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main page content - Render children (Home hoặc Dashboard) */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
