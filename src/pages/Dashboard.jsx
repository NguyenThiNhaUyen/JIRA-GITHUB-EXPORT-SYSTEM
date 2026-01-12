// Dashboard: Trang báo cáo - hiển thị contribution của students (đồng bộ weekId với header)
import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";

const MOCK = [
  { student: "Nguyễn Xuân Lộc", email: "xuanloc072018@gmail.com", week: "2026-W01", commits: 12, issues: 6 },
  { student: "Nguyễn Xuân Lộc", email: "xuanloc072018@gmail.com", week: "2026-W02", commits: 9, issues: 4 },
  { student: "NguyenThiNhaUyen", email: "uyen.work.01@gmail.com", week: "2026-W01", commits: 10, issues: 7 },
  { student: "Tran Tan Phat", email: "Trantanphat2004@gmail.com", week: "2026-W01", commits: 6, issues: 3 },
  { student: "binhcoder08", email: "139665502+binhcoder08@users.noreply.github.com", week: "2026-W02", commits: 11, issues: 2 },
];

export default function Dashboard() {
  const { weeks, weekId, setWeekId } = useApp();
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState("commits");
  const [sortDir, setSortDir] = useState("desc");

  const currentWeek = weeks.find((w) => w.id === weekId);
  const weekLabel = currentWeek?.label || "N/A";

  // Filter và sort dữ liệu (chỉ tính lại khi q, sortKey, sortDir thay đổi)
  const rows = useMemo(() => {
    let data = MOCK;

    // Filter: Tìm kiếm trong student name hoặc email
    if (q.trim()) {
      const s = q.toLowerCase();
      data = data.filter(
        (x) =>
          x.student.toLowerCase().includes(s) ||
          x.email.toLowerCase().includes(s)
      );
    }

    // Sort: Sắp xếp dữ liệu
    data = [...data].sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];

      // Nếu sort theo student (string), so sánh alphabetically
      if (sortKey === "student") {
        av = a.student.toLowerCase();
        bv = b.student.toLowerCase();
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      }

      // Nếu sort theo commits hoặc issues (number), so sánh số
      return sortDir === "asc" ? av - bv : bv - av;
    });

    return data;
  }, [q, sortKey, sortDir]);

  function toggleSort(nextKey) {
    if (sortKey !== nextKey) {
      setSortKey(nextKey);
      setSortDir("desc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Contribution theo tuần (Jira issues + GitHub commits)
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <select
              className="w-48 rounded-xl border px-3 py-2 text-sm bg-white"
              value={weekId}
              onChange={(e) => setWeekId(e.target.value)}
            >
              {weeks.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>

            <input
              className="flex-1 md:w-64 rounded-xl border px-3 py-2 text-sm"
              placeholder="Search student/email..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="font-semibold">{weekLabel}</div>
          <div className="text-sm text-gray-500">
            Sort: <span className="font-medium">{sortKey}</span> ({sortDir})
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <Th onClick={() => toggleSort("student")}>
                Student {sortKey === "student" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </Th>
              <Th>Email</Th>
              <Th onClick={() => toggleSort("issues")}>
                Jira Issues {sortKey === "issues" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </Th>
              <Th onClick={() => toggleSort("commits")}>
                Git Commits {sortKey === "commits" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </Th>
              <Th>Total</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-6 py-4 font-medium">{r.student}</td>
                <td className="px-6 py-4 text-gray-600">{r.email}</td>
                <td className="px-6 py-4">{r.issues}</td>
                <td className="px-6 py-4">{r.commits}</td>
                <td className="px-6 py-4 font-semibold">{r.issues + r.commits}</td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td className="px-6 py-10 text-center text-gray-500" colSpan={5}>
                  Không có dữ liệu tuần này (hoặc search không match).
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Th Component - Table header cell
 * Component tái sử dụng cho table headers
 * - Có onClick: Có thể click để sort (hiển thị cursor-pointer)
 * - Không có onClick: Chỉ hiển thị text
 */
function Th({ children, onClick }) {
  return (
    <th
      onClick={onClick}
      className={
        "text-left font-medium px-6 py-3 select-none " +
        (onClick ? "cursor-pointer hover:text-slate-900" : "")
      }
    >
      {children}
    </th>
  );
}
