/**
 * systemMapper.js — BE SemesterInfo/SubjectInfo → FE shape
 */

export function mapSemester(beSem) {
    if (!beSem) return null;
    return {
        id: String(beSem.id || beSem.Id || ""),
        name: beSem.name || beSem.Name || "",
        code: beSem.code || beSem.Code || beSem.semester_code || beSem.name || beSem.Name || "",
        startDate: beSem.startDate || beSem.StartDate || beSem.start_date || null,
        endDate: beSem.endDate || beSem.EndDate || beSem.end_date || null,
        status: beSem.status || beSem.Status || "ACTIVE"
    };
}

export function mapSubject(beSub) {
    if (!beSub) return null;
    return {
        id: String(beSub.id || beSub.Id || ""),
        code: beSub.subjectCode || beSub.SubjectCode || beSub.subject_code || "",
        name: beSub.subjectName || beSub.SubjectName || beSub.subject_name || "",
        department: beSub.department || beSub.Department || "",
        description: beSub.description || beSub.Description || "",
        credits: beSub.credits || beSub.Credits || 3,
        maxStudents: beSub.maxStudents || beSub.MaxStudents || beSub.max_students || 40,
        status: beSub.status || beSub.Status || "ACTIVE"
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






