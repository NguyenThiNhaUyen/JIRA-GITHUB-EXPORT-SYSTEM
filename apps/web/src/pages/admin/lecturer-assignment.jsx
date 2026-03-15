import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";

// Components UI
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { InputField, SelectField } from "../../components/shared/FormFields.jsx";

// Feature Hooks
import {
  useGetCourses,
  useAssignLecturer,
  useRemoveLecturer
} from "../../features/courses/hooks/useCourses.js";
import { useGetSemesters, useGetSubjects } from "../../features/system/hooks/useSystem.js";
import { useGetUsers } from "../../features/users/hooks/useUsers.js";

export default function LecturerAssignment() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const { data: coursesData = { items: [] }, isLoading: loadingCourses } = useGetCourses();
  const { data: lecturers = [], isLoading: loadingLects } = useGetUsers("LECTURER");
  const { data: semesters = [], isLoading: loadingSems } = useGetSemesters();
  const { data: subjects = [], isLoading: loadingSubs } = useGetSubjects();

  const assignMutation = useAssignLecturer();
  const removeMutation = useRemoveLecturer();

  const [search, setSearch] = useState("");
  const [filterSem, setFilterSem] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLecturer, setSelectedLecturer] = useState("");

  const courses = coursesData.items || [];
  
  const lecturerWorkload = useMemo(() => {
    const map = {};
    courses.forEach(c => (c.lecturers || []).forEach(l => { map[l.id] = (map[l.id] || 0) + 1; }));
    return map;
  }, [courses]);

  const filtered = useMemo(() => {
    return courses.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !search || c.code?.toLowerCase().includes(q) || c.name?.toLowerCase().includes(q);
      const matchSem = filterSem === 'all' || String(c.semesterId) === String(filterSem);
      return matchSearch && matchSem;
    });
  }, [courses, search, filterSem]);

  const handleAssign = async () => {
    if (!selectedLecturer || !selectedCourse) return showError("Vui lòng chọn giảng viên");
    try {
      await assignMutation.mutateAsync({ courseId: selectedCourse.id, lecturerUserId: selectedLecturer });
      success("Đã phân công giảng viên");
      setModalOpen(false); setSelectedLecturer("");
    } catch (err) { showError(err.message); }
  };

  if (loadingCourses || loadingLects) return (
     <div className="flex h-64 items-center justify-center">
        <Layers3 className="animate-pulse text-teal-600 mr-2" /> 
        <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu giảng viên...</span>
     </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Điều phối Giảng viên"
        subtitle="Gán giảng viên phụ trách các lớp học phần và quản lý khối lượng công việc."
        breadcrumb={["Admin", "Phân công"]}
        actions={[
          <Button key="add" className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest border-0 shadow-lg shadow-teal-100" onClick={() => setModalOpen(true)}>
             <Plus size={16} className="mr-2"/> Phân công mới
          </Button>
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <StatsCard label="Tổng số lớp" value={courses.length} icon={Layers3} variant="default" />
         <StatsCard label="Đã phân công" value={courses.filter(c=>(c.lecturers?.length||0)>0).length} icon={CalendarCheck} variant="success" />
         <StatsCard label="Chưa có GV" value={courses.filter(c=>(c.lecturers?.length||0)===0).length} icon={Users} variant="warning" />
      </div>

      <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="md:col-span-2">
              <InputField placeholder="Tìm kiếm mã lớp, tên lớp..." value={search} onChange={e => setSearch(e.target.value)} icon={Search} />
           </div>
           <SelectField value={filterSem} onChange={e => setFilterSem(e.target.value)}>
              <option value="all">Tất cả học kỳ</option>
              {semesters.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
           </SelectField>
        </CardContent>
      </Card>

      <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
         <CardHeader className="border-b border-gray-50 py-5 px-8">
            <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Danh sách Phân công</CardTitle>
         </CardHeader>
         <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
               {filtered.map(c => (
                 <div key={c.id} className="p-6 hover:bg-gray-50/50 transition-all flex items-center justify-between gap-8 group">
                    <div className="flex-1 min-w-0">
                       <h3 className="font-black text-teal-700 text-base uppercase tracking-tight">{c.code}</h3>
                       <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{c.name}</p>
                    </div>
                    <div className="w-48 hidden md:block">
                       <p className="text-[10px] font-black text-gray-300 uppercase mb-1">Học kỳ</p>
                       <p className="text-xs font-bold text-gray-800">{semesters.find(s=>s.id===c.semesterId)?.name || '—'}</p>
                    </div>
                    <div className="flex-1">
                       <p className="text-[10px] font-black text-gray-300 uppercase mb-2">Giảng viên phụ trách</p>
                       <div className="flex flex-wrap gap-2">
                          {c.lecturers?.length ? c.lecturers.map(l => (
                            <div key={l.id} className="flex items-center gap-2 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-xl text-teal-700">
                               <div className="w-5 h-5 rounded-full bg-teal-200 flex items-center justify-center text-[9px] font-black">{l.name.charAt(0)}</div>
                               <span className="text-[10px] font-bold">{l.name}</span>
                               <span className="text-[8px] bg-white px-1.5 py-0.5 rounded-md border border-teal-100 font-black">{lecturerWorkload[l.id] || 0} Lớp</span>
                               <button onClick={() => removeMutation.mutate({courseId: c.id, lecturerUserId: l.id})} className="hover:text-red-500"><X size={10}/></button>
                            </div>
                          )) : <span className="text-[10px] font-bold text-gray-300 italic">Chưa gán giảng viên</span>}
                       </div>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-xl h-9 px-4 text-[10px] font-black uppercase tracking-widest transition-all group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600" onClick={() => { setSelectedCourse(c); setModalOpen(true); }}><Plus size={14} className="mr-2"/> Phân công</Button>
                 </div>
               ))}
            </div>
         </CardContent>
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
           <Card className="w-[450px] rounded-[32px] border-0 shadow-2xl overflow-hidden bg-white">
              <CardHeader className="bg-teal-600 text-white p-8">
                 <div className="flex justify-between items-center mb-4">
                    <CardTitle className="text-xl font-black uppercase tracking-widest">Phân công mới</CardTitle>
                    <button onClick={() => setModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"><X size={20}/></button>
                 </div>
                 <p className="text-teal-50 text-xs font-bold uppercase tracking-widest">{selectedCourse ? `${selectedCourse.code} — ${selectedCourse.name}` : 'Chọn lớp trước'}</p>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 {!selectedCourse && (
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Chọn lớp học</p>
                      <SelectField value={selectedCourse?.id || ''} onChange={e => setSelectedCourse(courses.find(c=>c.id===e.target.value))}>
                         <option value="">-- Chọn lớp học --</option>
                         {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                      </SelectField>
                   </div>
                 )}
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Giảng viên (Lớp đang giảng dạy)</p>
                    <SelectField value={selectedLecturer} onChange={e => setSelectedLecturer(e.target.value)}>
                       <option value="">-- Chọn giảng viên --</option>
                       {lecturers.map(l => <option key={l.id} value={l.id}>{l.name} ({lecturerWorkload[l.id] || 0} Lớp)</option>)}
                    </SelectField>
                 </div>
                 <Button className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-teal-100 border-0" onClick={handleAssign} disabled={assignMutation.isPending}>Hoàn tất phân công</Button>
              </CardContent>
           </Card>
        </div>
      )}
    </div>
  );
}