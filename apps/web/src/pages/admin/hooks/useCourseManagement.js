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
        if (window.confirm("Báº¡n cĂ³ cháº¯c cháº¯n muá»‘n xĂ³a lá»›p há»c nĂ y? HĂ nh Ä‘á»™ng nĂ y khĂ´ng thá»ƒ hoĂ n tĂ¡c.")) {
            try {
                await deleteMutation.mutateAsync(id);
                success("ÄĂ£ xĂ³a lá»›p há»c thĂ nh cĂ´ng");
            } catch (err) {
                showError("KhĂ´ng thá»ƒ xĂ³a lá»›p há»c: " + err.message);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Map FE form fields â†’ BE expected field names
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
                success("Cáº­p nháº­t lá»›p há»c thĂ nh cĂ´ng");
            } else {
                await createMutation.mutateAsync(payload);
                success("Táº¡o lá»›p há»c má»›i thĂ nh cĂ´ng");
            }
            setShowModal(false);
            setEditingCourse(null);
            setFormData(DEFAULT_COURSE_FORM);
        } catch (err) {
            showError("Thao tĂ¡c tháº¥t báº¡i: " + err.message);
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
            success("PhĂ¢n cĂ´ng giáº£ng viĂªn thĂ nh cĂ´ng");
            setShowAssignModal(false);
        } catch (err) {
            showError("PhĂ¢n cĂ´ng tháº¥t báº¡i: " + err.message);
        }
    };

    const handleRemoveLecturer = async (course) => {
        if (!window.confirm("XĂ³a giáº£ng viĂªn khá»i lá»›p há»c nĂ y?")) return;
        const lecturerId = course.lecturers?.[0]?.id;
        if (!lecturerId) return showError("KhĂ´ng tĂ¬m tháº¥y giáº£ng viĂªn Ä‘á»ƒ gá»¡");
        try {
            await removeLecturerMutation.mutateAsync({ courseId: course.id, lecturerUserId: Number(lecturerId) });
            success("ÄĂ£ gá»¡ bá» giáº£ng viĂªn");
        } catch (err) {
            showError("Tháº¥t báº¡i: " + err.message);
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
            success(`ÄĂ£ thĂªm ${importSelectedIds.length} sinh viĂªn vĂ o lá»›p`);
            setShowImportModal(false);
        } catch (err) {
            showError("Import tháº¥t báº¡i: " + err.message);
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
            success("ÄĂ£ hoĂ n táº¥t import tá»« file Excel");
            setShowImportModal(false);
        } catch (err) {
            showError("Import Excel tháº¥t báº¡i: " + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleOpenViewStudents = (course) => {
        setSelectedCourse(course);
        setShowViewStudentsModal(true);
    };

    const handleKickStudent = async (studentId, studentName) => {
        if (!window.confirm(`Gá»¡ sinh viĂªn ${studentName} khá»i lá»›p nĂ y?`)) return;
        try {
            await unenrollMutation.mutateAsync({
                courseId: selectedCourse.id,
                studentId
            });
            success("ÄĂ£ gá»¡ sinh viĂªn");
        } catch (err) {
            showError("Tháº¥t báº¡i: " + err.message);
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
