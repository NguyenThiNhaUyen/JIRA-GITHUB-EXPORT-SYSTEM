import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";
import { mapSemester, mapSemesterList, mapSubject, mapSubjectList } from "./mappers/systemMapper.js";

export async function getSemesters() {
    // Try /all first, fallback to paged with large size
    try {
        const res = await client.get("/semesters/all");
        return mapSemesterList(unwrap(res));
    } catch (e) {
        const res = await client.get("/semesters", { params: { pageSize: 100 } });
        return mapSemesterList(unwrap(res));
    }
}

export async function createSemester(data) {
    const res = await client.post("/semesters", data);
    return mapSemester(unwrap(res));
}

export async function generateSemesters(data) {
    // data can be an object with { year } or just a year value depending on implementation
    const body = typeof data === 'object' ? data : { year: data };
    const res = await client.post("/semesters/generate", body);
    return unwrap(res);
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
    try {
        const res = await client.get("/subjects/all");
        return mapSubjectList(unwrap(res));
    } catch (e) {
        const res = await client.get("/subjects", { params: { pageSize: 100 } });
        return mapSubjectList(unwrap(res));
    }
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
