import { useState, useMemo } from "react";
import { useToast } from "@/components/ui/Toast.jsx";
import {
    useGetCourses,
    useCreateCourse,
    useUpdateCourse,
    useDeleteCourse,
    useAssignLecturer,
    useEnrollStudents,
    useImportStudents,
    useUnenrollStudent,
    useRemoveLecturer
} from "@/features/courses/hooks/useCourses.js";
import { useGetSemesters, useGetSubjects } from "@/features/system/hooks/useSystem.js";
import { useGetUsers } from "@/features/users/hooks/useUsers.js";
import { DEFAULT_COURSE_FORM } from "@/constants/courses.js";

export function useCourseManagement() {
    const { success, error: showError } = useToast();

    // Data Fetching
    const { data: coursesData = { items: [] }, isLoading: loadingCourses } = useGetCourses();
    const courses = coursesData.items || [];
    const { data: semesters = [] } = useGetSemesters();
    const { data: subjects = [] } = useGetSubjects();
    const { data: lecturers = [] } = useGetUsers("LECTURER");
    const { data: allStudents = [] } = useGetUsers("STUDENT");

    // Mutations
    const createMutation = useCreateCourse();
    const updateMutation = useUpdateCourse();
    const deleteMutation = useDeleteCourse();
    const assignMutation = useAssignLecturer();
    const removeLecturerMutation = useRemoveLecturer();
    const enrollMutation = useEnrollStudents();
    const importMutation = useImportStudents();
    const unenrollMutation = useUnenrollStudent();

    // State
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showViewStudentsModal, setShowViewStudentsModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [activeImportTab, setActiveImportTab] = useState("manual");

    const [selectedCourse, setSelectedCourse] = useState(null);
    const [importSelectedIds, setImportSelectedIds] = useState([]);
    const [excelFile, setExcelFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const [filterSemester, setFilterSemester] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingCourse, setEditingCourse] = useState(null);

    const [formData, setFormData] = useState(DEFAULT_COURSE_FORM);
    const [assignForm, setAssignForm] = useState({ lecturerId: "" });

    // Computed
    const stats = useMemo(() => ({
        total: courses.length,
        active: courses.filter(c => c.status === "ACTIVE").length,
        upcoming: courses.filter(c => c.status === "UPCOMING").length,
        enrolled: courses.reduce((sum, c) => sum + (c.currentStudents || 0), 0)
    }), [courses]);

    const filteredCourses = useMemo(() => {
        return courses.filter(c => {
            const matchesSemester = !filterSemester || String(c.semesterId) === String(filterSemester);
            const q = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm ||
                (c.code || "").toLowerCase().includes(q) ||
                (c.name || "").toLowerCase().includes(q);
            return matchesSemester && matchesSearch;
        });
    }, [courses, filterSemester, searchTerm]);

    // Handlers
    const handleEdit = (course) => {
        setEditingCourse(course);
        setFormData({
            code: course.code || course.course_code || "",
            name: course.name || course.course_name || "",
            description: course.description || "",
            subjectId: course.subjectId || course.subject_id || "",
            semesterId: course.semesterId || course.semester_id || "",
            lecturerId: course.lecturerId || (course.lecturers?.[0]?.id) || "",
            room: course.room || "",
            startDate: course.startDate || "",
            endDate: course.endDate || "",
            minStudents: course.minStudents || 10,
            maxStudents: course.maxStudents || 40,
            status: course.status || "ACTIVE",
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa lớp học này? Hành động này không thể hoàn tác.")) {
            try {
                await deleteMutation.mutateAsync(id);
                success("Đã xóa lớp học thành công");
            } catch (err) {
                showError("Không thể xóa lớp học: " + err.message);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Map FE form fields → BE expected field names
            const payload = {
                courseCode: formData.code,
                courseName: formData.name,
                subjectId: formData.subjectId ? Number(formData.subjectId) : undefined,
                semesterId: formData.semesterId ? Number(formData.semesterId) : undefined,
                maxStudents: formData.maxStudents ? Number(formData.maxStudents) : undefined,
                status: formData.status || "ACTIVE",
            };
            if (editingCourse) {
                await updateMutation.mutateAsync({ id: editingCourse.id, body: payload });
                success("Cập nhật lớp học thành công");
            } else {
                await createMutation.mutateAsync(payload);
                success("Tạo lớp học mới thành công");
            }
            setShowModal(false);
            setEditingCourse(null);
            setFormData(DEFAULT_COURSE_FORM);
        } catch (err) {
            showError("Thao tác thất bại: " + err.message);
        }
    };

    const handleOpenAssign = (course) => {
        setSelectedCourse(course);
        setAssignForm({ lecturerId: course.lecturerId || (course.lecturers?.[0]?.id) || "" });
        setShowAssignModal(true);
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCourse) return;
        try {
            await assignMutation.mutateAsync({
                courseId: selectedCourse.id,
                lecturerUserId: Number(assignForm.lecturerId)  // hook expects lecturerUserId
            });
            success("Phân công giảng viên thành công");
            setShowAssignModal(false);
        } catch (err) {
            showError("Phân công thất bại: " + err.message);
        }
    };

    const handleRemoveLecturer = async (course) => {
        if (!window.confirm("Xóa giảng viên khỏi lớp học này?")) return;
        const lecturerId = course.lecturers?.[0]?.id;
        if (!lecturerId) return showError("Không tìm thấy giảng viên để gỡ");
        try {
            await removeLecturerMutation.mutateAsync({ courseId: course.id, lecturerUserId: Number(lecturerId) });
            success("Đã gỡ bỏ giảng viên");
        } catch (err) {
            showError("Thất bại: " + err.message);
        }
    };

    const handleOpenImport = (course) => {
        setSelectedCourse(course);
        setImportSelectedIds([]);
        setExcelFile(null);
        setShowImportModal(true);
    };

    const toggleImportStudent = (id) => {
        setImportSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleImportSubmit = async () => {
        if (!selectedCourse || importSelectedIds.length === 0) return;
        try {
            await enrollMutation.mutateAsync({
                courseId: selectedCourse.id,
                studentUserIds: importSelectedIds  // hook expects studentUserIds
            });
            success(`Đã thêm ${importSelectedIds.length} sinh viên vào lớp`);
            setShowImportModal(false);
        } catch (err) {
            showError("Import thất bại: " + err.message);
        }
    };

    const handleExcelUpload = (e) => {
        const file = e.target.files[0];
        if (file) setExcelFile(file);
    };

    const handleExcelSubmit = async () => {
        if (!selectedCourse || !excelFile) return;
        setIsUploading(true);
        try {
            await importMutation.mutateAsync({
                courseId: selectedCourse.id,
                formData: excelFile  // hook destructures { courseId, formData }
            });
            success("Đã hoàn tất import từ file Excel");
            setShowImportModal(false);
        } catch (err) {
            showError("Import Excel thất bại: " + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleOpenViewStudents = (course) => {
        setSelectedCourse(course);
        setShowViewStudentsModal(true);
    };

    const handleKickStudent = async (studentId, studentName) => {
        if (!window.confirm(`Gỡ sinh viên ${studentName} khỏi lớp này?`)) return;
        try {
            await unenrollMutation.mutateAsync({
                courseId: selectedCourse.id,
                studentId
            });
            success("Đã gỡ sinh viên");
        } catch (err) {
            showError("Thất bại: " + err.message);
        }
    };

    return {
        // Data
        courses,
        loadingCourses,
        semesters,
        subjects,
        lecturers,
        allStudents,
        filteredCourses,
        stats,

        // State
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

        // Handlers
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
    };
}
