import db from "../../../mock/db.js";

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getProjectSrs(projectId) {
    await delay();
    return db.findMany('srsReports', { projectId }).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export async function submitSrsReport(projectId, studentId, version, fileObj) {
    await delay();

    // Fake upload file function - Trong thực tế sẽ call FormData tới server 
    return db.create('srsReports', {
        projectId,
        version,
        status: 'DRAFT', // Default state is draft
        submittedByStudentId: studentId,
        submittedAt: new Date().toISOString(),
        fileName: fileObj ? fileObj.name : `SRS_v${version}.pdf`,
    });
}

export async function updateSrsStatus(reportId, newStatus) {
    await delay();
    if (!['DRAFT', 'REVIEW', 'FINAL', 'REJECTED'].includes(newStatus)) {
        throw new Error("Invalid status type");
    }
    return db.update('srsReports', reportId, { status: newStatus });
}
