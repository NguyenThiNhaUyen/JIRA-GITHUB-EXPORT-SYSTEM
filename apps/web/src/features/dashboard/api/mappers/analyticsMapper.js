export function mapAnalyticsStats(data) {
    if (!data) return null;
    return {
        semesters: data.semesters || 0,
        subjects: data.subjects || 0,
        courses: data.courses || 0,
        lecturers: data.lecturers || 0,
        students: data.students || 0,
        projects: data.projects || 0
    };
}

export function mapHeatmapData(data) {
    // BE might return array of { date, count } or just array of counts
    if (Array.isArray(data)) return data;
    return [];
}

export function mapRadarData(data) {
    // Transform BE radar data to match Recharts shape
    // Expected BE: { labels: ["Commit", "Task", ...], datasets: [ { label: "Group A", data: [10, 20, ...] } ] }
    if (!data) return [];
    return data;
}
