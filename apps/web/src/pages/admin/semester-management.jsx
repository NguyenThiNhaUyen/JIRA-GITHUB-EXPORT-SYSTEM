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
} from "../../features/system/hooks/useSystem.js";

import { useGetCourses } from "../../features/courses/hooks/useCourses.js";

export default function QuanLyHocKy() {
  const { success, error: showError } = useToast();

  const { data: semesters = [], isLoading: loadingSemesters } = useGetSemesters();
  const { data: coursesData = { items: [] }, isLoading: loadingCourses } =
    useGetCourses({ pageSize: 1000 });

  const allCourses = coursesData.items || [];

  const createMutation = useCreateSemester();
  const updateMutation = useUpdateSemester();
  const deleteMutation = useDeleteSemester();

  const isCreating = createMutation.isPending;
const isUpdating = updateMutation.isPending;
const isDeleting = deleteMutation.isPending;

  

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
      const yearA = parseInt(a.name.split(" ")[1]);
      const yearB = parseInt(b.name.split(" ")[1]);
      return sortYear === "ASC" ? yearA - yearB : yearB - yearA;
    });

    return result;
  }, [semesters, filter, search, sortYear]);

const semesterExists = (name) => {
  return semesters.some((s) => s.name === name);
};

  const getCoursesForSemester = (semesterId) =>
    allCourses.filter((c) => c.semesterId === semesterId);

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
    const year = parseInt(formData.year);

    const mapping = {
      Spring: [`${year}-01-01`, `${year}-04-30`],
      Summer: [`${year}-05-01`, `${year}-08-31`],
      Fall: [`${year}-09-01`, `${year}-12-31`],
    };

    const [start, end] = mapping[type];

    setFormData({
      ...formData,
      type,
      startDate: start,
      endDate: end,
    });
  };

  /* ---------------- AUTO GENERATE ---------------- */

  const autoGenerateYear = async (year) => {
    const semestersToCreate = [
      { type: "Spring", start: `${year}-01-01`, end: `${year}-04-30` },
      { type: "Summer", start: `${year}-05-01`, end: `${year}-08-31` },
      { type: "Fall", start: `${year}-09-01`, end: `${year}-12-31` },
    ];

    try {

  for (const s of semestersToCreate) {

    const name = `${s.type} ${year}`;

    if (semesterExists(name)) continue;

    await createMutation.mutateAsync({
      name,
      code: name.toUpperCase().replace(/\s+/g, ""),
      startDate: s.start,
      endDate: s.end,
      status: tinhTrangThai(s.start, s.end),
    });

  }

  success("Đã tạo học kỳ cho năm " + year);

} catch {

  showError("Auto generate thất bại");

}

    success("Đã tạo 3 học kỳ cho năm " + year);
  };

  /* ---------------- CRUD ---------------- */

  const handleCreate = () => {
    setEditingSemester(null);
    setFormData({
      type: "Spring",
      year: new Date().getFullYear(),
      startDate: "",
      endDate: "",
    });
    setShowModal(true);
  };

  const handleEdit = (semester) => {
    setEditingSemester(semester);

    const parts = semester.name?.split(" ") || [];
const type = parts[0] || "Spring";
const year = parts[1] || new Date().getFullYear();
    setFormData({
      type,
      year,
      startDate: semester.startDate,
      endDate: semester.endDate,
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

if (!editingSemester && semesterExists(name)) {
  showError("Học kỳ này đã tồn tại");
  return;
}

    const status = tinhTrangThai(formData.startDate, formData.endDate);

    const payload = {
      name,
      code: name.toUpperCase().replace(/\s+/g, ""),
      startDate: formData.startDate,
      endDate: formData.endDate,
      status,
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

setFormData({
  type: "Spring",
  year: new Date().getFullYear(),
  startDate: "",
  endDate: "",
});
    } catch {
      showError("Thao tác thất bại");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6 space-y-8">

      {/* STATS */}

      <div className="grid grid-cols-4 gap-6">

        <StatCard icon={<CalendarDays />} title="Tổng số học kỳ" value={semesters.length} />

        <StatCard
          icon={<PlayCircle />}
          title="Đang diễn ra"
          value={semesters.filter((s) => s.status === "ACTIVE").length}
        />

        <StatCard
          icon={<AlertCircle />}
          title="Sắp tới"
          value={semesters.filter((s) => s.status === "UPCOMING").length}
        />

        <StatCard
          icon={<CheckCircle />}
          title="Đã kết thúc"
          value={semesters.filter((s) => s.status === "COMPLETED").length}
        />

      </div>

      {/* TIMELINE */}

      <Card className="p-6">
        <CardTitle className="mb-4">Timeline Học kỳ</CardTitle>

        {semesters.map((s) => (
          <div key={s.id} className="flex gap-4 mb-3">

            <div className="w-32 text-sm">{s.name}</div>

            <div className="flex-1 h-3 bg-gray-200 rounded">

              <div
                className={`h-full ${
                  s.status === "ACTIVE"
                    ? "bg-green-500"
                    : s.status === "UPCOMING"
                    ? "bg-blue-500"
                    : "bg-gray-400"
                }`}
              />

            </div>

            <div className="text-xs text-gray-500">
              {s.startDate} → {s.endDate}
            </div>

          </div>
        ))}
      </Card>

      {/* COURSE LOAD */}

      <Card className="p-6">
        <CardTitle className="mb-4">Course Load Analyzer</CardTitle>

        {semesters.map((s) => {
          const count = getCoursesForSemester(s.id).length;

          return (
            <div key={s.id} className="mb-3">

              <div className="flex justify-between text-sm mb-1">
                <span>{s.name}</span>
                <span>{count} courses</span>
              </div>

              <div className="w-full bg-gray-200 h-3 rounded">

                <div
                  className="bg-blue-500 h-3 rounded"
                  style={{ width: `${Math.min(count * 15, 100)}%` }}
                />

              </div>

            </div>
          );
        })}
      </Card>

      {/* TABLE */}

      <Card>

        <CardHeader className="flex justify-between">

          <CardTitle>Danh sách Học kỳ</CardTitle>

          <div className="flex gap-2">

            <Button onClick={handleCreate}>+ Thêm</Button>

            <Button
              variant="outline"
              onClick={() =>
                autoGenerateYear(new Date().getFullYear())
              }
            >
              Auto Generate
            </Button>

          </div>

        </CardHeader>

        {/* SEARCH + SORT */}

        <div className="flex gap-3 px-6 pb-4">

          <input
            placeholder="Tìm học kỳ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          />

          <select
            value={sortYear}
            onChange={(e) => setSortYear(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          >
            <option value="DESC">Năm mới nhất</option>
            <option value="ASC">Năm cũ nhất</option>
          </select>

        </div>

        {/* FILTER */}

        <div className="flex gap-2 px-6 pb-4">

          {["ALL", "ACTIVE", "UPCOMING", "COMPLETED"].map((status) => (

            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
            >
              {status === "ALL"
                ? "Tất cả"
                : status === "ACTIVE"
                ? "Đang diễn ra"
                : status === "UPCOMING"
                ? "Sắp tới"
                : "Đã kết thúc"}
            </Button>

          ))}

        </div>

        <CardContent>

          {(loadingSemesters || loadingCourses) ? (
            <div className="text-center py-10">Đang tải...</div>
          ) : (

            <Table>

              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Môn học</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>

                {filteredSemesters.map((semester) => {

                  const courses = getCoursesForSemester(semester.id);

                  return (

                    <TableRow key={semester.id}>

                      <TableCell>{semester.name}</TableCell>

                      <TableCell>
                        {semester.startDate} - {semester.endDate}
                      </TableCell>

                      <TableCell>
                        {courses.length === 0
                          ? "Chưa có lớp"
                          : courses.slice(0, 3).map((c) => c.code).join(", ")}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={semester.status} />
                      </TableCell>

                      <TableCell className="flex gap-2">

                        <Button size="sm" onClick={() => handleEdit(semester)}>
                          Sửa
                        </Button>

                        <Button
  size="sm"
  variant="destructive"
  disabled={isDeleting}
  onClick={() => handleDelete(semester.id)}
>
                          Xóa
                        </Button>

                      </TableCell>

                    </TableRow>

                  );
                })}

              </TableBody>

            </Table>

          )}

        </CardContent>

      </Card>

      {/* MODAL */}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSemester ? "Sửa học kỳ" : "Tạo học kỳ"}
      >

        <form onSubmit={handleSubmit} className="space-y-4">

          <select
            value={formData.type}
            onChange={(e) => goiYThoiGian(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
            <option value="Fall">Fall</option>
          </select>

          <input
            type="number"
            value={formData.year}
            onChange={(e) =>
              setFormData({ ...formData, year: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          />

          <div className="grid grid-cols-2 gap-4">

            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="border rounded-lg px-3 py-2"
            />

          </div>

          <div className="flex justify-end gap-3">

            <Button variant="outline" onClick={() => setShowModal(false)}>
              Hủy
            </Button>

            <Button type="submit" disabled={isCreating || isUpdating}>
              {editingSemester ? "Cập nhật" : "Tạo"}
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
    <div className="bg-white p-4 rounded-xl flex items-center gap-3 border">
      {icon}
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {

  const map = {
    ACTIVE: "bg-green-100 text-green-700",
    UPCOMING: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-gray-100 text-gray-600",
  };

  const label = {
    ACTIVE: "Đang diễn ra",
    UPCOMING: "Sắp tới",
    COMPLETED: "Đã kết thúc",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded ${map[status]}`}>
      {label[status]}
    </span>
  );
}