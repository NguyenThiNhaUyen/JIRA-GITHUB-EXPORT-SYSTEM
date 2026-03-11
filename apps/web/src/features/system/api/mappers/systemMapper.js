/**
 * systemMapper.js — BE SemesterInfo/SubjectInfo → FE shape
 */

export function mapSemester(beSem) {
    if (!beSem) return null;
    return {
        id: String(beSem.id || ""),
        name: beSem.name || "",
        code: beSem.semester_code || "",
        startDate: beSem.start_date || null,
        endDate: beSem.end_date || null,
        status: beSem.status || "ACTIVE"
    };
}

export function mapSubject(beSub) {
    if (!beSub) return null;
    return {
        id: String(beSub.id || ""),
        subject_code: beSub.subject_code || "",
        subject_name: beSub.subject_name || "",
        department: beSub.department || "",
        description: beSub.description || "",
        credits: beSub.credits || 3,
        maxStudents: beSub.max_students || 40,
        status: beSub.status || "ACTIVE"
    };
}

export function mapSemesterList(beData) {
    const results = beData?.items || beData?.Items || beData?.results || beData?.Results || (Array.isArray(beData) ? beData : []);
    return results.map(mapSemester);
}

export function mapSubjectList(beData) {
    const results = beData?.items || beData?.Items || beData?.results || beData?.Results || (Array.isArray(beData) ? beData : []);
    return results.map(mapSubject);
}
