import {
    BookOpen,
    AlertCircle,
    PlayCircle,
    CheckCircle,
    Upload,
    Download,
    Plus,
    Users,
    Search,
    Trash2,
    Edit2,
} from "lucide-react";

// Components UI
import { Button } from "@/components/ui/Button.jsx";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card.jsx";
import { Modal } from "@/components/ui/Interactive.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { Skeleton } from "@/components/ui/Skeleton.jsx";

// Shared Components
import { PageHeader } from "@/components/shared/PageHeader.jsx";
import { StatsCard } from "@/components/shared/StatsCard.jsx";
import { SelectField, InputField } from "@/components/shared/FormFields.jsx";

// Constants
import { COURSE_CODES, COURSE_STATUSES, DEFAULT_COURSE_FORM } from "@/constants/courses.js";

// Hook
import { useCourseManagement } from "./hooks/useCourseManagement.js";

export default function CourseManagement() {
    const {
        loadingCourses,
        semesters,
        subjects,
        lecturers,
        allStudents,
        filteredCourses,
        stats,
        showModal, setShowModal,
        showImportModal, setShowImportModal,
        showViewStudentsModal, setShowViewStudentsModal,
        showAssignModal, setShowAssignModal,
        activeImportTab, setActiveImportTab,
        selectedCourse,
        importSelectedIds,
        excelFile,
        isUploading,
        filterSemester, setFilterSemester,
        searchTerm, setSearchTerm,
        editingCourse,
        formData, setFormData,
        assignForm, setAssignForm,
        handleEdit,
        handleDelete,
        handleSubmit,
        handleOpenAssign,
        handleAssignSubmit,
        handleRemoveLecturer,
        handleOpenImport,
        toggleImportStudent,
        handleImportSubmit,
        handleExcelUpload,
        handleExcelSubmit,
        handleOpenViewStudents,
        handleKickStudent
    } = useCourseManagement();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Quản lý Lớp học"
                subtitle="Quản lý danh sách lớp học phần, phân công giảng viên và import sinh viên."
                breadcrumb={["Admin", "Lớp học"]}
                actions={[
                    <Button key="import" onClick={handleDownloadTemplate} variant="outline" className="rounded-2xl border-gray-200 h-11 px-6 text-[10px] font-black hover:bg-gray-50 transition-all">
                        <Download size={14} className="mr-2" /> Tải Template Excel
                    </Button>,
                    <Button key="add" onClick={() => { setShowModal(true); }} className="rounded-2xl bg-teal-600 hover:bg-teal-700 text-white h-11 px-8 text-[10px] font-black shadow-lg shadow-teal-100 border-0 transition-all">
                        <Plus size={16} className="mr-2" /> Tạo lớp học phần
                    </Button>
                ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard label="Tổng số lớp" value={stats.total} icon={BookOpen} variant="info" />
                <StatsCard label="Lớp đang mở" value={stats.active} icon={PlayCircle} variant="success" />
                <StatsCard label="Lớp sắp mở" value={stats.upcoming} icon={AlertCircle} variant="warning" />
                <StatsCard label="Tổng sinh viên" value={stats.enrolled} icon={Users} variant="indigo" />
            </div>

            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <CardHeader className="border-b border-gray-50 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2">
                        {["", "SUMMER 2024", "FALL 2024", "SPRING 2024"].map((semLabel, i) => {
                            const semId = semesters.find(s => s.name === semLabel)?.id || "";
                            return (
                                <button
                                    key={i}
                                    onClick={() => setFilterSemester(semId)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${filterSemester === semId ? 'bg-teal-600 text-white shadow-lg shadow-teal-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                >
                                    {semLabel || "Tất cả học kỳ"}
                                </button>
                            );
                        })}
                    </div>
                    <div className="w-full md:w-80">
                        <InputField
                            placeholder="Tìm mã lớp, tên lớp..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={Search}
                        />
                    </div>
                </CardHeader>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 border-b border-gray-100">Lớp học</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 border-b border-gray-100 text-center">Môn / Học kỳ</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 border-b border-gray-100 text-center">Giảng viên</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 border-b border-gray-100 text-center">Sĩ số</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 border-b border-gray-100 text-center">Trạng thái</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 border-b border-gray-100 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loadingCourses ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-8 py-6"><div className="flex items-center gap-3"><Skeleton className="h-4 w-6 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-32" /></div></div></td>
                                        <td className="px-8 py-6 text-center"><div className="flex flex-col items-center gap-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-3 w-20" /></div></td>
                                        <td className="px-8 py-6 text-center"><Skeleton className="h-4 w-24 mx-auto" /></td>
                                        <td className="px-8 py-6 text-center"><Skeleton className="h-4 w-10 mx-auto" /></td>
                                        <td className="px-8 py-6 text-center"><Skeleton className="h-6 w-20 rounded-lg mx-auto" /></td>
                                        <td className="px-8 py-6"><div className="flex justify-end gap-2"><Skeleton className="h-9 w-9 rounded-xl" /><Skeleton className="h-9 w-9 rounded-xl" /><Skeleton className="h-9 w-9 rounded-xl" /></div></td>
                                    </tr>
                                ))
                            ) : filteredCourses.map((course, idx) => {
                                const lecturer = lecturers.find(l => l.id === course.lecturerId) || course.lecturers?.[0];
                                const status = COURSE_STATUSES[course.status] || COURSE_STATUSES.ACTIVE;
                                return (
                                    <tr key={course.id} className="group hover:bg-teal-50/20 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-gray-300">#{idx + 1}</span>
                                                <div>
                                                    <p className="font-black text-gray-800 text-sm">{course.code || course.course_code}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold truncate max-w-[150px]">{course.name || course.course_name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                                                    {course.subject?.code || course.subject_code || (subjects.find(s => s.id === course.subjectId))?.code || 'N/A'}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold">{course.semester?.name || course.semester_name || (semesters.find(s => s.id === course.semesterId))?.name || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {lecturer ? (
                                                <div className="flex flex-col items-center group/lect">
                                                    <p className="text-sm font-bold text-gray-700">{lecturer.name}</p>
                                                    <button onClick={() => handleRemoveLecturer(course)} className="text-[9px] font-black text-red-400 hover:text-red-600 opacity-0 group-hover/lect:opacity-100 transition-all">Gỡ giảng viên</button>
                                                </div>
                                            ) : (
                                                <Button size="sm" onClick={() => handleOpenAssign(course)} className="h-7 px-3 bg-gray-100 hover:bg-teal-600 hover:text-white text-gray-400 border-0 rounded-lg text-[9px] font-bold transition-all">
                                                    Chưa phân công
                                                </Button>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <p className="text-sm font-black text-gray-700">
                                                {course.currentStudents || course.enrollments?.length || 0}
                                                <span className="text-gray-300 text-xs font-bold">/{course.maxStudents || course.max_students || 40}</span>
                                            </p>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${status.variant === 'success' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
                                                status.variant === 'warning' ? 'text-sky-700 bg-sky-50 border-sky-100' :
                                                    'text-gray-500 bg-gray-100 border-gray-200'
                                                }`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-end gap-1.5">
                                                <Button onClick={() => handleOpenViewStudents(course)} variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-gray-100 text-indigo-600" title="Danh sách SV">
                                                    <Users size={16} />
                                                </Button>
                                                <Button onClick={() => handleOpenImport(course)} variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-gray-100 text-emerald-600" title="Import SV">
                                                    <Upload size={16} />
                                                </Button>
                                                <Button onClick={() => handleEdit(course)} variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-gray-100 text-teal-600">
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button onClick={() => handleDelete(course.id)} variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-gray-100 text-red-500">
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {!loadingCourses && filteredCourses.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-gray-400 font-bold text-xs">Không tìm thấy lớp học phù hợp</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal CRUD - No default footer because form has its own */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCourse ? "Cập nhật lớp học" : "Tạo lớp học mới"} size="lg">
                <form onSubmit={handleSubmit} className="p-2 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <SelectField label="Mã lớp chuẩn" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} required>
                            <option value="">Chọn mã lớp</option>
                            {COURSE_CODES.map(c => <option key={c} value={c}>{c}</option>)}
                        </SelectField>
                        <InputField label="Tên lớp hiển thị" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <SelectField label="Môn học" value={formData.subjectId} onChange={e => setFormData({ ...formData, subjectId: e.target.value })} required>
                            <option value="">Chọn môn học</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_code || s.code} - {s.subject_name || s.name}</option>)}
                        </SelectField>
                        <SelectField label="Học kỳ" value={formData.semesterId} onChange={e => setFormData({ ...formData, semesterId: e.target.value })} required>
                            <option value="">Chọn học kỳ</option>
                            {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </SelectField>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <InputField label="Sĩ số tối đa" type="number" value={formData.maxStudents} onChange={e => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })} required />
                        <SelectField label="Trạng thái" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                            {Object.entries(COURSE_STATUSES).map(([key, val]) => (
                                <option key={key} value={key}>{val.label} ({val.text})</option>
                            ))}
                        </SelectField>
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="rounded-xl h-11 px-6 font-bold">Hủy bỏ</Button>
                        <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-11 px-8 font-black shadow-lg shadow-teal-100 border-0">
                            {editingCourse ? "Lưu thay đổi" : "Xác nhận tạo"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Assign Lecturer Modal */}
            <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Phân công Giảng viên" size="md">
                <form onSubmit={handleAssignSubmit} className="p-2 space-y-4">
                    {selectedCourse && (
                        <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-teal-600 shadow-sm"><BookOpen size={18} /></div>
                            <div>
                                <p className="text-sm font-black text-gray-800 tracking-tight">{selectedCourse.code}</p>
                                <p className="text-xs text-gray-500 font-bold">{selectedCourse.name}</p>
                            </div>
                        </div>
                    )}
                    <SelectField label="Chọn giảng viên phụ trách" value={assignForm.lecturerId} onChange={e => setAssignForm({ lecturerId: e.target.value })} required>
                        <option value="">-- Danh sách giảng viên --</option>
                        {lecturers.map(l => <option key={l.id} value={l.id}>{l.name} ({l.email})</option>)}
                    </SelectField>
                    <div className="flex justify-end gap-3 pt-6">
                        <Button type="button" variant="outline" onClick={() => setShowAssignModal(false)} className="rounded-xl border-gray-200">Hủy</Button>
                        <Button type="submit" disabled={!assignForm.lecturerId} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 font-black shadow-sm">
                            Xác nhận phân công
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Import Students Modal */}
            <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Import Sinh viên" size="lg">
                <div className="p-2 space-y-6">
                    <div className="flex bg-gray-50 p-1 rounded-2xl">
                        {["manual", "excel"].map(tab => (
                            <button key={tab} onClick={() => setActiveImportTab(tab)} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${activeImportTab === tab ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                                {tab === "manual" ? "Chọn từ hệ thống" : "Tải lên Excel"}
                            </button>
                        ))}
                    </div>

                    {activeImportTab === "manual" ? (
                        <div className="space-y-4">
                            <div className="max-h-80 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                {allStudents.filter(s => !selectedCourse?.enrollments?.some(e => e.userId === s.id)).map(student => (
                                    <div key={student.id} onClick={() => toggleImportStudent(student.id)} className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${importSelectedIds.includes(student.id) ? 'bg-teal-50 border-teal-200 ring-2 ring-teal-100' : 'bg-white border-gray-100 hover:border-teal-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-400">
                                                {student.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{student.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold tracking-tight">{student.email}</p>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${importSelectedIds.includes(student.id) ? 'bg-teal-600 border-teal-600 shadow-sm' : 'border-gray-100 bg-gray-50'}`}>
                                            {importSelectedIds.includes(student.id) && <CheckCircle className="text-white" size={12} />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <p className="text-[10px] font-black text-gray-400">Đã chọn <span className="text-teal-600">{importSelectedIds.length}</span> sinh viên</p>
                                <Button onClick={handleImportSubmit} disabled={importSelectedIds.length === 0} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-10 font-black shadow-lg shadow-teal-100">Xác nhận</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className={`p-12 border-2 border-dashed rounded-3xl text-center space-y-4 transition-all relative ${excelFile ? 'border-emerald-200 bg-emerald-50/20' : 'border-gray-100 hover:border-teal-200 hover:bg-teal-50/20'}`}>
                                <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                {excelFile ? (
                                    <>
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto text-emerald-600 shadow-sm border border-emerald-100"><CheckCircle size={32} /></div>
                                        <div>
                                            <p className="text-sm font-black text-gray-800">{excelFile.name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold mt-1">{(excelFile.size / 1024).toFixed(1)} KB — Nhấn import để lưu</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto text-teal-600 shadow-sm border border-gray-50"><Upload size={32} /></div>
                                        <div>
                                            <p className="text-sm font-black text-gray-800">Chọn file danh sách sinh viên</p>
                                            <p className="text-[10px] text-gray-400 font-bold mt-1">Hệ thống chấp nhận file .xlsx hoặc .xls</p>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <Button variant="outline" onClick={() => setShowImportModal(false)} className="rounded-xl border-gray-200">Đóng</Button>
                                <Button onClick={handleExcelSubmit} disabled={!excelFile || isUploading} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-10 font-black shadow-lg shadow-teal-100">
                                    {isUploading ? "Đang xử lý..." : "Import Excel"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* View Enrolled Students Modal */}
            <Modal isOpen={showViewStudentsModal} onClose={() => setShowViewStudentsModal(false)} title="Danh sách Sinh viên" size="lg">
                <div className="p-2 space-y-6">
                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm"><Users size={18} /></div>
                            <div>
                                <p className="text-sm font-black text-gray-800 tracking-tight">{selectedCourse?.code}</p>
                                <p className="text-[10px] text-gray-400 font-bold">{selectedCourse?.name}</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-white border-indigo-200 text-indigo-700 px-4 py-1.5 rounded-xl font-black text-[10px]">{selectedCourse?.currentStudents || selectedCourse?.enrollments?.length || 0} Sinh viên</Badge>
                    </div>

                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-50 border border-gray-100 rounded-3xl custom-scrollbar">
                        {(selectedCourse?.enrollments || []).length === 0 ? (
                            <div className="py-20 text-center text-gray-300 font-bold text-[10px]">Chưa có sinh viên tham gia lớp này</div>
                        ) : (
                            selectedCourse.enrollments.map(en => (
                                <div key={en.userId} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-all">
                                    <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-black text-gray-400">
                                        {en.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">{en.user?.name || "N/A"}</p>
                                        <p className="text-[10px] text-gray-400 font-bold truncate tracking-tight">{en.user?.email || "N/A"}</p>
                                    </div>
                                    <button onClick={() => handleKickStudent(en.userId, en.user?.name)} className="text-xs font-black text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-all">Gỡ</button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={() => setShowViewStudentsModal(false)} variant="outline" className="rounded-xl border-gray-200 px-8 font-bold">Đóng</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
