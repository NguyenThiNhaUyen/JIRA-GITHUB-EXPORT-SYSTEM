import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";
import { mapProject as mapGroup } from "../../projects/api/mappers/projectMapper.js";

export async function getGroupById(groupId) {
    const res = await client.get(`/projects/${groupId}`);
    const beData = unwrap(res);
    const mapped = mapGroup(beData);
    
    // Gộp chung data trả về tương thích với mảng sinh viên ở UI cũ nếu UI chưa đổi
    return {
        ...mapped,
        students: mapped.team || [],
        course: { id: mapped.courseId, name: mapped.courseName }
    };
}

export async function approveGroupLink(groupId, linkType, lecturerId) {
    // Gọi API của Project Service
    const res = await client.post(`/projects/${groupId}/integrations/approve`);
    return unwrap(res);
}

export async function rejectGroupLink(groupId, linkType, lecturerId) {
    // Bắt buộc đẩy lý do theo request DTO
    const res = await client.post(`/projects/${groupId}/integrations/reject`, { reason: "Rejected by Lecturer" });
    return unwrap(res);
}

export async function updateStudentScore(groupId, studentId, score) {
    const res = await client.patch(`/projects/${groupId}/members/${studentId}/contribution`, { 
        contributionScore: score 
    });
    return unwrap(res);
}
