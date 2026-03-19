/**
 * AdminStatsResponse (BE):
 *   Semesters, Subjects, Courses, Lecturers, Students, Projects (PascalCase)
 * FE shape: semesters, subjects, courses, lecturers, students, projects
 */
export function mapAnalyticsStats(data) {
    if (!data) return null;
    return {
        semesters: data.Semesters ?? data.semesters ?? data.totalSemesters ?? 0,
        subjects:  data.Subjects  ?? data.subjects  ?? data.totalSubjects  ?? 0,
        courses:   data.Courses   ?? data.courses   ?? data.totalCourses   ?? 0,
        lecturers: data.Lecturers ?? data.lecturers ?? data.totalLecturers ?? 0,
        students:  data.Students  ?? data.students  ?? data.totalStudents  ?? 0,
        projects:  data.Projects  ?? data.projects  ?? data.totalProjects  ?? 0,
    };
}

/**
 * HeatmapStat (BE): { Date: "yyyy-MM-dd", Count: int }
 * FE shape: [{ date, count }]
 */
export function mapHeatmapData(data) {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
        date:  item.date  || item.Date  || "",
        count: item.count ?? item.Count ?? 0,
    }));
}

/**
 * GroupRadarMetricResponse (BE):
 *   GroupName, Commits, SrsDone, TeamSize, GithubLinked, JiraLinked
 * FE shape for Recharts RadarChart: [{ groupName, commits, srsDone, teamSize, githubLinked, jiraLinked }]
 */
export function mapRadarData(data) {
    if (!Array.isArray(data) || data.length === 0) return [];
    return data.map(item => ({
        groupName:    item.groupName    || item.GroupName    || "",
        commits:      item.commits      ?? item.Commits      ?? 0,
        srsDone:      item.srsDone      ?? item.SrsDone      ?? 0,
        teamSize:     item.teamSize     ?? item.TeamSize     ?? 0,
        githubLinked: item.githubLinked ?? item.GithubLinked ?? 0,
        jiraLinked:   item.jiraLinked   ?? item.JiraLinked   ?? 0,
    }));
}
