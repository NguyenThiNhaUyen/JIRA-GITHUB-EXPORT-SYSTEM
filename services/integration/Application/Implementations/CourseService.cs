using AutoMapper;
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Courses;
using JiraGithubExport.Shared.Contracts.Responses.Courses;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class CourseService : ICourseService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<CourseService> _logger;
    private readonly JiraGithubExport.Shared.Infrastructure.Identity.Interfaces.IPasswordHasher _passwordHasher;

    public CourseService(
        IUnitOfWork unitOfWork, 
        IMapper mapper, 
        ILogger<CourseService> logger,
        JiraGithubExport.Shared.Infrastructure.Identity.Interfaces.IPasswordHasher passwordHasher)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
        _passwordHasher = passwordHasher;
    }


    // ============================================
    // COURSE
    // ============================================

    public async Task<CourseDetailResponse> CreateCourseAsync(CreateCourseRequest request, long createdByUserId)
    {
        // Validate semester exists
        var semester = await _unitOfWork.Semesters.GetByIdAsync(request.SemesterId);
        if (semester == null)
        {
            throw new NotFoundException("Semester not found");
        }

        // Validate subject exists
        var subject = await _unitOfWork.Subjects.GetByIdAsync(request.SubjectId);
        if (subject == null)
        {
            throw new NotFoundException("Subject not found");
        }

        // Check duplicate course code in same semester and subject
        var existing = await _unitOfWork.Courses.FirstOrDefaultAsync(c =>
            c.semester_id == request.SemesterId &&
            c.subject_id == request.SubjectId &&
            c.course_code == request.CourseCode);

        if (existing != null)
        {
            throw new BusinessException("Course with this code already exists in the selected semester and subject");
        }

        var course = new course
        {
            subject_id = request.SubjectId,
            semester_id = request.SemesterId,
            course_code = request.CourseCode,
            course_name = request.CourseName,
            max_students = request.MaxStudents,
            status = request.Status,
            created_by_user_id = createdByUserId,
            created_at = DateTime.UtcNow,
            updated_at = DateTime.UtcNow
        };

        _unitOfWork.Courses.Add(course);
        await _unitOfWork.SaveChangesAsync();

        // Reload with navigation properties
        var createdCourse = await _unitOfWork.Courses
            .FirstOrDefaultAsync(c => c.id == course.id);

        return _mapper.Map<CourseDetailResponse>(createdCourse);
    }

    public async Task<CourseDetailResponse> UpdateCourseAsync(long courseId, UpdateCourseRequest request)
    {
        var course = await _unitOfWork.Courses.FirstOrDefaultAsync(c => c.id == courseId);
        if (course == null) throw new NotFoundException("Course not found");

        course.course_name = request.CourseName;
        course.updated_at = DateTime.UtcNow;

        _unitOfWork.Courses.Update(course);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<CourseDetailResponse>(course);
    }

    public async Task DeleteCourseAsync(long courseId)
    {
        var course = await _unitOfWork.Courses.FirstOrDefaultAsync(c => c.id == courseId);
        if (course == null) throw new NotFoundException("Course not found");

        // Consider real cascade delete if needed or validation before delete
        _unitOfWork.Courses.Remove(course);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<CourseDetailResponse> GetCourseByIdAsync(long courseId)
    {
        var course = await _unitOfWork.Courses.FirstOrDefaultAsync(c => c.id == courseId);
        if (course == null)
        {
            throw new NotFoundException("Course not found");
        }

        return _mapper.Map<CourseDetailResponse>(course);
    }

    public async Task<PagedResponse<CourseDetailResponse>> GetAllCoursesAsync(PagedRequest request)
    {
        var (items, totalItems) = await _unitOfWork.Courses.GetPagedCoursesAsync(
            request.Q,
            request.SortDir,
            request.Page,
            request.PageSize
        );

        var dtoList = items.Select(c => _mapper.Map<CourseDetailResponse>(c)).ToList();
        return new PagedResponse<CourseDetailResponse>(dtoList, totalItems, request.Page, request.PageSize);
    }

    public async Task<PagedResponse<CourseDetailResponse>> GetCoursesByLecturerAsync(long lecturerUserId, PagedRequest request)
    {
        var lecturer = await _unitOfWork.Lecturers.Query()
            .Include(l => l.courses)
            .FirstOrDefaultAsync(l => l.user_id == lecturerUserId);

        if (lecturer == null)
        {
            throw new NotFoundException("Lecturer not found");
        }

        var (items, totalItems) = await _unitOfWork.Courses.GetPagedCoursesByLecturerAsync(
            lecturerUserId,
            request.Q,
            request.SortDir,
            request.Page,
            request.PageSize
        );

        var dtoList = items.Select(c => _mapper.Map<CourseDetailResponse>(c)).ToList();
        return new PagedResponse<CourseDetailResponse>(dtoList, totalItems, request.Page, request.PageSize);
    }

    public async Task<PagedResponse<CourseDetailResponse>> GetCoursesByStudentAsync(long studentUserId, PagedRequest request)
    {
        var student = await _unitOfWork.Students.FirstOrDefaultAsync(s => s.user_id == studentUserId);
        if (student == null)
        {
            throw new NotFoundException("Student not found");
        }

        var (items, totalItems) = await _unitOfWork.Courses.GetPagedCoursesByStudentAsync(
            studentUserId,
            request.Q,
            request.SortDir,
            request.Page,
            request.PageSize
        );

        var dtoList = items.Select(c => _mapper.Map<CourseDetailResponse>(c)).ToList();
        return new PagedResponse<CourseDetailResponse>(dtoList, totalItems, request.Page, request.PageSize);
    }

    // ============================================
    // ASSIGN LECTURER
    // ============================================

    public async Task AssignLecturerAsync(long courseId, long lecturerUserId)
    {
        var course = await _unitOfWork.Courses.Query()
            .Include(c => c.lecturer_users)
            .FirstOrDefaultAsync(c => c.id == courseId);

        if (course == null)
        {
            throw new NotFoundException("Course not found");
        }

        var lecturer = await _unitOfWork.Lecturers.FirstOrDefaultAsync(l => l.user_id == lecturerUserId);
        if (lecturer == null)
        {
            throw new NotFoundException($"Lecturer with UserID {lecturerUserId} not found in lecturers table");
        }

        // Check if already assigned
        if (course.lecturer_users.Any(l => l.user_id == lecturerUserId))
        {
            throw new BusinessException("Lecturer already assigned to this course");
        }

        course.lecturer_users.Add(lecturer);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Lecturer {LecturerId} assigned to course {CourseId}", lecturerUserId, courseId);
    }

    public async Task RemoveLecturerAsync(long courseId, long lecturerUserId)
    {
        var course = await _unitOfWork.Courses.Query()
            .Include(c => c.lecturer_users)
            .FirstOrDefaultAsync(c => c.id == courseId);
            
        if (course == null) throw new NotFoundException("Course not found");

        var lecturer = course.lecturer_users.FirstOrDefault(l => l.user_id == lecturerUserId);
        if (lecturer == null) throw new NotFoundException("Lecturer is not assigned to this course");

        course.lecturer_users.Remove(lecturer);
        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Lecturer {LecturerId} removed from course {CourseId}", lecturerUserId, courseId);
    }

    // ============================================
    // ENROLL STUDENTS
    // ============================================

    public async Task<EnrollmentResult> EnrollStudentsAsync(long courseId, List<long> studentUserIds)
    {
        var course = await _unitOfWork.Courses.FirstOrDefaultAsync(c => c.id == courseId);
        if (course == null)
        {
            throw new NotFoundException("Course not found");
        }

        var result = new EnrollmentResult
        {
            EnrolledCount = 0,
            Failed = new List<EnrollmentFailure>()
        };

        // Fetch students in bulk
        var studentsMap = await _unitOfWork.Students.Query()
            .Where(s => studentUserIds.Contains(s.user_id))
            .ToDictionaryAsync(s => s.user_id, s => s);

        // Fetch existing enrollments in bulk
        var existingEnrollmentsMap = await _unitOfWork.CourseEnrollments.Query()
            .Where(e => e.course_id == courseId && studentUserIds.Contains(e.student_user_id))
            .ToDictionaryAsync(e => e.student_user_id, e => e);

        foreach (var studentUserId in studentUserIds)
        {
            try
            {
                // Check if student exists in bulk memory map or missing
                var student = studentsMap.GetValueOrDefault(studentUserId);
                if (student == null)
                {
                    result.Failed.Add(new EnrollmentFailure
                    {
                        StudentUserId = studentUserId,
                        Reason = "Student not found"
                    });
                    continue;
                }

                // Check if already enrolled
                var existingEnrollment = existingEnrollmentsMap.GetValueOrDefault(studentUserId);

                if (existingEnrollment != null)
                {
                    if (existingEnrollment.status == "ACTIVE")
                    {
                        result.Failed.Add(new EnrollmentFailure
                        {
                            StudentUserId = studentUserId,
                            Reason = "Student already enrolled in this course"
                        });
                        continue;
                    }
                    else
                    {
                        // Reactivate enrollment
                        existingEnrollment.status = "ACTIVE";
                        existingEnrollment.enrolled_at = DateTime.UtcNow;
                        _unitOfWork.CourseEnrollments.Update(existingEnrollment);
                    }
                }
                else
                {
                    // Create new enrollment
                    var enrollment = new course_enrollment
                    {
                        course_id = courseId,
                        student_user_id = studentUserId,
                        status = "ACTIVE",
                        enrolled_at = DateTime.UtcNow
                    };

                    _unitOfWork.CourseEnrollments.Add(enrollment);
                }

                result.EnrolledCount++;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to enroll student {StudentId} to course {CourseId}", studentUserId, courseId);
                result.Failed.Add(new EnrollmentFailure
                {
                    StudentUserId = studentUserId,
                    Reason = "Enrollment failed: " + ex.Message
                });
            }
        }

        await _unitOfWork.SaveChangesAsync();

        return result;
    }

    public async Task RemoveStudentAsync(long courseId, long studentUserId)
    {
        var enrollment = await _unitOfWork.CourseEnrollments.Query()
            .FirstOrDefaultAsync(e => e.course_id == courseId && e.student_user_id == studentUserId);

        if (enrollment == null || enrollment.status != "ACTIVE")
        {
            throw new NotFoundException("Active enrollment not found for this student in this course");
        }

        enrollment.status = "DROPPED";
        _unitOfWork.CourseEnrollments.Update(enrollment);
        
        // Optionally remove from projects in this course if needed, but keeping history is usually better
        var teamMemberships = await _unitOfWork.TeamMembers.Query()
            .Include(tm => tm.project)
            .Where(tm => tm.student_user_id == studentUserId && tm.project.course_id == courseId)
            .ToListAsync();
            
        foreach (var membership in teamMemberships)
        {
            _unitOfWork.TeamMembers.Remove(membership);
        }

        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Student {StudentId} removed from course {CourseId}", studentUserId, courseId);
    }

    public async Task<object> GetPendingIntegrationsAsync(long courseId)
    {
        var pendingProjects = await _unitOfWork.Courses.Query()
            .Where(c => c.id == courseId)
            .SelectMany(c => c.projects)
            .Where(p => p.project_integration != null && p.project_integration.approval_status == "PENDING")
            .Select(p => new
            {
                ProjectId = p.id,
                ProjectName = p.name,
                p.project_integration!.approval_status,
                SubmittedAt = p.project_integration.submitted_at,
                GithubRepoUrl = p.project_integration.github_repo != null ? p.project_integration.github_repo.repo_url : null,
                JiraProjectKey = p.project_integration.jira_project != null ? p.project_integration.jira_project.jira_project_key : null
            })
            .ToListAsync();

        return pendingProjects;
    }

    public async Task<EnrollmentResult> ImportEnrollmentsFromExcelAsync(long courseId, Microsoft.AspNetCore.Http.IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new BusinessException("No file uploaded");

        var course = await _unitOfWork.Courses.FirstOrDefaultAsync(c => c.id == courseId);
        if (course == null) throw new NotFoundException("Course not found");

        // ─── BƯỚC 1: ĐỌC FILE EXCEL ─────────────────────────────────────────
        var studentInfos = new List<(string Code, string Name, string Email)>();
        using (var stream = file.OpenReadStream())
        using (var workbook = new ClosedXML.Excel.XLWorkbook(stream))
        {
            var worksheet = workbook.Worksheet(1);
            foreach (var row in worksheet.RangeUsed().RowsUsed().Skip(1))
            {
                var code  = row.Cell(1).GetString()?.Trim();
                var name  = row.Cell(2).GetString()?.Trim();
                var email = row.Cell(3).GetString()?.Trim();
                if (!string.IsNullOrEmpty(code) && !string.IsNullOrEmpty(email))
                    studentInfos.Add((code, name ?? "Sinh viên mới", email));
            }
        }

        if (!studentInfos.Any())
            throw new BusinessException("No valid student rows found. Excel must have columns: [StudentCode, FullName, Email]");

        var studentRoleId = (await _unitOfWork.Roles.FirstOrDefaultAsync(r => r.role_name == "STUDENT")
            ?? throw new NotFoundException("Role 'STUDENT' not found")).id;

        var emailsLower = studentInfos.Select(i => i.Email.ToLower()).ToList();

        // ─── BƯỚC 2: XÁC ĐỊNH USER CẦN TẠO MỚI ────────────────────────────
        var existingUsers = await _unitOfWork.Users.Query()
            .Include(u => u.student)
            .Where(u => emailsLower.Contains(u.email.ToLower()))
            .ToListAsync();

        var existingEmailToId = existingUsers.ToDictionary(u => u.email.ToLower(), u => u.id);
        var newUsersToCreate  = studentInfos.Where(i => !existingEmailToId.ContainsKey(i.Email.ToLower())).ToList();

        // ─── BƯỚC 3: TẠO USER MỚI (không gán role, không gán student) ───────
        //   ValueGeneratedNever() trên student.user_id nên phải lấy id user trước
        if (newUsersToCreate.Any())
        {
            foreach (var info in newUsersToCreate)
            {
                var newUser = new user
                {
                    email      = info.Email,
                    password   = _passwordHasher.HashPassword("Student@123"),
                    full_name  = info.Name,
                    enabled    = true,
                    created_at = DateTime.UtcNow,
                    updated_at = DateTime.UtcNow
                };
                _unitOfWork.Users.Add(newUser);
            }

            await _unitOfWork.SaveChangesAsync(); // → users.id được sinh ra

            // Lấy lại id của user vừa tạo
            var newlyCreatedUsers = await _unitOfWork.Users.Query()
                .Where(u => newUsersToCreate.Select(i => i.Email.ToLower()).Contains(u.email.ToLower()))
                .ToListAsync();

            foreach (var createdUser in newlyCreatedUsers)
            {
                // Gán role qua navigation property (user đã có id → an toàn)
                var roleEntity = await _unitOfWork.Roles.GetByIdAsync(studentRoleId);
                if (roleEntity != null) createdUser.roles.Add(roleEntity);

                // Tạo student record với user_id tường minh
                var info = newUsersToCreate.First(i => i.Email.ToLower() == createdUser.email.ToLower());
                _unitOfWork.Students.Add(new student
                {
                    user_id      = createdUser.id,
                    student_code = info.Code,
                    created_at   = DateTime.UtcNow,
                    updated_at   = DateTime.UtcNow
                });

                existingEmailToId[createdUser.email.ToLower()] = createdUser.id;
            }

            await _unitOfWork.SaveChangesAsync(); // → lưu roles + students
        }

        // ─── BƯỚC 4: ĐẢM BẢO USER CŨ CỦA CÓ STUDENT RECORD ────────────────
        foreach (var existing in existingUsers.Where(u => u.student == null))
        {
            var info = studentInfos.FirstOrDefault(i => i.Email.ToLower() == existing.email.ToLower());
            if (info != default)
            {
                _unitOfWork.Students.Add(new student
                {
                    user_id      = existing.id,
                    student_code = info.Code,
                    created_at   = DateTime.UtcNow,
                    updated_at   = DateTime.UtcNow
                });
            }
        }
        if (existingUsers.Any(u => u.student == null))
            await _unitOfWork.SaveChangesAsync();

        // ─── BƯỚC 5: GHI DANH VÀO LỚP ──────────────────────────────────────
        var finalUserIds = emailsLower
            .Where(e => existingEmailToId.ContainsKey(e))
            .Select(e => existingEmailToId[e])
            .Distinct()
            .ToList();

        _logger.LogInformation("[Import] Enrolling {Count} students to course {CourseId}", finalUserIds.Count, courseId);
        return await EnrollStudentsAsync(courseId, finalUserIds);
    }
}



