import React from "react";
import {
  FileText,
  ExternalLink,
  CheckCircle,
  MessageSquare,
  User,
  Clock,
  Info,
  ChevronRight,
  ShieldCheck,
  Ban
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card.jsx";
import { Button } from "@/components/ui/Button.jsx";

export function SrsDetailPanel({
  selectedSrs,
  feedbackText,
  setFeedbackText,
  onSaveFeedback,
  onUpdateStatus,
  isUpdating,
  statusMeta
}) {
  if (!selectedSrs) {
    return (
      <Card className="rounded-[24px] border border-dashed border-gray-200 shadow-none bg-gray-50/30 h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-[200px]">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-300">
            <Info size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">ChÆ°a chá»n bĂ¡o cĂ¡o</p>
            <p className="text-xs text-gray-400 mt-1">Chá»n má»™t bĂ¡o cĂ¡o tá»« danh sĂ¡ch Ä‘á»ƒ xem chi tiáº¿t vĂ  cháº¥m Ä‘iá»ƒm</p>
          </div>
        </div>
      </Card>
    );
  }

  const status = statusMeta[selectedSrs.status] || statusMeta.DRAFT;

  return (
    <Card className="rounded-[24px] border border-gray-100 shadow-xl bg-white sticky top-6 overflow-hidden animate-in slide-in-from-right duration-300">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-5 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-200">
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <CardTitle className="text-base font-black text-gray-800">Chi tiáº¿t SRS</CardTitle>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${status.dot} animate-pulse`} />
              <span className="text-[10px] font-bold text-gray-400">{status.label}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
        {/* Project Info Section */}
        <div className="p-6 space-y-5">
          <div className="space-y-4">
            <div className="group">
              <label className="text-[10px] font-bold text-gray-400 mb-1.5 block">NhĂ³m & Leader</label>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
                  <User size={14} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{selectedSrs.teamName}</p>
                  <p className="text-[11px] text-gray-500 font-medium">Leader: {selectedSrs.leader || "â€”"}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-gray-400 mb-1 block">MĂ´n há»c</label>
                  <p className="text-[11px] font-bold text-gray-700">{selectedSrs.courseCode}</p>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-400 mb-1 block">Milestone</label>
                  <p className="text-[11px] font-bold text-gray-700">{selectedSrs.milestone || "N/A"}</p>
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-400 mb-1 block">Dá»± Ă¡n</label>
                <p className="text-[11px] font-medium text-gray-600 line-clamp-2 leading-relaxed">
                  {selectedSrs.projectName}
                </p>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 mb-2 block">TĂ i liá»‡u Ä‘Ă­nh kĂ¨m</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-10 border-teal-100 text-teal-700 hover:bg-teal-50 text-[11px] font-bold shadow-sm"
                  onClick={() => window.open(selectedSrs.fileUrl || '#', '_blank')}
                >
                  <ExternalLink size={14} className="mr-2" /> Xem trá»±c tuyáº¿n
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Grading and Feedback Section */}
        <div className="px-6 pb-6 pt-2 border-t border-gray-100 bg-gray-50/30">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-4 bg-teal-500 rounded-full" />
            <h4 className="text-xs font-black text-gray-800">Pháº£n há»“i cá»§a giáº£ng viĂªn</h4>
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Nháº­p nháº­n xĂ©t chi tiáº¿t cho nhĂ³m (vĂ­ dá»¥: cáº§n chá»‰nh sá»­a logic sÆ¡ Ä‘á»“ tuáº§n tá»±...)"
                className="w-full min-h-[140px] p-4 text-sm text-gray-700 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all outline-none resize-none shadow-inner"
              />
              <div className="absolute bottom-3 right-3 opacity-0 group-focus-within:opacity-100 transition-opacity">
                <MessageSquare size={14} className="text-teal-300" />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                disabled={isUpdating}
                className="rounded-xl h-12 bg-teal-600 hover:bg-teal-700 text-white border-0 shadow-lg shadow-teal-100 text-xs font-black"
                onClick={() => onUpdateStatus(selectedSrs.id, 'APPROVED')}
              >
                <ShieldCheck size={16} className="mr-2" /> Duyá»‡t BĂ i
              </Button>
              <Button
                disabled={isUpdating}
                variant="outline"
                className="rounded-xl h-12 bg-white border-red-100 text-red-600 hover:bg-red-50 text-xs font-black"
                onClick={() => onUpdateStatus(selectedSrs.id, 'NEED_REVISION')}
              >
                <Ban size={16} className="mr-2" /> YĂªu Cáº§u Sá»­a
              </Button>
            </div>

            <Button
              variant="ghost"
              disabled={isUpdating || !feedbackText}
              className="w-full h-10 rounded-xl text-[11px] font-bold text-gray-400 hover:text-teal-700 hover:bg-teal-50 transition-all"
              onClick={() => onSaveFeedback(selectedSrs.id)}
            >
              Chá»‰ lÆ°u nháº­n xĂ©t (khĂ´ng chuyá»ƒn tráº¡ng thĂ¡i)
            </Button>
          </div>
        </div>

        {/* Audit Log / Metadata */}
        <div className="p-6 bg-gray-100/50 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock size={12} />
            <span className="text-[10px] font-bold">Cập nhật lúc:</span>
          </div>
          <span className="text-[10px] font-bold text-gray-600">
            {new Date(selectedSrs.updatedAt || Date.now()).toLocaleString("vi-VN")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
