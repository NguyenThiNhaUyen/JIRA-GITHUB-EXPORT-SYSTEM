// Unauthorized page - 403 access denied page with theme consistency
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Alert } from "../components/ui/interactive.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Unauthorized() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const redirectTo = location.state?.redirectTo || "/login";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-600">Truy cập bị từ chối</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-gray-700 mb-4">
                Bạn không có quyền truy cập vào trang này.
              </p>
              {user && (
                <div className="mb-4">
                  <span className="text-sm text-gray-500">Vai trò hiện tại: </span>
                  <span className="font-semibold text-gray-900">{user.role}</span>
                </div>
              )}
            </div>

            <Alert variant="warning">
              <strong>Thông báo:</strong> Trang này yêu cầu quyền truy cập cao hơn.
              {user && ` Vai trò của bạn (${user.role}) không đủ quyền để truy cập trang này.`}
            </Alert>

            <div className="space-y-3 mt-6">
              <Button 
                onClick={() => navigate(redirectTo)}
                className="w-full"
              >
                Quay về Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/login")}
                className="w-full"
              >
                Đăng xuất
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Nếu bạn nghĩ đây là lỗi, vui lòng liên hệ quản trị viên hệ thống.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
