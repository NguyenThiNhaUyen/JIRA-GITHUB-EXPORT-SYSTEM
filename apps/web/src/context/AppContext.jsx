// AppContext: Quáº£n lĂ½ state toĂ n cá»¥c (semester, week, repo) - dĂ¹ng useApp() Ä‘á»ƒ truy cáº­p
import { createContext, useContext, useMemo, useState } from "react";
import { generateWeeks } from "@/utils/dateRange.js";

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

// AppProvider: Wrap app Ä‘á»ƒ cung cáº¥p global state (semesterId, weekId, repoId)
export function AppProvider({ children }) {
  const [semesterId, setSemesterId] = useState(SEMESTERS[0].id);
  const semester = SEMESTERS.find((s) => s.id === semesterId);

  // Generate danh sĂ¡ch tuáº§n dá»±a trĂªn semester (chá»‰ tĂ­nh láº¡i khi semester thay Ä‘á»•i)
  const weeks = useMemo(
    () => generateWeeks(semester.start, semester.end),
    [semester.start, semester.end]
  );

  const [weekId, setWeekId] = useState(weeks[0]?.id);
  const [repoId, setRepoId] = useState(REPOSITORIES[0].id);

  // Äá»•i kĂ¬ há»c vĂ  reset vá» tuáº§n Ä‘áº§u tiĂªn
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

// useApp: Hook Ä‘á»ƒ truy cáº­p global state tá»« báº¥t ká»³ component nĂ o
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

