import { useState, useMemo } from "react";
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

import {
  CalendarDays,
  PlayCircle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

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
  const { data: coursesData = { items: [] }, isLoading: loadingCourses } =
    useGetCourses({ pageSize: 1000 });

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

  /* ---------------- HELPERS ---------------- */

  const filteredSemesters = useMemo(() => {
    let result = [...semesters];

    if (filter !== "ALL") {
      result = result.filter((s) => s.status === filter);
    }

    if (search) {
      result = result.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    result.sort((a, b) => {
      const partsA = a.name.split(" ");
      const partsB = b.name.split(" ");
      const yearA = partsA.length > 1 ? parseInt(partsA[1]) : 0;
      const yearB = partsB.length > 1 ? parseInt(partsB[1]) : 0;
      return sortYear === "ASC" ? yearA - yearB : yearB - yearA;
    });

    return result;
  }, [semesters, filter, search, sortYear]);

  const getCoursesForSemester = (semesterId) =>
    allCourses.filter((c) => c.semester?.id === semesterId);

  const taoTenHocKy = () => `${formData.type} ${formData.year}`;

  const tinhTrangThai = (start, end) => {
    const today = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (today < startDate) return "UPCOMING";
    if (today <= endDate) return "ACTIVE";
    return "COMPLETED";
  };

  const goiYThoiGian = (type) => {
    const year = parseInt(formData.year) || new Date().getFullYear();

    const mapping = {
      Spring: [`${year}-01-01`, `${year}-04-30`],
      Summer: [`${year}-05-01`, `${year}-08-31`],
      Fall: [`${year}-09-01`, `${year}-12-31`],
    };

    const [start, end] = mapping[type] || mapping['Spring'];

    setFormData({
      ...formData,
      type,
      startDate: start,
      endDate: end,
    });
  };

  /* ---------------- AUTO GENERATE ---------------- */

  const autoGenerateYear = async (year) => {
    try {
      await generateMutation.mutateAsync({ year }); 
      success("Đã tạo tự động 3 học kỳ cho năm " + year);
    } catch {
      showError("Tính năng Auto Generate bị lỗi kết nối.");
    }
  };

  /* ---------------- CRUD ---------------- */

  const handleCreate = () => {
    setEditingSemester(null);
    const currentYear = new Date().getFullYear();
    setFormData({
      type: "Spring",
      year: currentYear,
      startDate: `${currentYear}-01-01`,
      endDate: `${currentYear}-04-30`,
    });
    setShowModal(true);
  };

  const handleEdit = (semester) => {
    setEditingSemester(semester);

    const parts = semester.name ? semester.name.split(" ") : ["Spring", new Date().getFullYear().toString()];
    const type = parts[0] || "Spring";
    const year = parts[1] || new Date().getFullYear().toString();

    const formatForInput = (dateStr) => {
      if (!dateStr || dateStr.startsWith('0001')) return "";
      return dateStr.split('T')[0];
    };

    setFormData({
      type,
      year,
      startDate: formatForInput(semester.startDate),
      endDate: formatForInput(semester.endDate),
    });

    setShowModal(true);
  };

  const handleDelete = async (semesterId) => {
    const courses = getCoursesForSemester(semesterId);

    if (courses.length > 0) {
      showError("Không thể xóa học kỳ đã có lớp học");
      return;
    }

    if (!confirm("Bạn có chắc muốn xóa học kỳ này?")) return;

    try {
      await deleteMutation.mutateAsync(semesterId);
      success("Xóa học kỳ thành công");
    } catch {
      showError("Xóa học kỳ thất bại");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      showError("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }

    const name = taoTenHocKy();
    
    // Bỏ hết đống Status đi, cứ ném đúng Name, StartDate, EndDate. C# sẽ tự nội suy dựa vào thời gian thực tế!
    const payload = {
      name: name,
      startDate: formData.startDate,
      endDate: formData.endDate
    };

    try {
      if (editingSemester) {
        await updateMutation.mutateAsync({
          id: editingSemester.id,
          updates: payload,
        });
        success("Cập nhật học kỳ thành công");
      } else {
        await createMutation.mutateAsync(payload);
        success("Tạo học kỳ thành công");
      }

      setShowModal(false);
    } catch {
      showError("Thao tác thất bại");
    }
  };

  /* ---------------- UI ---------------- */

  const formatDisplayDate = (dateStr) => {
    if (!dateStr || dateStr.startsWith('0001')) return "Chưa xác định";
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div className="p-6 space-y-8">

      {/* STATS */}

      <div className="grid grid-cols-4 gap-6">

        <StatCard icon={<CalendarDays className="text-blue-500" />} title="Tổng số học kỳ" value={semesters.length} />

        <StatCard
          icon={<PlayCircle className="text-green-500" />}
          title="Đang diễn ra"
          value={semesters.filter((s) => s.status === "ACTIVE").length}
        />

        <StatCard
          icon={<AlertCircle className="text-indigo-500" />}
          title="Sắp tới"
          value={semesters.filter((s) => s.status === "UPCOMING").length}
        />

        <StatCard
          icon={<CheckCircle className="text-gray-500" />}
          title="Đã kết thúc"
          value={semesters.filter((s) => s.status === "COMPLETED").length}
        />

      </div>

      {/* TIMELINE */}

      <Card className="p-6 border-0 shadow-sm rounded-2xl bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none"></div>
        <CardTitle className="mb-6 text-xl tracking-tight text-gray-800">Timeline Học kỳ</CardTitle>

        {semesters.length > 0 ? semesters.map((s) => (
          <div key={s.id} className="flex items-center gap-4 mb-4 relative z-10">

            <div className="w-32 text-sm font-semibold text-gray-700">{s.name}</div>

            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  s.status === "ACTIVE"
                    ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                    : s.status === "UPCOMING"
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }`}
                style={{ width: s.status === 'ACTIVE' ? '100%' : s.status === 'COMPLETED' ? '100%' : '50%' }}
              />
            </div>

            <div className="text-xs font-medium text-gray-500 w-48 text-right">
              {formatDisplayDate(s.startDate)} → {formatDisplayDate(s.endDate)}
            </div>

          </div>
        )) : <div className="text-gray-400 text-sm text-center py-4">Chưa có dữ liệu</div>}
      </Card>

      {/* COURSE LOAD */}

      <Card className="p-6 border-0 shadow-sm rounded-2xl bg-white relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none"></div>
        <CardTitle className="mb-6 text-xl tracking-tight text-gray-800">Cường độ Lớp học (Course Load)</CardTitle>

        {semesters.length > 0 ? semesters.map((s) => {
          const count = getCoursesForSemester(s.id).length;
          
          // Tránh lỗi chia cho 0, xác định maxCourses giả định là 20 để scale thanh
          const maxCourses = 20;
          const percentage = Math.min((count / maxCourses) * 100, 100);

          return (
            <div key={s.id} className="mb-5 relative z-10">

              <div className="flex justify-between items-end text-sm mb-2">
                <span className="font-semibold text-gray-700">{s.name}</span>
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-xs">{count} Lớp</span>
              </div>

              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-400 to-indigo-500 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>

            </div>
          );
        }) : <div className="text-gray-400 text-sm text-center py-4">Chưa có dữ liệu</div>}
      </Card>

      {/* TABLE */}

      <Card className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden">

        <CardHeader className="flex flex-row justify-between items-center border-b border-gray-50 bg-white px-6 py-5">
          <CardTitle className="text-xl tracking-tight text-gray-800">Danh sách Cụ thể</CardTitle>
          <div className="flex gap-3">
            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm text-sm h-9">
              + Thêm mới
            </Button>
            <Button
              variant="outline"
              onClick={() => autoGenerateYear(new Date().getFullYear())}
              className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 text-sm h-9"
            >
              Tạo tự động
            </Button>
          </div>
        </CardHeader>

        <div className="bg-gray-50/50 p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {/* SEARCH + SORT */}
            <div className="flex gap-3 flex-1">
              <input
                placeholder="Tìm học kỳ (VD: Spring 2026)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-200 px-4 py-2 rounded-xl text-sm w-full max-w-[250px] focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-white"
              />

              <select
                value={sortYear}
                onChange={(e) => setSortYear(e.target.value)}
                className="border border-gray-200 px-4 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-white cursor-pointer"
              >
                <option value="DESC">Năm mới nhất</option>
                <option value="ASC">Năm cũ nhất</option>
              </select>
            </div>

            {/* FILTER */}
            <div className="flex gap-2">
              {[
                { val: "ALL", label: "Tất cả" }, 
                { val: "ACTIVE", label: "Đang diễn ra" }, 
                { val: "UPCOMING", label: "Sắp tới" }, 
                { val: "COMPLETED", label: "Đã xong" }
              ].map((st) => (
                <button
                  key={st.val}
                  onClick={() => setFilter(st.val)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    filter === st.val 
                      ? "bg-gray-800 text-white shadow-md" 
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <CardContent className="p-0">
          {(loadingSemesters || loadingCourses) ? (
            <div className="text-center py-20 text-gray-400 text-sm">Đang tải biểu dữ liệu...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/30">
                  <TableRow className="border-b border-gray-100 hover:bg-transparent">
                    <TableHead className="py-4 px-6 text-xs text-center font-semibold text-gray-500 uppercase">Tên Học Kỳ</TableHead>
                    <TableHead className="py-4 px-6 text-xs text-center font-semibold text-gray-500 uppercase">Thời gian</TableHead>
                    <TableHead className="py-4 px-6 text-xs text-center font-semibold text-gray-500 uppercase">Các Lớp Môn Học</TableHead>
                    <TableHead className="py-4 px-6 text-xs text-center font-semibold text-gray-500 uppercase">Trạng thái</TableHead>
                    <TableHead className="py-4 px-6 text-xs text-center font-semibold text-gray-500 uppercase">Hành động</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-50">
                  {filteredSemesters.map((semester) => {
                    const courses = getCoursesForSemester(semester.id);

                    return (
                      <TableRow key={semester.id} className="hover:bg-blue-50/30 transition-colors border-none">
                        
                        <TableCell className="py-4 px-6 text-center font-semibold text-gray-800 text-sm">
                          {semester.name}
                        </TableCell>

                        <TableCell className="py-4 px-6 text-center text-sm">
                           <div className="text-gray-700 font-medium">{formatDisplayDate(semester.startDate)}</div>
                           <div className="text-xs text-gray-400 mt-0.5">{formatDisplayDate(semester.endDate)}</div>
                        </TableCell>

                        <TableCell className="py-4 px-6 text-center max-w-[200px]">
                          <div className="flex flex-wrap justify-center gap-1.5">
                            {courses.length === 0 ? (
                              <span className="text-xs text-gray-400 italic">Trống</span>
                            ) : (
                              <>
                                {courses.slice(0, 3).map((c) => (
                                  <span key={c.id} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                                    {c.code}
                                  </span>
                                ))}
                                {courses.length > 3 && (
                                  <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                                    +{courses.length - 3}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="py-4 px-6 text-center">
                          <StatusBadge status={semester.status || 'UPCOMING'} />
                        </TableCell>

                        <TableCell className="py-4 px-6 text-center">
                          <div className="flex justify-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEdit(semester)}
                              className="h-8 px-3 text-xs text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 rounded-lg"
                            >
                              Sửa
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(semester.id)}
                              className="h-8 px-3 text-xs text-red-600 border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 rounded-lg"
                            >
                              Xóa
                            </Button>
                          </div>
                        </TableCell>

                      </TableRow>
                    );
                  })}
                  {filteredSemesters.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-gray-400 text-sm">
                        Không tìm thấy học kỳ nào phù hợp với bộ lọc
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL */}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSemester ? "Sửa học kỳ" : "Tạo học kỳ mới"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mùa (Giai đoạn)</label>
              <select
                value={formData.type}
                onChange={(e) => goiYThoiGian(e.target.value)}
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
              >
                <option value="Spring">Spring (Mùa Xuân)</option>
                <option value="Summer">Summer (Mùa Hè)</option>
                <option value="Fall">Fall (Mùa Thu)</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Năm học</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => {
                  setFormData({ ...formData, year: e.target.value });
                }}
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                min="2000"
                max="2100"
              />
            </div>
          </div>

          <div className="text-center py-2 bg-blue-50/50 rounded-lg border border-blue-100 border-dashed">
            <p className="text-sm font-medium text-blue-800">
              Tên học kỳ sẽ lưu: <strong className="text-blue-600">{formData.type} {formData.year}</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ngày bắt đầu</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ngày kết thúc</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="rounded-xl">
              Hủy
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm px-6">
              {editingSemester ? "Lưu Cập Nhật" : "Hoàn Tất Tạo"}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

/* COMPONENTS */

function StatCard({ icon, title, value }) {
  return (
    <div className="bg-white p-5 rounded-2xl flex items-center gap-4 border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-blue-100 group">
      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold tracking-tight text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    ACTIVE: "bg-green-50 text-green-600 border border-green-200/50",
    UPCOMING: "bg-blue-50 text-blue-600 border border-blue-200/50",
    COMPLETED: "bg-gray-100 text-gray-600 border border-gray-200/50",
  };

  const label = {
    ACTIVE: "ĐANG DIỄN RA",
    UPCOMING: "SẮP TỚI",
    COMPLETED: "ĐÃ KẾT THÚC",
  };

  return (
    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wide whitespace-nowrap ${map[status] || map.UPCOMING}`}>
      {label[status] || "CHƯA RÕ"}
    </span>
  );
}
