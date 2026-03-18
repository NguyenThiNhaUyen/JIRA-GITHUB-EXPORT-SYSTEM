import { FileText, Download, RefreshCw } from"lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from"@/components/ui/Card.jsx";
import { Button } from"@/components/ui/Button.jsx";
import { StatusBadge } from"@/components/shared/Badge.jsx";

export function SrsSubmissions({ loadingSrs, srsReports, onUploadModalOpen }) {
 return (
 <Card className="border border-gray-100 shadow-sm rounded-[44px] overflow-hidden bg-white">
 <CardHeader className="border-b border-gray-50/50 py-10 px-12 flex justify-between items-center bg-gray-50/10">
 <CardTitle className="text-xs font-black text-gray-400 font-display">Bản nộp tài liệu SRS (Software Requirements Specification)</CardTitle>
 <Button onClick={onUploadModalOpen} className="bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-[20px] h-12 px-8 text-[11px] font-black border border-teal-100 transition-all font-display hover:scale-105 active:scale-95 shadow-sm">Submit New</Button>
 </CardHeader>
 <CardContent className="p-0">
 {loadingSrs ? (
 <div className="py-32 text-center space-y-4">
 <FileText className="mx-auto text-gray-100 animate-bounce" size={48}/>
 <p className="text-[11px] font-black text-gray-300">Đang tải tài liệu...</p>
 </div>
 ) : srsReports.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-36 gap-8 text-center bg-gray-50/5">
 <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center text-gray-100 border border-gray-50 shadow-inner">
 <FileText size={48} />
 </div>
 <p className="text-[11px] font-black text-gray-400 tracking-[0.3em] leading-relaxed">Chưa có tài liệu nào được nộp.<br/>Phân loại SRS là bắt buộc để giảng viên duyệt.</p>
 </div>
 ) : (
 <div className="divide-y divide-gray-50">
 {srsReports.map((rpt, idx) => (
 <div key={rpt.id} className="p-10 px-12 flex items-center justify-between hover:bg-gray-50/50 group transition-all animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
 <div className="flex items-center gap-10">
 <div className="w-16 h-16 rounded-[28px] bg-white border border-gray-100 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-xl group-hover:scale-110">
 <FileText size={32} />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-4 mb-3">
 <p className="text-base font-black text-gray-800 tracking-tight font-display">{rpt.fileName || `SRS_Version_${rpt.version}.pdf`}</p>
 <StatusBadge status={rpt.status === 'FINAL' ? 'success' : 'warning'} label={rpt.status} variant={rpt.status === 'FINAL' ? 'success' : 'warning'} />
 </div>
 <p className="text-[11px] text-gray-400 font-bold bg-white border border-gray-100 px-3 py-1 rounded-xl shadow-sm inline-flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
 Đã nộp: {new Date(rpt.submittedAt).toLocaleString("vi-VN")}
 </p>
 
 {rpt.feedback && (
 <div className="mt-5 bg-indigo-50/30 border border-indigo-100/50 p-6 rounded-[24px] max-w-lg relative overflow-hidden group/feedback">
 <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 group-hover/feedback:w-2 transition-all" />
 <p className="text-[11px] font-black text-indigo-400 mb-2 opacity-60">Phản hồi từ giảng viên</p>
 <p className="text-sm font-bold text-indigo-800 leading-relaxed italic">"{rpt.feedback}"</p>
 </div>
 )}
 </div>
 </div>
 <div className="flex items-center gap-6 shrink-0">
 <Button 
 variant="outline" 
 className="rounded-[24px] h-14 px-10 text-[11px] font-black border-gray-100 bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 hover:shadow-2xl transition-all font-display shadow-sm active:scale-95"
 onClick={() => rpt.fileUrl && window.open(rpt.fileUrl, '_blank')}
 >
 <Download size={18} className="mr-3"/> Tải xuống
 </Button>
 <div className="w-2 h-2 rounded-full {rpt.status === 'FINAL' ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'} shadow-lg" />
 </div>
 </div>
 ))}
 </div>
 )}
 </CardContent>
 </Card>
 );
}






