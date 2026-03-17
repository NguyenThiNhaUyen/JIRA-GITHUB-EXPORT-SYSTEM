import { Button } from "../ui/Button.jsx";
import { StatusBadge } from "./Badge.jsx";
import { ExternalLink } from "lucide-react";

export function LinkApprovalSection({ icon, label, url, status, onApprove, onReject }) {
    const isApproved = status === "APPROVED";
    const isRejected = status === "REJECTED";
    const isPending = status === "PENDING";

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">{icon}</div>
                    <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">{label}</span>
                </div>
                <StatusBadge 
                    status={isApproved ? 'success' : isRejected ? 'danger' : 'warning'} 
                    label={isApproved ? 'Đã duyệt' : isRejected ? 'Từ chối' : 'Chờ duyệt'} 
                />
            </div>

            <div className="flex gap-3">
                <div className={`flex-1 flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all ${
                    url ? isApproved ? "bg-white border-green-200 shadow-sm" : isRejected ? "bg-red-50 border-red-200" : "bg-gray-50/50 border-gray-100" : "bg-gray-50 border-gray-50 italic"
                }`}>
                    {url ? (
                        <>
                            <span className="truncate flex-1 text-xs font-bold text-gray-600">{url}</span>
                            <a href={url} target="_blank" rel="noopener noreferrer" className={`hover:scale-110 transition-transform ${isRejected ? 'text-red-400' : 'text-teal-500'}`}>
                                <ExternalLink size={16} />
                            </a>
                        </>
                    ) : (
                        <span className="text-[10px] font-black text-gray-300 uppercase">Chưa cung cấp liên kết</span>
                    )}
                </div>
                
                {url && (isPending || isRejected) && (
                    <Button onClick={onApprove} className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-6 h-12 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-100 border-0 transition-all">Duyệt</Button>
                )}
                {url && (isPending || isApproved) && (
                    <Button onClick={onReject} variant="outline" className="bg-white hover:bg-red-50 text-red-600 border border-red-100 hover:border-red-200 rounded-2xl px-6 h-12 text-[10px] font-black uppercase tracking-widest shadow-sm transition-all">Từ chối</Button>
                )}
            </div>
        </div>
    );
}
