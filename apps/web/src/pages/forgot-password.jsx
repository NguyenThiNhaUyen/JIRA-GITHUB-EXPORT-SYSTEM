// Forgot Password page - Matching login theme with gradient design
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Alert } from "../components/ui/interactive.jsx";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

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
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Back to Login Button */}
                <Button
                    variant="ghost"
                    onClick={handleBackToLogin}
                    className="mb-4 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại đăng nhập
                </Button>

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 drop-shadow-sm">
                        Project-Based Learning
                    </h1>
                    <p className="text-gray-700 font-medium">Khôi phục mật khẩu</p>
                </div>

                <Card className="shadow-2xl border-0">
                    <CardHeader className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-t-lg">
                        <CardTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
                            <Mail className="w-6 h-6" />
                            Quên mật khẩu
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <p className="text-sm text-gray-600 mb-4 text-center">
                                        Nhập email của bạn để nhận link khôi phục mật khẩu
                                    </p>
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
                                    {loading ? "Đang gửi..." : "Gửi link khôi phục"}
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center space-y-4 py-4">
                                <div className="flex justify-center">
                                    <div className="bg-green-100 rounded-full p-3">
                                        <CheckCircle className="w-12 h-12 text-green-600" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Email đã được gửi!</h3>
                                <p className="text-gray-600">
                                    Chúng tôi đã gửi link khôi phục mật khẩu đến email:
                                </p>
                                <p className="font-semibold text-indigo-600">{email}</p>
                                <p className="text-sm text-gray-500">
                                    Vui lòng kiểm tra hộp thư đến (hoặc spam) và làm theo hướng dẫn.
                                </p>
                                <Button
                                    onClick={handleBackToLogin}
                                    className="mt-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    Quay lại đăng nhập
                                </Button>
                            </div>
                        )}

                        {!isSubmitted && (
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Nhớ mật khẩu rồi?{" "}
                                    <button
                                        type="button"
                                        onClick={handleBackToLogin}
                                        className="text-indigo-600 hover:text-indigo-700 hover:underline font-semibold"
                                    >
                                        Đăng nhập ngay
                                    </button>
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="mt-6 text-center text-xs text-gray-600 bg-white/50 backdrop-blur-sm rounded-lg p-3">
                    <p>
                        💡 <strong>Lưu ý:</strong> Link khôi phục sẽ hết hạn sau 1 giờ.
                    </p>
                </div>
            </div>
        </div>
    );
}
