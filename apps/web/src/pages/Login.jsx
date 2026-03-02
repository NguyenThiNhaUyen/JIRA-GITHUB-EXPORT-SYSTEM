// Login page - Admin Teal theme with glassmorphism and cut-out layout
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Button } from "../components/ui/button.jsx";
import { Alert } from "../components/ui/interactive.jsx";
import { BookOpen, Shield, GraduationCap } from "lucide-react";

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
    <div className="h-screen w-screen flex items-center justify-center bg-[#f0fdfa] p-4 sm:p-6 lg:p-8 relative overflow-hidden">

      {/* Blurred background spots for glow - Light Teal/Cyan */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden mix-blend-multiply">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-teal-200 rounded-full filter blur-[150px] opacity-70"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-200 rounded-full filter blur-[150px] opacity-60"></div>
        <div className="absolute top-[20%] right-[20%] w-[40vw] h-[40vw] bg-emerald-100 rounded-full filter blur-[120px] opacity-50"></div>
      </div>

      {/* Main Container - White Glassmorphism */}
      <div className="relative z-10 w-full max-w-6xl h-full max-h-[850px] mx-auto bg-white/70 backdrop-blur-3xl rounded-[40px] shadow-2xl flex flex-col md:flex-row border border-white p-2 md:p-3">

        {/* Left Form Section */}
        <div className="w-full md:w-[55%] h-full p-6 md:p-10 lg:p-12 flex flex-col justify-center relative overflow-y-auto scrollbar-hide">
          <div className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-3">
            <div className="bg-teal-50 p-2 rounded-xl border border-teal-100">
              <BookOpen size={24} className="text-teal-700 font-bold" />
            </div>
            <div className="font-bold text-2xl text-teal-900 tracking-wide">
              Devora
            </div>
          </div>

          <div className="max-w-[400px] w-full mx-auto mt-6 text-gray-900">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 mt-2">Chào mừng</h1>
            <p className="text-gray-500 mb-6 text-sm">Vui lòng nhập thông tin tài khoản của bạn</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  required
                  disabled={loading}
                  className="w-full px-5 py-4 bg-white/80 border border-teal-100 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu của bạn"
                  required
                  disabled={loading}
                  className="w-full px-5 py-4 bg-white/80 border border-teal-100 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm shadow-sm"
                />
              </div>

              {error && (
                <Alert variant="error" className="py-2 px-4 rounded-xl text-sm bg-red-50 border-red-200 text-red-600">
                  {error}
                </Alert>
              )}

              <div className="flex items-center justify-between px-2 pt-1 pb-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 focus:ring-offset-0" />
                  <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Duy trì đăng nhập</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-teal-600 hover:text-teal-700 hover:underline font-semibold transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-full shadow-[0_4px_15px_rgba(13,148,136,0.3)] hover:shadow-[0_6px_20px_rgba(13,148,136,0.4)] transition-all duration-300 text-sm"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px bg-teal-100 flex-1"></div>
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Đăng nhập nhanh</span>
                <div className="h-px bg-teal-100 flex-1"></div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => quickLogin("admin@gmail.com")}
                  disabled={loading}
                  title="Admin"
                  className="w-12 h-12 rounded-full bg-white border border-teal-100 flex items-center justify-center text-teal-700 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 hover:shadow-md transition-all"
                >
                  <Shield size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin("lecturer@gmail.com")}
                  disabled={loading}
                  title="Giảng viên"
                  className="w-12 h-12 rounded-full bg-white border border-teal-100 flex items-center justify-center text-teal-700 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 hover:shadow-md transition-all"
                >
                  <BookOpen size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin("student@gmail.com")}
                  disabled={loading}
                  title="Sinh viên"
                  className="w-12 h-12 rounded-full bg-white border border-teal-100 flex items-center justify-center text-teal-700 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 hover:shadow-md transition-all"
                >
                  <GraduationCap size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Info Section (Dark Teal Solid Background with cut out) */}
        <div className="hidden md:flex w-[45%] h-full bg-gradient-to-br from-[#134e4a] via-[#0f5864] to-[#042f2e] rounded-[32px] p-10 lg:p-12 flex-col relative text-white border border-teal-800/30 shadow-inner overflow-hidden">

          <div className="relative z-10 max-w-lg mt-2 mb-8">
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Hệ thống quản lý dự án học tập
            </h2>
          </div>

          <div className="relative mb-auto z-10">
            <svg className="w-8 h-8 text-teal-300 mb-6 opacity-80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-xl lg:text-2xl text-teal-50 font-medium leading-relaxed mb-6">
              "Trải nghiệm phương thức hiện đại, tối ưu và hiệu quả cao để quản lý các lớp học và theo dõi tiến trình giáo dục của bạn."
            </p>
          </div>

          {/* Abstract background elements inside right panel */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-400 rounded-full mix-blend-overlay filter blur-[100px] opacity-40 translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500 rounded-full mix-blend-overlay filter blur-[80px] opacity-30 -translate-x-1/3 translate-y-1/3"></div>
          </div>

          {/* Abstract pattern inside */}
          <div className="absolute top-[30%] right-[10%] w-64 h-64 pointer-events-none opacity-20">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white">
              <path fill="currentColor" d="M100 0C100 55.2285 55.2285 100 0 100C55.2285 100 100 144.772 100 200C100 144.772 144.772 100 200 100C144.772 100 100 55.2285 100 0Z" />
            </svg>
          </div>

          {/* The overlapped white card (Cut-out effect corner) */}
          <div className="absolute bottom-0 right-0 w-[85%] max-w-[320px] bg-white rounded-tl-[40px] p-6 pb-6 z-20 shadow-2xl text-black">
            {/* Top concave corner */}
            <div className="absolute right-0 w-[40px] h-[40px]" style={{ bottom: '100%', background: 'radial-gradient(circle at top left, transparent 40px, white 41px)' }} />
            {/* Left concave corner */}
            <div className="absolute bottom-0 w-[40px] h-[40px]" style={{ right: '100%', background: 'radial-gradient(circle at top left, transparent 40px, white 41px)' }} />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-teal-600" />
              </div>
              <div className="min-w-0">

                <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">Education Management System</h3>
                <p className="text-[10px] text-gray-500 mt-0.5 font-medium truncate">
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
