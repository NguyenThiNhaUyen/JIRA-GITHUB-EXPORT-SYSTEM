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
import db from "../../mock/db.js";
import { useToast } from "../../components/ui/toast.jsx";
import { Library, CheckCircle } from "lucide-react";

export default function SubjectManagement() {
    const { success } = useToast();
    const [subjects, setSubjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        credits: 3,
        status: "ACTIVE",
    });

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = () => {
        const data = db.findMany("subjects");
        setSubjects(data);
    };

    const handleCreate = () => {
        setEditingSubject(null);
        setFormData({
            code: "",
            name: "",
            credits: 3,
            status: "ACTIVE",
        });
        setShowModal(true);
    };

    const handleEdit = (subject) => {
        setEditingSubject(subject);
        setFormData({
            code: subject.code,
            name: subject.name,
            credits: subject.credits,
            status: subject.status,
        });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (confirm("Bạn có chắc chắn muốn xóa môn học này?")) {
            db.delete("subjects", id);
            success("Xóa môn học thành công!");
            loadSubjects();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const code = formData.code.toUpperCase().replace(/\s+/g, "");

        if (editingSubject) {
            db.update("subjects", editingSubject.id, { ...formData, code });
            success("Cập nhật môn học thành công!");
        } else {
            db.create("subjects", {
                ...formData,
                code,
                createdAt: new Date().toISOString(),
            });
            success("Tạo môn học thành công!");
        }

        setShowModal(false);
        loadSubjects();
    };

    return (
        <div className="space-y-6">
            {/* Top Stats Cards - Edaca Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-inner">
                        <Library size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Tổng số môn học</p>
                        <h3 className="text-2xl font-bold text-gray-800">{subjects.length}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="w-14 h-14 rounded-2xl bg-green-500 text-white flex items-center justify-center shrink-0 shadow-inner">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Đang áp dụng</p>
                        <h3 className="text-2xl font-bold text-gray-800">{subjects.filter(s => s.status === 'ACTIVE').length}</h3>
                    </div>
                </div>
            </div>

            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <CardHeader className="border-b border-gray-50 pb-4 pt-6 px-6">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl text-gray-800 font-bold">Danh sách Môn học</CardTitle>
                        <Button
                            onClick={handleCreate}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm h-10 px-5"
                        >
                            + Thêm Môn học
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow className="border-b border-gray-100/50 hover:bg-transparent">
                                    <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Mã môn</TableHead>
                                    <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Tên môn học</TableHead>
                                    <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Tín chỉ</TableHead>
                                    <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Trạng thái</TableHead>
                                    <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-50">
                                {subjects.map((subject, index) => (
                                    <TableRow key={subject.id} className="hover:bg-gray-50/50 transition-colors border-none group">
                                        <TableCell className="py-4 px-6 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="w-8 flex justify-center text-sm font-medium text-gray-400">
                                                    {index + 1}
                                                </div>
                                                <div className="font-semibold text-gray-800 text-sm">
                                                    {subject.code}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-center">
                                            <span className="text-sm text-gray-700">{subject.name}</span>
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-center">
                                            <span className="font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-xs">
                                                {subject.credits} tín chỉ
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-center">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider inline-block whitespace-nowrap ${subject.status === 'ACTIVE' ? 'text-green-600 bg-green-50' :
                                                'text-gray-600 bg-gray-100'
                                                }`}>
                                                {subject.status === 'ACTIVE' ? 'ĐANG ÁP DỤNG' : 'NGỪNG ÁP DỤNG'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-center">
                                            <div className="flex items-center justify-center gap-2 transition-opacity min-w-[120px]">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEdit(subject)}
                                                    className="h-8 w-8 p-0 rounded-lg text-blue-600 border-blue-200/50 hover:bg-blue-50 hover:border-blue-300"
                                                    title="Sửa"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(subject.id)}
                                                    className="h-8 w-8 p-0 rounded-lg text-red-500 border-red-200/50 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                                                    title="Xóa"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Modal Cập nhật môn học */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingSubject ? "Sửa môn học" : "Tạo môn học mới"}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mã môn học *
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm uppercase"
                            value={formData.code}
                            onChange={(e) =>
                                setFormData({ ...formData, code: e.target.value })
                            }
                            placeholder="VD: SWD392"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên môn học *
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số tín chỉ *
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                value={formData.credits}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        credits: parseInt(e.target.value),
                                    })
                                }
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Trạng thái
                            </label>
                            <select
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({ ...formData, status: e.target.value })
                                }
                            >
                                <option value="ACTIVE">Đang áp dụng (ACTIVE)</option>
                                <option value="INACTIVE">Ngừng áp dụng (INACTIVE)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowModal(false)}
                            className="rounded-xl border-gray-200"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
                        >
                            {editingSubject ? "Cập nhật" : "Tạo mới"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
