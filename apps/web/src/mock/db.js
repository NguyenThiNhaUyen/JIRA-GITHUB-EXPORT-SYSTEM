// Mock Database Layer - In-memory + localStorage persistence
class MockDB {
  constructor() {
    this.STORAGE_KEY = 'pbl_mock_db_v4'; // v4 - Only 8 students assigned, 15 available in se1821
    this.initializeData();
  }

  initializeData() {
    // FORCE RESET: Skip localStorage to always load fresh data
    const FORCE_RESET = true; // Set to false after testing

    // Try to load from localStorage first
    const stored = !FORCE_RESET ? localStorage.getItem(this.STORAGE_KEY) : null;
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.data = data;
        return;
      } catch (e) {
        console.warn('Failed to load from localStorage, using fresh data');
      }
    }

    // Fresh data initialization
    this.data = {
      // Semesters: Kỳ học (e.g., Spring 2026, Fall 2025)
      semesters: [
        { id: 'sem-spring-2026', code: 'SPRING2026', name: 'Spring 2026', startDate: '2026-01-05', endDate: '2026-04-20', status: 'ACTIVE', createdAt: '2025-12-01' },
        { id: 'sem-fall-2025', code: 'FALL2025', name: 'Fall 2025', startDate: '2025-09-01', endDate: '2025-12-31', status: 'COMPLETED', createdAt: '2025-08-01' },
        { id: 'sem-summer-2026', code: 'SUMMER2026', name: 'Summer 2026', startDate: '2026-05-01', endDate: '2026-08-15', status: 'UPCOMING', createdAt: '2026-01-15' },
      ],

      // Subjects: Môn học
      subjects: [
        { id: 'subj-exe101', code: 'EXE101', name: 'Exe Project', createdAt: '2025-01-01' },
        { id: 'subj-prn222', code: 'PRN222', name: 'Programming .NET', createdAt: '2025-01-01' },
        { id: 'subj-swd302', code: 'SWD302', name: 'Software Development', createdAt: '2025-01-01' },
        { id: 'subj-swt301', code: 'SWT301', name: 'Software Testing', createdAt: '2025-01-01' },
      ],

      // Courses: Lớp học cụ thể (e.g., SE1821, SE1822) - combination of Subject + Semester
      courses: [
        // SWD302 Courses for Spring 2026
        { id: 'course-se1821', code: 'se1821', subjectId: 'subj-swd302', semesterId: 'sem-spring-2026', name: 'SWD302 - se1821', description: 'Software Development - Class se1821', status: 'ACTIVE', maxStudents: 40, currentStudents: 35, createdAt: '2025-12-15' },
        { id: 'course-se1822', code: 'se1822', subjectId: 'subj-swd302', semesterId: 'sem-spring-2026', name: 'SWD302 - se1822', description: 'Software Development - Class se1822', status: 'ACTIVE', maxStudents: 40, currentStudents: 38, createdAt: '2025-12-15' },
        { id: 'course-se1823', code: 'se1823', subjectId: 'subj-swd302', semesterId: 'sem-spring-2026', name: 'SWD302 - se1823', description: 'Software Development - Class se1823', status: 'ACTIVE', maxStudents: 40, currentStudents: 32, createdAt: '2025-12-15' },

        // EXE101 Courses for Spring 2026
        { id: 'course-exe1821', code: 'exe1821', subjectId: 'subj-exe101', semesterId: 'sem-spring-2026', name: 'EXE101 - exe1821', description: 'Exe Project - Class exe1821', status: 'ACTIVE', maxStudents: 30, currentStudents: 28, createdAt: '2025-12-15' },
        { id: 'course-exe1822', code: 'exe1822', subjectId: 'subj-exe101', semesterId: 'sem-spring-2026', name: 'EXE101 - exe1822', description: 'Exe Project - Class exe1822', status: 'ACTIVE', maxStudents: 30, currentStudents: 25, createdAt: '2025-12-15' },

        // PRN222 Courses for Spring 2026
        { id: 'course-prn1821', code: 'prn1821', subjectId: 'subj-prn222', semesterId: 'sem-spring-2026', name: 'PRN222 - prn1821', description: 'Programming .NET - Class prn1821', status: 'ACTIVE', maxStudents: 35, currentStudents: 30, createdAt: '2025-12-15' },

        // Fall 2025 courses (completed)
        { id: 'course-se1721', code: 'se1721', subjectId: 'subj-swd302', semesterId: 'sem-fall-2025', name: 'SWD302 - se1721', description: 'Software Development - Class se1721', status: 'COMPLETED', maxStudents: 40, currentStudents: 40, createdAt: '2025-08-15' },
      ],

      users: {
        admins: [
          { id: 'adm001', name: 'Admin System', email: 'admin@gmail.com', role: 'ADMIN', avatar: null, createdAt: '2025-01-01' },
        ],
        lecturers: [
          { id: 'lec001', name: 'Nguyễn Văn A', email: 'lecturer@gmail.com', role: 'LECTURER', avatar: null, department: 'Computer Science', createdAt: '2025-01-01' },
          { id: 'lec002', name: 'Trần Thị B', email: 'lecturer2@gmail.com', role: 'LECTURER', avatar: null, department: 'Software Engineering', createdAt: '2025-01-01' },
        ],
        students: [
          { id: 'stu001', name: 'Lê Văn C', email: 'student@gmail.com', role: 'STUDENT', avatar: null, studentId: 'SE2026001', createdAt: '2025-01-01' },
          { id: 'stu002', name: 'Phạm Thị D', email: 'student2@gmail.com', role: 'STUDENT', avatar: null, studentId: 'SE2026002', createdAt: '2025-01-01' },
          { id: 'stu003', name: 'Hoàng Văn E', email: 'student3@gmail.com', role: 'STUDENT', avatar: null, studentId: 'SE2026003', createdAt: '2025-01-01' },
          { id: 'stu004', name: 'Nguyễn Thị Mai', email: 'mai.nguyen@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026004', createdAt: '2025-01-01' },
          { id: 'stu005', name: 'Trần Văn Tùng', email: 'tung.tran@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026005', createdAt: '2025-01-01' },
          { id: 'stu006', name: 'Võ Thị Linh', email: 'linh.vo@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026006', createdAt: '2025-01-01' },
          { id: 'stu007', name: 'Đỗ Văn Hưng', email: 'hung.do@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026007', createdAt: '2025-01-01' },
          { id: 'stu008', name: 'Bùi Thị Hoa', email: 'hoa.bui@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026008', createdAt: '2025-01-01' },
          { id: 'stu009', name: 'Lý Văn Minh', email: 'minh.ly@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026009', createdAt: '2025-01-01' },
          { id: 'stu010', name: 'Phan Thị Lan', email: 'lan.phan@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026010', createdAt: '2025-01-01' },
          { id: 'stu011', name: 'Nguyễn Văn Khánh', email: 'khanh.nguyen@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026011', createdAt: '2025-01-01' },
          { id: 'stu012', name: 'Trương Thị Thanh', email: 'thanh.truong@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026012', createdAt: '2025-01-01' },
          { id: 'stu013', name: 'Đặng Văn Long', email: 'long.dang@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026013', createdAt: '2025-01-01' },
          { id: 'stu014', name: 'Hồ Thị Dung', email: 'dung.ho@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026014', createdAt: '2025-01-01' },
          { id: 'stu015', name: 'Lê Văn Quân', email: 'quan.le@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026015', createdAt: '2025-01-01' },
          { id: 'stu016', name: 'Nguyễn Văn Nam', email: 'nam.nguyen@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026016', createdAt: '2025-01-01' },
          { id: 'stu017', name: 'Trần Thị Hương', email: 'huong.tran@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026017', createdAt: '2025-01-01' },
          { id: 'stu018', name: 'Phạm Văn Đức', email: 'duc.pham@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026018', createdAt: '2025-01-01' },
          { id: 'stu019', name: 'Lý Thị Nhung', email: 'nhung.ly@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026019', createdAt: '2025-01-01' },
          { id: 'stu020', name: 'Đỗ Văn Hải', email: 'hai.do@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026020', createdAt: '2025-01-01' },
          { id: 'stu021', name: 'Võ Thị Nga', email: 'nga.vo@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026021', createdAt: '2025-01-01' },
          { id: 'stu022', name: 'Bùi Văn Sơn', email: 'son.bui@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026022', createdAt: '2025-01-01' },
          { id: 'stu023', name: 'Hoàng Thị Thu', email: 'thu.hoang@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026023', createdAt: '2025-01-01' },
          { id: 'stu024', name: 'Phan Văn Tuấn', email: 'tuan.phan@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026024', createdAt: '2025-01-01' },
          { id: 'stu025', name: 'Trương Thị An', email: 'an.truong@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026025', createdAt: '2025-01-01' },
          { id: 'stu026', name: 'Đặng Văn Phong', email: 'phong.dang@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026026', createdAt: '2025-01-01' },
          { id: 'stu027', name: 'Hồ Thị Vân', email: 'van.ho@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026027', createdAt: '2025-01-01' },
          { id: 'stu028', name: 'Lê Văn Toàn', email: 'toan.le@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026028', createdAt: '2025-01-01' },
          { id: 'stu029', name: 'Nguyễn Thị Yến', email: 'yen.nguyen@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026029', createdAt: '2025-01-01' },
          { id: 'stu030', name: 'Trần Văn Bình', email: 'binh.tran@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026030', createdAt: '2025-01-01' },
          { id: 'stu031', name: 'Phạm Thị Hà', email: 'ha.pham@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026031', createdAt: '2025-01-01' },
          { id: 'stu032', name: 'Lý Văn Cường', email: 'cuong.ly@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026032', createdAt: '2025-01-01' },
          { id: 'stu033', name: 'Đỗ Thị Kim', email: 'kim.do@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026033', createdAt: '2025-01-01' },
          { id: 'stu034', name: 'Võ Văn Thắng', email: 'thang.vo@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026034', createdAt: '2025-01-01' },
          { id: 'stu035', name: 'Bùi Thị Phương', email: 'phuong.bui@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026035', createdAt: '2025-01-01' },
          { id: 'stu036', name: 'Hoàng Văn Đạt', email: 'dat.hoang@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026036', createdAt: '2025-01-01' },
          { id: 'stu037', name: 'Phan Thị Loan', email: 'loan.phan@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026037', createdAt: '2025-01-01' },
          { id: 'stu038', name: 'Trương Văn Hiếu', email: 'hieu.truong@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026038', createdAt: '2025-01-01' },
          { id: 'stu039', name: 'Đặng Thị Ngọc', email: 'ngoc.dang@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026039', createdAt: '2025-01-01' },
          { id: 'stu040', name: 'Hồ Văn Thành', email: 'thanh.ho@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026040', createdAt: '2025-01-01' },
          { id: 'stu041', name: 'Lê Thị Trang', email: 'trang.le@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026041', createdAt: '2025-01-01' },
          { id: 'stu042', name: 'Nguyễn Văn Hoàng', email: 'hoang.nguyen@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026042', createdAt: '2025-01-01' },
          { id: 'stu043', name: 'Trần Thị Tuyết', email: 'tuyet.tran@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026043', createdAt: '2025-01-01' },
          { id: 'stu044', name: 'Phạm Văn Vũ', email: 'vu.pham@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026044', createdAt: '2025-01-01' },
          { id: 'stu045', name: 'Lý Thị Xuân', email: 'xuan.ly@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026045', createdAt: '2025-01-01' },
          { id: 'stu046', name: 'Đỗ Văn Duy', email: 'duy.do@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026046', createdAt: '2025-01-01' },
          { id: 'stu047', name: 'Võ Thị Diệu', email: 'dieu.vo@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026047', createdAt: '2025-01-01' },
          { id: 'stu048', name: 'Bùi Văn Quyết', email: 'quyet.bui@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026048', createdAt: '2025-01-01' },
          { id: 'stu049', name: 'Hoàng Thị My', email: 'my.hoang@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026049', createdAt: '2025-01-01' },
          { id: 'stu050', name: 'Phan Văn Thịnh', email: 'thinh.phan@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026050', createdAt: '2025-01-01' },
          { id: 'stu051', name: 'Trương Thị Bích', email: 'bich.truong@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026051', createdAt: '2025-01-01' },
          { id: 'stu052', name: 'Đặng Văn Tiến', email: 'tien.dang@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026052', createdAt: '2025-01-01' },
          { id: 'stu053', name: 'Hồ Thị Châu', email: 'chau.ho@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026053', createdAt: '2025-01-01' },
          { id: 'stu054', name: 'Lê Văn Tùng', email: 'tung.le@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026054', createdAt: '2025-01-01' },
          { id: 'stu055', name: 'Nguyễn Thị Thảo', email: 'thao.nguyen@university.edu', role: 'STUDENT', avatar: null, studentId: 'SE2026055', createdAt: '2025-01-01' },
        ]
      },

      // Course-Lecturer assignments: Mỗi course chỉ có 1 giảng viên PRIMARY
      courseLecturers: [
        // Lecturer 1 teaches multiple SWD courses
        { id: 'cl1', courseId: 'course-se1821', lecturerId: 'lec001', role: 'PRIMARY', assignedAt: '2025-12-01' },
        { id: 'cl2', courseId: 'course-se1822', lecturerId: 'lec001', role: 'PRIMARY', assignedAt: '2025-12-01' },
        { id: 'cl3', courseId: 'course-se1823', lecturerId: 'lec001', role: 'PRIMARY', assignedAt: '2025-12-01' },

        // Lecturer 2 teaches EXE and PRN courses
        { id: 'cl4', courseId: 'course-exe1821', lecturerId: 'lec002', role: 'PRIMARY', assignedAt: '2025-12-01' },
        { id: 'cl5', courseId: 'course-prn1821', lecturerId: 'lec002', role: 'PRIMARY', assignedAt: '2025-12-01' },
      ],

      courseEnrollments: [
        // SWD se1821 students
        { id: 'ce1', courseId: 'course-se1821', studentId: 'stu001', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce2', courseId: 'course-se1821', studentId: 'stu002', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce3', courseId: 'course-se1821', studentId: 'stu003', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce4', courseId: 'course-se1821', studentId: 'stu004', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce5', courseId: 'course-se1821', studentId: 'stu005', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce6', courseId: 'course-se1821', studentId: 'stu006', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce7', courseId: 'course-se1821', studentId: 'stu007', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce8', courseId: 'course-se1821', studentId: 'stu008', enrolledAt: '2025-12-15', status: 'ACTIVE' },

        // SWD se1822 students
        { id: 'ce9', courseId: 'course-se1822', studentId: 'stu009', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce10', courseId: 'course-se1822', studentId: 'stu010', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce11', courseId: 'course-se1822', studentId: 'stu011', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce12', courseId: 'course-se1822', studentId: 'stu012', enrolledAt: '2025-12-15', status: 'ACTIVE' },

        // SWD se1823 students
        { id: 'ce13', courseId: 'course-se1823', studentId: 'stu013', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce14', courseId: 'course-se1823', studentId: 'stu014', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce15', courseId: 'course-se1823', studentId: 'stu015', enrolledAt: '2025-12-15', status: 'ACTIVE' },

        // Additional se1821 students
        { id: 'ce16', courseId: 'course-se1821', studentId: 'stu016', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce17', courseId: 'course-se1821', studentId: 'stu017', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce18', courseId: 'course-se1821', studentId: 'stu018', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce19', courseId: 'course-se1821', studentId: 'stu019', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce20', courseId: 'course-se1821', studentId: 'stu020', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce21', courseId: 'course-se1821', studentId: 'stu021', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce22', courseId: 'course-se1821', studentId: 'stu022', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce23', courseId: 'course-se1821', studentId: 'stu023', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce24', courseId: 'course-se1821', studentId: 'stu024', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce25', courseId: 'course-se1821', studentId: 'stu025', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce26', courseId: 'course-se1821', studentId: 'stu026', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce27', courseId: 'course-se1821', studentId: 'stu027', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce28', courseId: 'course-se1821', studentId: 'stu028', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce29', courseId: 'course-se1821', studentId: 'stu029', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce30', courseId: 'course-se1821', studentId: 'stu030', enrolledAt: '2025-12-15', status: 'ACTIVE' },

        // Additional se1822 students
        { id: 'ce31', courseId: 'course-se1822', studentId: 'stu031', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce32', courseId: 'course-se1822', studentId: 'stu032', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce33', courseId: 'course-se1822', studentId: 'stu033', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce34', courseId: 'course-se1822', studentId: 'stu034', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce35', courseId: 'course-se1822', studentId: 'stu035', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce36', courseId: 'course-se1822', studentId: 'stu036', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce37', courseId: 'course-se1822', studentId: 'stu037', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce38', courseId: 'course-se1822', studentId: 'stu038', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce39', courseId: 'course-se1822', studentId: 'stu039', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce40', courseId: 'course-se1822', studentId: 'stu040', enrolledAt: '2025-12-15', status: 'ACTIVE' },

        // Additional se1823 students
        { id: 'ce41', courseId: 'course-se1823', studentId: 'stu041', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce42', courseId: 'course-se1823', studentId: 'stu042', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce43', courseId: 'course-se1823', studentId: 'stu043', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce44', courseId: 'course-se1823', studentId: 'stu044', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce45', courseId: 'course-se1823', studentId: 'stu045', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce46', courseId: 'course-se1823', studentId: 'stu046', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce47', courseId: 'course-se1823', studentId: 'stu047', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce48', courseId: 'course-se1823', studentId: 'stu048', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce49', courseId: 'course-se1823', studentId: 'stu049', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce50', courseId: 'course-se1823', studentId: 'stu050', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce51', courseId: 'course-se1823', studentId: 'stu051', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce52', courseId: 'course-se1823', studentId: 'stu052', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce53', courseId: 'course-se1823', studentId: 'stu053', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce54', courseId: 'course-se1823', studentId: 'stu054', enrolledAt: '2025-12-15', status: 'ACTIVE' },
        { id: 'ce55', courseId: 'course-se1823', studentId: 'stu055', enrolledAt: '2025-12-15', status: 'ACTIVE' },
      ],

      // Groups: Nhóm học sinh trong course
      groups: [
        {
          id: 'grp-se1821-1',
          courseId: 'course-se1821',
          name: 'Nhóm 1',
          topic: 'E-commerce Platform với AI Recommendation System',
          studentIds: ['stu001', 'stu002'],
          teamLeaderId: 'stu001',
          githubRepoUrl: 'https://github.com/team1/ecommerce-ai',
          jiraProjectUrl: 'https://team1.atlassian.net/browse/ECOM',
          githubStatus: 'APPROVED',
          jiraStatus: 'APPROVED',
          approvedByLecturerId: 'lec001',
          approvedAt: '2026-01-25T10:00:00Z',
          createdAt: '2026-01-10',
          updatedAt: '2026-01-25'
        },
        {
          id: 'grp-se1821-2',
          courseId: 'course-se1821',
          name: 'Nhóm 2',
          topic: 'Task Management System với Realtime Collaboration & Kanban Board',
          studentIds: ['stu003', 'stu004'],
          teamLeaderId: 'stu003',
          githubRepoUrl: 'https://github.com/team2/task-manager',
          jiraProjectUrl: 'https://team2.atlassian.net/browse/TASK',
          githubStatus: 'APPROVED',
          jiraStatus: 'PENDING',
          approvedByLecturerId: 'lec001',
          approvedAt: '2026-01-22T10:00:00Z',
          createdAt: '2026-01-10',
          updatedAt: '2026-01-27'
        },
        {
          id: 'grp-se1821-3',
          courseId: 'course-se1821',
          name: 'Nhóm 3',
          topic: 'Social Media Platform for University Students',
          studentIds: ['stu005', 'stu006'],
          teamLeaderId: 'stu005',
          githubRepoUrl: 'https://github.com/team3/social-campus',
          jiraProjectUrl: null,
          githubStatus: 'PENDING',
          jiraStatus: 'PENDING',
          approvedByLecturerId: null,
          approvedAt: null,
          createdAt: '2026-01-12',
          updatedAt: '2026-01-28'
        },
        {
          id: 'grp-se1821-4',
          courseId: 'course-se1821',
          name: 'Nhóm 4',
          topic: 'Online Learning Platform với Video Streaming',
          studentIds: ['stu007', 'stu008'],
          teamLeaderId: 'stu007',
          githubRepoUrl: null,
          jiraProjectUrl: null,
          githubStatus: 'PENDING',
          jiraStatus: 'PENDING',
          approvedByLecturerId: null,
          approvedAt: null,
          createdAt: '2026-01-15',
          updatedAt: '2026-01-15'
        },
        {
          id: 'grp-se1822-1',
          courseId: 'course-se1822',
          name: 'Nhóm 1',
          topic: 'Healthcare Management System với IoT Integration',
          studentIds: ['stu009', 'stu010'],
          teamLeaderId: 'stu009',
          githubRepoUrl: 'https://github.com/team-health/health-iot',
          jiraProjectUrl: 'https://healthcare.atlassian.net/browse/HEALTH',
          githubStatus: 'PENDING',
          jiraStatus: 'APPROVED',
          approvedByLecturerId: 'lec001',
          approvedAt: '2026-01-20T14:30:00Z',
          createdAt: '2026-01-12',
          updatedAt: '2026-01-27'
        },
        {
          id: 'grp-se1822-2',
          courseId: 'course-se1822',
          name: 'Nhóm 2',
          topic: 'Smart Home Automation với Voice Control & Machine Learning',
          studentIds: ['stu011', 'stu012'],
          teamLeaderId: 'stu011',
          githubRepoUrl: 'https://github.com/smart-home/automation',
          jiraProjectUrl: 'https://smarthome.atlassian.net/browse/SMART',
          githubStatus: 'APPROVED',
          jiraStatus: 'APPROVED',
          approvedByLecturerId: 'lec001',
          approvedAt: '2026-01-18T09:15:00Z',
          createdAt: '2026-01-11',
          updatedAt: '2026-01-18'
        },
        {
          id: 'grp-se1823-1',
          courseId: 'course-se1823',
          name: 'Nhóm 1',
          topic: 'Restaurant Management & Delivery System với Real-time Tracking',
          studentIds: ['stu013'],
          teamLeaderId: 'stu013',
          githubRepoUrl: null,
          jiraProjectUrl: null,
          githubStatus: 'PENDING',
          jiraStatus: 'PENDING',
          approvedByLecturerId: null,
          approvedAt: null,
          createdAt: '2026-01-14',
          updatedAt: '2026-01-14'
        }
      ],

      projects: [
        { id: 'proj1', courseId: 'course-se1821', name: 'E-commerce Platform', description: 'Build a full-stack e-commerce platform', status: 'ACTIVE', startDate: '2026-01-15', endDate: '2026-04-10', createdAt: '2026-01-10' },
        { id: 'proj2', courseId: 'course-se1822', name: 'Task Management System', description: 'Create a task management application', status: 'ACTIVE', startDate: '2026-01-15', endDate: '2026-04-10', createdAt: '2026-01-10' },
        { id: 'proj3', courseId: 'course-exe1821', name: 'AI Chatbot', description: 'Develop an AI-powered chatbot', status: 'ACTIVE', startDate: '2026-01-20', endDate: '2026-04-15', createdAt: '2026-01-15' },
      ],

      teamMembers: [
        { id: 'tm1', projectId: 'proj1', studentId: 'stu001', roleInTeam: 'LEADER', responsibility: 'Backend Development', status: 'ACTIVE', contributionScore: 95, joinedAt: '2026-01-12' },
        { id: 'tm2', projectId: 'proj1', studentId: 'stu002', roleInTeam: 'MEMBER', responsibility: 'Frontend Development', status: 'ACTIVE', contributionScore: 88, joinedAt: '2026-01-12' },
        { id: 'tm3', projectId: 'proj1', studentId: 'stu003', roleInTeam: 'MEMBER', responsibility: 'UI/UX Design', status: 'ACTIVE', contributionScore: 92, joinedAt: '2026-01-12' },
        { id: 'tm4', projectId: 'proj2', studentId: 'stu002', roleInTeam: 'LEADER', responsibility: 'Full Stack Development', status: 'ACTIVE', contributionScore: 90, joinedAt: '2026-01-12' },
        { id: 'tm5', projectId: 'proj3', studentId: 'stu004', roleInTeam: 'LEADER', responsibility: 'AI/ML Development', status: 'ACTIVE', contributionScore: 93, joinedAt: '2026-01-15' },
        { id: 'tm6', projectId: 'proj3', studentId: 'stu005', roleInTeam: 'MEMBER', responsibility: 'Data Processing', status: 'ACTIVE', contributionScore: 87, joinedAt: '2026-01-15' },
      ],

      projectIntegrations: [
        { id: 'pi1', projectId: 'proj1', jiraKey: 'ECOM', jiraUrl: 'https://university.atlassian.net/browse/ECOM', githubRepo: 'ecommerce-platform', githubUrl: 'https://github.com/university/ecommerce-platform', syncStatus: 'SUCCESS', lastSyncAt: '2026-01-28T09:00:00Z' },
        { id: 'pi2', projectId: 'proj2', jiraKey: 'TASK', jiraUrl: 'https://university.atlassian.net/browse/TASK', githubRepo: 'task-management', githubUrl: 'https://github.com/university/task-management', syncStatus: 'SUCCESS', lastSyncAt: '2026-01-28T08:30:00Z' },
        { id: 'pi3', projectId: 'proj3', jiraKey: 'AI', jiraUrl: 'https://university.atlassian.net/browse/AI', githubRepo: 'ai-chatbot', githubUrl: 'https://github.com/university/ai-chatbot', syncStatus: 'ERROR', lastSyncAt: '2026-01-27T15:45:00Z' },
      ],

      studentLinks: [
        { id: 'sl1', studentId: 'stu001', courseId: 'course-se1821', githubAccountUrl: 'https://github.com/alicejohnson', jiraAccountUrl: 'https://university.atlassian.net/secure/ViewProfile.jspa?name=alicejohnson', status: 'CONFIRMED', confirmedByLecturerId: 'lec001', updatedAt: '2026-01-15T10:00:00Z' },
        { id: 'sl2', studentId: 'stu002', courseId: 'course-se1821', githubAccountUrl: 'https://github.com/bobwilson', jiraAccountUrl: 'https://university.atlassian.net/secure/ViewProfile.jspa?name=bobwilson', status: 'PENDING', confirmedByLecturerId: null, updatedAt: '2026-01-20T14:30:00Z' },
        { id: 'sl3', studentId: 'stu003', courseId: 'course-se1822', githubAccountUrl: 'https://github.com/caroldavis', jiraAccountUrl: 'https://university.atlassian.net/secure/ViewProfile.jspa?name=caroldavis', status: 'REJECTED', confirmedByLecturerId: 'lec001', updatedAt: '2026-01-18T16:20:00Z', rejectionReason: 'Invalid GitHub URL' },
      ],

      commits: [
        { id: 'c1', projectId: 'proj1', repo: 'ecommerce-platform', sha: 'abc123', message: 'Add user authentication module', authorStudentId: 'stu001', committedAt: '2026-01-27T10:30:00Z' },
        { id: 'c2', projectId: 'proj1', repo: 'ecommerce-platform', sha: 'def456', message: 'Fix login validation bug', authorStudentId: 'stu002', committedAt: '2026-01-27T14:15:00Z' },
        { id: 'c3', projectId: 'proj1', repo: 'ecommerce-platform', sha: 'ghi789', message: 'Update product catalog UI', authorStudentId: 'stu003', committedAt: '2026-01-26T16:45:00Z' },
        { id: 'c4', projectId: 'proj2', repo: 'task-management', sha: 'jkl012', message: 'Implement task creation API', authorStudentId: 'stu002', committedAt: '2026-01-27T09:20:00Z' },
        { id: 'c5', projectId: 'proj3', repo: 'ai-chatbot', sha: 'mno345', message: 'Add natural language processing', authorStudentId: 'stu004', committedAt: '2026-01-25T11:00:00Z' },
      ],

      srsReports: [
        { id: 'srs1', projectId: 'proj1', version: '1.0', status: 'FINAL', submittedByStudentId: 'stu001', submittedAt: '2026-01-20T10:00:00Z', fileName: 'SRS_Ecommerce_v1.0.pdf' },
        { id: 'srs2', projectId: 'proj1', version: '1.1', status: 'DRAFT', submittedByStudentId: 'stu001', submittedAt: '2026-01-25T15:30:00Z', fileName: 'SRS_Ecommerce_v1.1_draft.pdf' },
        { id: 's3', projectId: 'proj2', version: '1.0', status: 'REVIEW', submittedByStudentId: 'stu002', submittedAt: '2026-01-24T09:15:00Z', fileName: 'SRS_TaskManagement_v1.0.pdf' },
      ],
    };

    this.save();
  }

  save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
  }

  // Reset database to fresh data
  reset() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.initializeData();
  }

  // Generic CRUD operations
  create(collection, item) {
    const newItem = { ...item, id: this.generateId() };
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    this.data[collection].push(newItem);
    this.save();
    return newItem;
  }

  findById(collection, id) {
    const items = Array.isArray(this.data[collection]) ? this.data[collection] : [];
    return items.find(item => item.id === id);
  }

  findMany(collection, filter = {}) {
    let items = Array.isArray(this.data[collection]) ? this.data[collection] : [];

    Object.keys(filter).forEach(key => {
      if (filter[key] !== undefined && filter[key] !== null) {
        items = items.filter(item => item[key] === filter[key]);
      }
    });

    return items;
  }

  update(collection, id, updates) {
    const items = this.data[collection];
    if (!Array.isArray(items)) return null;

    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;

    items[index] = { ...items[index], ...updates };
    this.save();
    return items[index];
  }

  delete(collection, id) {
    const items = this.data[collection];
    if (!Array.isArray(items)) return false;

    const index = items.findIndex(item => item.id === id);
    if (index === -1) return false;

    items.splice(index, 1);
    this.save();
    return true;
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Specialized queries
  getCourseStudents(courseId) {
    const enrollments = this.findMany('courseEnrollments', { courseId });
    return enrollments.map(e => this.findById('users.students', e.studentId)).filter(Boolean);
  }

  getCourseLecturers(courseId) {
    const assignments = this.findMany('courseLecturers', { courseId });
    return assignments.map(a => this.findById('users.lecturers', a.lecturerId)).filter(Boolean);
  }

  getProjectTeam(projectId) {
    return this.findMany('teamMembers', { projectId });
  }

  getProjectCommits(projectId, limit = 50) {
    return this.findMany('commits', { projectId })
      .sort((a, b) => new Date(b.committedAt) - new Date(a.committedAt))
      .slice(0, limit);
  }

  getStudentProjects(studentId) {
    const teamMemberships = this.findMany('teamMembers', { studentId });
    return teamMemberships.map(tm => this.findById('projects', tm.projectId)).filter(Boolean);
  }

  getStudentLinks(studentId, courseId = null) {
    const filter = { studentId };
    if (courseId) filter.courseId = courseId;
    return this.findMany('studentLinks', filter);
  }

  // Analytics methods
  getCommitsStats(courseId, startDate, endDate) {
    const courseProjects = this.findMany('projects', { courseId });
    const projectIds = courseProjects.map(p => p.id);

    const commits = this.data.commits.filter(commit =>
      projectIds.includes(commit.projectId) &&
      new Date(commit.committedAt) >= new Date(startDate) &&
      new Date(commit.committedAt) <= new Date(endDate)
    );

    return {
      total: commits.length,
      byProject: projectIds.map(projectId => ({
        projectId,
        count: commits.filter(c => c.projectId === projectId).length
      })),
      byStudent: commits.reduce((acc, commit) => {
        acc[commit.authorStudentId] = (acc[commit.authorStudentId] || 0) + 1;
        return acc;
      }, {})
    };
  }

  getActiveStudents(courseId, days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const courseProjects = this.findMany('projects', { courseId });
    const projectIds = courseProjects.map(p => p.id);

    const recentCommits = this.data.commits.filter(commit =>
      projectIds.includes(commit.projectId) &&
      new Date(commit.committedAt) >= cutoffDate
    );

    return [...new Set(recentCommits.map(c => c.authorStudentId))];
  }

  getSilentProjects(courseId, days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const courseProjects = this.findMany('projects', { courseId });

    return courseProjects.filter(project => {
      const lastCommit = this.data.commits
        .filter(c => c.projectId === project.id)
        .sort((a, b) => new Date(b.committedAt) - new Date(a.committedAt))[0];

      return !lastCommit || new Date(lastCommit.committedAt) < cutoffDate;
    });
  }

  // Group management methods
  getCourseGroups(courseId) {
    return this.findMany('groups', { courseId });
  }

  getGroupStudents(groupId) {
    const group = this.findById('groups', groupId);
    if (!group) return [];

    // Access students directly from nested structure (findById doesn't handle nested paths)
    const students = this.data.users.students || [];
    return group.studentIds
      .map(id => students.find(s => s.id === id))
      .filter(Boolean);
  }

  approveGroupLink(groupId, linkType, lecturerId) {
    const group = this.findById('groups', groupId);
    if (!group) return null;

    const updates = {
      approvedByLecturerId: lecturerId,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (linkType === 'github') {
      updates.githubStatus = 'APPROVED';
    } else if (linkType === 'jira') {
      updates.jiraStatus = 'APPROVED';
    }

    return this.update('groups', groupId, updates);
  }
}

// Export singleton instance
export const db = new MockDB();
export default db;
