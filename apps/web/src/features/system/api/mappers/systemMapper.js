/**
 * systemMapper.js — BE SemesterInfo/SubjectInfo → FE shape
 */

export function mapSemester(beSem) {
    if (!beSem) return null;
    return {
        id: String(beSem.id || beSem.Id),
        name: beSem.name || beSem.Name || "",
        code: beSem.semester_code || beSem.code || beSem.Code || beSem.name || beSem.Name || "",
        startDate: beSem.start_date || beSem.startDate || beSem.StartDate,
        endDate: beSem.end_date || beSem.endDate || beSem.EndDate,
        status: beSem.status || beSem.Status || "ACTIVE" // Fallback fallback
    };
}

export function mapSubject(beSub) {
    if (!beSub) return null;
    return {
        id: String(beSub.id || beSub.Id),
        code: beSub.subject_code || beSub.subjectCode || beSub.SubjectCode || "",
        name: beSub.subject_name || beSub.subjectName || beSub.SubjectName || "",
        credits: beSub.credits || beSub.Credits || 3,
        status: beSub.status || beSub.Status || "ACTIVE",
        description: beSub.description || beSub.Description || ""
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
