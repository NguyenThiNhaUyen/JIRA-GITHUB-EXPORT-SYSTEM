import { Eye, ExternalLink, Users, CalendarDays, Star, RefreshCcw, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";

export function SrsReviewPanel({
  selectedSrs,
  feedbackText,
  setFeedbackText,
  scoreValue,
  setScoreValue,
  handleReview,
  reviewMutation
}) {
  return (
    <div className="xl:col-span-4 space-y-8">
      <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white sticky top-8">
        <CardHeader className="border-b border-gray-50 py-6 px-8 flex justify-between items-center">
          <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest">Chi tiết thẩm định</CardTitle>
          {selectedSrs?.fileUrl && (
            <Button variant="outline" onClick={() => window.open(selectedSrs.fileUrl, '_blank')} className="rounded-xl h-9 px-4 text-[9px] font-black uppercase tracking-widest border-teal-100 text-teal-600 hover:bg-teal-50">
              <ExternalLink size={12} className="mr-1.5" /> Xem File
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {!selectedSrs ? (
            <div className="py-20 text-center opacity-30">
              <Eye size={48} className="mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Chọn một bản nộp để review</p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-gray-800 tracking-tighter uppercase leading-tight mb-2">{selectedSrs.teamName}</h3>
                  <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Users size={12} /> {selectedSrs.leaderName}</span>
                    <span className="flex items-center gap-1.5"><CalendarDays size={12} /> {new Date(selectedSrs.submittedAt || selectedSrs.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>

                <div className="p-5 rounded-[24px] bg-gray-50 border border-gray-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bản đặc tả:</span>
                    <span className="text-[10px] font-black text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-widest">ISO 29148 Standard</span>
                  </div>
                  <p className="text-xs font-bold text-gray-600 leading-relaxed italic">"{selectedSrs.projectName}"</p>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Điểm Review (0-10)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="10"
                      value={scoreValue}
                      onChange={e => setScoreValue(e.target.value)}
                      className="w-full h-14 rounded-[20px] bg-gray-50 border border-gray-100 px-6 text-base font-black text-amber-600 focus:ring-4 focus:ring-teal-50 focus:border-teal-500 outline-none transition-all pr-12"
                    />
                    <Star size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 fill-amber-400" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phản hồi của Giảng viên</label>
                  <textarea
                    rows={6}
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                    placeholder="Nhập nội dung góp ý hoặc lý do yêu cầu sửa đổi..."
                    className="w-full rounded-[24px] bg-gray-50 border border-gray-100 p-6 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-teal-50 focus:border-teal-500 outline-none transition-all resize-none placeholder:text-gray-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button
                    onClick={() => handleReview("NEED_REVISION")}
                    disabled={reviewMutation.isPending}
                    className="h-16 rounded-[24px] bg-amber-500 hover:bg-amber-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-amber-100 border-0 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    Yêu cầu sửa
                  </Button>
                  <Button
                    onClick={() => handleReview("FINAL")}
                    disabled={reviewMutation.isPending}
                    className="h-16 rounded-[24px] bg-teal-600 hover:bg-teal-700 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-teal-100 border-0 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    {reviewMutation.isPending ? <RefreshCcw className="animate-spin mr-2" size={14} /> : <CheckCircle size={16} className="mr-2" />} Duyệt Final
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
