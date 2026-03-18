import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGetCourses } from "@/features/courses/hooks/useCourses.js";
import { getCourseContributions } from "@/features/analytics/api/analyticsApi.js";

export function useContributions() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [search, setSearch] = useState("");

  const { data: coursesData = { items: [] }, isLoading: loadingCourses } = useGetCourses({ pageSize: 100 });
  const courses = coursesData.items || [];

  // Initialize selected course
  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) {
      setSelectedCourse(String(courses[0].id));
    }
  }, [courses, selectedCourse]);

  // Fetch real contributions data
  const { data: contributionsData, isLoading: loadingContributions, refetch } = useQuery({
    queryKey: ['course-contributions', selectedCourse],
    queryFn: () => getCourseContributions(selectedCourse),
    enabled: !!selectedCourse
  });

  // Process data from API
  const commitsByStudent = useMemo(() => {
    if (!contributionsData?.students) return {};
    const map = {};
    contributionsData.students.forEach(s => {
      map[s.studentId] = {
        id: s.studentId,
        name: s.name,
        studentCode: s.studentCode,
        team: s.groupName,
        commits: s.commits,
        prs: s.prs,
        reviews: s.reviews,
        jiraDone: s.jiraDone,
        activeDays: s.activeDays,
        score: s.score,
        status: (s.status === 'Cần chú ý' || s.status === 'Chưa commit') ? 'warning' : 'stable',
        statusText: s.status,
        dailyActivity: s.dailyActivity
      };
    });
    return map;
  }, [contributionsData]);

  const weeklyCommits = useMemo(() => {
    if (!contributionsData?.weeklyCommits) {
      return new Array(12).fill(0).map((_, i) => ({ name: `W${i + 1}`, count: 0 }));
    }
    return contributionsData.weeklyCommits.map((val, i) => ({
      name: `W${i + 1}`,
      count: val
    }));
  }, [contributionsData]);

  const filteredStudents = useMemo(() => {
    const studentList = Object.values(commitsByStudent);
    if (!search) return studentList;
    
    const q = search.toLowerCase();
    return studentList.filter(s => 
      (s.name || "").toLowerCase().includes(q) || 
      (s.team || "").toLowerCase().includes(q) ||
      (s.studentCode || "").toLowerCase().includes(q)
    );
  }, [commitsByStudent, search]);

  const stats = useMemo(() => {
    const list = Object.values(commitsByStudent);
    return {
      totalCommits: list.reduce((sum, s) => sum + (s.commits || 0), 0),
      activeStudents: list.filter(s => s.commits > 0).length,
      avgScore: list.length > 0 ? Math.round(list.reduce((sum, s) => sum + (s.score || 0), 0) / list.length) : 0,
      totalPRs: list.reduce((sum, s) => sum + (s.prs || 0), 0),
      totalReviews: list.reduce((sum, s) => sum + (s.reviews || 0), 0),
      riskGroupsCount: list.filter(s => s.status === 'warning').length
    };
  }, [commitsByStudent]);

  return {
    selectedCourse, setSelectedCourse,
    search, setSearch,
    courses,
    loading: loadingCourses || loadingContributions,
    filteredStudents,
    weeklyCommits,
    stats,
    refetch
  };
}






