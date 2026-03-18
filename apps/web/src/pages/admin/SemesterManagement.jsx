import { useState, useMemo } from "react";
import { 
  Plus, 
  CalendarDays, 
  PlayCircle, 
  AlertCircle, 
  CheckCircle, 
  Trash2, 
  Edit2, 
  Zap,
  BarChart3,
  Calendar
} from "lucide-react";

// Components UI
import { Button } from "@/components/ui/Button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card.jsx";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table.jsx";
import { Modal } from "@/components/ui/Interactive.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
import { Badge } from "@/components/ui/Badge.jsx";

// Shared Components
import { PageHeader } from "@/components/shared/PageHeader.jsx";
import { StatsCard } from "@/components/shared/StatsCard.jsx";
import { SelectField, InputField } from "@/components/shared/FormFields.jsx";

// Feature Hooks
import {
  useGetSemesters,
  useCreateSemester,
  useUpdateSemester,
  useDeleteSemester,
  useGenerateSemesters,
} from "@/features/system/hooks/useSystem.js";
import { useGetCourses } from "@/features/courses/hooks/useCourses.js";

export default function SemesterManagement() {
  const { success, error: showError } = useToast();

  const { data: semesters = [], isLoading: loadingSemesters } = useGetSemesters();
  const { data: coursesData = { items: [] }, isLoading: loadingCourses } = useGetCourses({ pageSize: 1000 });
  const allCourses = coursesData.items || [];

  const createMutation = useCreateSemester();
  const updateMutation = useUpdateSemester();
  const deleteMutation = useDeleteSemester();
  const generateMutation = useGenerateSemesters();

  const [showModal, setShowModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortYear, setSortYear] = useState("DESC");

  const [formData, setFormData] = useState({
    type: "Spring",
    year: new Date().getFullYear(),
    startDate: "",
    endDate: "",
  });

  const filteredSemesters = useMemo(() => {
    let result = [...semesters];
    if (filter !== "ALL") result = result.filter(s => s.status === filter);
    if (search) result = result.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    
    result.sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return sortYear === "DESC" ? dateB - dateA : dateA - dateB;
    });
    
    return result;
  }, [semesters, filter, search, sortYear]);

  const stats = useMemo(() => ({
    total: semesters.length,
    active: semesters.filter(s => s.status === 'ACTIVE').length,
    upcoming: semesters.filter(s => s.status === 'UPCOMING').length,
    completed: semesters.filter(s => s.status === 'COMPLETED').length,
  }), [semesters]);

  const handleCreate = () => {
    setEditingSemester(null);
    const year = new Date().getFullYear();
    setFormData({ type: "Spring", year, startDate: `${year}-01-01`, endDate: `${year}-04-30` });
    setShowModal(true);
  };

  const handleEdit = (semester) => {
    setEditingSemester(semester);
    const [type, year] = semester.name?.split(" ") || ["Spring", new Date().getFullYear()];
    const formatDate = (d) => d ? d.split('T')[0] : "";
    setFormData({ 
      type: type || "Spring", 
      year: year || new Date().getFullYear(), 
      startDate: formatDate(semester.startDate), 
      endDate: formatDate(semester.endDate) 
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (allCourses.some(c => c.semesterId === id || c.semester?.id === id)) {
      showError("Không thể xóa học kỳ đã có lớp học kết nối");
      return;
    }
    if (!confirm("Bạn có chắc chắn muốn xóa học kỳ này?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      success("Đã xóa học kỳ thành công");
    } catch {
      showError("Thao tác xóa thất bại");
    }
  };

  const handleGenerate = async () => {
    const year = new Date().getFullYear();
    try {
      await generateMutation.mutateAsync({ year });
      success(`Đã tự động khởi tạo 3 học kỳ cho năm ${year}`);
    } catch {
      showError("Không thể tự động tạo học kỳ");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      showError("Ngày kết thúc phải diễn ra sau ngày bắt đầu");
      return;
    }

    const name = `${formData.type} ${formData.year}`;
    const payload = {
      name,
      startDate: formData.startDate,
      endDate: formData.endDate,
    };

    try {
      if (editingSemester) {
        await updateMutation.mutateAsync({ id: editingSemester.id, updates: payload });
        success("Cập nhật học kỳ thành công");
      } else {
        await createMutation.mutateAsync(payload);
        success("Tạo học kỳ mới thành công");
      }
      setShowModal(false);
    } catch {
      showError("Thao tác thất bại");
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr || dateStr.startsWith('0001')) return "N/A";
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Quản lý Học kỳ"
        subtitle="Thiết lập các mốc thời gian đào tạo và chu kỳ học tập cho toàn bộ hệ thống."
        breadcrumb={["Admin", "Cấu hình", "Học kỳ"]}
        actions={[
          <Button key="gen" variant="outline" onClick={handleGenerate} className="rounded-2xl border-teal-200 text-teal-700 h-11 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-teal-50 transition-all shadow-sm">
            <Zap size={14} className="mr-2" /> Auto Generate {new Date().getFullYear()}
          </Button>,
          <Button key="add" onClick={handleCreate} className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-11 px-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-100 border-0 transition-all">
            <Plus size={16} className="mr-2" /> Thêm Học kỳ
          </Button>
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Tổng học kỳ" value={stats.total} icon={CalendarDays} variant="indigo" />
        <StatsCard label="Đang diễn ra" value={stats.active} icon={PlayCircle} variant="success" />
        <StatsCard label="Sắp đến" value={stats.upcoming} icon={AlertCircle} variant="warning" />
        <StatsCard label="Đã đóng" value={stats.completed} icon={CheckCircle} variant="default" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-sm rounded-[32px] bg-white p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 group-hover:opacity-50 transition-all pointer-events-none"></div>
          <CardTitle className="mb-8 text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
            <Calendar size={18} className="text-teal-600"/> Timeline Đào tạo
          </CardTitle>
          <div className="space-y-6">
            {semesters.slice(0, 5).map((s) => (
              <div key={s.id} className="relative z-10 flex flex-col gap-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-sm font-black text-gray-700">{s.name}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{formatDisplayDate(s.startDate)} — {formatDisplayDate(s.endDate)}</span>
                </div>
                <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100 shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      s.status === "ACTIVE" ? "bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.3)]" : 
                      s.status === "UPCOMING" ? "bg-indigo-400" : "bg-gray-200"
                    }`}
                    style={{ width: s.status === 'COMPLETED' ? '100%' : s.status === 'ACTIVE' ? '100%' : '30%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-0 shadow-sm rounded-[32px] bg-white p-8 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 group-hover:opacity-50 transition-all pointer-events-none"></div>
          <CardTitle className="mb-8 text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
            <BarChart3 size={18} className="text-indigo-600"/> Tỷ lệ lớp học phần
          </CardTitle>
          <div className="space-y-6">
            {semesters.slice(0, 5).map((s) => {
              const count = allCourses.filter(c => c.semesterId === s.id || c.semester?.id === s.id).length;
              const percentage = Math.min((count / 30) * 100, 100);
              return (
                <div key={s.id} className="relative z-10">
                  <div className="flex justify-between items-end mb-2 px-1">
                    <span className="text-sm font-black text-gray-700">{s.name}</span>
                    <Badge variant="outline" className="bg-indigo-50/50 border-indigo-100 text-indigo-700 text-[10px] font-black">{count} Lớp</Badge>
                  </div>
                  <div className="w-full bg-gray-50 h-2.5 rounded-full overflow-hidden border border-gray-100">
                    <div
                      className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-full rounded-full transition-all duration-1000 delay-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 py-6 px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest leading-none">Danh sách Chi tiết</CardTitle>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="flex-1 md:w-64">
              <InputField placeholder="Tìm kiếm học kỳ..." value={search} onChange={e => setSearch(e.target.value)} icon={Calendar} />
            </div>
            <div className="w-40">
              <SelectField value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="ALL">Tất cả</option>
                <option value="ACTIVE">Đang mở</option>
                <option value="UPCOMING">Sắp tới</option>
                <option value="COMPLETED">Đã đóng</option>
              </SelectField>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Học kỳ</TableHead>
                <TableHead className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Thời gian</TableHead>
                <TableHead className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Lớp môn học</TableHead>
                <TableHead className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Trạng thái</TableHead>
                <TableHead className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50">
              {filteredSemesters.map(s => {
                const count = allCourses.filter(c => c.semesterId === s.id || c.semester?.id === s.id).length;
                return (
                  <TableRow key={s.id} className="hover:bg-teal-50/10 transition-all border-none group">
                    <TableCell className="py-6 px-8">
                      <p className="font-black text-gray-800 text-sm tracking-tight">{s.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{s.code || s.name?.replace(/\s+/g, '').toUpperCase()}</p>
                    </TableCell>
                    <TableCell className="py-6 px-8 text-center">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-gray-700">{formatDisplayDate(s.startDate)}</span>
                        <div className="h-px w-4 bg-gray-100 mx-auto"></div>
                        <span className="text-[11px] font-bold text-gray-400">{formatDisplayDate(s.endDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 px-8 text-center">
                      <span className={`px-4 py-1.5 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${
                        count > 0 ? "bg-indigo-50 border-indigo-100 text-indigo-700" : "bg-gray-50 border-gray-100 text-gray-400"
                      }`}>
                        {count} Lớp học
                      </span>
                    </TableCell>
                    <TableCell className="py-6 px-8 text-center">
                      <span className={`px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest border transition-all ${
                        s.status === 'ACTIVE' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                        s.status === 'UPCOMING' ? 'bg-sky-50 border-sky-100 text-sky-700' :
                        'bg-gray-50 border-gray-100 text-gray-400'
                      }`}>
                        {s.status === 'ACTIVE' ? 'Đang mở' : s.status === 'UPCOMING' ? 'Sắp mở' : 'Đã đóng'}
                      </span>
                    </TableCell>
                    <TableCell className="py-6 px-8">
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => handleEdit(s)} variant="ghost" size="icon" className="w-10 h-10 rounded-2xl bg-white border border-transparent hover:border-teal-100 hover:text-teal-600 shadow-sm transition-all">
                          <Edit2 size={16}/>
                        </Button>
                        <Button onClick={() => handleDelete(s.id)} variant="ghost" size="icon" className="w-10 h-10 rounded-2xl bg-white border border-transparent hover:border-red-100 hover:text-red-600 shadow-sm transition-all">
                          <Trash2 size={16}/>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredSemesters.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
                    <CalendarDays size={48} className="text-gray-100 mx-auto mb-4" />
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Không tìm thấy học kỳ khả dụng</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingSemester ? "Cập nhật Học kỳ" : "Thiết lập Học kỳ mới"} size="md">
        <form onSubmit={handleSubmit} className="p-2 space-y-6">
          <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 mb-2">
            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Dự kiến tên học kỳ</p>
            <p className="text-sm font-black text-gray-800 tracking-tight">{formData.type} {formData.year}</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <SelectField label="Giai đoạn đào tạo" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
              <option value="Spring">SPRING (Xuân)</option>
              <option value="Summer">SUMMER (Hè)</option>
              <option value="Fall">FALL (Thu)</option>
            </SelectField>
            <InputField label="Năm học" type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <InputField label="Ngày bắt đầu" type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
            <InputField label="Ngày kết thúc" type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="rounded-2xl h-11 px-6 font-bold uppercase tracking-widest text-[10px]">Hủy bỏ</Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-11 px-8 font-black uppercase tracking-widest shadow-lg shadow-teal-100 border-0 transition-all">
              {editingSemester ? "Xác nhận cập nhật" : "Khởi tạo học kỳ"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}






