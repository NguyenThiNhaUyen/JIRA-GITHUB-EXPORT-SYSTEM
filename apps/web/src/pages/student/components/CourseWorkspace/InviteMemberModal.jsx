import { Search, UserPlus, CheckCircle, RefreshCw, X, Users } from "lucide-react";
import { Modal } from "../../../components/ui/Interactive.jsx";
import { Button } from "../../../components/ui/Button.jsx";

export function InviteMemberModal({ isOpen, onClose, enrolledData, groupStudents, inviteSelectedIds, setInviteSelectedIds, isInviting, onInviteSubmit }) {
    const availableStudents = (enrolledData.items || []).filter(s => !groupStudents.find(m => String(m.studentId) === String(s.id)));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Tìm kiếm & Mời thành viên" size="md">
            <div className="space-y-12 p-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="space-y-6">
                   <div className="flex items-center justify-between px-4">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                             Sinh viên chưa có nhóm ({availableStudents.length})
                        </p>
                        {inviteSelectedIds.length > 0 && (
                            <button onClick={() => setInviteSelectedIds([])} className="text-[9px] font-black text-red-500 hover:text-red-600 uppercase tracking-widest flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-xl transition-all border border-red-100">
                                <X size={12} /> Hủy chọn ({inviteSelectedIds.length})
                            </button>
                        )}
                   </div>
                    
                    <div className="max-h-[500px] overflow-y-auto pr-6 space-y-4 custom-scrollbar p-2">
                        {availableStudents.map((s, idx) => {
                            const isSelected = inviteSelectedIds.includes(s.id);
                            return (
                                <div 
                                    key={s.id} 
                                    onClick={() => setInviteSelectedIds(prev => isSelected ? prev.filter(id => id !== s.id) : [...prev, s.id])}
                                    className={`p-8 rounded-[40px] border-3 transition-all duration-500 cursor-pointer flex items-center justify-between group animate-in slide-in-from-right-4 relative overflow-hidden active:scale-95 ${isSelected ? 'border-teal-500 bg-teal-50/30 shadow-2xl shadow-teal-500/10' : 'border-gray-50 bg-white hover:border-teal-200 hover:shadow-2xl hover:bg-gray-50/50'}`}
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    {isSelected && <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 rounded-full blur-[80px] -mr-16 -mt-16 opacity-10 pointer-events-none" />}
                                    
                                    <div className="flex items-center gap-8 relative z-10">
                                        <div className={`w-16 h-16 rounded-[24px] shadow-2xl flex items-center justify-center font-black text-xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 ${isSelected ? 'bg-teal-600 text-white shadow-teal-200' : 'bg-gray-100 text-gray-300 shadow-inner'}`}>
                                            {s.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-gray-800 uppercase tracking-tight leading-none mb-2 font-display">{s.name}</p>
                                            <div className="flex items-center gap-3">
                                                 <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest bg-white/50 px-3 py-1 rounded-xl border border-gray-100 group-hover:border-teal-200 group-hover:text-teal-600 transition-colors">{s.studentCode || s.email}</p>
                                                 {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="relative z-10">
                                        {isSelected ? (
                                            <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center text-white shadow-xl shadow-teal-100 animate-in zoom-in spin-in-45 duration-300"><CheckCircle size={24}/></div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-2xl border-3 border-gray-50 opacity-20 group-hover:opacity-100 group-hover:border-teal-200 group-hover:bg-teal-50/50 transition-all duration-500 flex items-center justify-center"><UserPlus size={20} className="text-teal-400 scale-0 group-hover:scale-100 transition-transform duration-500" /></div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {availableStudents.length === 0 && (
                            <div className="py-32 text-center space-y-8 bg-gray-50/30 rounded-[48px] border-2 border-dashed border-gray-100">
                                <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center mx-auto shadow-inner">
                                    <Users size={48} className="text-gray-100" />
                                </div>
                                <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.4em] leading-relaxed">Tất cả sinh viên trong lớp học<br/>đều đã có nhóm dự án.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-10 border-t border-gray-50 flex gap-8 px-4 mt-4">
                    <Button 
                        onClick={onClose} 
                        variant="ghost" 
                        className="flex-1 rounded-[32px] h-20 text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all font-display"
                    >
                        Đóng cửa sổ
                    </Button>
                    <Button 
                        onClick={onInviteSubmit} 
                        disabled={isInviting || inviteSelectedIds.length === 0} 
                        className="flex-1 bg-slate-900 hover:bg-black text-white rounded-[32px] h-20 text-[12px] font-black uppercase tracking-[0.3em] shadow-[0_30px_60px_-10px_rgba(0,0,0,0.15)] transition-all active:scale-95 disabled:opacity-20 border-0 font-display hover:scale-105"
                    >
                        {isInviting ? <RefreshCw className="animate-spin mr-3" size={24}/> : <UserPlus size={24} className="mr-3" />} Mời {inviteSelectedIds.length} sinh viên
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
