import { Link, useLocation } from "react-router-dom";

export function Footer() {
  const { pathname } = useLocation();

  const links = [
    { label: "Trang chủ", to: "/" },
    { label: "Giới thiệu", to: "/about" },
    { label: "Liên hệ", to: "/contact" },
    { label: "Chính sách", to: "/policy" },
  ];

  return (
    <footer className="mt-auto">
      {/* Accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400" />

      <div className="bg-gradient-to-r from-white via-blue-50/70 to-white border-t border-blue-100">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Brand */}
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow ring-1 ring-blue-100" />
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  Project-Based Learning
                </div>
                <div className="text-sm text-slate-600">
                  Hệ thống quản lý học tập theo dự án
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-wrap gap-2">
              {links.map((item) => {
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition
                      ${
                        active
                          ? "bg-gradient-to-r from-indigo-500 to-cyan-400 text-white shadow"
                          : "bg-white/70 text-slate-700 border border-blue-100 hover:border-blue-200 hover:shadow-sm"
                      }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Meta */}
            <div className="flex flex-col items-start gap-2 lg:items-end">
              <div className="text-sm text-slate-700">
                © 2026 FPT University
              </div>
              <div className="flex gap-2 text-xs text-slate-500">
                <span className="px-3 py-1 rounded-full bg-white/70 border border-blue-100 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  System Online
                </span>
                <span className="px-3 py-1 rounded-full bg-white/70 border border-blue-100">
                  v1.0.0
                </span>
              </div>
            </div>
          </div>

          {/* Bottom note */}
          <div className="mt-6 pt-4 border-t border-blue-100 flex flex-col gap-2 text-xs text-slate-500 lg:flex-row lg:justify-between">
            <span>
              Gợi ý: Tối ưu trải nghiệm học theo dự án với Jira & GitHub tích hợp.
            </span>
            <span>Built with Vite + React</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
