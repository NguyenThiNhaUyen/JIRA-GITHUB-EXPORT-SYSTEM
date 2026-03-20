import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

export async function getSemesters(params = {}) {
    const res = await client.get("/semesters", { params });
    return unwrap(res);
}

export async function getAllSemesters() {
    const res = await client.get("/semesters/all");
    return unwrap(res);
}

export async function createSemester(body) {
    const res = await client.post("/semesters", body);
    return unwrap(res);
}

export async function generateSemesters(year) {
    const res = await client.post("/semesters/generate", { year });
    return unwrap(res);
}

export async function updateSemester(id, body) {
    const res = await client.put(`/semesters/${id}`, body);
    return unwrap(res);
}

export async function deleteSemester(id) {
    const res = await client.delete(`/semesters/${id}`);
    return unwrap(res);
}
