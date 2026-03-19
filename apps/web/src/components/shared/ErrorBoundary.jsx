import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-12 bg-gray-50/50 rounded-[44px] border border-gray-100 border-dashed animate-in fade-in duration-500">
          <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 mb-8 shadow-xl shadow-red-100/50">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-4 font-display">Oops! Đã có sự cố xảy ra</h2>
          <p className="text-gray-400 text-sm font-bold max-w-md text-center leading-relaxed mb-10">
            Chúng tôi rất tiếc vì sự gián đoạn này. Một thành phần của hệ thống đang gặp lỗi xử lý nhưng bạn vẫn có thể quay lại trang Dashboard chính.
          </p>
          <div className="flex gap-4">
            <Button 
                variant="outline"
                className="rounded-2xl border-gray-200 h-14 px-8 font-black text-[11px] hover:bg-white transition-all shadow-sm"
                onClick={() => window.location.reload()}
            >
                <RotateCcw size={18} className="mr-2" /> Thử tải lại trang
            </Button>
            <Button 
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-14 px-10 font-black text-[11px] shadow-xl shadow-teal-100 border-0 transition-all hover:scale-105"
                onClick={() => {
                    this.setState({ hasError: false });
                    window.location.href = "/";
                }}
            >
                Quay về Trang chủ
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
