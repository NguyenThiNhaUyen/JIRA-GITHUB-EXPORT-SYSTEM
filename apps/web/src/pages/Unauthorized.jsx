import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';
import { Button } from "@/components/ui/Button.jsx";

export default function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans selection:bg-teal-100 selection:text-teal-900">
            <div className="max-w-xl w-full text-center relative">
                {/* Decorative background elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-100/30 rounded-full blur-[120px] -z-10 animate-pulse"></div>
                
                <div className="bg-white rounded-[48px] shadow-[0_32px_120px_-20px_rgba(220,38,38,0.12)] border border-red-50 p-12 md:p-16 relative overflow-hidden group">
                    {/* Header Icon */}
                    <div className="mb-10 relative inline-block">
                        <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center text-red-500 shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <ShieldAlert size={48} strokeWidth={1.5} />
                        </div>
                        <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg border border-red-50 flex items-center justify-center text-red-600 animate-bounce">
                            <Lock size={20} strokeWidth={2.5} />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-6">
                        Access <span className="text-red-600">Denied</span>
                    </h1>
                    
                    <p className="text-gray-500 text-lg font-medium leading-relaxed mb-12 max-w-sm mx-auto">
                        Ops! Bạn không có quyền truy cập vào khu vực này. Vui lòng liên hệ Admin nếu bạn tin đây là một sai sót.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button 
                            onClick={() => navigate(-1)}
                            className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-white border border-gray-100 text-gray-800 font-black uppercase tracking-widest text-[10px] shadow-sm hover:bg-gray-50 transition-all active:scale-95"
                        >
                            <ArrowLeft size={16} className="mr-3" /> Quay lại
                        </Button>
                        
                        <Button 
                            onClick={() => navigate('/')}
                            className="w-full sm:w-auto h-14 px-12 rounded-2xl bg-slate-900 border-0 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95"
                        >
                            <Home size={16} className="mr-3" /> Về Trang chủ
                        </Button>
                    </div>

                    {/* Fun extra detail */}
                    <div className="mt-12 pt-10 border-t border-gray-50">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">403 Forbidden Error</p>
                    </div>
                </div>

                {/* Footer credit-ish style */}
                <p className="mt-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest opacity-60">
                    Jira GitHub Export System &copy; 2026
                </p>
            </div>
        </div>
    );
}






