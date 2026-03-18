import { useState, useMemo, useEffect } from"react";
import { useNavigate } from"react-router-dom";
import {
 ChevronRight,
 Search,
 Plus,
 X,
 BookOpen,
 ArrowUpDown,
 Users,
 Layers3,
 CalendarCheck,
} from"lucide-react";

// Components UI
import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/Card.jsx";
import { Button } from"@/components/ui/Button.jsx";
import { useToast } from"@/components/ui/Toast.jsx";
import { Badge } from"@/components/ui/Badge.jsx";

// Shared Components
import { PageHeader } from"@/components/shared/PageHeader.jsx";
import { StatsCard } from"@/components/shared/StatsCard.jsx";
import { InputField, SelectField } from"@/components/shared/FormFields.jsx";

// Feature Hooks
import {
 useGetCourses,
 useAssignLecturer,
 useRemoveLecturer
} from"@/features/courses/hooks/useCourses.js";
import { useGetSemesters, useGetSubjects } from"@/features/system/hooks/useSystem.js";
import { useGetUsers } from"@/features/users/hooks/useUsers.js";

export default function LecturerAssignment() {
 const navigate = useNavigate();
 const { success, error: showError } = useToast();

 const { data: coursesData = { items: [] }, isLoading: loadingCourses } = useGetCourses();
 const courses = coursesData.items || [];
 const { data: lecturers = [], isLoading: loadingLects } = useGetUsers("LECTURER");
 const { data: semesters = [], isLoading: loadingSems } = useGetSemesters();
 const { data: subjects = [], isLoading: loadingSubs } = useGetSubjects();

 const assignMutation = useAssignLecturer();
 const removeMutation = useRemoveLecturer();

 const [search, setSearch] = useState("");
 const [filterSem, setFilterSem] = useState("all");
 const [sort, setSort] = useState("");
 const [modalOpen, setModalOpen] = useState(false);
 const [selectedCourse, setSelectedCourse] = useState(null);
 const [selectedLecturer, setSelectedLecturer] = useState("");
 const [page, setPage] = useState(1);
 const pageSize = 10;

 const lecturerWorkload = useMemo(() => {
 const map = {};
 courses.forEach(c => (c.lecturers || []).forEach(l => { map[l.id] = (map[l.id] || 0) + 1; }));
 return map;
 }, [courses]);

 const filtered = useMemo(() => {
 let result = courses.filter(c => {
 const q = search.toLowerCase();
 const code = c.code || c.course_code ||"";
 const name = c.name || c.course_name ||"";
 const matchSearch = !search || code.toLowerCase().includes(q) || name.toLowerCase().includes(q);
 const matchSem = filterSem === 'all' || String(c.semesterId) === String(filterSem);
 return matchSearch && matchSem;
 });

 if (sort ==="students") {
 result = [...result].sort((a, b) => (b.currentStudents || 0) - (a.currentStudents || 0));
 } else if (sort ==="code") {
 result = [...result].sort((a, b) => (a.code || a.course_code ||"").localeCompare(b.code || b.course_code ||""));
 }

 return result;
 }, [courses, search, filterSem, sort]);

 const paginated = useMemo(() => {
 const start = (page - 1) * pageSize;
 return filtered.slice(start, start + pageSize);
 }, [filtered, page]);

 const totalPages = Math.ceil(filtered.length / pageSize);

 const handleAssign = async () => {
 if (!selectedLecturer || !selectedCourse) return showError("Vui lĂ²ng chá»n giáº£ng viĂªn");
 try {
 await assignMutation.mutateAsync({ 
 courseId: selectedCourse.id, 
 lecturerUserId: selectedLecturer 
 });
 success("ÄĂ£ phĂ¢n cĂ´ng giáº£ng viĂªn thĂ nh cĂ´ng");
 setModalOpen(false); 
 setSelectedLecturer("");
 } catch (err) { 
 showError(err.message ||"KhĂ´ng thá»ƒ phĂ¢n cĂ´ng"); 
 }
 };

 const handleRemove = async (courseId, lecturerId, lecturerName) => {
 if (!window.confirm(`XĂ³a giáº£ng viĂªn ${lecturerName} khá»i lá»›p nĂ y?`)) return;
 try {
 await removeMutation.mutateAsync({
 courseId,
 lecturerUserId: lecturerId
 });
 success("ÄĂ£ gá»¡ bá» phĂ¢n cĂ´ng");
 } catch (err) {
 showError(err.message ||"KhĂ´ng thá»ƒ xĂ³a");
 }
 };

 if (loadingCourses || loadingLects || loadingSems || loadingSubs) return (
 <div className="flex h-screen items-center justify-center p-8 bg-gray-50/50">
 <div className="text-center">
 <Layers3 className="animate-pulse text-teal-600 mx-auto mb-4" size={48} /> 
 <span className="text-gray-500 font-bold text-xs">Äang Ä‘á»“ng bá»™ dá»¯ liá»‡u giáº£ng viĂªn...</span>
 </div>
 </div>
 );

 return (
 <div className="space-y-8 animate-in fade-in duration-500">
 <PageHeader 
 title="Äiá»u phá»‘i Giáº£ng viĂªn"
 subtitle="GĂ¡n giáº£ng viĂªn phá»¥ trĂ¡ch cĂ¡c lá»›p há»c pháº§n vĂ  quáº£n lĂ½ khá»‘i lÆ°á»£ng cĂ´ng viá»‡c."
 breadcrumb={["Admin","PhĂ¢n cĂ´ng"]}
 actions={[
 <Button key="add" className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-11 px-6 text-[10px] font-black border-0 shadow-lg shadow-teal-100 transition-all" onClick={() => { setSelectedCourse(null); setModalOpen(true); }}>
 <Plus size={16} className="mr-2"/> PhĂ¢n cĂ´ng má»›i
 </Button>
 ]}
 />

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <StatsCard label="Tá»•ng sá»‘ lá»›p" value={courses.length} icon={Layers3} variant="info" />
 <StatsCard label="ÄĂ£ phĂ¢n cĂ´ng" value={courses.filter(c=>(c.lecturers?.length||0)>0).length} icon={CalendarCheck} variant="success" />
 <StatsCard label="ChÆ°a cĂ³ GV" value={courses.filter(c=>(c.lecturers?.length||0)===0).length} icon={Users} variant="warning" />
 </div>

 <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
 <CardContent className="p-4 flex flex-col md:flex-row gap-4">
 <div className="flex-1">
 <InputField placeholder="TĂ¬m kiáº¿m mĂ£ lá»›p, tĂªn lá»›p..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} icon={Search} />
 </div>
 <div className="flex gap-4">
 <SelectField value={filterSem} onChange={e => { setFilterSem(e.target.value); setPage(1); }}>
 <option value="all">Táº¥t cáº£ há»c ká»³</option>
 {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
 </SelectField>
 <Button variant="outline" className="rounded-xl border-gray-100 h-11 px-4 text-[10px] font-black shadow-sm" onClick={() => setSort(s => s ==="students" ?"code" :"students")}>
 <ArrowUpDown size={14} className="mr-2" /> Sort {sort ||"Máº·c Ä‘á»‹nh"}
 </Button>
 </div>
 </CardContent>
 </Card>

 <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
 <CardHeader className="border-b border-gray-50 py-5 px-8">
 <CardTitle className="text-base font-black text-gray-800">Danh sĂ¡ch PhĂ¢n cĂ´ng</CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="divide-y divide-gray-50">
 {paginated.map(c => (
 <div key={c.id} className="p-8 hover:bg-teal-50/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 group">
 <div className="flex-1 min-w-0">
 <h3 className="font-black text-teal-700 text-lg tracking-tight">{c.code || c.course_code}</h3>
 <p className="text-[10px] text-gray-400 font-bold mt-1">{c.name || c.course_name}</p>
 </div>
 <div className="w-48">
 <p className="text-[10px] font-black text-gray-300 mb-1">Há»c ká»³ / MĂ´n há»c</p>
 <p className="text-xs font-bold text-gray-800">{semesters.find(s=>s.id===c.semesterId)?.name || c.semester_name || 'â€”'}</p>
 <p className="text-[10px] text-blue-500 font-bold mt-0.5">{subjects.find(s=>s.id===c.subjectId)?.code || c.subject_code || 'N/A'}</p>
 </div>
 <div className="flex-[1.5]">
 <p className="text-[10px] font-black text-gray-300 mb-3">Giáº£ng viĂªn phá»¥ trĂ¡ch</p>
 <div className="flex flex-wrap gap-3">
 {c.lecturers?.length ? c.lecturers.map(l => (
 <div key={l.id} className="flex items-center gap-2 bg-white border border-teal-100 px-3 py-1.5 rounded-2xl text-teal-700 shadow-sm group/item">
 <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-black shadow-inner">{l.name.charAt(0)}</div>
 <span className="text-[11px] font-black">{l.name}</span>
 <span className={`text-[9px] px-2 py-0.5 rounded-lg font-black border tracking-tighter ${
 (lecturerWorkload[l.id] || 0) > 4 ?"bg-red-50 text-red-600 border-red-100" :"bg-teal-50 text-teal-600 border-teal-100"
 }`}>
 {lecturerWorkload[l.id] || 0} Lá»›p
 </span>
 <button onClick={() => handleRemove(c.id, l.id, l.name)} className="w-5 h-5 rounded-full flex items-center justify-center text-teal-300 hover:text-red-500 hover:bg-red-50 transition-all"><X size={12}/></button>
 </div>
 )) : <span className="text-[11px] font-bold text-gray-300 italic tracking-wide">ChÆ°a cĂ³ giáº£ng viĂªn Ä‘iá»u phá»‘i</span>}
 </div>
 </div>
 <Button size="sm" variant="outline" className="rounded-xl h-11 px-6 text-[10px] font-black transition-all hover:bg-teal-600 hover:text-white border-gray-100 hover:border-teal-600 shadow-sm" onClick={() => { setSelectedCourse(c); setModalOpen(true); }}><Plus size={14} className="mr-2"/> PhĂ¢n cĂ´ng</Button>
 </div>
 ))}
 {paginated.length === 0 && (
 <div className="py-20 text-center">
 <BookOpen size={48} className="text-gray-200 mx-auto mb-4" />
 <p className="text-xs font-black text-gray-300">KhĂ´ng cĂ³ lá»›p há»c phĂ¹ há»£p</p>
 </div>
 )}
 </div>
 </CardContent>
 {totalPages > 1 && (
 <div className="p-6 border-t border-gray-50 flex items-center justify-between">
 <p className="text-[10px] font-black text-gray-400">Trang {page} / {totalPages}</p>
 <div className="flex gap-2">
 <Button variant="ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-xl h-9 px-4 text-[10px] font-black border border-gray-100">TrÆ°á»›c</Button>
 <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl h-9 px-4 text-[10px] font-black border border-gray-100">Sau</Button>
 </div>
 </div>
 )}
 </Card>

 {/* Assign Modal */}
 {modalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
 <Card className="w-[480px] rounded-[32px] border-0 shadow-2xl overflow-hidden bg-white animate-in zoom-in duration-300">
 <CardHeader className="bg-teal-600 text-white p-10">
 <div className="flex justify-between items-center mb-6">
 <CardTitle className="text-2xl font-black">PhĂ¢n cĂ´ng Giáº£ng viĂªn</CardTitle>
 <button onClick={() => setModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-2xl transition-all shadow-sm"><X size={20}/></button>
 </div>
 <div className="p-5 bg-white/10 rounded-2xl border border-white/20">
 <p className="text-teal-50 text-[10px] font-black mb-1">Äang chá»n lá»›p há»c</p>
 <p className="text-white text-base font-black tracking-tight">{selectedCourse ? `${selectedCourse.code || selectedCourse.course_code} â€” ${selectedCourse.name || selectedCourse.course_name}` : 'Vui lĂ²ng chá»n lá»›p há»c phĂ­a dÆ°á»›i'}</p>
 </div>
 </CardHeader>
 <CardContent className="p-10 space-y-8">
 {!selectedCourse && (
 <div>
 <p className="text-[11px] font-black text-gray-400 mb-3 pl-1">Chá»n lá»›p há»c pháº§n</p>
 <SelectField value={selectedCourse?.id || ''} onChange={e => setSelectedCourse(courses.find(c=>c.id===e.target.value))}>
 <option value="">-- Danh sĂ¡ch cĂ¡c lá»›p há»c --</option>
 {courses.map(c => <option key={c.id} value={c.id}>{c.code || c.course_code} - {c.name || c.course_name}</option>)}
 </SelectField>
 </div>
 )}
 <div>
 <label className="text-[11px] font-black text-gray-400 mb-3 pl-1 block">Chá»n Giáº£ng viĂªn chuyĂªn trĂ¡ch</label>
 <SelectField value={selectedLecturer} onChange={e => setSelectedLecturer(e.target.value)}>
 <option value="">-- Danh sĂ¡ch giáº£ng viĂªn --</option>
 {lecturers.map(l => (
 <option key={l.id} value={l.id}>
 {l.name} (Äang gĂ¡nh {lecturerWorkload[l.id] || 0} lá»›p)
 </option>
 ))}
 </SelectField>
 <p className="text-[10px] text-gray-400 mt-2 italic px-1">* Há»‡ thá»‘ng sáº½ phĂ¢n tĂ­ch workload Ä‘á»ƒ Ä‘Æ°a ra gá»£i Ă½ tá»‘t nháº¥t</p>
 </div>
 <div className="pt-4">
 <Button 
 className="w-full h-16 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black shadow-2xl shadow-teal-100 border-0 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50" 
 onClick={handleAssign} 
 disabled={assignMutation.isPending || !selectedLecturer || !selectedCourse}
 >
 {assignMutation.isPending ?"Äang xá»­ lĂ½..." :"XĂ¡c nháº­n Ä‘iá»u phá»‘i"}
 </Button>
 <Button variant="ghost" className="w-full mt-4 h-12 text-gray-400 font-bold text-[10px] hover:text-gray-600" onClick={() => setModalOpen(false)}>Há»§y bá»</Button>
 </div>
 </CardContent>
 </Card>
 </div>
 )}
 </div>
 );
}
