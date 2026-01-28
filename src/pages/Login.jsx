// Login page - Updated with theme consistency
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Alert } from "../components/ui/interactive.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(email, password);
    if (result.success) {
      navigate(result.redirectPath);
    } else {
      setError(result.error || "Đăng nhập thất bại");
    }
  };

  const quickLogin = async (roleEmail) => {
    setError("");
    const result = await login(roleEmail, "123456");
    if (result.success) {
      navigate(result.redirectPath);
    } else {
      setError(result.error || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project-Based Learning</h1>
          <p className="text-gray-600">Hệ thống quản lý học tập dự án</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Đăng nhập</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email"
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập password"
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {error && (
                <Alert variant="error">
                  {error}
                </Alert>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="text-center text-sm text-gray-600 font-medium">
                Đăng nhập nhanh:
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin("admin@gmail.com")}
                  disabled={loading}
                  className="text-xs"
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin("lecturer@gmail.com")}
                  disabled={loading}
                  className="text-xs"
                >
                  Lecturer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin("student@gmail.com")}
                  disabled={loading}
                  className="text-xs"
                >
                  Student
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center space-y-2">
              <div className="text-xs text-gray-600">
                <strong>Tài khoản mẫu:</strong><br/>
                admin@gmail.com / 123456<br/>
                lecturer@gmail.com / 123456<br/>
                student@gmail.com / 123456
              </div>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                Quên mật khẩu?
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

