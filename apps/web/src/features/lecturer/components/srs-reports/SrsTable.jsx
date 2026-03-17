import React from "react";
import { Eye, ExternalLink, Calendar, GitBranch } from "lucide-react";
import { Card, CardContent } from "../../../../components/ui/Card.jsx";

export function SrsTable({ items, selectedId, onSelect, statusMeta }) {
  const renderStatusChip = (status) => {
    const meta = statusMeta[status] || statusMeta.DRAFT;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${meta.chip}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
        {meta.label}
      </span>
    );
  };

  return (
    <Card className="rounded-[24px] border border-gray-100 shadow-sm bg-white overflow-hidden">
      <div className="grid grid-cols-12 gap-2 px-6 py-3.5 bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
        <div className="col-span-5">Nhóm / Dự án</div>
        <div className="col-span-2 text-center">Milestone</div>
        <div className="col-span-2 text-center">Trạng thái</div>
        <div className="col-span-3 text-right">Cập nhật</div>
      </div>
      <CardContent className="p-0 overflow-y-auto max-h-[600px] scrollbar-hide">
        {items.length === 0 ? (
          <div className="py-20 text-center text-gray-400 italic text-sm">
            Không tìm thấy báo cáo nào phù hợp
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`grid grid-cols-12 gap-2 px-6 py-4 items-center border-b border-gray-50 transition-all cursor-pointer last:border-0 hover:bg-teal-50/30 ${
                selectedId === item.id ? "bg-teal-50 border-l-4 border-l-teal-500 pl-5" : ""
              }`}
            >
              <div className="col-span-5 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800">{item.teamName}</span>
                  <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded-md leading-none">
                    {item.courseCode}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate max-w-full">
                  {item.projectName}
                </p>
              </div>

              <div className="col-span-2 text-center">
                <span className="text-[11px] font-semibold text-gray-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100/50">
                  {item.milestone || "N/A"}
                </span>
              </div>

              <div className="col-span-2 text-center">
                {renderStatusChip(item.status)}
              </div>

              <div className="col-span-3 text-right group">
                <p className="text-xs font-bold text-gray-700">
                  {new Date(item.updatedAt || Date.now()).toLocaleDateString("vi-VN")}
                </p>
                <p className="text-[10px] text-gray-400 flex items-center justify-end gap-1">
                  <Eye size={10} /> 
                  {item.commentsCount || 0} reviews
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
