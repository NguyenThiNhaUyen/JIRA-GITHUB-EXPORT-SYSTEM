// Footer - App footer with status and quick links
export function Footer() {
  return (
    <footer className="border-t border-blue-100 bg-gradient-to-r from-white via-blue-50 to-white">
      <div className="px-4 lg:px-6 py-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="font-semibold text-blue-900">Project-Based Learning</div>
          <div className="text-xs text-blue-600">Hệ thống quản lý học tập theo dự án</div>
        </div>

        <nav className="flex flex-wrap gap-3 text-sm text-blue-700">
          <a className="hover:text-blue-900" href="#">Trang chủ</a>
          <a className="hover:text-blue-900" href="#">Giới thiệu</a>
          <a className="hover:text-blue-900" href="#">Liên hệ</a>
          <a className="hover:text-blue-900" href="#">Chính sách</a>
        </nav>

        <div className="text-xs text-blue-600 flex flex-wrap items-center gap-2">
          <span>© 2026 FPT University</span>
          <span>• v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
