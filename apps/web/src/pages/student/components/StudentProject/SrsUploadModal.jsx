import { Upload, Check, RefreshCw } from "lucide-react";
import { Modal } from "../../../components/ui/Interactive.jsx";
import { Button } from "../../../components/ui/Button.jsx";

export function SrsUploadModal({ isOpen, onClose, uploadFile, setUploadFile, onSrsSubmit, isSubmitting }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nộp tài liệu SRS mới" size="md">
            <div className="p-4 space-y-12 animate-in fade-in zoom-in-95 duration-500">
                <div 
                    className={`p-16 border-3 border-dashed rounded-[48px] text-center group cursor-pointer transition-all hover:scale-[1.02] active:scale-95 relative overflow-hidden ${uploadFile ? 'border-teal-500 bg-teal-50/20 shadow-2xl shadow-teal-100' : 'border-teal-100 bg-teal-50/5 hover:bg-teal-50/15'}`}
                    onClick={() => document.getElementById('srs-upload').click()}
                >
                    <input 
                        id="srs-upload" 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => setUploadFile(e.target.files[0])} 
                    />
                    
                    <div className="absolute top-0 right-0 p-12 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <Upload size={120} />
                    </div>

                    <div className={`w-28 h-28 rounded-[36px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] flex items-center justify-center mx-auto mb-10 transition-all group-hover:shadow-teal-200 group-hover:-translate-y-2 ${uploadFile ? 'bg-teal-600 text-white' : 'bg-white text-teal-600'}`}>
                        {uploadFile ? <Check size={48} className="animate-in zoom-in duration-300" /> : <Upload size={48} className="animate-pulse" />}
                    </div>
                    
                    <p className="text-xl font-black text-gray-800 uppercase tracking-tight font-display mb-3">{uploadFile ? uploadFile.name : "Chọn hoặc Kéo thả file SRS"}</p>
                    <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] opacity-60">
                        {uploadFile ? `${(uploadFile.size / 1024 / 1024).toFixed(2)} MB` : "Định dạng hỗ trợ: PDF (Tối đa 20MB)"}
                    </p>
                </div>
                
                <div className="grid grid-cols-2 gap-8 px-2">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                            Phiên bản tài liệu
                        </label>
                        <input type="text" placeholder="VD: 1.0.1-RC" className="w-full h-16 rounded-[24px] bg-gray-50 border border-gray-100 px-8 text-sm font-black focus:ring-8 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white outline-none transition-all placeholder:font-bold placeholder:text-gray-300 font-mono tracking-tighter" />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            Phân loại nộp
                        </label>
                        <select className="w-full h-16 rounded-[24px] bg-gray-50 border border-gray-100 px-8 text-sm font-black focus:ring-8 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white outline-none transition-all cursor-pointer appearance-none shadow-sm hover:bg-gray-100/50">
                            <option>Bản nháp (Draft)</option>
                            <option>Bản chính thức (Final)</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-6 pt-10 border-t border-gray-50 px-2 mt-4">
                    <Button 
                        onClick={() => { onClose(); setUploadFile(null); }} 
                        variant="ghost" 
                        className="rounded-[24px] h-16 px-12 font-black uppercase tracking-[0.2em] text-[11px] text-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-all font-display"
                    >
                        Hủy bỏ
                    </Button>
                    <Button 
                        onClick={onSrsSubmit} 
                        disabled={isSubmitting || !uploadFile} 
                        className="bg-teal-600 hover:bg-teal-700 text-white rounded-[32px] h-16 px-20 font-black uppercase tracking-[0.3em] shadow-2xl shadow-teal-200 disabled:opacity-30 transition-all hover:scale-105 active:scale-95 border-0 font-display group/btn"
                    >
                        {isSubmitting ? <RefreshCw className="animate-spin mr-4" size={24}/> : null} 
                        <span className="relative z-10">Gửi nộp tài liệu</span>
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
