import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

const BASE_URL = import.meta.env.VITE_API_URL ?? "https://jira-github-export-system-production.up.railway.app";
const API_BASE = `${BASE_URL}/api`;

/**
 * Tạo báo cáo Commit Statistics
 */
export async function generateCommitStats(courseId, format = "PDF") {
    const res = await client.post(`/reports/commit-statistics`, null, {
        params: { courseId, format }
    });
    return unwrap(res);
}

/**
 * Tạo báo cáo Team Roster
 */
export async function generateTeamRoster(projectId, format = "PDF") {
    const res = await client.post(`/reports/team-roster`, null, {
        params: { projectId, format }
    });
    return unwrap(res);
}

/**
 * Tạo báo cáo Activity Summary
 */
export async function generateActivitySummary(projectId, startDate, endDate, format = "PDF") {
    const res = await client.post(`/reports/activity-summary`, null, {
        params: { projectId, startDate, endDate, format }
    });
    return unwrap(res);
}

/**
 * Tạo báo cáo SRS
 */
export async function generateSrs(projectId, format = "PDF") {
    const res = await client.post(`/reports/srs`, null, {
        params: { projectId, format }
    });
    return unwrap(res);
}

async function postDownloadBlob(path, params = {}) {
    const token = localStorage.getItem("accessToken");

    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        qs.set(k, String(v));
    });

    const url = `${API_BASE}${path}${qs.toString() ? `?${qs.toString()}` : ""}`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!res.ok) {
        let message = `Download failed (${res.status})`;
        try {
            const data = await res.json();
            message = data?.message ?? data?.Message ?? message;
        } catch {
            // ignore
        }
        throw new Error(message);
    }

    const blob = await res.blob();
    const cd = res.headers.get("content-disposition") || "";
    const match = cd.match(/filename\*?=(?:UTF-8''|")?([^;"\n]+)"?/i);
    const filename = match?.[1] ? decodeURIComponent(match[1]) : null;

    return { blob, filename, contentType: res.headers.get("content-type") };
}

export async function downloadCommitStats(courseId, format = "PDF") {
    return postDownloadBlob(`/reports/commit-statistics/download`, { courseId, format });
}

export async function downloadTeamRoster({ projectId, courseId, format = "PDF" }) {
    return postDownloadBlob(`/reports/team-roster/download`, { projectId, courseId, format });
}

export async function downloadActivitySummary({ projectId, startDate, endDate, format = "PDF" }) {
    return postDownloadBlob(`/reports/activity-summary/download`, { projectId, startDate, endDate, format });
}

export async function downloadSrs({ projectId, courseId, format = "PDF" }) {
    return postDownloadBlob(`/reports/srs/download`, { projectId, courseId, format });
}

/**
 * Láy link tải báo cáo
 */
export async function getReportDownloadLink(reportId) {
    const res = await client.get(`/reports/${reportId}/download-link`);
    return unwrap(res);
}

/**
 * Lấy danh sách báo cáo của tôi
 */
export async function getMyReports() {
    const res = await client.get(`/reports`);
    return unwrap(res);
}

/**
 * Helper: Đợi BE chạy ngầm xử lý xong báo cáo (Polling)
 * Vì xuất luồng report PDF từ Jira sẽ chậm và trả về 404 nếu chưa xong.
 */
export async function pollForReportLink(reportId, intervalMs = 3000, maxAttempts = 10) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const res = await getReportDownloadLink(reportId);
            if (res && res.downloadUrl) return res;
        } catch (err) {
            if (err.response && err.response.status !== 404) {
                throw err; // Lỗi khác (ví dụ 500) thì bắn rớt luôn
            }
        }
        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    throw new Error("Report generation timed out. Please refresh or try again later.");
}
