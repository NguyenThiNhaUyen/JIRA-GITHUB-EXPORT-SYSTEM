// Login page - Updated with theme consistency
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 drop-shadow-sm">
            Project-Based Learning
          </h1>
          <p className="text-gray-700 font-medium">Hệ thống quản lý học tập dự án</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="text-center text-2xl font-bold">Đăng nhập</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>

              {error && (
                <Alert variant="error">
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="text-center text-sm text-gray-700 font-semibold">
                Đăng nhập nhanh:
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  onClick={() => quickLogin("admin@gmail.com")}
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 border-0"
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  onClick={() => quickLogin("lecturer@gmail.com")}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 border-0"
                >
                  Lecturer
                </Button>
                <Button
                  type="button"
                  onClick={() => quickLogin("student@gmail.com")}
                  disabled={loading}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 border-0"
                >
                  Student
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center space-y-2">
              <div className="text-xs text-gray-600">
                <strong>Tài khoản mẫu:</strong><br />
                admin@gmail.com / 123456<br />
                lecturer@gmail.com / 123456<br />
                student@gmail.com / 123456
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline font-semibold inline-block"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

