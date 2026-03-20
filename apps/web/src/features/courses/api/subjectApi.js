import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

export async function getSubjects(params = {}) {
    const res = await client.get("/subjects", { params });
    return unwrap(res);
}

export async function getAllSubjects() {
    const res = await client.get("/subjects/all");
    return unwrap(res);
}

export async function createSubject(body) {
    const res = await client.post("/subjects", body);
    return unwrap(res);
}

export async function updateSubject(id, body) {
    const res = await client.put(`/subjects/${id}`, body);
    return unwrap(res);
}

export async function deleteSubject(id) {
    const res = await client.delete(`/subjects/${id}`);
    return unwrap(res);
}
