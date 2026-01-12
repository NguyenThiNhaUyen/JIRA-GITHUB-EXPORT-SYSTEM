/**
 * Kết nối với:
 * - layouts/MainLayout.jsx: Được render như children trong MainLayout
 * - App.jsx: Route "/" render component này
 * Lưu ý: Trang này không sử dụng global state từ context
 */
export default function Home() {
  return (
    <div className="space-y-6">
      {/* Card giới thiệu và buttons kết nối */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold">Home</h1>
        <p className="text-gray-600 mt-2">
          Chào mừng bạn đến Jira–GitHub Export Tool. Kết nối Jira + Repo để sync dữ liệu và xuất báo cáo.
        </p>

        {/* Buttons kết nối (TODO: Implement logic kết nối thực tế) */}
        <div className="mt-6 flex gap-3">
          <button className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800">
            Connect Jira
          </button>
          <button className="px-4 py-2 rounded-xl bg-white border hover:bg-gray-50">
            Connect GitHub
          </button>
        </div>
      </div>

      {/* Grid thống kê tổng quan */}
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard title="Projects" value="1" desc="Project đang theo dõi" />
        <StatCard title="Students" value="5" desc="Thành viên trong team" />
        <StatCard title="Last Sync" value="—" desc="Chưa sync" />
      </div>
    </div>
  );
}

/**
 * StatCard Component - Hiển thị thẻ thống kê
 * Component tái sử dụng để hiển thị thông tin thống kê
 */
function StatCard({ title, value, desc }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      <div className="text-xs text-gray-500 mt-2">{desc}</div>
    </div>
  );
}
