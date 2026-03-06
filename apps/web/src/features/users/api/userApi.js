import db from "../../../mock/db.js";

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getUsers(role) {
    await delay();
    if (role === 'ADMIN') return db.data.users.admins || [];
    if (role === 'LECTURER') return db.data.users.lecturers || [];
    if (role === 'STUDENT') return db.data.users.students || [];

    return [
        ...(db.data.users.admins || []),
        ...(db.data.users.lecturers || []),
        ...(db.data.users.students || [])
    ];
}

export async function createUser(data) {
    await delay();
    const collectionKey = data.role === 'ADMIN' ? 'admins' :
        data.role === 'LECTURER' ? 'lecturers' : 'students';

    // Kiểm tra mã số tồn tại (chỉ áp dụng Student)
    if (data.role === 'STUDENT' && data.studentId) {
        const existing = db.data.users.students.find(s => s.studentId === data.studentId);
        if (existing) throw new Error('Mã sinh viên đã tồn tại');
    }

    const newItem = {
        ...data,
        id: db.generateId(),
        createdAt: new Date().toISOString()
    };

    db.data.users[collectionKey].push(newItem);
    db.save();
    return newItem;
}

export async function getStudentLinks(studentId) {
    await delay();
    return db.getStudentLinks(studentId);
}

export async function linkStudentAccounts(studentId, courseId, githubUrl, jiraUrl) {
    await delay();
    const existing = db.findMany('studentLinks', { studentId, courseId });

    if (existing.length > 0) {
        return db.update('studentLinks', existing[0].id, {
            githubAccountUrl: githubUrl,
            jiraAccountUrl: jiraUrl,
            status: 'PENDING',
            updatedAt: new Date().toISOString()
        });
    }

    return db.create('studentLinks', {
        studentId,
        courseId,
        githubAccountUrl: githubUrl,
        jiraAccountUrl: jiraUrl,
        status: 'PENDING',
        confirmedByLecturerId: null,
        updatedAt: new Date().toISOString()
    });
}
