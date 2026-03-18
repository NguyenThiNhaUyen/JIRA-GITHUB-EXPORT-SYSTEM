import { useState, useMemo } from "react";
import { useGetCourses } from "@/features/courses/hooks/useCourses.js";

export function useMyCoursesHook() {
  const [search, setSearch] = useState("");
  
  const { data: coursesData = { items: [] }, isLoading } = useGetCourses({ pageSize: 100 });
  const courses = coursesData.items || [];

  const filtered = useMemo(() => {
    return courses.filter(c => {
      const keyword = search.toLowerCase();
      return (
        c.code?.toLowerCase().includes(keyword) ||
        c.name?.toLowerCase().includes(keyword) ||
        (c.subjectName || c.subject?.name)?.toLowerCase().includes(keyword)
      );
    });
  }, [courses, search]);

  const totalGroups = courses.reduce((a, c) => a + (c.projects?.length || 0), 0);
  const totalStudents = courses.reduce((a, c) => a + (c.currentStudents || 0), 0);

  return {
    search, setSearch,
    courses,
    filtered,
    totalGroups,
    totalStudents,
    isLoading
  };
}






