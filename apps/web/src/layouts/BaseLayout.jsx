import { NavLink } from "react-router-dom";
import { useState } from "react";
import { TopHeader } from "@/components/layout/TopHeader.jsx";
import { BookOpen, Menu } from "lucide-react";

const linkActive = "bg-teal-50 text-teal-800 shadow-sm font-bold";
const linkIdle = "text-teal-50 hover:bg-teal-700/50 hover:text-white";

export default function BaseLayout({ navConfig, children }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="h-screen flex relative overflow-hidden bg-[#e6f4f1]">
            {/* â•â•â•â• SIDEBAR â•â•â•â• */}
            <aside className={[
                "bg-[#255f58] p-4 transition-all duration-300 shadow-xl z-20 flex flex-col relative rounded-r-3xl my-2 ml-2",
                collapsed ? "w-20" : "w-[260px]",
            ].join(" ")}>
                {/* Logo */}
                <div className="flex items-center justify-between mb-8 px-2 mt-2">
                    {!collapsed && (
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="bg-white p-2 rounded-xl"><BookOpen size={20} className="text-teal-800" /></div>
                            <span className="font-bold text-xl text-white whitespace-nowrap tracking-wide">Devora</span>
                        </div>
                    )}
                    {collapsed && (
                        <div className="w-full flex justify-center">
                            <div className="bg-white p-2 rounded-xl"><BookOpen size={20} className="text-teal-800" /></div>
                        </div>
                    )}
                </div>

                {/* Nav sections */}
                <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {navConfig.map((section) => (
                        <div key={section.label} className="mb-4">
                            {!collapsed && (
                                <div className="text-xs text-teal-400 font-medium px-4 mb-2 whitespace-nowrap uppercase tracking-widest">
                                    {section.label}
                                </div>
                            )}
                            <div className="space-y-1">
                                {section.items.map(({ to, icon: Icon, label, end }) => (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        end={end}
                                        className={({ isActive }) => [
                                            "flex items-center rounded-xl px-4 py-3 text-sm transition-all duration-200",
                                            collapsed ? "justify-center" : "gap-4",
                                            isActive ? linkActive : linkIdle,
                                        ].join(" ")}
                                        title={label}
                                    >
                                        <Icon size={20} />
                                        {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Collapse toggle */}
                <div className="mt-auto pt-4 border-t border-teal-800">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center justify-center p-3 rounded-xl text-teal-100 hover:bg-teal-800/50 hover:text-white transition-colors"
                        title={collapsed ? "Má»Ÿ rá»™ng" : "Thu gá»n"}
                    >
                        <Menu size={20} />
                        {!collapsed && <span className="ml-3 text-sm whitespace-nowrap font-medium">Thu gá»n menu</span>}
                    </button>
                </div>
            </aside>

            {/* â•â•â•â• CONTENT â•â•â•â• */}
            <div className="flex-1 flex flex-col z-10 overflow-hidden relative">
                <div className="p-4 md:p-6 lg:p-8 flex-1 flex flex-col h-full overflow-y-auto w-full max-w-[1600px] mx-auto">
                    <div className="bg-white/95 backdrop-blur-md rounded-[32px] shadow-xl flex-1 flex flex-col overflow-hidden border border-white/40">
                        <TopHeader />
                        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-transparent">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}

