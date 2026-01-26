// Mock data: 4 members, 4 tuần, 100 commits, 30 issues, 10 milestones
import dayjs from "dayjs";

export const mockMembers = [
  { id: "1", name: "Nguyễn Xuân Lộc", email: "xuanloc072018@gmail.com", avatarUrl: "" },
  { id: "2", name: "NguyenThiNhaUyen", email: "uyen.work.01@gmail.com", avatarUrl: "" },
  { id: "3", name: "Tran Tan Phat", email: "Trantanphat2004@gmail.com", avatarUrl: "" },
  { id: "4", name: "binhcoder08", email: "139665502+binhcoder08@users.noreply.github.com", avatarUrl: "" },
];

// Generate dates cho 4 tuần (2026-01-05 đến 2026-02-01)
const generateDateRange = (start, days) => {
  const dates = [];
  let current = dayjs(start);
  for (let i = 0; i < days; i++) {
    dates.push(current.format("YYYY-MM-DD"));
    current = current.add(1, "day");
  }
  return dates;
};

const dates = generateDateRange("2026-01-05", 28);

// Generate 100 commits
export const mockCommits = Array.from({ length: 100 }, (_, i) => {
  const authorId = mockMembers[i % mockMembers.length].id;
  const dateIdx = Math.floor(i / 4);
  const date = dates[dateIdx] || dates[dates.length - 1];
  const hour = 9 + (i % 8);
  const minute = (i * 7) % 60;
  const committedAt = `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`;

  const messages = [
    "feat: Add new feature component",
    "fix: Resolve issue with date calculation",
    "refactor: Improve code structure",
    "docs: Update README",
    "style: Format code",
    "test: Add unit tests",
    "chore: Update dependencies",
    "perf: Optimize rendering",
  ];

  return {
    id: `commit-${i + 1}`,
    sha: Array.from({ length: 7 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
    message: messages[i % messages.length] + ` (${i + 1})`,
    authorId,
    committedAt,
    additions: 10 + Math.floor(Math.random() * 200),
    deletions: Math.floor(Math.random() * 50),
    filesChanged: 1 + Math.floor(Math.random() * 10),
  };
});

// Generate 30 issues
export const mockIssues = Array.from({ length: 30 }, (_, i) => {
  const assigneeId = mockMembers[i % mockMembers.length].id;
  const dateIdx = Math.floor(i / 2);
  const date = dates[dateIdx] || dates[dates.length - 1];
  const statuses = ["todo", "in_progress", "done"];
  const priorities = ["low", "medium", "high"];
  const status = statuses[i % 3];
  const priority = priorities[Math.floor(i / 10) % 3];

  const summaries = [
    "Implement user authentication",
    "Fix bug in date picker",
    "Add validation for form inputs",
    "Refactor API service layer",
    "Update documentation",
    "Optimize database queries",
    "Add error handling",
    "Improve UI responsiveness",
    "Write integration tests",
    "Update dependencies",
  ];

  const createdAt = `${date}T09:00:00Z`;
  const startedAt = status !== "todo" ? `${date}T10:00:00Z` : undefined;
  const resolvedAt = status === "done" ? `${date}T16:00:00Z` : undefined;

  return {
    id: `issue-${i + 1}`,
    key: `PROJ-${String(i + 1).padStart(3, "0")}`,
    summary: summaries[i % summaries.length],
    status,
    priority,
    assigneeId,
    createdAt,
    startedAt,
    dueAt: undefined,
    resolvedAt,
    sprintId: undefined,
  };
});

// Generate 10 milestones
export const mockMilestones = [
  { id: "m1", title: "Sprint 1 Review", dueAt: "2026-01-12T17:00:00Z", type: "sprint_review", status: "completed" },
  { id: "m2", title: "Code Review Deadline", dueAt: "2026-01-18T17:00:00Z", type: "code_review", status: "upcoming" },
  { id: "m3", title: "Milestone 1 Release", dueAt: "2026-01-20T17:00:00Z", type: "release", status: "upcoming" },
  { id: "m4", title: "Weekly Report", dueAt: "2026-01-15T17:00:00Z", type: "report", status: "upcoming" },
  { id: "m5", title: "Sprint 2 Review", dueAt: "2026-01-26T17:00:00Z", type: "sprint_review", status: "upcoming" },
  { id: "m6", title: "API Documentation", dueAt: "2026-01-22T17:00:00Z", type: "other", status: "upcoming" },
  { id: "m7", title: "Security Audit", dueAt: "2026-01-25T17:00:00Z", type: "other", status: "upcoming" },
  { id: "m8", title: "Performance Testing", dueAt: "2026-01-28T17:00:00Z", type: "other", status: "upcoming" },
  { id: "m9", title: "Final Review", dueAt: "2026-02-01T17:00:00Z", type: "code_review", status: "upcoming" },
  { id: "m10", title: "Project Completion", dueAt: "2026-02-05T17:00:00Z", type: "release", status: "upcoming" },
];

// Generate sprints
export const mockSprints = [
  {
    id: "s1",
    name: "Sprint 1",
    startAt: "2026-01-05T00:00:00Z",
    endAt: "2026-01-19T23:59:59Z",
    plannedPoints: 40,
    completedPoints: 35,
  },
  {
    id: "s2",
    name: "Sprint 2",
    startAt: "2026-01-20T00:00:00Z",
    endAt: "2026-02-03T23:59:59Z",
    plannedPoints: 45,
    completedPoints: 0,
  },
];

