import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * GET /api/admin/stats
 */
export async function getAdminStats() {
    const res = await client.get("/admin/stats");
    return unwrap(res);
}

/**
 * POST /api/admin/bulk-assign
 * body: { assignments: [ { courseId, lecturerId } ] }
 */
export async function bulkAssignLecturers(assignments) {
    const res = await client.post("/admin/bulk-assign", { assignments });
    return unwrap(res);
}
