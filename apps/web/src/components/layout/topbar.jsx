// Topbar - Header với search, filters, actions
import { Search, RefreshCw, Download, Bell, LogOut, ChevronDown } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/input.jsx";
import { Select } from "../ui/select.jsx";
import { Button } from "../ui/button.jsx";
import { cn } from "../../lib/utils.js";

function Control({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-blue-700 font-medium whitespace-nowrap">{label}</span>
      {children}
    </div>
  );
}

export function Topbar() {
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
    <header className="h-16 bg-white border-b border-blue-100 shadow-sm sticky top-0 z-10">
      <div className="h-full px-6 flex items-center gap-6">
        {/* Search */}
        <div className="flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
            <Input
              type="text"
              placeholder="Search tasks..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Center controls */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-end gap-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
            <Control label="Kì học">
              <Select
                value={semesterId}
                onChange={(e) => changeSemester(e.target.value)}
                className="min-w-[180px]"
              >
                {SEMESTERS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Control>

            <div className="h-8 w-px bg-blue-200" />

            <Control label="Tuần">
              <Select
                value={weekId}
                onChange={(e) => setWeekId(e.target.value)}
                className="min-w-[200px]"
              >
                {weeks.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </Select>
            </Control>

            <div className="h-8 w-px bg-blue-200" />

            <Control label="Repo">
              <Select
                value={repoId}
                onChange={(e) => setRepoId(e.target.value)}
                className="min-w-[160px]"
              >
                {REPOSITORIES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </Control>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log("Sync")}
          >
            <RefreshCw size={16} className="mr-2" />
            <span>Sync</span>
          </Button>

          <Button
            size="sm"
            onClick={() => console.log("Export")}
          >
            <Download size={16} className="mr-2" />
            <span>Export</span>
          </Button>

          <button className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" aria-label="Notifications">
            <Bell size={20} />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <ChevronDown size={16} className={cn(showUserMenu && "rotate-180")} />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
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
    </header>
  );
}

