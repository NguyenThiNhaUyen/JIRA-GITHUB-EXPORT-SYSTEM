import { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button.jsx";

export default function SRSUploadModal({ isOpen, onClose, onSave, editingReport }) {
    const [form, setForm] = useState({ file: null });

    useEffect(() => {
        setForm({ file: null });
    }, [editingReport, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-[28px] shadow-2xl p-6 w-full max-w-sm mx-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                    {editingReport ? "Chỉnh sửa SRS" : "Nộp SRS Report"}
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">File tài liệu (PDF, DOCX) *</label>
                        <input
                            type="file"
                            onChange={e => setForm({ ...form, file: e.target.files[0] })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all text-gray-700
                            file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                        />
                    </div>
                </div>
                <div className="flex gap-3 mt-5">
                    <Button onClick={onClose} variant="outline" className="flex-1 rounded-xl border-gray-200 text-gray-600 h-10">Hủy</Button>
                    <Button
                        onClick={() => { if (!form.file) return; onSave(form); setForm({ file: null }); }}
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 border-0 shadow-sm"
                    >
                        {editingReport ? "Lưu" : "Nộp"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
