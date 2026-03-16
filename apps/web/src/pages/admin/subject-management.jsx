import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button.jsx";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../components/ui/card.jsx";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "../../components/ui/table.jsx";
import { Modal } from "../../components/ui/interactive.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { Library, CheckCircle } from "lucide-react";

import {
    useGetSubjects,
    useCreateSubject,
    useUpdateSubject,
    useDeleteSubject
} from "../../features/system/hooks/useSystem.js";

const departmentPrefix = {
    "Software Engineering": "SWD",
    "Artificial Intelligence": "AI",
    "Information Security": "SEC",
    "Business Administration": "BUS",
};

export default function SubjectManagement() {

    const { success, error } = useToast();

    const { data: subjects = [], isLoading } = useGetSubjects();

    const createMutation = useCreateSubject();
    const updateMutation = useUpdateSubject();
    const deleteMutation = useDeleteSubject();

    const [showModal, setShowModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);

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

        const courseNumber = subject.code?.replace(/[A-Z]/g, "");

        setFormData({
            department: subject.department || "",
            courseNumber: courseNumber || "",
            code: subject.code,
            name: subject.name,
            description: subject.description || "",
            credits: subject.credits,
            maxStudents: subject.maxStudents || 40,
            status: subject.status,
        });

        setShowModal(true);

    };

    const handleDelete = async (id) => {

        if (!confirm("Bạn có chắc chắn muốn xóa môn học này?")) return;

        try {

            await deleteMutation.mutateAsync(id);

            success("Xóa môn học thành công!");

        } catch (err) {

            error(err.message || "Xóa thất bại");

        }

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        const payload = {
        subjectCode: formData.code,
        subjectName: formData.name,
        department: formData.department,
        description: formData.description,
        credits: Number(formData.credits),
        maxStudents: Number(formData.maxStudents),
        status: formData.status
};

        try {

            if (editingSubject) {

                await updateMutation.mutateAsync({
                    id: editingSubject.id,
                    updates: payload
            });

                success("Cập nhật môn học thành công!");

            } else {

                await createMutation.mutateAsync(payload);

                success("Tạo môn học thành công!");

            }

            setShowModal(false);

        } catch (err) {
            console.log(err.response?.data);
            error(err.message || "Thao tác thất bại");

        }

    };

    return (
        <div className="space-y-6">

            {/* Stats */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">

                    <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center">
                        <Library size={24}/>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Tổng số môn học</p>
                        <h3 className="text-2xl font-bold">{subjects.length}</h3>
                    </div>

                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">

                    <div className="w-14 h-14 rounded-2xl bg-green-500 text-white flex items-center justify-center">
                        <CheckCircle size={24}/>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Đang áp dụng</p>
                        <h3 className="text-2xl font-bold">
                            {subjects.filter(s => s.status === "ACTIVE").length}
                        </h3>
                    </div>

                </div>

            </div>

            {/* Table */}

            <Card>

                <CardHeader className="flex justify-between items-center">

                    <CardTitle>Danh sách Môn học</CardTitle>

                    <Button onClick={handleCreate}>
                        + Thêm Môn học
                    </Button>

                </CardHeader>

                <CardContent>

                    <Table>

                        <TableHeader>

                            <TableRow>

                                <TableHead>Mã</TableHead>
                                <TableHead>Tên</TableHead>
                                <TableHead>Bộ môn</TableHead>
                                <TableHead>Tín chỉ</TableHead>
                                <TableHead>SV tối đa</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead></TableHead>

                            </TableRow>

                        </TableHeader>

                        <TableBody>

                            {subjects.map(subject => (

                                <TableRow key={subject.id}>

                                    <TableCell>{subject.code}</TableCell>
                                    <TableCell>{subject.name}</TableCell>
                                    <TableCell>{subject.department}</TableCell>
                                    <TableCell>{subject.credits}</TableCell>
                                    <TableCell>{subject.maxStudents}</TableCell>
                                    <TableCell>{subject.status}</TableCell>

                                    <TableCell className="flex gap-2">

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEdit(subject)}
                                        >
                                            Sửa
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(subject.id)}
                                            className="text-red-500"
                                        >
                                            Xóa
                                        </Button>

                                    </TableCell>

                                </TableRow>

                            ))}

                        </TableBody>

                    </Table>

                </CardContent>

            </Card>

            {/* Modal */}

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingSubject ? "Sửa môn học" : "Tạo môn học mới"}
            >

                <form onSubmit={handleSubmit} className="space-y-5">

{/* Row 1 */}

<div className="grid grid-cols-2 gap-4">

<div>
<label className="block text-sm font-semibold text-gray-700 mb-1">
Bộ môn *
</label>

<select
className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
value={formData.department}
onChange={(e)=>setFormData({...formData,department:e.target.value})}
required
>
<option value="">Chọn bộ môn</option>
<option value="Software Engineering">Software Engineering</option>
<option value="Artificial Intelligence">Artificial Intelligence</option>
<option value="Information Security">Information Security</option>
</select>
</div>


<div>
<label className="block text-sm font-semibold text-gray-700 mb-1">
Course Number *
</label>

<input
type="number"
placeholder="VD: 392"
className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
value={formData.courseNumber}
onChange={(e)=>setFormData({...formData,courseNumber:e.target.value})}
required
/>
</div>

</div>


{/* Auto Code */}

<div>
<label className="block text-sm font-semibold text-gray-700 mb-1">
Mã môn học
</label>

<input
value={formData.code}
readOnly
className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg font-semibold text-gray-700"
/>
</div>


{/* Subject Name */}

<div>
<label className="block text-sm font-semibold text-gray-700 mb-1">
Tên môn học *
</label>

<input
type="text"
className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
value={formData.name}
onChange={(e)=>setFormData({...formData,name:e.target.value})}
required
/>
</div>


{/* Description */}

<div>
<label className="block text-sm font-semibold text-gray-700 mb-1">
Mô tả môn học
</label>

<textarea
rows={3}
className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
value={formData.description}
onChange={(e)=>setFormData({...formData,description:e.target.value})}
/>
</div>


{/* Bottom Grid */}

<div className="grid grid-cols-3 gap-4">

<div>
<label className="block text-sm font-semibold text-gray-700 mb-1">
Tín chỉ
</label>

<input
type="number"
className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
value={formData.credits}
onChange={(e)=>setFormData({...formData,credits:Number(e.target.value)})}
/>
</div>


<div>
<label className="block text-sm font-semibold text-gray-700 mb-1">
SV tối đa
</label>

<input
type="number"
className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
value={formData.maxStudents}
onChange={(e)=>setFormData({...formData,maxStudents:Number(e.target.value)})}
/>
</div>


<div>
<label className="block text-sm font-semibold text-gray-700 mb-1">
Trạng thái
</label>

<select
className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
value={formData.status}
onChange={(e)=>setFormData({...formData,status:e.target.value})}
>
<option value="ACTIVE">ACTIVE</option>
<option value="INACTIVE">INACTIVE</option>
</select>

</div>

</div>


{/* Buttons */}

<div className="flex justify-end gap-3 pt-5 border-t">

<Button
type="button"
variant="outline"
onClick={()=>setShowModal(false)}
>
Hủy
</Button>

<Button
type="submit"
className="bg-indigo-600 hover:bg-indigo-700 text-white"
>
{editingSubject ? "Cập nhật" : "Tạo mới"}
</Button>

</div>

</form>

            </Modal>

        </div>
    );
}