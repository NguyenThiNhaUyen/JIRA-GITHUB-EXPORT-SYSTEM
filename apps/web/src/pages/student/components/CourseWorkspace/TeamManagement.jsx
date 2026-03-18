import { Users, UserPlus, Crown, Trash2 } from"lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from"@/components/ui/Card.jsx";
import { Button } from"@/components/ui/Button.jsx";
import { Badge } from"@/components/ui/Badge.jsx";

export function TeamManagement({ groupStudents = [], isLeader, onInviteOpen, onRemoveMember }) {
 return (
 <Card className="border-0 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.08)] rounded-[48px] bg-white overflow-hidden glass-card h-full flex flex-col">
 <CardHeader className="p-12 border-b border-gray-50 bg-gray-50/20 flex flex-row items-center justify-between">
 <CardTitle className="text-lg font-black text-gray-800 tracking-[0.2em] flex items-center gap-6 font-display">
 <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shadow-inner">
 <Users size={24} className="text-emerald-600" />
 </div>
 Thành viên nhóm ({groupStudents.length})
 </CardTitle>
 {isLeader && (
 <Button 
 onClick={onInviteOpen} 
 variant="ghost" 
 className="h-14 px-10 rounded-[28px] text-[11px] font-black tracking-[0.2em] text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all font-display hover:scale-105 active:scale-95 border-2 border-emerald-50"
 >
 <UserPlus size={20} className="mr-3 shrink-0" /> Thêm thành viên
 </Button>
 )}
 </CardHeader>
 <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
 <div className="divide-y divide-gray-50">
 {groupStudents.map((m, idx) => (
 <div key={m.studentId} className="p-12 flex items-center justify-between hover:bg-gray-50/40 transition-all group animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
 <div className="flex items-center gap-8">
 <div className={`w-16 h-16 rounded-[28px] flex items-center justify-center font-black text-xl shadow-2xl transition-all group-hover:scale-110 group-hover:rotate-3 ${m.role === 'LEADER' ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-100' : 'bg-gradient-to-br from-gray-50 to-gray-200 text-gray-400 shadow-inner'}`}>
 {m.name?.charAt(0) || <Crown size={32} />}
 </div>
 <div>
 <p className="font-black text-gray-800 text-lg tracking-tight leading-none mb-3 font-display">{m.name}</p>
 <p className="text-[11px] text-gray-400 font-black tracking-[0.3em] flex items-center gap-4 opacity-70">
 <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
 {m.responsibility || (m.role === 'LEADER' ?"QUẢN TRỊ DỰ ÁN" :"PHÁT TRIỂN PHẦN MỀM")}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-10">
 <Badge variant={m.role === 'LEADER' ? 'warning' : 'outline'} className={`text-[10px] font-black px-5 py-2 rounded-full border shadow-sm tracking-[0.2em] ${m.role === 'LEADER' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-white text-gray-400 border-gray-100'}`}>
 {m.role === 'LEADER' ? 'TRƯỞNG NHÓM' : 'THÀNH VIÊN'}
 </Badge>
 
 {isLeader && m.role !== 'LEADER' && (
 <Button 
 variant="ghost" 
 size="icon" 
 className="h-14 w-14 text-gray-100 hover:text-red-500 rounded-[28px] opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:border-red-100 border-2 border-transparent shadow-sm active:scale-95"
 onClick={() => onRemoveMember(m.studentId)}
 >
 <Trash2 size={24} className="hover:animate-shake" />
 </Button>
 )}
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 );
}






