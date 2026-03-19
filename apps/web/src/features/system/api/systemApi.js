import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";
import { mapSemester, mapSemesterList, mapSubject, mapSubjectList } from "./mappers/systemMapper.js";

export async function getSemesters() {
    const res = await client.get("/semesters", { params: { pageSize: 100 } });
    const payload = unwrap(res);
    return mapSemesterList(payload);
}

export async function createSemester(data) {
    const res = await client.post("/semesters", data);
    return mapSemester(unwrap(res));
}

export async function updateSemester(id, updates) {
    const res = await client.put(`/semesters/${id}`, updates);
    return mapSemester(unwrap(res));
}

export async function deleteSemester(id) {
    const res = await client.delete(`/semesters/${id}`);
    return unwrap(res);
}

export async function getSubjects() {
    const res = await client.get("/subjects", { params: { pageSize: 100 } });
    const payload = unwrap(res);
    return mapSubjectList(payload);
}

export async function createSubject(data) {
    const res = await client.post("/subjects", data);
    return mapSubject(unwrap(res));
}

export async function updateSubject(id, updates) {
    const res = await client.put(`/subjects/${id}`, updates);
    return mapSubject(unwrap(res));
}

export async function deleteSubject(id) {
    const res = await client.delete(`/subjects/${id}`);
    return unwrap(res);
}

export async function getDashboardStats() {
    const res = await client.get("/dashboard/stats");
    return unwrap(res);
}
