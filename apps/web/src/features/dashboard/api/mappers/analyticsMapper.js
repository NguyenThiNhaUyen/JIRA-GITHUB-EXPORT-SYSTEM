export function mapAnalyticsStats(data) {
    if (!data) return null;
    return {
        totalSubjects: data.totalSubjects || 0,
        totalCourses: data.totalCourses || 0,
        totalUsers: data.totalUsers || 0,
        totalProjects: data.totalProjects || 0,
        totalCommits: data.totalCommits || 0,
        activeGroups: data.activeGroups || 0,
        syncSuccessRate: data.syncSuccessRate || 0
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
