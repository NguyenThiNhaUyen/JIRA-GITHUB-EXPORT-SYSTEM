// Mobile Login Page - Touch-optimized
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../packages/shared/src/context/AuthContext.jsx";

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
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center px-4 safe-top safe-bottom">
            <div className="w-full max-w-md">
                {/* Logo/Title */}
                <div className="text-center mb-8 animate-slide-up">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <LogIn className="text-blue-600" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">JIRA-GitHub Export</h1>
                    <p className="text-blue-100">Mobile App</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 animate-slide-up">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Đăng nhập</h2>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 btn-touch"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="text-right">
                            <button
                                type="button"
                                onClick={() => navigate("/forgot-password")}
                                className="text-sm text-blue-600 hover:underline btn-touch"
                            >
                                Quên mật khẩu?
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 btn-touch"
                        >
                            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </button>
                    </form>

                    {/* Demo accounts */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center mb-3">Demo accounts:</p>
                        <div className="space-y-2 text-xs text-gray-600">
                            <div className="flex justify-between">
                                <span>Admin:</span>
                                <span className="font-mono">admin@fpt.edu.vn / admin123</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Lecturer:</span>
                                <span className="font-mono">namngv@fpt.edu.vn / lecturer123</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Student:</span>
                                <span className="font-mono">anvse2026001@fpt.edu.vn / student123</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
