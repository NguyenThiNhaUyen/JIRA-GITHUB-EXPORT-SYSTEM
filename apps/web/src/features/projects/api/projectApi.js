/**
 * projectApi.js — API calls cho Projects (Groups/Teams)
 *
 * Hiện tại BE chưa có API thật cho Project.
 * Tạm thời giả lập HTTP Request bằng mock/db.js với Promise có delay 500ms.
 * Sau này khi BE hoàn thiện, chỉ cần thay các thân hàm bọc bằng `client.get('/projects')`
 * giống như courseApi.js, giao diện UI sẽ tự động chạy mà không cần sửa code Component.
 */
import db from '../../../mock/db.js';

// Helper giả lập delay mạng (500ms)
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export async function getProjects(filters = {}) {
    await delay();
    let projects = db.findMany('projects', filters);

    // Enrich with related data (giống BE sẽ join bảng)
    const items = projects.map(project => ({
        ...project,
        course: db.findById('courses', project.courseId),
        team: db.getProjectTeam(project.id),
        integration: db.findMany('projectIntegrations', { projectId: project.id })[0],
        commits: db.getProjectCommits(project.id, 10),
        srsReports: db.findMany('srsReports', { projectId: project.id })
    }));
    return { items, totalCount: items.length, page: 1, pageSize: items.length };
}

export async function getProjectById(projectId) {
    await delay();
    const project = db.findById('projects', projectId);
    if (!project) throw new Error("Project not found");

    return {
        ...project,
        course: db.findById('courses', project.courseId),
        team: db.getProjectTeam(project.id).map(member => ({
            ...member,
            student: db.findById('users.students', member.studentId),
            links: db.getStudentLinks(member.studentId, project.courseId)
        })),
        integration: db.findMany('projectIntegrations', { projectId: project.id })[0],
        commits: db.getProjectCommits(project.id),
        srsReports: db.findMany('srsReports', { projectId: project.id })
    };
}

export async function createProject(projectData) {
    await delay();
    const required = ['courseId', 'name', 'description', 'startDate', 'endDate'];
    for (const field of required) {
        if (!projectData[field]) {
            throw new Error(`${field} is required`);
        }
    }

    const course = db.findById('courses', projectData.courseId);
    if (!course) throw new Error('Course not found');
    if (new Date(projectData.endDate) <= new Date(projectData.startDate)) {
        throw new Error('End date must be after start date');
    }

    const project = db.create('projects', {
        ...projectData,
        status: projectData.status || 'ACTIVE',
        createdAt: new Date().toISOString()
    });

    db.create('projectIntegrations', {
        projectId: project.id,
        jiraKey: projectData.jiraKey || `PROJ${project.id.toUpperCase()}`,
        jiraUrl: projectData.jiraUrl || `https://university.atlassian.net/browse/PROJ${project.id.toUpperCase()}`,
        githubRepo: projectData.githubRepo || `project-${project.id}`,
        githubUrl: projectData.githubUrl || `https://github.com/university/project-${project.id}`,
        syncStatus: 'PENDING',
        lastSyncAt: null
    });

    const createdProject = db.findById('projects', project.id);
    return {
        ...createdProject,
        course: db.findById('courses', createdProject.courseId),
        team: [],
        integration: db.findMany('projectIntegrations', { projectId: createdProject.id })[0],
        commits: [],
        srsReports: []
    };
}

export async function updateProject(projectId, updates) {
    await delay();
    const project = db.findById('projects', projectId);
    if (!project) throw new Error('Project not found');

    if (updates.startDate || updates.endDate) {
        const startDate = updates.startDate || project.startDate;
        const endDate = updates.endDate || project.endDate;
        if (new Date(endDate) <= new Date(startDate)) {
            throw new Error('End date must be after start date');
        }
    }
    db.update('projects', projectId, {
        ...updates,
        updatedAt: new Date().toISOString()
    });
    return getProjectById(projectId); // Reuse
}

export async function deleteProject(projectId) {
    await delay();
    const project = db.findById('projects', projectId);
    if (!project) throw new Error('Project not found');

    const teamMembers = db.findMany('teamMembers', { projectId });
    teamMembers.forEach(member => db.delete('teamMembers', member.id));

    const integration = db.findMany('projectIntegrations', { projectId });
    integration.forEach(int => db.delete('projectIntegrations', int.id));

    const commits = db.findMany('commits', { projectId });
    commits.forEach(commit => db.delete('commits', commit.id));

    const srsReports = db.findMany('srsReports', { projectId });
    srsReports.forEach(report => db.delete('srsReports', report.id));

    return db.delete('projects', projectId);
}

export async function addTeamMember(projectId, studentId, roleInTeam = 'MEMBER', responsibility = '') {
    await delay();
    const project = db.findById('projects', projectId);
    const student = db.findById('users.students', studentId);

    if (!project) throw new Error('Project not found');
    if (!student) throw new Error('Student not found');

    const existing = db.findMany('teamMembers', { projectId, studentId });
    if (existing.length > 0) throw new Error('Student is already a team member');

    if (roleInTeam === 'LEADER') {
        const currentLeader = db.findMany('teamMembers', { projectId, roleInTeam: 'LEADER' });
        currentLeader.forEach(leader => db.update('teamMembers', leader.id, { roleInTeam: 'MEMBER' }));
    }

    const teamMember = db.create('teamMembers', {
        projectId,
        studentId,
        roleInTeam,
        responsibility,
        status: 'ACTIVE',
        contributionScore: 0,
        joinedAt: new Date().toISOString()
    });

    return { ...teamMember, student, project };
}

export async function removeTeamMember(projectId, studentId) {
    await delay();
    const members = db.findMany('teamMembers', { projectId, studentId });
    if (members.length === 0) throw new Error('Student is not a team member');

    members.forEach(member => {
        db.update('teamMembers', member.id, {
            status: 'LEFT',
            leftAt: new Date().toISOString()
        });
    });
    return true;
}

export async function updateTeamMember(projectId, studentId, updates) {
    await delay();
    const members = db.findMany('teamMembers', { projectId, studentId });
    if (members.length === 0) throw new Error('Student is not a team member');

    const member = members[0];
    if (updates.roleInTeam === 'LEADER' && member.roleInTeam !== 'LEADER') {
        const currentLeader = db.findMany('teamMembers', { projectId, roleInTeam: 'LEADER' });
        currentLeader.forEach(leader => {
            if (leader.id !== member.id) {
                db.update('teamMembers', leader.id, { roleInTeam: 'MEMBER' });
            }
        });
    }

    db.update('teamMembers', member.id, {
        ...updates,
        updatedAt: new Date().toISOString()
    });

    return db.findById('teamMembers', member.id);
}
