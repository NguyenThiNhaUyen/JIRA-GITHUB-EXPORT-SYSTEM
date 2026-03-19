import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * GET /api/reports
 * Lấy danh sách reports của user (hoặc SRS reports theo course)
 * params: { projectId?, courseId?, type?, status?, milestone?, page?, pageSize? }
 * BE: ReportsController → GetReports()
 * Ví dụ lấy SRS: getReports({ type: 'SRS', courseId: 1 })
 */
export async function getReports(params = {}) {
    const res = await client.get(`/reports`, { params });
    return unwrap(res);
}

/**
 * PUT /api/reports/{id}/status
 * Cập nhật trạng thái review SRS (Lecturer/Admin)
 * body: { status: 'APPROVED'|'REJECTED'|'PENDING', feedback? }
 * BE: ReportsController → ReviewSrsStatus(id, request)
 */
export async function reviewSrsStatus(reportId, status, feedback = "") {
    const res = await client.put(`/reports/${reportId}/status`, { status, feedback });
    return unwrap(res);
}

/**
 * POST /api/reports/srs
 * Tạo SRS report từ Jira (theo projectId hoặc courseId)
 * BE: ReportsController → GenerateSrs(projectId?, courseId?, format)
 */
export async function generateSrsReport(projectId, format = "PDF") {
    const res = await client.post(`/reports/srs`, null, {
        params: { projectId, format }
    });
    return unwrap(res);
}

/**
 * POST /api/reports/srs (dùng courseId — tạo SRS cho toàn bộ course)
 */
export async function generateSrsReportForCourse(courseId, format = "PDF") {
    const res = await client.post(`/reports/srs`, null, {
        params: { courseId, format }
    });
    return unwrap(res);
}

/**
 * GET /api/reports/{id}/download-link
 * Lấy URL tải file report
 * BE: ReportsController → GetDownloadUrl(id)
 */
export async function getDownloadUrl(reportId) {
    const res = await client.get(`/reports/${reportId}/download-link`);
    return unwrap(res);
}

/**
 * POST /api/reports/commit-statistics
 * Tạo báo cáo thống kê commit theo course
 * BE: ReportsController → GenerateCommitStats(courseId, format)
 */
export async function generateCommitStatisticsReport(courseId, format = "PDF") {
    const res = await client.post(`/reports/commit-statistics`, null, {
        params: { courseId, format }
    });
    return unwrap(res);
}

/**
 * POST /api/reports/team-roster
 * Tạo báo cáo danh sách thành viên nhóm (theo projectId hoặc courseId)
 * BE: ReportsController → GenerateTeamRoster(projectId?, courseId?, format)
 */
export async function generateTeamRosterReport(projectId, format = "PDF") {
    const res = await client.post(`/reports/team-roster`, null, {
        params: { projectId, format }
    });
    return unwrap(res);
}

export async function generateTeamRosterForCourse(courseId, format = "PDF") {
    const res = await client.post(`/reports/team-roster`, null, {
        params: { courseId, format }
    });
    return unwrap(res);
}

/**
 * POST /api/reports/activity-summary
 * Tạo báo cáo hoạt động theo project + khoảng thời gian
 * BE: ReportsController → GenerateActivitySummary(projectId, startDate, endDate, format)
 */
export async function generateActivitySummaryReport(projectId, startDate, endDate, format = "PDF") {
    const res = await client.post(`/reports/activity-summary`, null, {
        params: { projectId, startDate, endDate, format }
    });
    return unwrap(res);
}
