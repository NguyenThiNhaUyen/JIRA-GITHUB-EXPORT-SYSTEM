// Lecturer Assignment — Admin Module (Enhanced LMS Version)

import { DndContext } from "@dnd-kit/core";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";

import {
  ChevronRight,
  Search,
  Plus,
  X,
  BookOpen,
  ArrowUpDown
} from "lucide-react";

import {
  useGetCourses,
  useAssignLecturer,
  useRemoveLecturer
} from "../../features/courses/hooks/useCourses.js";

import {
  useGetSemesters,
  useGetSubjects
} from "../../features/system/hooks/useSystem.js";

import { useGetUsers } from "../../features/users/hooks/useUsers.js";


/* ---------------- COMPONENTS ---------------- */

function Avatar({ name }) {

  const letter = name?.charAt(0)?.toUpperCase() || "L";

  return (
    <div className="w-6 h-6 rounded-full bg-teal-200 text-teal-800 flex items-center justify-center text-xs font-bold">
      {letter}
    </div>
  );
}

function SkeletonRow() {

  return (
    <div className="grid grid-cols-12 gap-3 px-6 py-4 animate-pulse">
      <div className="col-span-4 h-4 bg-gray-200 rounded"></div>
      <div className="col-span-2 h-4 bg-gray-200 rounded"></div>
      <div className="col-span-1 h-4 bg-gray-200 rounded"></div>
      <div className="col-span-3 h-4 bg-gray-200 rounded"></div>
      <div className="col-span-2 h-4 bg-gray-200 rounded"></div>
    </div>
  );
}


/* ---------------- MAIN ---------------- */

export default function LecturerAssignment() {

  const navigate = useNavigate();
  const { success, error: showError } = useToast();


  /* ---------------- DATA ---------------- */

  const { data: coursesData = { items: [] }, isLoading: loadingCourses } =
    useGetCourses();

  const courses = coursesData.items || [];

  const { data: lecturers = [], isLoading: loadingLects } =
    useGetUsers("LECTURER");

  const { data: semesters = [], isLoading: loadingSems } =
    useGetSemesters();

  const { data: subjects = [], isLoading: loadingSubs } =
    useGetSubjects();

  const assignMutation = useAssignLecturer();
  const removeMutation = useRemoveLecturer();


  /* ---------------- STATE ---------------- */

  const [search, setSearch] = useState("");
  const [filterSem, setFilterSem] = useState("");
  const [sort, setSort] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLecturer, setSelectedLecturer] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 8;


  /* ---------------- MAP LOOKUP ---------------- */

  const subjectMap = useMemo(() => {

    const map = {};
    subjects.forEach((s) => (map[String(s.id)] = s));
    return map;

  }, [subjects]);

  const semesterMap = useMemo(() => {

    const map = {};
    semesters.forEach((s) => (map[String(s.id)] = s));
    return map;

  }, [semesters]);


  /* ---------------- LECTURER WORKLOAD ---------------- */

  const lecturerWorkload = useMemo(() => {

    const map = {};

    courses.forEach((c) => {

      (c.lecturers || []).forEach((l) => {

        map[l.id] = (map[l.id] || 0) + 1;

      });

    });

    return map;

  }, [courses]);


  /* ---------------- FILTER ---------------- */

  const filtered = useMemo(() => {

    let result = courses.filter((c) => {

      const matchSearch =
        !search ||
        c.code?.toLowerCase().includes(search.toLowerCase()) ||
        c.name?.toLowerCase().includes(search.toLowerCase());

      const matchSem =
        !filterSem ||
        String(c.semesterId) === String(filterSem);

      return matchSearch && matchSem;

    });

    if (sort === "students") {

      result = [...result].sort(
        (a, b) => (b.currentStudents || 0) - (a.currentStudents || 0)
      );

    }

    if (sort === "course") {

      result = [...result].sort(
        (a, b) => a.code.localeCompare(b.code)
      );

    }

    return result;

  }, [courses, search, filterSem, sort]);


  useEffect(() => {
    setPage(1);
  }, [search, filterSem]);


  /* ---------------- PAGINATION ---------------- */

  const totalPages = Math.ceil(filtered.length / pageSize);

  const paginated = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );


  /* ---------------- STATS ---------------- */

  const assignedCount = courses.filter(
    (c) => (c.lecturers?.length || 0) > 0
  ).length;

  const unassignedCount = courses.filter(
    (c) => (c.lecturers?.length || 0) === 0
  ).length;


  /* ---------------- ACTIONS ---------------- */

  const handleDragEnd = async (event) => {

    const lecturerId = event.active.id;
    const courseId = event.over?.id;

    if (!courseId) return;

    await assignMutation.mutateAsync({
      courseId,
      lecturerUserId: lecturerId
    });

  };


  const handleAssign = async () => {

    if (!selectedLecturer || !selectedCourse) {
      showError("Vui lòng chọn giảng viên");
      return;
    }

    try {

      await assignMutation.mutateAsync({
        courseId: selectedCourse.id,
        lecturerUserId: selectedLecturer
      });

      success("Đã phân công giảng viên");

      setModalOpen(false);
      setSelectedCourse(null);
      setSelectedLecturer("");

    } catch (err) {

      showError(err.message || "Không thể phân công");

    }

  };


  const handleRemove = async (courseId, lecturerId, lecturerName) => {

    const confirmDelete = window.confirm(
      `Xóa giảng viên ${lecturerName} khỏi lớp này?`
    );

    if (!confirmDelete) return;

    try {

      await removeMutation.mutateAsync({
        courseId,
        lecturerUserId: lecturerId
      });

      success("Đã xóa phân công");

    } catch (err) {

      showError(err.message || "Không thể xóa");

    }

  };


  const isLoading =
    loadingCourses ||
    loadingLects ||
    loadingSems ||
    loadingSubs;


  /* ---------------- UI ---------------- */

  return (

<DndContext onDragEnd={handleDragEnd}>

<div className="space-y-6">

{/* Breadcrumb */}

<nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">

<span
className="text-teal-700 font-semibold cursor-pointer hover:underline"
onClick={() => navigate("/admin")}
>
Admin
</span>

<ChevronRight size={12} />

<span className="text-gray-800 font-semibold">
Phân công Giảng viên
</span>

</nav>


{/* TITLE */}

<div>

<h2 className="text-2xl font-bold text-gray-800">
Phân công Giảng viên
</h2>

<p className="text-sm text-gray-500">
Gán giảng viên phụ trách các lớp học phần
</p>

</div>


{/* STATS */}

<div className="grid grid-cols-3 gap-4">

<div className="rounded-2xl px-4 py-3 border border-blue-100 bg-blue-50 flex justify-between text-blue-700">
<span className="text-xs font-semibold">Tổng lớp</span>
<span className="text-xl font-bold">{courses.length}</span>
</div>

<div className="rounded-2xl px-4 py-3 border border-green-100 bg-green-50 flex justify-between text-green-700">
<span className="text-xs font-semibold">Đã phân công</span>
<span className="text-xl font-bold">{assignedCount}</span>
</div>

<div className="rounded-2xl px-4 py-3 border border-orange-100 bg-orange-50 flex justify-between text-orange-600">
<span className="text-xs font-semibold">Chưa phân công</span>
<span className="text-xl font-bold">{unassignedCount}</span>
</div>

</div>


{/* FILTER */}

<Card className="border border-gray-100 shadow-sm rounded-[24px]">

<CardContent className="p-5 flex gap-4 items-end">

<div className="relative flex-1">

<Search
size={15}
className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
/>

<input
value={search}
onChange={(e) => setSearch(e.target.value)}
placeholder="Tìm lớp học..."
className="pl-9 pr-4 py-2.5 w-full bg-gray-50 border border-gray-100 rounded-xl text-sm"
/>

</div>

<select
value={filterSem}
onChange={(e) => setFilterSem(e.target.value)}
className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm"
>

<option value="">Tất cả học kỳ</option>

{semesters.map((s) => (

<option key={s.id} value={s.id}>
{s.code} – {s.name}
</option>

))}

</select>

<button
onClick={() => setSort("students")}
className="px-3 py-2 border rounded-lg text-xs flex items-center gap-1"
>
<ArrowUpDown size={12} />
Sort sĩ số
</button>

</CardContent>

</Card>


{/* TABLE */}

<Card className="border border-gray-100 shadow-sm rounded-[24px]">

<div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">

<div className="col-span-4">Lớp học phần</div>
<div className="col-span-2 text-center hidden md:block">Môn / Kỳ</div>
<div className="col-span-1 text-center">Sĩ số</div>
<div className="col-span-3">Giảng viên</div>
<div className="col-span-2 text-right">Thao tác</div>

</div>

<CardContent className="p-0">

{isLoading ? (

<>
<SkeletonRow />
<SkeletonRow />
<SkeletonRow />
</>

) : paginated.length === 0 ? (

<div className="flex flex-col items-center py-20 text-gray-400">

<BookOpen size={40} />

<p className="mt-2 font-medium">
Chưa có lớp học phần
</p>

<p className="text-xs">
Hãy tạo lớp học phần trước khi phân công giảng viên
</p>

</div>

) : (

<div className="divide-y">

{paginated.map((course) => {

const assigned = course.lecturers || [];
const subject = subjectMap[String(course.subjectId)];
const semester = semesterMap[String(course.semesterId)];

return (

<div
key={course.id}
id={course.id}
className="grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-teal-50 transition"
>

<div className="col-span-4">

<p className="font-bold text-teal-700">
{course.code}
</p>

<p className="text-xs text-gray-400">
{course.name}
</p>

</div>

<div className="col-span-2 text-center hidden md:block">

<p className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block">
{subject?.code || "N/A"}
</p>

<p className="text-[11px] text-gray-400">
{semester?.name || "N/A"}
</p>

</div>

<div className="col-span-1 text-center text-xs">

<span className="font-semibold">
{course.currentStudents || 0}
</span>

<span className="text-gray-400">
/{course.maxStudents || 40}
</span>

<div className="w-full bg-gray-100 rounded-full h-1 mt-1">
<div
className="bg-teal-500 h-1 rounded-full"
style={{
width: `${((course.currentStudents || 0) /
(course.maxStudents || 40)) * 100}%`
}}
/>
</div>

</div>

<div className="col-span-3 flex flex-wrap gap-2">

{assigned.length === 0 ? (

<span className="text-xs text-gray-400 italic">
Chưa phân công
</span>

) : (

assigned.map((lect) => (

<div
key={lect.id}
className="flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full"
>

<Avatar name={lect.name} />

<span className="font-semibold">
{lect.name}
</span>

<span
className={`text-xs ${
(lecturerWorkload[lect.id] || 1) > 4
? "text-red-500"
: "text-gray-400"
}`}
>
{lecturerWorkload[lect.id] || 1} lớp
</span>

<button
onClick={() =>
handleRemove(
course.id,
lect.id,
lect.name
)
}
className="text-teal-400 hover:text-red-500"
>
<X size={11} />
</button>

</div>

))

)}

</div>

<div className="col-span-2 flex justify-end">

<button
onClick={() => {
setSelectedCourse(course);
setModalOpen(true);
}}
className="flex items-center gap-1 text-xs bg-teal-600 text-white rounded-xl px-3 py-1.5 hover:bg-teal-700"
>

<Plus size={12} />
Phân công

</button>

</div>

</div>

);

})}

</div>

)}

</CardContent>

</Card>


{/* Pagination */}

{totalPages > 1 && (

<div className="flex justify-end items-center gap-3 text-sm">

<Button
disabled={page === 1}
onClick={() => setPage((p) => p - 1)}
>
Prev
</Button>

<span>
Page {page} / {totalPages}
</span>

<Button
disabled={page === totalPages}
onClick={() => setPage((p) => p + 1)}
>
Next
</Button>

</div>

)}


{/* Assign Modal */}

{modalOpen && selectedCourse && (

<div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

<div className="bg-white rounded-2xl w-[420px] shadow-xl p-6 space-y-4">

<div className="flex justify-between items-center">

<h3 className="font-bold text-lg">
Phân công giảng viên
</h3>

<button
onClick={() => setModalOpen(false)}
className="text-gray-400 hover:text-red-500"
>
<X size={16} />
</button>

</div>

<p className="text-sm text-gray-500">

{selectedCourse.code} — {selectedCourse.name}

</p>

<select
value={selectedLecturer}
onChange={(e) => setSelectedLecturer(e.target.value)}
className="w-full border rounded-xl px-3 py-2 text-sm"
>

<option value="">Chọn giảng viên</option>

{lecturers.map((l) => (

<option key={l.id} value={l.id}>
{l.name} ({lecturerWorkload[l.id] || 0} lớp)
</option>

))}

</select>

<Button
onClick={handleAssign}
className="w-full bg-teal-600 hover:bg-teal-700"
>

Xác nhận phân công

</Button>

</div>

</div>

)}

</div>

</DndContext>

);
}