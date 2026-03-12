export const STUDENT_COURSES = [
  {
    id: "SE113",
    code: "SE113.SP25",
    name: "Software Engineering",
    lecturer: "TS. Nguyễn Thanh Bình",
    projects: 1,
    status: "ACTIVE",
    progress: 76,
  },
  {
    id: "SWD392",
    code: "SWD392.SP25",
    name: "SWP Project",
    lecturer: "ThS. Lê Hoàng",
    projects: 1,
    status: "ACTIVE",
    progress: 68,
  },
  {
    id: "PRU211",
    code: "PRU211.SP25",
    name: "C# Programming",
    lecturer: "TS. Trần Minh Hà",
    projects: 1,
    status: "ACTIVE",
    progress: 84,
  },
];

export const STUDENT_PROJECTS = [
  {
    id: "P1",
    courseId: "SE113",
    courseCode: "SE113.SP25",
    title: "Jira GitHub Export Tool",
    description:
      "Hệ thống theo dõi tiến độ nhóm, contribution GitHub, task Jira và export báo cáo cho lecturer/admin.",
    role: "LEADER",
    status: "ACTIVE",
    repository: "jira-gh-export-tool",
    jiraKey: "JGT",
    teamSize: 5,
    sprintCompletion: 78,
    myContribution: 82,
    commits: 24,
    issuesDone: 11,
    prsMerged: 4,
    linesChanged: 1260,
    lastCommit: "2 giờ trước",
    srsVersions: 3,
    openIssues: 5,
    branch: "feat/student-dashboard",
    repoUrl: "https://github.com/demo/jira-gh-export-tool",
    jiraUrl: "https://jira.demo.com/browse/JGT",
    techStack: ["React", "Tailwind", ".NET", "SQL Server"],
  },
  {
    id: "P2",
    courseId: "SWD392",
    courseCode: "SWD392.SP25",
    title: "CV Review AI Platform",
    description:
      "Nền tảng đánh giá CV cho sinh viên năm cuối và fresher, có AI feedback và scoring.",
    role: "MEMBER",
    status: "ACTIVE",
    repository: "jobie-cv-review",
    jiraKey: "JOB",
    teamSize: 4,
    sprintCompletion: 64,
    myContribution: 69,
    commits: 16,
    issuesDone: 7,
    prsMerged: 2,
    linesChanged: 845,
    lastCommit: "Hôm qua",
    srsVersions: 2,
    openIssues: 8,
    branch: "feat/cv-analysis-ui",
    repoUrl: "https://github.com/demo/jobie-cv-review",
    jiraUrl: "https://jira.demo.com/browse/JOB",
    techStack: ["Next.js", "Node.js", "PostgreSQL", "Gemini API"],
  },
];

export const STUDENT_PROJECT_DETAILS = {
  P1: {
    milestones: [
      { id: "M1", title: "Requirement & Planning", status: "DONE", progress: 100 },
      { id: "M2", title: "UI Dashboard Module", status: "IN_PROGRESS", progress: 85 },
      { id: "M3", title: "GitHub Sync Integration", status: "IN_PROGRESS", progress: 62 },
      { id: "M4", title: "Export Report Module", status: "TODO", progress: 28 },
    ],
    personalTasks: [
      {
        id: "T1",
        key: "JGT-41",
        title: "Hoàn thiện student dashboard mock data",
        status: "In Progress",
        priority: "High",
        assignee: "Bạn",
        due: "Hôm nay",
      },
      {
        id: "T2",
        key: "JGT-38",
        title: "Tạo trang chi tiết project cho student",
        status: "Todo",
        priority: "Medium",
        assignee: "Bạn",
        due: "Ngày mai",
      },
      {
        id: "T3",
        key: "JGT-35",
        title: "Review alert logic cho lecturer",
        status: "Done",
        priority: "Low",
        assignee: "Bạn",
        due: "Đã xong",
      },
    ],
    activities: [
      { id: "A1", type: "commit", text: "Bạn push 4 commits lên feat/student-dashboard", time: "2 giờ trước" },
      { id: "A2", type: "jira", text: "Task JGT-35 được chuyển sang Done", time: "Hôm qua" },
      { id: "A3", type: "srs", text: "SRS version 3 đã được upload", time: "2 ngày trước" },
      { id: "A4", type: "pr", text: "PR #24 đã được merge vào develop", time: "3 ngày trước" },
    ],
    teamMembers: [
      { id: "U1", name: "Trần Thị B", role: "Leader", commits: 24, issuesDone: 11, score: 82 },
      { id: "U2", name: "Nguyễn Văn A", role: "Member", commits: 18, issuesDone: 9, score: 74 },
      { id: "U3", name: "Lê Minh C", role: "Member", commits: 12, issuesDone: 6, score: 61 },
      { id: "U4", name: "Phạm Khánh D", role: "Member", commits: 9, issuesDone: 4, score: 48 },
      { id: "U5", name: "Hoàng Gia E", role: "Member", commits: 7, issuesDone: 3, score: 43 },
    ],
    deadlines: [
      { id: "D1", title: "Sprint 4 Demo", due: "Ngày mai - 09:00", severity: "high" },
      { id: "D2", title: "SRS Version 3", due: "Trong 2 ngày", severity: "medium" },
      { id: "D3", title: "Contribution Report", due: "Trong 5 ngày", severity: "low" },
    ],
    srsFiles: [
      { id: "S1", version: "v1.0", updatedAt: "12/02/2026", status: "Approved" },
      { id: "S2", version: "v2.0", updatedAt: "23/02/2026", status: "Reviewed" },
      { id: "S3", version: "v3.0", updatedAt: "09/03/2026", status: "Pending" },
    ],
    weeklyCommits: [
      { label: "T2", value: 3 },
      { label: "T3", value: 5 },
      { label: "T4", value: 2 },
      { label: "T5", value: 6 },
      { label: "T6", value: 4 },
      { label: "T7", value: 1 },
      { label: "CN", value: 2 },
    ],
  },

  P2: {
    milestones: [
      { id: "M1", title: "CV Upload Flow", status: "DONE", progress: 100 },
      { id: "M2", title: "AI CV Analysis", status: "IN_PROGRESS", progress: 72 },
      { id: "M3", title: "Employer Report UI", status: "IN_PROGRESS", progress: 55 },
      { id: "M4", title: "Admin Analytics", status: "TODO", progress: 24 },
    ],
    personalTasks: [
      {
        id: "T1",
        key: "JOB-12",
        title: "Fix validation upload CV",
        status: "Done",
        priority: "Low",
        assignee: "Bạn",
        due: "Đã xong",
      },
      {
        id: "T2",
        key: "JOB-19",
        title: "Thiết kế scoring summary card",
        status: "In Progress",
        priority: "High",
        assignee: "Bạn",
        due: "Ngày mai",
      },
    ],
    activities: [
      { id: "A1", type: "commit", text: "Bạn push 2 commits lên feat/cv-analysis-ui", time: "Hôm qua" },
      { id: "A2", type: "jira", text: "Task JOB-12 được lecturer review", time: "2 ngày trước" },
      { id: "A3", type: "pr", text: "PR #10 đã được merge", time: "4 ngày trước" },
    ],
    teamMembers: [
      { id: "U1", name: "Trần Thị B", role: "Member", commits: 16, issuesDone: 7, score: 69 },
      { id: "U2", name: "Nguyễn Văn H", role: "Leader", commits: 22, issuesDone: 10, score: 84 },
      { id: "U3", name: "Lê Anh K", role: "Member", commits: 13, issuesDone: 6, score: 58 },
      { id: "U4", name: "Phạm Duy N", role: "Member", commits: 10, issuesDone: 5, score: 50 },
    ],
    deadlines: [
      { id: "D1", title: "Midterm Demo", due: "Trong 3 ngày", severity: "high" },
      { id: "D2", title: "CV Scoring Report", due: "Trong 6 ngày", severity: "medium" },
    ],
    srsFiles: [
      { id: "S1", version: "v1.0", updatedAt: "15/02/2026", status: "Approved" },
      { id: "S2", version: "v2.0", updatedAt: "04/03/2026", status: "Pending" },
    ],
    weeklyCommits: [
      { label: "T2", value: 2 },
      { label: "T3", value: 4 },
      { label: "T4", value: 1 },
      { label: "T5", value: 3 },
      { label: "T6", value: 4 },
      { label: "T7", value: 0 },
      { label: "CN", value: 2 },
    ],
  },
};

export function getStudentProjectById(projectId) {
  return STUDENT_PROJECTS.find((item) => item.id === projectId);
}

export function getStudentProjectDetailById(projectId) {
  return STUDENT_PROJECT_DETAILS[projectId];
}