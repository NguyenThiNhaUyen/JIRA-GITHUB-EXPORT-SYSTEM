import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * Lấy danh sách SRS Reports của một project
 * GET /api/projects/:projectId/srs
 *
 * BE trả về PagedResponse<SrsDocumentResponse>:
 * { id, projectId, versionNo, status, fileUrl, submittedByUserId, submittedByName, submittedAt, feedback, reviewedAt }
 */
export async function getProjectSrs(projectId) {
    const res = await client.get(`/projects/${projectId}/srs`);
    const paged = unwrap(res);
    // Support paged items array from PagedResponse (Standard BE response)
    const list = paged?.items ?? paged?.Items ?? (Array.isArray(paged) ? paged : []);
    return list.map(mapSrs);
}

/**
 * Nộp SRS Report mới — gửi multipart/form-data vì BE dùng IFormFile
 * POST /api/projects/:projectId/srs
 * Body: FormData { File: <File object> }
 */
export async function submitSrsReport(projectId, { file }) {
    const formData = new FormData();
    formData.append("File", file);

    const res = await client.post(`/projects/${projectId}/srs`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return mapSrs(unwrap(res));
}

/**
 * Cập nhật status SRS (Giảng viên duyệt/từ chối + ghi feedback)
 * PATCH /api/srs/:id/status
 * Body: { status: "FINAL"|"DRAFT", feedback? }
 */
export async function updateSrsStatus(reportId, newStatus, feedback) {
    const res = await client.patch(`/srs/${reportId}/status`, {
        status: newStatus,
        ...(feedback ? { feedback } : {}),
    });
    return mapSrs(unwrap(res));
}

/**
 * Gửi feedback cho SRS (Giảng viên)
 * PATCH /api/srs/:id/feedback
 * Body: { feedback }
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
