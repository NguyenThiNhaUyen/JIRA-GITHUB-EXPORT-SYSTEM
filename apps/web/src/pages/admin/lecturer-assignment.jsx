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
  getSemesters,
  getSubjects
} from "../../features/system/api/systemApi.js";

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
  const { data: coursesData = { items: [] }, isLoading: loadingCourses } = useGetCourses();
  const courses = coursesData.items || [];

  const { data: lecturers = [], isLoading: loadingLects } = useGetUsers("LECTURER");
  
  // Use local state for semesters/subjects to use the direct API calls I refined
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingInternal, setLoadingInternal] = useState(true);

  useEffect(() => {
    async function loadInternalData() {
      try {
        const [semData, subData] = await Promise.all([getSemesters(), getSubjects()]);
        setSemesters(semData || []);
        setSubjects(subData || []);
      } catch (err) {
        showError("Không thể tải danh sách học kỳ/môn học");
      } finally {
        setLoadingInternal(false);
      }
    }
    loadInternalData();
  }, []);

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
        c.course_code?.toLowerCase().includes(search.toLowerCase()) ||
        c.course_name?.toLowerCase().includes(search.toLowerCase());

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
      result = [...result].sort((a, b) => 
        (a.course_code || "").localeCompare(b.course_code || "")
      );
    }

    return result;
  }, [courses, search, filterSem, sort]);

  useEffect(() => {
    setPage(1);
  }, [search, filterSem]);

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  /* ---------------- STATS ---------------- */
  const assignedCount = courses.filter((c) => (c.lecturers?.length || 0) > 0).length;
  const unassignedCount = courses.filter((c) => (c.lecturers?.length || 0) === 0).length;


  const handleAssign = async () => {
    if (!selectedLecturer || !selectedCourse) {
      showError("Vui lòng chọn giảng viên");
      return;
    }
    try {
      await assignMutation.mutateAsync({
        courseId: selectedCourse.id,
        lecturerUserId: Number(selectedLecturer)
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
    const confirmDelete = window.confirm(`Xóa giảng viên ${lecturerName} khỏi lớp này?`);
    if (!confirmDelete) return;
    try {
      await removeMutation.mutateAsync({
        courseId,
        lecturerUserId: Number(lecturerId)
      });
      success("Đã xóa phân công");
    } catch (err) {
      showError(err.message || "Không thể xóa");
    }
  };

  const isLoading = loadingCourses || loadingLects || loadingInternal;

  /* ---------------- UI ---------------- */
  return (
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
          <span className="text-gray-800 font-semibold">Phân công Giảng viên</span>
        </nav>

        {/* TITLE */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Phân công Giảng viên</h2>
          <p className="text-sm text-gray-500">Gán giảng viên phụ trách các lớp học phần</p>
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
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
              className="px-3 py-2 border rounded-lg text-xs flex items-center gap-1 hover:bg-gray-50 transition-colors"
            >
              <ArrowUpDown size={12} />
              Sort sĩ số
            </button>
          </CardContent>
        </Card>

        {/* TABLE */}
        <Card className="border border-gray-100 shadow-sm rounded-[24px]">
          <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase rounded-t-[24px]">
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
                <p className="mt-2 font-medium">Chưa có lớp học phần</p>
                <p className="text-xs">Hãy tạo lớp học phần trước khi phân công giảng viên</p>
              </div>
            ) : (
              <div className="divide-y">
                {paginated.map((course) => {
                  const assigned = course.lecturers || [];
                  const subject_code = course.subject_code || subjectMap[String(course.subjectId)]?.subject_code || "N/A";
                  const semester_name = course.semester_name || semesterMap[String(course.semesterId)]?.name || "N/A";

                  return (
                    <div
                      key={course.id}
                      className="grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-teal-50 transition group"
                    >
                      <div className="col-span-4">
                        <p className="font-bold text-teal-700">{course.course_code}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{course.course_name}</p>
                      </div>

                      <div className="col-span-2 text-center hidden md:block">
                        <p className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block">
                          {subject_code}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">{semester_name}</p>
                      </div>

                      <div className="col-span-1 text-center text-xs">
                        <span className="font-semibold">{course.currentStudents || 0}</span>
                        <span className="text-gray-400">/{course.max_students || 40}</span>
                        <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                          <div
                            className="bg-teal-500 h-1 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, ((course.currentStudents || 0) / (course.max_students || 40)) * 100)}%`
                            }}
                          />
                        </div>
                      </div>

                      <div className="col-span-3 flex flex-wrap gap-2">
                        {assigned.length === 0 ? (
                          <span className="text-xs text-gray-400 italic">Chưa phân công</span>
                        ) : (
                          assigned.map((lect) => (
                            <div
                              key={lect.id}
                              className="flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full shadow-sm"
                            >
                              <Avatar name={lect.name} />
                              <span className="font-semibold">{lect.name}</span>
                              <span
                                className={`text-[10px] ${
                                  (lecturerWorkload[lect.id] || 0) > 4 ? "text-red-500 font-bold" : "text-gray-400"
                                }`}
                              >
                                {lecturerWorkload[lect.id] || 0} lớp
                              </span>
                              <button
                                onClick={() => handleRemove(course.id, lect.id, lect.name)}
                                className="text-teal-400 hover:text-red-500 transition-colors ml-1"
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
                          className="flex items-center gap-1 text-xs bg-teal-600 text-white rounded-xl px-3 py-1.5 hover:bg-teal-700 transition-all shadow-sm hover:shadow-md"
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
          <div className="flex justify-end items-center gap-3 text-sm py-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-xl border-gray-200"
            >
              Trước
            </Button>
            <span className="text-gray-500 font-medium">Trang {page} / {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border-gray-200"
            >
              Sau
            </Button>
          </div>
        )}

        {/* Assign Modal */}
        {modalOpen && selectedCourse && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-[32px] w-[420px] shadow-2xl p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl text-gray-800">Phân công giảng viên</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100/50">
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-1">Đang chọn lớp</p>
                <p className="text-sm font-bold text-gray-800">
                  {selectedCourse.course_code} — {selectedCourse.course_name}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Chọn Giảng viên</label>
                <select
                  value={selectedLecturer}
                  onChange={(e) => setSelectedLecturer(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                >
                  <option value="">-- Click để chọn giảng viên --</option>
                  {lecturers.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} (Đang dạy {lecturerWorkload[l.id] || 0} lớp)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setModalOpen(false)}
                  variant="outline"
                  className="flex-1 rounded-2xl h-12 border-gray-200 font-bold"
                >
                  Hủy bỏ
                </Button>
                <Button
                  onClick={handleAssign}
                  disabled={!selectedLecturer}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-12 font-bold shadow-lg shadow-teal-600/20 disabled:opacity-50"
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
