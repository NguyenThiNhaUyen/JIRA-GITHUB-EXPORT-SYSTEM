// Login page - Admin Teal theme with glassmorphism and cut-out layout
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Alert } from "@/components/ui/Interactive.jsx";
import { BookOpen, Shield, GraduationCap, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const quickLogin = async (role) => {
    setError("");
    // Tài khoản mặc định BE seed — xem Program.cs
    const QUICK_CREDS = {
      admin: { email: "admin@truonghoc.com", password: "Admin@123" },
      lecturer: { email: "gv@fpt.edu.vn", password: "Lecturer@123" },
      student: { email: "sv@fpt.edu.vn", password: "Student@123" },
    };
    const creds = QUICK_CREDS[role];
    const result = await login(creds.email, creds.password);
    if (result.success) {
      navigate(result.redirectPath);
    } else {
      setError(result.error || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#e6f4f1] p-4 sm:p-6 lg:p-8 relative overflow-hidden">

      {/* Background spots */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden mix-blend-multiply">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-teal-100 rounded-full filter blur-[150px] opacity-70"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-100 rounded-full filter blur-[150px] opacity-60"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1000px] h-full max-h-[700px] mx-auto bg-white rounded-[40px] shadow-2xl flex flex-col md:flex-row p-2">

        {/* Left Form Section */}
        <div className="w-full md:w-1/2 h-full p-8 md:p-12 flex flex-col justify-center relative bg-white rounded-l-[36px]">
          <div className="absolute top-8 left-8 flex items-center gap-3">
            <BookOpen size={24} className="text-teal-700 font-bold" />
            <div className="font-bold text-xl text-gray-800">
              Devora
            </div>
          </div>

          <div className="max-w-[400px] w-full mx-auto mt-10 text-gray-900">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng</h1>
            <p className="text-gray-500 mb-8 text-sm">Vui lòng nhập thông tin tài khoản của bạn</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  required
                  disabled={loading}
                  className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu của bạn"
                    required
                    disabled={loading}
                    className="w-full px-5 py-3.5 pr-12 bg-gray-50/50 border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors bg-transparent border-none outline-none p-1"
                    tabIndex="-1"
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="error" className="py-2 px-4 rounded-xl text-sm bg-red-50 border-red-200 text-red-600">
                  {error}
                </Alert>
              )}

              <div className="flex items-center justify-between px-2 pt-2 pb-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                  <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Duy trì đăng nhập</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-teal-600 hover:text-teal-700 font-semibold transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#46867d] hover:bg-[#386d65] text-white font-bold py-4 rounded-md shadow-md hover:shadow-lg transition-all text-sm"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>

            <div className="mt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px bg-gray-100 flex-1"></div>
                <span className="text-xs text-gray-400 font-bold">Đăng nhập nhanh</span>
                <div className="h-px bg-gray-100 flex-1"></div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => quickLogin("admin")}
                  disabled={loading}
                  title="Admin — admin@truonghoc.com"
                  className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 hover:shadow-sm transition-all shadow-sm"
                >
                  <Shield size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin("lecturer")}
                  disabled={loading}
                  title="Giảng viên"
                  className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 hover:shadow-sm transition-all shadow-sm"
                >
                  <BookOpen size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin("student")}
                  disabled={loading}
                  title="Sinh viên"
                  className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 hover:shadow-sm transition-all shadow-sm"
                >
                  <GraduationCap size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Info Section */}
        <div className="hidden md:flex w-1/2 h-full bg-gradient-to-b from-[#255f58] to-[#1a413d] rounded-[36px] p-10 lg:p-14 flex-col relative text-white overflow-hidden shadow-inner border border-[#2c6e66]">

          <div className="relative z-10 max-w-lg mt-10">
            <h2 className="text-4xl lg:text-5xl font-bold leading-snug mb-8">
              Hệ thống quản lý<br />dự án học tập
            </h2>
          </div>

          <div className="relative mb-auto z-10 mt-4">
            <svg className="w-10 h-10 text-teal-400/80 mb-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-xl text-teal-50/90 font-medium leading-relaxed max-w-[90%]">
              "Trải nghiệm phương thức hiện đại, tối ưu và hiệu quả cao để quản lý các lớp học và theo dõi tiến trình giáo dục của bạn."
            </p>
          </div>

          {/* The overlapped white card (Cut-out effect corner) */}
          <div className="absolute bottom-0 right-0 w-[85%] max-w-[320px] bg-white rounded-tl-[40px] p-6 pb-6 z-20 shadow-2xl text-black">
            {/* Top concave corner */}
            <div className="absolute right-0 w-[40px] h-[40px]" style={{ bottom: '100%', background: 'radial-gradient(circle at top left, transparent 40px, white 41px)' }} />
            {/* Left concave corner */}
            <div className="absolute bottom-0 w-[40px] h-[40px]" style={{ right: '100%', background: 'radial-gradient(circle at top left, transparent 40px, white 41px)' }} />

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-teal-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">Education Management System</h3>
                <p className="text-[10px] text-gray-500 mt-1 font-medium truncate">
                  Nền tảng Quản lý Giáo dục
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






