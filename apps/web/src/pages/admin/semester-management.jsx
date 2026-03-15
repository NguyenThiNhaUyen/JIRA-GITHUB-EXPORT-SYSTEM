import { useState, useMemo } from "react";
import { Plus, CalendarDays, PlayCircle, AlertCircle, CheckCircle, Trash2, Edit2, Zap } from "lucide-react";

// Components UI
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table.jsx";
import { Modal } from "../../components/ui/interactive.jsx";
import { useToast } from "../../components/ui/toast.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { SelectField, InputField } from "../../components/shared/FormFields.jsx";
import { StatusBadge } from "../../components/shared/Badge.jsx";

// Feature Hooks
import {
  useGetSemesters,
  useCreateSemester,
  useUpdateSemester,
  useDeleteSemester,
  useGenerateSemesters,
} from "../../features/system/hooks/useSystem.js";
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";

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
    result.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    return result;
  }, [semesters, filter, search]);

  const handleCreate = () => {
    setEditingSemester(null);
    setFormData({ type: "Spring", year: new Date().getFullYear(), startDate: "", endDate: "" });
    setShowModal(true);
  };

  const handleEdit = (semester) => {
    setEditingSemester(semester);
    const [type, year] = semester.name?.split(" ") || ["Spring", new Date().getFullYear()];
    setFormData({ type, year, startDate: semester.startDate, endDate: semester.endDate });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (allCourses.some(c => c.semesterId === id)) {
      showError("Không thể xóa học kỳ đã có lớp học");
      return;
    }
    if (!confirm("Bạn có chắc muốn xóa học kỳ này?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      success("Xóa học kỳ thành công");
    } catch {
      showError("Xóa thất bại");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      showError("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }
    const name = `${formData.type} ${formData.year}`;
    const payload = {
      name,
      code: name.toUpperCase().replace(/\s+/g, ""),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    };
    try {
      if (editingSemester) {
        await updateMutation.mutateAsync({ id: editingSemester.id, updates: payload });
        success("Cập nhật thành công");
      } else {
        await createMutation.mutateAsync(payload);
        success("Tạo mới thành công");
      }
      setShowModal(false);
    } catch {
      showError("Thao tác thất bại");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Quản lý Học kỳ"
        subtitle="Thiết lập các mốc thời gian đào tạo và chu kỳ học tập."
        breadcrumb={["Admin", "Hệ thống", "Học kỳ"]}
        actions={[
          <Button key="gen" variant="outline" onClick={() => generateMutation.mutate(new Date().getFullYear())} className="rounded-2xl border-teal-200 text-teal-700 h-11 px-6 text-xs font-black uppercase tracking-widest hover:bg-teal-50 transition-all">
            <Zap size={16} className="mr-2" /> Auto Generate
          </Button>,
          <Button key="add" onClick={handleCreate} className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-11 px-6 text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-100 border-0">
            <Plus size={16} className="mr-2" /> Thêm Học kỳ
          </Button>
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Tổng học kỳ" value={semesters.length} icon={CalendarDays} variant="indigo" />
        <StatsCard label="Đang mở" value={semesters.filter(s => s.status === 'ACTIVE').length} icon={PlayCircle} variant="success" />
        <StatsCard label="Sắp tới" value={semesters.filter(s => s.status === 'UPCOMING').length} icon={AlertCircle} variant="warning" />
        <StatsCard label="Đã đóng" value={semesters.filter(s => s.status === 'COMPLETED').length} icon={CheckCircle} variant="default" />
      </div>

      <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 py-5 px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest leading-none">Danh sách học kỳ</CardTitle>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <InputField placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} />
              <div className="min-w-[150px]">
                <SelectField value={filter} onChange={e => setFilter(e.target.value)}>
                  <option value="ALL">Tất cả</option>
                  <option value="ACTIVE">Đang diễn ra</option>
                  <option value="UPCOMING">Sắp tới</option>
                  <option value="COMPLETED">Đã kết thúc</option>
                </SelectField>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Học kỳ</TableHead>
                <TableHead className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Thời gian</TableHead>
                <TableHead className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Lớp học</TableHead>
                <TableHead className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Trạng thái</TableHead>
                <TableHead className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50">
              {filteredSemesters.map(s => {
                const count = allCourses.filter(c => c.semesterId === s.id).length;
                return (
                  <TableRow key={s.id} className="hover:bg-teal-50/20 transition-all border-none">
                    <TableCell className="py-4 px-6">
                      <p className="font-bold text-gray-800 text-sm">{s.name}</p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{s.code}</p>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center">
                      <p className="text-xs font-bold text-gray-600">{s.startDate} — {s.endDate}</p>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center">
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">{count} lớp</span>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center">
                      <StatusBadge status={s.status} label={s.status === 'ACTIVE' ? 'Đang mở' : s.status === 'UPCOMING' ? 'Sắp tới' : 'Đã đóng'} variant={s.status === 'ACTIVE' ? 'success' : s.status === 'UPCOMING' ? 'info' : 'default'} />
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => handleEdit(s)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-teal-600 hover:bg-teal-50"><Edit2 size={14}/></Button>
                        <Button onClick={() => handleDelete(s.id)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={14}/></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingSemester ? "Sửa học kỳ" : "Tạo học kỳ mới"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Loại học kỳ" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Fall">Fall</option>
            </SelectField>
            <InputField label="Năm" type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Ngày bắt đầu" type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
            <InputField label="Ngày kết thúc" type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="rounded-xl h-11 px-6 font-bold">Hủy</Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-11 px-8 font-black uppercase tracking-widest shadow-lg shadow-teal-100 border-0">{editingSemester ? "Cập nhật" : "Tạo mới"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}