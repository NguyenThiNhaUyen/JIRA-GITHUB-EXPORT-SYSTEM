// MainLayout - Desktop-only layout with Sidebar and Topbar
import { useState } from "react";
import { Sidebar } from "./sidebar.jsx";
import { Topbar } from "./topbar.jsx";

export function MainLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-blue-50/30">
      {/* Sidebar - Desktop only */}
      <aside>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

