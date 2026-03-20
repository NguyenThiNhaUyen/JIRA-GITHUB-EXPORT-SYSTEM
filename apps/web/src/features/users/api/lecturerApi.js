import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";
import { mapUser } from "./mappers/userMapper.js";

export async function getAllLecturers() {
    const res = await client.get("/lecturers");
    const arr = unwrap(res) || [];
    // Sử dụng mapUser từ cùng thư mục chung (vì thư mục map thường nằm ở features/users)
    // Lưu ý: Import tương đối phụ thuộc vào vị trí thực tế của file này
    return arr.map(mapUser);
}

export async function getLecturerWorkload(lecturerId) {
    const res = await client.get(`/lecturers/${lecturerId}/workload`);
    return unwrap(res);
}

export async function getLecturerCourses(lecturerId) {
    const res = await client.get(`/lecturers/${lecturerId}/courses`);
    return unwrap(res);
}

export async function getMyWorkload() {
    const res = await client.get("/lecturers/me/workload");
    return unwrap(res);
}

export async function getMyCourses() {
    const res = await client.get("/lecturers/me/courses");
    return unwrap(res);
}
