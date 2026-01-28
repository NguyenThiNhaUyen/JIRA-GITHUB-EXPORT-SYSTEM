// StudentDashboard: Dashboard cho vai trò STUDENT
import { useAuth } from "../context/AuthContext.jsx";
import { Button } from "../components/ui/button.jsx";

export default function StudentDashboard() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-green-200 p-8 mb-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-green-900 mb-2">Student Dashboard</h1>
              <p className="text-green-700">Chào mừng, {user?.name}!</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Đăng xuất
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="text-green-900 font-semibold text-lg mb-2">Vai trò</div>
              <div className="text-green-700 text-2xl font-bold">{user?.role}</div>
            </div>
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="text-green-900 font-semibold text-lg mb-2">Email</div>
              <div className="text-green-700">{user?.email}</div>
            </div>
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="text-green-900 font-semibold text-lg mb-2">User ID</div>
              <div className="text-green-700">{user?.id}</div>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h2 className="text-xl font-semibold text-green-900 mb-4">Quyền hạn Student</h2>
            <ul className="space-y-2 text-green-700">
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Xem task cá nhân
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Báo cáo tiến độ
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Xem deadline
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Export báo cáo cá nhân
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
