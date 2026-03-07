<<<<<<< HEAD
// MainLayout - Layout chính với Sidebar, Topbar, MobileNav
import { useState } from "react";
import { Sidebar } from "./sidebar.jsx";
import { Topbar } from "./topbar.jsx";
import { MobileNav } from "./mobile-nav.jsx";
=======
// MainLayout - Desktop-only layout with Sidebar and Topbar
import { useState } from "react";
import { Sidebar } from "./sidebar.jsx";
import { Topbar } from "./topbar.jsx";
>>>>>>> recover-local-code

export function MainLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-blue-50/30">
      {/* Sidebar - Desktop only */}
<<<<<<< HEAD
      <aside className="hidden lg:block">
=======
      <aside>
>>>>>>> recover-local-code
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
<<<<<<< HEAD
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
=======
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
>>>>>>> recover-local-code
    </div>
  );
}

<<<<<<< HEAD

=======
>>>>>>> recover-local-code
