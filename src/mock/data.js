// Mock Data Structure for Project-Based Learning Management System

// Mock Users
export const mockUsers = {
  lecturers: [
    {
      id: 'lec001',
      email: 'lecturer@gmail.com',
      password: '123456',
      name: 'Nguyễn Văn A',
      role: 'LECTURER',
      department: 'Computer Science',
      phone: '0123456789',
      courses: ['cs101', 'cs102']
    },
    {
      id: 'lec002',
      email: 'lecturer2@gmail.com',
      password: '123456',
      name: 'Trần Thị B',
      role: 'LECTURER',
      department: 'Software Engineering',
      phone: '0123456788',
      courses: ['se201']
    }
  ],
  students: [
    {
      id: 'stu001',
      email: 'student@gmail.com',
      password: '123456',
      name: 'Lê Văn C',
      role: 'STUDENT',
      studentCode: 'SE2021001',
      department: 'Software Engineering',
      batch: '2021',
      courses: ['cs101', 'se201'],
      projects: ['proj001', 'proj002']
    },
    {
      id: 'stu002',
      email: 'student2@gmail.com',
      password: '123456',
      name: 'Phạm Thị D',
      role: 'STUDENT',
      studentCode: 'SE2021002',
      department: 'Software Engineering',
      batch: '2021',
      courses: ['cs101'],
      projects: ['proj001']
    },
    {
      id: 'stu003',
      email: 'student3@gmail.com',
      password: '123456',
      name: 'Hoàng Văn E',
      role: 'STUDENT',
      studentCode: 'CS2021001',
      department: 'Computer Science',
      batch: '2021',
      courses: ['cs102'],
      projects: ['proj003']
    }
  ],
  admins: [
    {
      id: 'adm001',
      email: 'admin@gmail.com',
      password: '123456',
      name: 'Admin System',
      role: 'ADMIN',
      department: 'IT Department'
    }
  ]
};

// Mock Semesters
export const mockSemesters = [
  {
    id: 'sem20231',
    name: 'Fall 2023',
    startDate: '2023-09-01',
    endDate: '2024-01-15',
    status: 'ACTIVE'
  },
  {
    id: 'sem20232',
    name: 'Spring 2024',
    startDate: '2024-01-20',
    endDate: '2024-05-30',
    status: 'UPCOMING'
  }
];

// Mock Subjects
export const mockSubjects = [
  {
    id: 'sub001',
    code: 'CS101',
    name: 'Introduction to Programming',
    credits: 3,
    department: 'Computer Science'
  },
  {
    id: 'sub002',
    code: 'CS102',
    name: 'Data Structures & Algorithms',
    credits: 4,
    department: 'Computer Science'
  },
  {
    id: 'sub003',
    code: 'SE201',
    name: 'Software Engineering',
    credits: 4,
    department: 'Software Engineering'
  }
];

// Mock Courses
export const mockCourses = [
  {
    id: 'cs101',
    code: 'CS101.F21',
    name: 'Lập trình cơ bản',
    subjectId: 'sub001',
    semesterId: 'sem20231',
    lecturerId: 'lec001',
    studentIds: ['stu001', 'stu002'],
    status: 'ACTIVE',
    maxStudents: 60,
    currentStudents: 2,
    projects: ['proj001']
  },
  {
    id: 'cs102',
    code: 'CS102.F21',
    name: 'Cấu trúc dữ liệu và giải thuật',
    subjectId: 'sub002',
    semesterId: 'sem20231',
    lecturerId: 'lec001',
    studentIds: ['stu003'],
    status: 'ACTIVE',
    maxStudents: 50,
    currentStudents: 1,
    projects: ['proj003']
  },
  {
    id: 'se201',
    code: 'SE201.F21',
    name: 'Kỹ thuật phần mềm',
    subjectId: 'sub003',
    semesterId: 'sem20231',
    lecturerId: 'lec002',
    studentIds: ['stu001'],
    status: 'ACTIVE',
    maxStudents: 40,
    currentStudents: 1,
    projects: ['proj002']
  }
];

// Mock Projects
export const mockProjects = [
  {
    id: 'proj001',
    name: 'E-commerce Website',
    description: 'Xây dựng website thương mại điện tử',
    courseId: 'cs101',
    jiraProjectKey: 'ECOM',
    githubRepo: 'https://github.com/example/ecommerce',
    status: 'ACTIVE',
    startDate: '2023-10-01',
    endDate: '2023-12-15',
    teamMembers: [
      {
        studentId: 'stu001',
        roleInTeam: 'LEADER',
        responsibility: 'Frontend Development',
        status: 'ACTIVE',
        contributionScore: 85
      },
      {
        studentId: 'stu002',
        roleInTeam: 'MEMBER',
        responsibility: 'Backend Development',
        status: 'ACTIVE',
        contributionScore: 78
      }
    ]
  },
  {
    id: 'proj002',
    name: 'Mobile Banking App',
    description: 'Ứng dụng ngân hàng di động',
    courseId: 'se201',
    jiraProjectKey: 'BANK',
    githubRepo: 'https://github.com/example/banking-app',
    status: 'ACTIVE',
    startDate: '2023-10-15',
    endDate: '2024-01-10',
    teamMembers: [
      {
        studentId: 'stu001',
        roleInTeam: 'MEMBER',
        responsibility: 'UI/UX Design',
        status: 'ACTIVE',
        contributionScore: 92
      }
    ]
  },
  {
    id: 'proj003',
    name: 'Data Analytics Dashboard',
    description: 'Bảng điều khiển phân tích dữ liệu',
    courseId: 'cs102',
    jiraProjectKey: 'DASH',
    githubRepo: 'https://github.com/example/dashboard',
    status: 'ACTIVE',
    startDate: '2023-11-01',
    endDate: '2024-01-20',
    teamMembers: [
      {
        studentId: 'stu003',
        roleInTeam: 'LEADER',
        responsibility: 'Data Visualization',
        status: 'ACTIVE',
        contributionScore: 88
      }
    ]
  }
];

// Mock Jira Projects
export const mockJiraProjects = [
  {
    id: 'jira001',
    projectKey: 'ECOM',
    name: 'E-commerce Website',
    projectId: 'proj001',
    issueCount: 45,
    completedIssues: 32,
    sprintCount: 6,
    currentSprint: 'Sprint 6',
    sprintStatus: 'ACTIVE',
    lastSync: '2024-01-25T10:30:00Z'
  },
  {
    id: 'jira002',
    projectKey: 'BANK',
    name: 'Mobile Banking App',
    projectId: 'proj002',
    issueCount: 38,
    completedIssues: 25,
    sprintCount: 5,
    currentSprint: 'Sprint 5',
    sprintStatus: 'ACTIVE',
    lastSync: '2024-01-25T09:15:00Z'
  },
  {
    id: 'jira003',
    projectKey: 'DASH',
    name: 'Data Analytics Dashboard',
    projectId: 'proj003',
    issueCount: 28,
    completedIssues: 18,
    sprintCount: 4,
    currentSprint: 'Sprint 4',
    sprintStatus: 'PLANNING',
    lastSync: '2024-01-24T16:45:00Z'
  }
];

// Mock GitHub Repositories
export const mockGithubRepos = [
  {
    id: 'repo001',
    name: 'ecommerce',
    url: 'https://github.com/example/ecommerce',
    projectId: 'proj001',
    totalCommits: 156,
    lastCommitDate: '2024-01-25T08:20:00Z',
    contributors: ['stu001', 'stu002'],
    branches: ['main', 'develop', 'feature/payment'],
    lastSync: '2024-01-25T10:30:00Z'
  },
  {
    id: 'repo002',
    name: 'banking-app',
    url: 'https://github.com/example/banking-app',
    projectId: 'proj002',
    totalCommits: 89,
    lastCommitDate: '2024-01-24T14:15:00Z',
    contributors: ['stu001'],
    branches: ['main', 'develop'],
    lastSync: '2024-01-25T09:15:00Z'
  },
  {
    id: 'repo003',
    name: 'dashboard',
    url: 'https://github.com/example/dashboard',
    projectId: 'proj003',
    totalCommits: 67,
    lastCommitDate: '2024-01-23T11:30:00Z',
    contributors: ['stu003'],
    branches: ['main', 'feature/charts'],
    lastSync: '2024-01-24T16:45:00Z'
  }
];

// Mock Commits
export const mockCommits = [
  {
    id: 'commit001',
    sha: 'abc123def456',
    message: 'Fix login validation bug',
    authorStudentId: 'stu001',
    projectId: 'proj001',
    repoId: 'repo001',
    date: '2024-01-25T08:20:00Z',
    additions: 15,
    deletions: 8,
    files: ['src/components/Login.jsx', 'src/utils/validation.js']
  },
  {
    id: 'commit002',
    sha: 'def456ghi789',
    message: 'Add payment gateway integration',
    authorStudentId: 'stu002',
    projectId: 'proj001',
    repoId: 'repo001',
    date: '2024-01-24T16:45:00Z',
    additions: 45,
    deletions: 12,
    files: ['src/components/Payment.jsx', 'src/api/payment.js']
  },
  {
    id: 'commit003',
    sha: 'ghi789jkl012',
    message: 'Update dashboard UI components',
    authorStudentId: 'stu003',
    projectId: 'proj003',
    repoId: 'repo003',
    date: '2024-01-23T11:30:00Z',
    additions: 28,
    deletions: 15,
    files: ['src/components/Dashboard.jsx', 'src/styles/dashboard.css']
  },
  {
    id: 'commit004',
    sha: 'jkl012mno345',
    message: 'Implement user authentication',
    authorStudentId: 'stu001',
    projectId: 'proj002',
    repoId: 'repo002',
    date: '2024-01-24T14:15:00Z',
    additions: 67,
    deletions: 5,
    files: ['src/auth/AuthContext.jsx', 'src/components/Auth.jsx']
  }
];

// Mock SRS Reports
export const mockSrsReports = [
  {
    id: 'srs001',
    projectId: 'proj001',
    version: '1.0',
    status: 'FINAL',
    title: 'Software Requirements Specification - E-commerce Website',
    submittedBy: 'stu001',
    submittedDate: '2023-10-15T10:00:00Z',
    reviewedBy: 'lec001',
    reviewedDate: '2023-10-16T14:30:00Z',
    fileUrl: '/files/srs/proj001_final.pdf',
    comments: 'Good requirements analysis, well-structured document.'
  },
  {
    id: 'srs002',
    projectId: 'proj001',
    version: '0.9',
    status: 'DRAFT',
    title: 'Software Requirements Specification - E-commerce Website (Draft)',
    submittedBy: 'stu001',
    submittedDate: '2023-10-10T09:00:00Z',
    reviewedBy: null,
    reviewedDate: null,
    fileUrl: '/files/srs/proj001_draft.pdf',
    comments: 'Initial draft for review.'
  },
  {
    id: 'srs003',
    projectId: 'proj002',
    version: '1.0',
    status: 'REVIEW',
    title: 'Software Requirements Specification - Mobile Banking App',
    submittedBy: 'stu001',
    submittedDate: '2024-01-20T11:00:00Z',
    reviewedBy: 'lec002',
    reviewedDate: null,
    fileUrl: '/files/srs/proj002_review.pdf',
    comments: 'Pending review by lecturer.'
  }
];

// Helper functions to get data
export const getUserByEmail = (email) => {
  const allUsers = [
    ...mockUsers.lecturers,
    ...mockUsers.students,
    ...mockUsers.admins
  ];
  return allUsers.find(user => user.email === email);
};

export const getCourseById = (courseId) => {
  return mockCourses.find(course => course.id === courseId);
};

export const getProjectById = (projectId) => {
  return mockProjects.find(project => project.id === projectId);
};

export const getProjectsByCourse = (courseId) => {
  return mockProjects.filter(project => project.courseId === courseId);
};

export const getCommitsByProject = (projectId) => {
  return mockCommits.filter(commit => commit.projectId === projectId);
};

export const getCommitsByStudent = (studentId) => {
  return mockCommits.filter(commit => commit.authorStudentId === studentId);
};

export const getSrsReportsByProject = (projectId) => {
  return mockSrsReports.filter(report => report.projectId === projectId);
};

export const getRecentActions = () => {
  return [
    {
      id: 'action001',
      type: 'ADD_LECTURER',
      description: 'Thêm giảng viên Nguyễn Văn A vào course CS101.F21',
      timestamp: '2024-01-25T10:00:00Z',
      userId: 'adm001'
    },
    {
      id: 'action002',
      type: 'CREATE_COURSE',
      description: 'Tạo course mới SE201.F21 - Kỹ thuật phần mềm',
      timestamp: '2024-01-24T14:30:00Z',
      userId: 'adm001'
    },
    {
      id: 'action003',
      type: 'CREATE_PROJECT',
      description: 'Tạo project mới "E-commerce Website" cho course CS101.F21',
      timestamp: '2024-01-23T09:15:00Z',
      userId: 'lec001'
    }
  ];
};
