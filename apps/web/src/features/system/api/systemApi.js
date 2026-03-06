import db from "../../../mock/db.js";

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getSemesters() {
    await delay();
    return db.findMany('semesters').sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
}

export async function createSemester(data) {
    await delay();
    if (data.status === 'ACTIVE') {
        const existingActive = db.findMany('semesters', { status: 'ACTIVE' });
        existingActive.forEach(sem => db.update('semesters', sem.id, { status: 'UPCOMING' }));
    }
    return db.create('semesters', { ...data, status: data.status || 'UPCOMING' });
}

export async function updateSemester(id, updates) {
    await delay();
    if (updates.status === 'ACTIVE') {
        const existingActive = db.findMany('semesters', { status: 'ACTIVE' });
        existingActive.forEach(sem => {
            if (sem.id !== id) db.update('semesters', sem.id, { status: 'COMPLETED' });
        });
    }
    return db.update('semesters', id, updates);
}

export async function getSubjects() {
    await delay();
    return db.findMany('subjects').sort((a, b) => a.code.localeCompare(b.code));
}

export async function createSubject(data) {
    await delay();
    const existing = db.findMany('subjects', { code: data.code });
    if (existing.length > 0) throw new Error('Subject code already exists');
    return db.create('subjects', { ...data, createdAt: new Date().toISOString() });
}

export async function updateSubject(id, updates) {
    await delay();
    return db.update('subjects', id, updates);
}
