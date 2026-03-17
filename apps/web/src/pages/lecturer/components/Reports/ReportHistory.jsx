import { SearchX, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";

export function ReportHistory({ myReports, success }) {
  return (
    <div className="lg:col-span-4 space-y-8">
      <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 py-5 px-6">
          <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Lịch sử xuất</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {myReports.map(ex => (
            <div key={ex.id} className="p-5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-black text-gray-800 uppercase tracking-tight">{ex.type || "Báo cáo"}</p>
                <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md uppercase">{ex.format}</span>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{ex.fileName || "N/A"} • {new Date(ex.createdAt).toLocaleString("vi-VN")}</p>
              <div className="mt-3 flex gap-2">
                {ex.fileUrl ? (
                  <a href={ex.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center h-8 rounded-lg text-teal-600 bg-teal-50 hover:bg-teal-100 text-[10px] font-black uppercase tracking-widest px-4 transition-all">Tải xuống</a>
                ) : (
                  <span className="text-[9px] text-amber-600 font-bold">Đang xử lý...</span>
                )}
              </div>
            </div>
          ))}
          {myReports.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <SearchX size={32} className="text-gray-300" />
              <p className="text-sm text-gray-500 font-black uppercase tracking-widest text-[10px]">Chưa có lịch sử</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4"><RefreshCcw size={24} className="text-indigo-600 animate-spin-slow" /></div>
          <h4 className="font-black text-gray-800 text-sm uppercase tracking-widest mb-2">Đồng bộ tự động</h4>
          <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6">Dữ liệu được làm mới mỗi 15 phút từ Jira & GitHub.</p>
          <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-100 border-0" onClick={() => success("Đã bắt đầu đồng bộ dữ liệu")}>Sync Now</Button>
        </div>
      </Card>
    </div>
  );
}
