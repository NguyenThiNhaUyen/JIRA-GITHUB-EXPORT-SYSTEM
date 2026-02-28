// Forgot Password page - Admin Teal theme with glassmorphism and cut-out layout
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { Alert } from "../components/ui/interactive.jsx";
import { Mail, ArrowLeft, CheckCircle, Shield, GraduationCap } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            if (email) {
                setIsSubmitted(true);
            } else {
                setError("Vui lòng nhập email hợp lệ");
            }
            setLoading(false);
        }, 1000);
    };

    const handleBackToLogin = () => {
        navigate("/login");
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
                        <button
                            onClick={handleBackToLogin}
                            className="bg-teal-50 p-2 rounded-xl border border-teal-100 text-teal-700 hover:bg-teal-100 transition-colors flex items-center gap-2 group"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div className="font-bold text-xl text-teal-900 tracking-wide cursor-pointer" onClick={handleBackToLogin}>
                            Quay lại đăng nhập
                        </div>
                    </div>

                    <div className="max-w-[400px] w-full mx-auto mt-6 text-gray-900">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2 mt-2">Khôi phục mật khẩu</h1>
                        <p className="text-gray-500 mb-6 text-sm">Hệ thống quản lý dự án học tập</p>

                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100 mb-6 flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        Vui lòng nhập địa chỉ email đã đăng ký của bạn. Chúng tôi sẽ gửi một liên kết để bạn có thể đặt lại mật khẩu mới.
                                    </p>
                                </div>

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

                                {error && (
                                    <Alert variant="error" className="py-2 px-4 rounded-xl text-sm bg-red-50 border-red-200 text-red-600">
                                        {error}
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-full shadow-[0_4px_15px_rgba(13,148,136,0.3)] hover:shadow-[0_6px_20px_rgba(13,148,136,0.4)] transition-all duration-300 text-sm mt-4"
                                >
                                    {loading ? "Đang gửi..." : "Gửi link khôi phục"}
                                </Button>

                                <div className="mt-6 text-center text-xs text-gray-500 pt-4">
                                    <p>
                                        💡 <span className="font-semibold text-gray-600">Lưu ý:</span> Link khôi phục sẽ hết hạn sau 1 giờ.
                                    </p>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center space-y-5 py-6">
                                <div className="flex justify-center mb-6">
                                    <div className="bg-teal-50 rounded-full p-4 border border-teal-100 shadow-inner">
                                        <CheckCircle className="w-16 h-16 text-teal-500" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">Email đã được gửi!</h3>
                                <div className="bg-white/50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-gray-600 text-sm mb-2">
                                        Chúng tôi đã gửi link khôi phục mật khẩu đến:
                                    </p>
                                    <p className="font-bold text-teal-700 text-lg">{email}</p>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed px-4">
                                    Vui lòng kiểm tra hộp thư đến (hoặc thư mục spam) và làm theo hướng dẫn trong email để đặt lại mật khẩu của bạn.
                                </p>
                                <div className="pt-4">
                                    <Button
                                        onClick={handleBackToLogin}
                                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-full shadow-md transition-all duration-300 text-sm"
                                    >
                                        Quay lại đăng nhập
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Info Section (Dark Teal Solid Background with cut out) */}
                <div className="hidden md:flex w-[45%] h-full bg-gradient-to-br from-[#134e4a] via-[#0f5864] to-[#042f2e] rounded-[32px] p-10 lg:p-12 flex-col relative text-white border border-teal-800/30 shadow-inner overflow-hidden">

                    <div className="relative z-10 max-w-lg mt-2 mb-8">
                        <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                            Bảo mật tài khoản<br />của bạn.
                        </h2>
                    </div>

                    <div className="relative mb-auto z-10">
                        <Shield className="w-10 h-10 text-teal-300 mb-6 opacity-80" />
                        <p className="text-xl lg:text-2xl text-teal-50 font-medium leading-relaxed mb-6">
                            "Chúng tôi cam kết bảo vệ thông tin và dữ liệu học tập của bạn ở mức cao nhất. Khôi phục quyền truy cập nhanh chóng và an toàn."
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
                            <path fill="currentColor" d="M100 0C100 55.2285 55.2285 100 0 100C55.2285 100 144.772 100 200C100 144.772 144.772 100 200 100C144.772 100 100 55.2285 100 0Z" />
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
