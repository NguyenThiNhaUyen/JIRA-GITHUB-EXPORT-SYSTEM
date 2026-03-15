import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * Lấy danh sách SRS Reports
 * GET /api/srs
 */
export async function getProjectSrs(params = {}) {
    const res = await client.get(`/srs`, { params });
    const paged = unwrap(res);
    return (paged?.items ?? paged ?? []).map(mapSrs);
}

// Alias for backward compatibility if needed
export const getSrs = getProjectSrs;

/**
 * Lấy chi tiết 1 Document bằng ID
 * GET /api/srs/{id}
 */
export async function getSrsById(id) {
    const res = await client.get(`/srs/${id}`);
    return mapSrs(unwrap(res));
}

/**
 * Nộp SRS Report mới — gửi multipart/form-data vì BE dùng IFormFile
 * POST /api/srs
 * Body: FormData { File: <File object>, projectId: <projectId> }
 */
export async function submitSrsReport(projectId, { file }) {
    const formData = new FormData();
    formData.append("File", file);
    formData.append("projectId", projectId);

    const res = await client.post(`/srs`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return mapSrs(unwrap(res));
}

/**
 * Gửi reminder tới các nhóm bị trễ hạn nộp (dành cho GV/Admin)
 * POST /api/srs/remind-overdue
 */
export async function remindOverdueSrs() {
    const res = await client.post(`/srs/remind-overdue`);
    return unwrap(res);
}

/**
 * Đánh giá SRS (Giảng viên)
 * POST /api/srs/:id/review
 * Body: { status, feedback, score, metadata? }
 */
export async function reviewSrs(reportId, { status, feedback, score, metadata }) {
    const res = await client.post(`/srs/${reportId}/review`, {
        status,
        feedback,
        score,
        metadata: metadata || "{}"
    });
    return mapSrs(unwrap(res));
}

/**
 * Cập nhật status SRS (Old version, keep if needed)
 */
export async function updateSrsStatus(reportId, newStatus, feedback) {
    const res = await client.patch(`/srs/${reportId}/status`, {
        status: newStatus,
        ...(feedback ? { feedback } : {}),
    });
    return mapSrs(unwrap(res));
}

/**
 * Gửi feedback cho SRS (Old version)
 */
export async function provideSrsFeedback(reportId, feedback) {
    const res = await client.patch(`/srs/${reportId}/feedback`, { feedback });
    return mapSrs(unwrap(res));
}

/**
 * Xóa SRS Report
 * DELETE /api/srs/:id
 */
export async function deleteSrsReport(reportId) {
    const res = await client.delete(`/srs/${reportId}`);
    return unwrap(res);
}

/* ─── mapper: BE → FE shape ─── */
function mapSrs(s) {
    if (!s) return s;
    return {
        id: s.id,
        projectId: s.projectId,
        // BE trả về versionNo (integer), FE dùng version (string)
        version: String(s.versionNo ?? s.version ?? ""),
        status: s.status,
        fileUrl: s.fileUrl,
        submittedAt: s.submittedAt,
        submittedByUserId: s.submittedByUserId,
        submittedByName: s.submittedByName,
        feedback: s.feedback,
        reviewedAt: s.reviewedAt,
        reviewerName: s.reviewerName,
    };
}
