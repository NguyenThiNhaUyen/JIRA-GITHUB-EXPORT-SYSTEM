import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/Card.jsx";
import { InfoRow } from"@/components/shared/InfoRow.jsx";
import { StatusBadge } from"@/components/shared/Badge.jsx";

export function GroupMembers({ group, students, handleUpdateScore }) {
 return (
 <div className="lg:col-span-2 space-y-8">
 <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
 <CardHeader className="border-b border-gray-50 py-5 px-8">
 <CardTitle className="text-base font-black text-gray-800">Thông tin Nhóm</CardTitle>
 </CardHeader>
 <CardContent className="p-8 space-y-6">
 <InfoRow label="Tên định danh" value={<span className="font-black text-gray-800 tracking-tight text-base">{group.name}</span>} />
 <InfoRow
 label="Đề tài đăng ký"
 value={
 group.description
 ? <span className="text-sm font-bold text-gray-600 leading-relaxed block">{group.description}</span>
 : <span className="text-[10px] font-black text-gray-300 italic">Chưa xác định đề tài</span>
 }
 />
 </CardContent>
 </Card>

 <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
 <CardHeader className="border-b border-gray-50 py-5 px-8 flex flex-row items-center justify-between">
 <CardTitle className="text-base font-black text-gray-800">Thành viên</CardTitle>
 <span className="text-[10px] font-black text-teal-600 bg-teal-50 rounded-full px-3 py-1 border border-teal-100">
 {students.length} Student
 </span>
 </CardHeader>
 <CardContent className="p-4 space-y-2">
 {students.map((student) => (
 <div key={student.studentId} className="flex items-center gap-4 p-4 rounded-[24px] hover:bg-gray-50/50 transition-all border border-transparent hover:border-gray-50">
 <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-xs font-black text-teal-700 shadow-sm shrink-0">
 {student.studentName?.charAt(0)}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1">
 <p className="text-sm font-black text-gray-800 tracking-tight truncate">{student.studentName}</p>
 {student.role ==="LEADER" && (
 <StatusBadge status="info" label="Leader" variant="info" />
 )}
 </div>
 <p className="text-[10px] font-bold text-gray-400">{student.studentCode}</p>
 </div>
 <div className="shrink-0 flex items-center gap-3">
 <label className="text-[8px] font-black text-gray-300">Score</label>
 <input
 type="number"
 min="0" max="100"
 defaultValue={student.contributionScore}
 onBlur={(e) => handleUpdateScore(student.studentId, e.target.value)}
 className="w-16 h-10 px-0 text-center font-black text-teal-600 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all text-xs"
 />
 </div>
 </div>
 ))}
 </CardContent>
 </Card>
 </div>
 );
}






