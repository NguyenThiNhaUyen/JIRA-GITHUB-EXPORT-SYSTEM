import { Button } from"@/components/ui/Button.jsx";

export function ForceAddModal({
 isOpen,
 onClose,
 availableStudents,
 forceAddSelectedIds,
 setForceAddSelectedIds,
 handleForceAddSubmit
}) {
 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
 <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-white">
 <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
 <div>
 <h3 className="text-xl font-black text-gray-800">Chèn Thành Viên</h3>
 <p className="text-[10px] text-gray-400 font-bold mt-1">Ép sinh viên vào nhóm dự án đã chọn</p>
 </div>
 <Button variant="ghost" size="icon" onClick={onClose} className="h-12 w-12 rounded-2xl text-gray-300 hover:text-gray-900 bg-white hover:bg-gray-100 shadow-sm transition-all text-xl font-light">×</Button>
 </div>

 <div className="p-2 flex-1 overflow-y-auto">
 <div className="divide-y divide-gray-50">
 {availableStudents.length === 0 ? (
 <div className="p-12 text-center bg-gray-50/50 rounded-[32px] m-4">
 <p className="text-[10px] font-black text-gray-300">Không còn sinh viên trống</p>
 </div>
 ) : (
 availableStudents.map((student) => (
 <label key={student.id} className="flex items-center gap-5 p-6 hover:bg-teal-50/20 cursor-pointer transition-all rounded-[24px] group">
 <input
 type="checkbox"
 checked={forceAddSelectedIds.includes(student.id)}
 onChange={() => setForceAddSelectedIds(prev => prev.includes(student.id) ? prev.filter(id => id !== student.id) : [...prev, student.id])}
 className="w-6 h-6 rounded-xl text-teal-600 border-gray-200 focus:ring-teal-500 shadow-sm"
 />
 <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-xs font-black shrink-0 border border-teal-100 shadow-inner group-hover:bg-teal-100 transition-all">
 {student.name?.charAt(0)}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-black text-gray-800 tracking-tight truncate">{student.name}</p>
 <p className="text-[10px] font-bold text-gray-400">{student.studentCode || student.id}</p>
 </div>
 </label>
 ))
 )}
 </div>
 </div>

 <div className="p-8 border-t border-gray-50 bg-gray-50/30">
 <Button
 onClick={handleForceAddSubmit}
 disabled={forceAddSelectedIds.length === 0}
 className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-[24px] h-14 font-black shadow-xl shadow-teal-100 border-0 transition-all disabled:opacity-30"
 >
 Xác nhận thêm ({forceAddSelectedIds.length})
 </Button>
 </div>
 </div>
 </div>
 );
}






