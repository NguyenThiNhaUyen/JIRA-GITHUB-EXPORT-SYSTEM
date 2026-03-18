import { RefreshCw, Check, Upload, X } from "lucide-react";
import { Modal } from "../../../components/ui/Interactive.jsx";
import { InputField, SelectField } from "../../../components/shared/FormFields.jsx";
import { Button } from "../../../components/ui/Button.jsx";

export function SubmitSrsModal({ isOpen, onClose, myGroups, selectedProject, setSelectedProject, version, setVersion, isFinal, setIsFinal, file, setFile, isSubmitting, onUpload }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nộp Bản đặc tả SRS mới" size="md">
            <div className="space-y-10 p-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="space-y-8">
                    <SelectField 
                        label="Dự án nhận bản nộp" 
                        value={selectedProject} 
                        onChange={e => setSelectedProject(e.target.value)}
                        className="rounded-3xl h-16 text-sm font-bold uppercase tracking-widest border-2 border-gray-100 focus:border-teal-500 transition-all shadow-sm"
                    >
                        <option value="">-- Chọn dự án --</option>
                        {myGroups.map(p => <option key={p.id} value={p.id}>{p.name} - {p.course?.code}</option>)}
                    </SelectField>

                    <div className="grid grid-cols-2 gap-8">
                        <InputField label="Mã phiên bản" value={version} onChange={e => setVersion(e.target.value)} placeholder="VD: 1.0.0" className="rounded-3xl h-16 font-bold" />
                        <SelectField 
                            label="Chế độ nộp bài" 
                            value={isFinal ? "final" : "draft"} 
                            onChange={e => setIsFinal(e.target.value === "final")}
                            className="rounded-3xl h-16 font-bold uppercase tracking-widest bg-gray-50/50"
                        >
                            <option value="draft">Bản nháp (Drafting)</option>
                            <option value="final">Chính thức (Finalized)</option>
                        </SelectField>
                    </div>

                    <div 
                        className={`p-16 border-4 border-dashed rounded-[48px] text-center group cursor-pointer transition-all duration-500 relative overflow-hidden ${file ? 'border-teal-500 bg-teal-50/30 shadow-2xl shadow-teal-500/10 scale-[1.02]' : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-teal-300 hover:shadow-xl'}`}
                        onClick={() => document.getElementById('srs-file-input-modal').click()}
                    >
                        {file && <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 rounded-full blur-[80px] -mr-16 -mt-16 opacity-20 pointer-events-none" />}
                        
                        <input id="srs-file-input-modal" type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
                        
                        <div className={`w-20 h-20 rounded-[28px] shadow-2xl flex items-center justify-center mx-auto mb-8 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 ${file ? 'bg-teal-600 text-white' : 'bg-white text-teal-600 shadow-inner border border-teal-50'}`}>
                            {file ? <Check size={32} className="animate-in zoom-in spin-in-45 duration-500"/> : <Upload size={32}/>}
                        </div>
                        
                        <p className="text-xl font-black text-gray-800 uppercase tracking-tighter mb-2 font-display">{file ? file.name : "Kéo thả hoặc Chọn file .PDF"}</p>
                        <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.3em] opacity-60 flex items-center justify-center gap-3">
                            {file ? (
                                <>
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                                    SIze: {(file.size / 1024 / 1024).toFixed(2)} MB
                                </>
                            ) : "(CHỈ HỖ TRỢ ĐỊNH DẠNG PDF TỐI ĐA 15MB)"}
                        </p>
                    </div>
                </div>

                <div className="flex gap-8 pt-10 border-t-2 border-dashed border-gray-50">
                    <Button 
                        onClick={onClose} 
                        variant="ghost" 
                        className="flex-1 rounded-[32px] h-20 text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all font-display"
                    >
                        Hủy bỏ
                    </Button>
                    <Button 
                        onClick={onUpload} 
                        disabled={isSubmitting || !file || !selectedProject} 
                        className="flex-1 bg-slate-900 hover:bg-black text-white rounded-[32px] h-20 text-[12px] font-black uppercase tracking-[0.3em] shadow-[0_30px_60px_-10px_rgba(0,0,0,0.15)] transition-all active:scale-95 disabled:opacity-20 border-0 font-display hover:scale-105"
                    >
                        {isSubmitting ? <RefreshCw className="animate-spin mr-3" size={24}/> : <Upload size={24} className="mr-3" />} Gửi bản nộp
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
