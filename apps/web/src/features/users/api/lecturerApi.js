import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";
import { mapUser } from "./mappers/userMapper.js";

export async function getAllLecturers() {
    const res = await client.get("/lecturers", { params: { pageSize: 200 } });
    const payload = unwrap(res);
    // BE may return { items: [...] } (paged) or plain array
    const items = payload?.items ?? payload?.Items ?? payload?.results ?? payload?.Results;
    if (items && Array.isArray(items)) return items.map(mapUser);
    if (Array.isArray(payload)) return payload.map(mapUser);
    return [];
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
