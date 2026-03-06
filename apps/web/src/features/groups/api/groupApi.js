import db from "../../../mock/db.js";

// Helper giả lập delay mạng (500ms)
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getGroupById(groupId) {
    await delay();
    const group = db.findById("groups", groupId);
    if (!group) throw new Error("Group not found");

    const students = db.getGroupStudents(groupId);
    const course = db.findById("courses", group.courseId);

    // Gộp chung data trả về như 1 cục response từ BE
    return {
        ...group,
        students,
        course,
    };
}

export async function approveGroupLink(groupId, linkType, lecturerId) {
    await delay();
    return db.approveGroupLink(groupId, linkType, lecturerId);
}

export async function rejectGroupLink(groupId, linkType, lecturerId) {
    await delay();
    return db.rejectGroupLink(groupId, linkType, lecturerId);
}

// API Giả lập cập nhật điểm (hiện chưa có trong mock DB)
export async function updateStudentScore(groupId, studentId, score) {
    await delay();
    return { success: true, score };
}
