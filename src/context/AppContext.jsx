// AppContext: Quản lý state toàn cục (semester, week, repo) - dùng useApp() để truy cập
import { createContext, useContext, useMemo, useState } from "react";
import { generateWeeks } from "../utils/dateRange";

const AppContext = createContext(null);

/* eslint-disable react-refresh/only-export-components */
const SEMESTERS = [
  { id: "2026-spring", name: "2026 Spring", start: "2026-01-05", end: "2026-04-20" },
  { id: "2025-fall", name: "2025 Fall", start: "2025-09-01", end: "2025-12-31" },
];

const REPOSITORIES = [
  { id: "t7-se1851", name: "T7-SE1851", label: "Repo: T7-SE1851" },
  { id: "backend", name: "Backend", label: "Backend" },
  { id: "frontend", name: "Frontend", label: "Frontend" },
];

// AppProvider: Wrap app để cung cấp global state (semesterId, weekId, repoId)
export function AppProvider({ children }) {
  const [semesterId, setSemesterId] = useState(SEMESTERS[0].id);
  const semester = SEMESTERS.find((s) => s.id === semesterId);

  // Generate danh sách tuần dựa trên semester (chỉ tính lại khi semester thay đổi)
  const weeks = useMemo(
    () => generateWeeks(semester.start, semester.end),
    [semester.start, semester.end]
  );

  const [weekId, setWeekId] = useState(weeks[0]?.id);
  const [repoId, setRepoId] = useState(REPOSITORIES[0].id);

  // Đổi kì học và reset về tuần đầu tiên
  function changeSemester(id) {
    const s = SEMESTERS.find((x) => x.id === id);
    const w = generateWeeks(s.start, s.end);
    setSemesterId(id);
    setWeekId(w[0]?.id);
  }

  const value = {
    SEMESTERS,
    REPOSITORIES,
    semesterId,
    semester,
    changeSemester,
    weeks,
    weekId,
    setWeekId,
    repoId,
    setRepoId,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// useApp: Hook để truy cập global state từ bất kỳ component nào
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
