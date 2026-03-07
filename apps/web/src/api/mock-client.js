// Mock API client - simulate API calls với delay
import { mockMembers, mockCommits, mockIssues, mockMilestones, mockSprints } from "../lib/mock-data.js";
import dayjs from "dayjs";

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulate API call
const apiCall = async (fn) => {
  await delay();
  return fn();
};

export const api = {
  // GET /api/context
  getContext: () => apiCall(() => ({
    semesters: [
      { id: "2026-spring", name: "2026 Spring", start: "2026-01-05", end: "2026-04-20" },
      { id: "2025-fall", name: "2025 Fall", start: "2025-09-01", end: "2025-12-31" },
    ],
    weeks: Array.from({ length: 16 }, (_, i) => ({
      id: `week-${i + 1}`,
      label: `Week ${String(i + 1).padStart(2, "0")}`,
      from: dayjs("2026-01-05").add(i * 7, "day").format("YYYY-MM-DD"),
      to: dayjs("2026-01-05").add(i * 7 + 6, "day").format("YYYY-MM-DD"),
    })),
    repos: [
      { id: "t7-se1851", name: "T7-SE1851", label: "Repo: T7-SE1851" },
      { id: "backend", name: "Backend", label: "Backend" },
      { id: "frontend", name: "Frontend", label: "Frontend" },
    ],
    members: mockMembers,
  })),

  // GET /api/dashboard/summary
  getDashboardSummary: (params) => apiCall(() => {
    const weekCommits = mockCommits.filter((c) => {
      const commitDate = dayjs(c.committedAt).format("YYYY-MM-DD");
      return params?.weekId ? true : true; // Simplified
    });
    const weekIssues = mockIssues.filter((i) => i.status === "done");
    const totalCommits = weekCommits.length;
    const totalIssues = weekIssues.length;
    const tasksCompleted = mockIssues.filter((i) => i.status === "done").length;
    const activeMembers = new Set(mockCommits.map((c) => c.authorId)).size;

    return {
      totalCommits,
      totalIssues,
      tasksCompleted,
      activeMembers,
      deltas: { commits: 12, issues: 5, tasks: 18, members: 0 },
    };
  }),

  // GET /api/dashboard/trends
  getDashboardTrends: (params) => apiCall(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = dayjs().subtract(6 - i, "day").format("YYYY-MM-DD");
      const dayCommits = mockCommits.filter((c) => dayjs(c.committedAt).format("YYYY-MM-DD") === date);
      const dayIssues = mockIssues.filter((i) => dayjs(i.createdAt).format("YYYY-MM-DD") === date);
      const dayTasks = mockIssues.filter((i) => i.status === "done" && dayjs(i.resolvedAt).format("YYYY-MM-DD") === date);
      return {
        date,
        commits: dayCommits.length,
        issuesClosed: dayIssues.filter((i) => i.status === "done").length,
        tasksDone: dayTasks.length,
        wip: mockIssues.filter((i) => i.status === "in_progress").length,
      };
    });
    return { buckets: days };
  }),

  // GET /api/dashboard/heatmap
  getHeatmap: (params) => apiCall(() => {
    const days = Array.from({ length: 28 }, (_, i) => {
      const date = dayjs().subtract(27 - i, "day").format("YYYY-MM-DD");
      const count = mockCommits.filter((c) => dayjs(c.committedAt).format("YYYY-MM-DD") === date).length;
      return { date, count };
    });
    return { days };
  }),

  // GET /api/tasks/board
  getTasksBoard: (params) => apiCall(() => ({
    columns: {
      todo: mockIssues.filter((i) => i.status === "todo"),
      in_progress: mockIssues.filter((i) => i.status === "in_progress"),
      done: mockIssues.filter((i) => i.status === "done"),
    },
  })),

  // GET /api/tasks/cfd
  getCfd: (params) => apiCall(() => {
    const buckets = Array.from({ length: 14 }, (_, i) => {
      const date = dayjs().subtract(13 - i, "day").format("YYYY-MM-DD");
      return {
        date,
        todo: mockIssues.filter((i) => i.status === "todo").length,
        in_progress: mockIssues.filter((i) => i.status === "in_progress").length,
        done: mockIssues.filter((i) => i.status === "done" && dayjs(i.resolvedAt).format("YYYY-MM-DD") === date).length,
      };
    });
    return { buckets };
  }),

  // GET /api/tasks/cycle-time
  getCycleTime: (params) => apiCall(() => ({
    histogram: [
      { bucket: 1, count: 5 },
      { bucket: 2, count: 8 },
      { bucket: 3, count: 6 },
      { bucket: 4, count: 3 },
      { bucket: 5, count: 2 },
    ],
    medianDays: 2.5,
    p75Days: 3.5,
  })),

  // GET /api/tasks/aging-wip
  getAgingWip: (params) => apiCall(() => ({
    items: mockIssues
      .filter((i) => i.status === "in_progress")
      .map((i) => ({
        issueId: i.id,
        key: i.key,
        summary: i.summary,
        daysInProgress: dayjs().diff(dayjs(i.startedAt), "day"),
      }))
      .slice(0, params?.limit || 5),
  })),

  // GET /api/commits/list
  getCommitsList: (params) => apiCall(() => {
    let items = [...mockCommits];
    if (params?.q) {
      items = items.filter((c) => c.message.toLowerCase().includes(params.q.toLowerCase()));
    }
    if (params?.from) {
      items = items.filter((c) => dayjs(c.committedAt).isAfter(dayjs(params.from)));
    }
    if (params?.to) {
      items = items.filter((c) => dayjs(c.committedAt).isBefore(dayjs(params.to)));
    }
    return { items: items.slice(0, 50), total: items.length };
  }),

  // GET /api/commits/frequency
  getCommitsFrequency: (params) => apiCall(() => {
    const buckets = Array.from({ length: 14 }, (_, i) => {
      const date = dayjs().subtract(13 - i, "day").format("YYYY-MM-DD");
      const commits = mockCommits.filter((c) => dayjs(c.committedAt).format("YYYY-MM-DD") === date).length;
      return { date, commits };
    });
    return { buckets };
  }),

  // GET /api/commits/code-changes
  getCodeChanges: (params) => apiCall(() => {
    const buckets = Array.from({ length: 14 }, (_, i) => {
      const date = dayjs().subtract(13 - i, "day").format("YYYY-MM-DD");
      const dayCommits = mockCommits.filter((c) => dayjs(c.committedAt).format("YYYY-MM-DD") === date);
      const additions = dayCommits.reduce((sum, c) => sum + c.additions, 0);
      const deletions = dayCommits.reduce((sum, c) => sum + c.deletions, 0);
      return { date, additions, deletions };
    });
    return { buckets };
  }),

  // GET /api/deadlines/roadmap
  getDeadlinesRoadmap: (params) => apiCall(() => ({
    items: mockMilestones,
    sprints: mockSprints,
  })),

  // GET /api/deadlines/distribution
  getDeadlinesDistribution: (params) => apiCall(() => {
    const buckets = Array.from({ length: 8 }, (_, i) => {
      const week = dayjs().add(i, "week").format("YYYY-MM-DD");
      const count = mockMilestones.filter((m) => {
        const milestoneWeek = dayjs(m.dueAt).format("YYYY-MM-DD");
        return dayjs(milestoneWeek).isSame(dayjs(week), "week");
      }).length;
      return { week, count };
    });
    return { buckets };
  }),

  // GET /api/performance/summary
  getPerformanceSummary: (params) => apiCall(() => ({
    productivity: 85,
    efficiency: 92,
    quality: 88,
    engagement: 90,
  })),

  // GET /api/performance/members
  getPerformanceMembers: (params) => apiCall(() => {
    const rows = mockMembers.map((member) => {
      const commits = mockCommits.filter((c) => c.authorId === member.id).length;
      const issues = mockIssues.filter((i) => i.assigneeId === member.id).length;
      const tasks = mockIssues.filter((i) => i.assigneeId === member.id && i.status === "done").length;
      const total = commits + issues + tasks;
      const score = Math.min(100, Math.round((total / 50) * 100));
      return { memberId: member.id, score, commits, issues, tasks, total };
    });
    return { rows };
  }),

  // GET /api/performance/trends
  getPerformanceTrends: (params) => apiCall(() => {
    const buckets = Array.from({ length: 4 }, (_, i) => {
      const week = `Week ${i + 1}`;
      const baseCommits = 30 + i * 5;
      const baseIssues = 15 + i * 2;
      const baseTasks = 10 + i * 3;
      return {
        week,
        commits: baseCommits,
        issues: baseIssues,
        tasks: baseTasks,
        total: baseCommits + baseIssues + baseTasks,
      };
    });
    return { buckets };
  }),
};


