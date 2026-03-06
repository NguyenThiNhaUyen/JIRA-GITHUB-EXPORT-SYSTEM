import db from "../../../mock/db.js";

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getProjectCommits(projectId, limit = 50) {
    await delay();
    return db.getProjectCommits(projectId, limit);
}

export async function syncGithubCommits(projectId) {
    await delay();
    // Call implementation từ mockup service (có thêm random record commit giả)
    const project = db.findById('projects', projectId);
    if (!project) throw new Error('Project not found');

    const integration = db.findMany('projectIntegrations', { projectId })[0];
    if (!integration) throw new Error('Project integration not found');

    const teamMembers = db.getProjectTeam(projectId);
    const commitMessages = ['Fix bug', 'Update UI', 'Refactor backend', 'Add docs'];

    const newCommits = [];
    for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
        const randomMember = teamMembers[Math.floor(Math.random() * teamMembers.length)];
        if (!randomMember) continue;

        const randomMessage = commitMessages[Math.floor(Math.random() * commitMessages.length)];
        const commit = db.create('commits', {
            projectId,
            repo: integration.githubRepo,
            sha: Math.random().toString(36).substr(2, 9),
            message: randomMessage,
            authorStudentId: randomMember.studentId,
            committedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        });
        newCommits.push(commit);
    }

    db.update('projectIntegrations', integration.id, {
        syncStatus: 'SUCCESS',
        lastSyncAt: new Date().toISOString()
    });

    return { success: true, commitsAdded: newCommits.length };
}

export async function getCommitsStats(courseId, startDate, endDate) {
    await delay();
    return db.getCommitsStats(courseId, startDate, endDate);
}
