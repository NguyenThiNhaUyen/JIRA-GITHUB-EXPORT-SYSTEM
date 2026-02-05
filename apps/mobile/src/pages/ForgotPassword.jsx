// Mobile Forgot Password Page
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center px-4 safe-top safe-bottom">
            <div className="w-full max-w-md">
                <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-2 text-white mb-6 btn-touch"
                >
                    <ArrowLeft size={20} />
                    <span>Quay lại</span>
                </button>

                <div className="bg-white rounded-2xl shadow-2xl p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Quên mật khẩu</h2>
                    <p className="text-gray-600 mb-6">
                        Nhập email của bạn để nhận link đặt lại mật khẩu
                    </p>

                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
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

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg font-semibold shadow-lg btn-touch"
                            >
                                Gửi link đặt lại mật khẩu
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="text-green-600" size={32} />
                            </div>
                            <p className="text-gray-700 mb-4">
                                Chúng tôi đã gửi link đặt lại mật khẩu đến email <strong>{email}</strong>
                            </p>
                            <button
                                onClick={() => navigate("/login")}
                                className="text-blue-600 hover:underline btn-touch"
                            >
                                Quay lại đăng nhập
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
