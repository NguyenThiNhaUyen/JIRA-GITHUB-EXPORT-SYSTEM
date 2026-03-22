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
    // BE expects: SubjectCode, SubjectName, Department, Credits, MaxStudents, Status
    const payload = {
        subjectCode: data.code || data.subjectCode,
        subjectName: data.name || data.subjectName,
        department: data.department || 'General',  // BE requires this field
        description: data.description || '',
        credits: data.credits || 3,
        maxStudents: data.maxStudents || 40,
        status: data.status || 'ACTIVE',
    };
    const res = await client.post("/subjects", payload);
    return mapSubject(unwrap(res));
}

export async function updateSubject(id, updates) {
    // BE field renaming for PUT as well
    const payload = {
        subjectCode: updates.code || updates.subjectCode,
        subjectName: updates.name || updates.subjectName,
        department: updates.department || 'General',
        description: updates.description || '',
        credits: updates.credits || 3,
        maxStudents: updates.maxStudents || 40,
        status: updates.status || 'ACTIVE',
    };
    const res = await client.put(`/subjects/${id}`, payload);
    return mapSubject(unwrap(res));
}

export async function deleteSubject(id) {
    const res = await client.delete(`/subjects/${id}`);
    return unwrap(res);
}

export async function getDashboardStats() {
    // Correct endpoint: /api/analytics/stats (Admin-only)
    // Returns: AdminStatsResponse { Semesters, Subjects, Courses, Lecturers, Students, Projects }
    try {
        const res = await client.get("/analytics/stats");
        const data = unwrap(res);
        // Normalize to camelCase for FE consumption
        return {
            totalSemesters: data.semesters ?? data.Semesters ?? 0,
            totalSubjects: data.subjects ?? data.Subjects ?? 0,
            totalCourses: data.courses ?? data.Courses ?? 0,
            totalLecturers: data.lecturers ?? data.Lecturers ?? 0,
            totalStudents: data.students ?? data.Students ?? 0,
            totalProjects: data.projects ?? data.Projects ?? 0,
        };
    } catch {
        // Fallback: compose from courses + users queries (non-blocking)
        return null;
    }
}
