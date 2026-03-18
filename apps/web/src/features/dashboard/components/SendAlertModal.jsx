import { useState } from "react";
import { Bell, RefreshCw, Send, ShieldAlert, AlertTriangle, Info } from "lucide-react";
import { Modal } from "@/components/ui/Interactive.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { SelectField, InputField } from "@/components/shared/FormFields.jsx";
import { useSendAlert } from "../hooks/useDashboard.js";
import { useToast } from "@/components/ui/Toast.jsx";

const SEVERITIES = [
    { id: 'HIGH', label: 'Nghiêm trọng (High)', icon: ShieldAlert, color: 'text-red-500' },
    { id: 'MEDIUM', label: 'Trung bình (Medium)', icon: AlertTriangle, color: 'text-amber-500' },
    { id: 'LOW', label: 'Nhẹ (Low)', icon: Info, color: 'text-blue-500' }
];

export function SendAlertModal({ isOpen, onClose, groups = [], initialGroupId = "" }) {
    const { success, error: showError } = useToast();
    const [groupId, setGroupId] = useState(initialGroupId);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState("MEDIUM");

    const sendAlertMutation = useSendAlert();

    const handleSubmit = async () => {
        if (!groupId) return showError("Vui lòng chọn nhóm");
        if (!message) return showError("Vui lòng nhập nội dung cảnh báo");

        sendAlertMutation.mutate({
            groupId: parseInt(groupId),
            message,
            severity
        }, {
            onSuccess: () => {
                success("Đã gửi cảnh báo đến nhóm!");
                onClose();
                setMessage("");
            },
            onError: (err) => showError(err.message || "Gửi cảnh báo thất bại")
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Gửi cảnh báo đến nhóm" size="md">
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Chọn nhóm dự án</label>
                    <SelectField value={groupId} onChange={e => setGroupId(e.target.value)}>
                        <option value="">-- Chọn nhóm --</option>
                        {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.name} ({g.courseCode || g.courseName})</option>
                        ))}
                    </SelectField>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mức độ cảnh báo</label>
                    <div className="grid grid-cols-3 gap-3">
                        {SEVERITIES.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setSeverity(s.id)}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                                    severity === s.id ? 'border-teal-500 bg-teal-50 shadow-lg shadow-teal-100' : 'border-gray-50 bg-gray-50/50 hover:bg-gray-50 text-gray-400'
                                }`}
                            >
                                <s.icon size={20} className={severity === s.id ? s.color : 'text-gray-300'} />
                                <span className="text-[9px] font-black uppercase tracking-widest">{s.id}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nội dung thông báo</label>
                    <textarea
                        rows={5}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="VD: Nhóm đang trễ tiến độ nộp SRS, vui lòng cập nhật sớm nhất có thể..."
                        className="w-full rounded-[24px] bg-gray-50 border border-gray-100 p-6 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-teal-50 focus:border-teal-500 outline-none transition-all resize-none"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                    <Button onClick={onClose} variant="ghost" className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] text-gray-400">Hủy</Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={sendAlertMutation.isPending || !message || !groupId} 
                        className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-12 px-10 font-black uppercase tracking-widest shadow-xl shadow-red-100 disabled:opacity-50"
                    >
                        {sendAlertMutation.isPending ? <RefreshCw className="animate-spin mr-2" size={14}/> : <Send size={14} className="mr-2"/>} Gửi cảnh báo
                    </Button>
                </div>
            </div>
        </Modal>
    );
}






