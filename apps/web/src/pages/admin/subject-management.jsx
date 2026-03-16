import { useState, useMemo, useEffect } from "react";
import { Plus, Library, Trash2, Edit2, Search, BookOpen, CheckCircle } from "lucide-react";

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
    useGetSubjects,
    useCreateSubject,
    useUpdateSubject,
    useDeleteSubject
} from "../../features/system/hooks/useSystem.js";

const DEPARTMENTS = [
    "Software Engineering",
    "Artificial Intelligence",
    "Information Security",
    "Digital Marketing",
    "Business Administration"
];

const departmentPrefix = {
    "Software Engineering": "SWD",
    "Artificial Intelligence": "AI",
    "Information Security": "SEC",
    "Business Administration": "BUS",
    "Digital Marketing": "MKT"
};

export default function SubjectManagement() {
    const { success, error: showError } = useToast();
    const { data: subjects = [], isLoading } = useGetSubjects();

    const createMutation = useCreateSubject();
    const updateMutation = useUpdateSubject();
    const deleteMutation = useDeleteSubject();

    const [showModal, setShowModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [search, setSearch] = useState("");
    const [deptFilter, setDeptFilter] = useState("ALL");

    const [formData, setFormData] = useState({
  department: "",
  courseNumber: "",
  code: "",
  name: "",
  description: "",
  credits: 3,
  maxStudents: 40,
  status: "ACTIVE",
});

    /* Auto generate code */
    useEffect(() => {
        if (formData.department && formData.courseNumber) {
            const prefix = departmentPrefix[formData.department] || "";
            setFormData(prev => ({
                ...prev,
                code: `${prefix}${formData.courseNumber}`
            }));
        }
    }, [formData.department, formData.courseNumber]);

    const filteredSubjects = useMemo(() => {
        return subjects.filter(s => {
            const name = s.subject_name || s.name || "";
            const code = s.subject_code || s.code || "";
            const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || code.toLowerCase().includes(search.toLowerCase());
            const matchesDept = deptFilter === "ALL" || s.department === deptFilter;
            return matchesSearch && matchesDept;
        }).sort((a,b) => (a.subject_code || a.code || "").localeCompare(b.subject_code || b.code || ""));
    }, [subjects, search, deptFilter]);

    const handleCreate = () => {
        setEditingSubject(null);
        setFormData({
            department: "",
            courseNumber: "",
            code: "",
            name: "",
            description: "",
            credits: 3,
            maxStudents: 40,
            status: "ACTIVE",
        });
        setShowModal(true);
    };

    const handleEdit = (subject) => {
        setEditingSubject(subject);
        const code = subject.subject_code || subject.code || "";
        const courseNumber = code.replace(/[A-Z]/g, "") || "";
        setFormData({
            department: subject.department || "",
            courseNumber: courseNumber,
            code: code,
            name: subject.subject_name || subject.name || "",
            description: subject.description || "",
            credits: subject.credits || 3,
            maxStudents: subject.maxStudents || subject.max_students || 40,
            status: subject.status || "ACTIVE",
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Bạn có chắc chắn muốn xóa môn học này?")) return;
        try {
            await deleteMutation.mutateAsync(id);
            success("Xóa môn học thành công");
        } catch (err) {
            showError(err.message || "Xóa môn học thất bại");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
<<<<<<< HEAD

        const payload = {
        subjectCode: formData.code,
        subjectName: formData.name,
        department: formData.department,
        description: formData.description,
        credits: Number(formData.credits),
        maxStudents: Number(formData.maxStudents),
        status: formData.status
};

=======
>>>>>>> d4f993c269f0e55c18a55ca5482935dba01b41e8
        try {
            const payload = {
                subjectCode: formData.code,
                subjectName: formData.name,
                department: formData.department,
                description: formData.description,
                credits: Number(formData.credits),
                maxStudents: Number(formData.maxStudents),
                status: formData.status
            };

            if (editingSubject) {
<<<<<<< HEAD

                await updateMutation.mutateAsync({
                    id: editingSubject.id,
                    updates: payload
            });

                success("Cập nhật môn học thành công!");

            } else {

                await createMutation.mutateAsync(payload);

                success("Tạo môn học thành công!");

=======
                await updateMutation.mutateAsync({ 
                    id: editingSubject.id, 
                    updates: payload 
                });
                success("Cập nhật thành công");
            } else {
                await createMutation.mutateAsync(payload);
                success("Tạo mới thành công");
>>>>>>> d4f993c269f0e55c18a55ca5482935dba01b41e8
            }
            setShowModal(false);
        } catch (err) {
<<<<<<< HEAD
            console.log(err.response?.data);
            error(err.message || "Thao tác thất bại");

=======
            showError(err.message || "Thao tác thất bại");
>>>>>>> d4f993c269f0e55c18a55ca5482935dba01b41e8
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader 
                title="Quản lý Môn học"
                subtitle="Danh mục chương trình đào tạo và cấu trúc các học phần."
                breadcrumb={["Admin", "Hệ thống", "Môn học"]}
                actions={[
                    <Button key="add" onClick={handleCreate} className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-11 px-6 text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-100 border-0">
                        <Plus size={16} className="mr-2" /> Thêm Môn học
                    </Button>
                ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard label="Tổng môn học" value={subjects.length} icon={Library} variant="indigo" />
                <StatsCard label="Đang hoạt động" value={subjects.filter(s => s.status === 'ACTIVE').length} icon={CheckCircle} variant="success" />
                <StatsCard label="Tín chỉ trung bình" value={(subjects.reduce((sum, s) => sum + (s.credits || 0), 0) / (subjects.length || 1)).toFixed(1)} icon={BookOpen} variant="info" />
            </div>

            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <CardHeader className="border-b border-gray-50 py-5 px-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest leading-none">Danh mục học phần</CardTitle>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <InputField placeholder="Tìm mã hoặc tên môn..." value={search} onChange={e => setSearch(e.target.value)} icon={Search} />
                            <div className="min-w-[200px]">
                              <SelectField value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                                <option value="ALL">Tất cả khoa</option>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                              </SelectField>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="border-b border-gray-100 hover:bg-transparent">
                                <TableHead className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mã môn / Tên môn</TableHead>
                                <TableHead className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Tín chỉ</TableHead>
                                <TableHead className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">SV tối đa</TableHead>
                                <TableHead className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Trạng thái</TableHead>
                                <TableHead className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-50">
                            {filteredSubjects.map(s => (
                                <TableRow key={s.id} className="hover:bg-teal-50/20 transition-all border-none group">
                                    <TableCell className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-teal-600 font-black text-xs group-hover:bg-white shadow-sm transition-all border border-gray-100">
                                              {(s.subject_code || s.code || "").substring(0, 3)}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-gray-800 text-sm leading-tight">{s.subject_code || s.code}</p>
                                                <p className="text-[11px] text-gray-400 font-medium mt-0.5">{s.subject_name || s.name}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-6 text-center">
                                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 uppercase tracking-wider">{s.credits} tín chỉ</span>
                                    </TableCell>
                                    <TableCell className="py-4 px-6 text-center">
                                        <span className="text-xs font-bold text-gray-600">{s.maxStudents || s.max_students || 40}</span>
                                    </TableCell>
                                    <TableCell className="py-4 px-6 text-center">
                                        <StatusBadge status={s.status} variant={s.status === 'ACTIVE' ? 'success' : 'default'} label={s.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'} />
                                    </TableCell>
                                    <TableCell className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button onClick={() => handleEdit(s)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-teal-600 hover:bg-teal-50"><Edit2 size={14}/></Button>
                                            <Button onClick={() => handleDelete(s.id)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={14}/></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredSubjects.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-12 text-center text-gray-400">
                                        Không tìm thấy môn học nào
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingSubject ? "Sửa môn học" : "Thêm môn học mới"}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <SelectField label="Bộ môn *" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required>
                            <option value="">Chọn bộ môn</option>
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </SelectField>
                        <InputField label="Course Number *" type="number" value={formData.courseNumber} onChange={e => setFormData({...formData, courseNumber: e.target.value})} placeholder="VD: 392" required />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Mã môn học (Tự động)" value={formData.code} readOnly className="bg-gray-50 font-bold" />
                        <InputField label="Số tín chỉ" type="number" value={formData.credits} onChange={e => setFormData({...formData, credits: Number(e.target.value)})} />
                    </div>

                    <InputField label="Tên môn học *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: Software Architecture" required />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="SV tối đa" type="number" value={formData.maxStudents} onChange={e => setFormData({...formData, maxStudents: Number(e.target.value)})} />
                        <SelectField label="Trạng thái" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                        </SelectField>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Mô tả môn học</label>
                        <textarea 
                            className="w-full p-4 rounded-xl border border-gray-100 focus:ring-2 focus:ring-teal-100 outline-none text-sm transition-all min-h-[100px]"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="rounded-xl h-11 px-6 font-bold">Hủy</Button>
                        <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-11 px-8 font-black uppercase tracking-widest shadow-lg shadow-teal-100 border-0">
                            {editingSubject ? "Lưu thay đổi" : "Tạo môn học"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
