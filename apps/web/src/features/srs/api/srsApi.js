import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * Lấy danh sách SRS Reports
 */
export async function getProjectSrs(projectIdOrParams) {
    // Determine if it's a projectId or params object
    if (typeof projectIdOrParams === 'object') {
        const res = await client.get(`/srs`, { params: projectIdOrParams });
        const paged = unwrap(res);
        return (paged?.items ?? paged ?? []).map(mapSrs);
    } else {
        const res = await client.get(`/projects/${projectIdOrParams}/srs`);
        const paged = unwrap(res);
        return (paged?.items ?? paged ?? []).map(mapSrs);
    }
}

// Alias for backward compatibility
export const getSrs = getProjectSrs;

/**
 * Lấy chi tiết 1 Document bằng ID
 */
export async function getSrsById(id) {
    const res = await client.get(`/srs/${id}`);
    return mapSrs(unwrap(res));
}

/**
 * Nộp SRS Report mới — gửi multipart/form-data
 */
export async function submitSrsReport(projectId, { file }) {
    const formData = new FormData();
    formData.append("File", file);
    formData.append("projectId", projectId);

    // Try nested endpoint first, fallback to root srs endpoint
    try {
        const res = await client.post(`/projects/${projectId}/srs`, formData);
        return mapSrs(unwrap(res));
    } catch (e) {
        const res = await client.post(`/srs`, formData);
        return mapSrs(unwrap(res));
    }
}

/**
 * Gửi reminder tới các nhóm bị trễ hạn nộp
 */
export async function remindOverdueSrs() {
    const res = await client.post(`/srs/remind-overdue`);
    return unwrap(res);
}

/**
 * Đánh giá SRS (Giảng viên) - Combined action
 */
export async function reviewSrs(reportId, { status, feedback, score, metadata }) {
    // Backend has separate endpoints for status and feedback
    // First update status (which includes feedback in the request body usually)
    const resStatus = await client.patch(`/srs/${reportId}/status`, {
        status,
        feedback,
        score,
        metadata: metadata || "{}"
    });
    
    // If feedback is provided separately or needs another call
    if (feedback && !resStatus.data.success) {
         await client.patch(`/srs/${reportId}/feedback`, { feedback });
    }

    return mapSrs(unwrap(resStatus));
}

/**
 * Cập nhật status SRS
 */
export async function updateSrsStatus(reportId, newStatus, feedback, score) {
    const res = await client.patch(`/srs/${reportId}/status`, {
        status: newStatus,
        feedback,
        score
    });
    return mapSrs(unwrap(res));
}

/**
 * Gửi feedback cho SRS
 */
export async function provideSrsFeedback(reportId, feedback) {
    const res = await client.patch(`/srs/${reportId}/feedback`, { feedback });
    return mapSrs(unwrap(res));
}

/**
 * Xóa SRS Report
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
