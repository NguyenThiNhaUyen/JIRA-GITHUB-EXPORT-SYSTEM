using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Courses;
using JiraGithubExport.Shared.Contracts.Responses.Courses;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.SignalR;
using JiraGithubExport.IntegrationService.Hubs;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class CourseService : ICourseService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<CourseService> _logger;
    private readonly JiraGithubExport.Shared.Infrastructure.Identity.Interfaces.IPasswordHasher _passwordHasher;
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly IAnalyticsService _analyticsService;

    public CourseService(
        IUnitOfWork unitOfWork, 
        IMapper mapper, 
        ILogger<CourseService> logger,
        JiraGithubExport.Shared.Infrastructure.Identity.Interfaces.IPasswordHasher passwordHasher,
        IHubContext<NotificationHub> hubContext,
        IAnalyticsService analyticsService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
        _passwordHasher = passwordHasher;
        _hubContext = hubContext;
        _analyticsService = analyticsService;
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
        try
        {
            var course = await _unitOfWork.Courses.Query()
                .AsNoTracking()
                .Include(c => c.subject)
                .Include(c => c.semester)
                .Include(c => c.lecturer_users).ThenInclude(l => l.user)
                .Include(c => c.projects).ThenInclude(p => p.project_integration)
                .Include(c => c.projects).ThenInclude(p => p.team_members).ThenInclude(tm => tm.student_user).ThenInclude(su => su.user)
                .Include(c => c.course_enrollments).ThenInclude(e => e.student_user).ThenInclude(s => s.user)
                .FirstOrDefaultAsync(c => c.id == courseId);

            if (course == null)
            {
                throw new NotFoundException("Course not found");
            }

            var response = _mapper.Map<CourseDetailResponse>(course);

            // Manual mapping for groups with explicit integration status (used by lecturer pending-integration panel).
            response.Groups = (course.projects ?? new List<project>())
                .Where(p => p.status == "ACTIVE")
                .Select(p => new CourseGroupInfo
                {
                    Id = p.id,
                    Name = p.name,
                    GithubStatus = p.project_integration?.approval_status ?? "NONE",
                    JiraStatus = p.project_integration?.approval_status ?? "NONE",
                    Integration = p.project_integration != null ? new JiraGithubExport.Shared.Contracts.Responses.Projects.IntegrationInfo
                    {
                        GithubStatus = p.project_integration.approval_status ?? "NONE",
                        JiraStatus = p.project_integration.approval_status ?? "NONE"
                    } : null,
                    Topic = p.description,
                    Team = (p.team_members ?? new List<team_member>()).Select(tm => new EnrollmentInfo
                    {
                        UserId = tm.student_user_id,
                        FullName = tm.student_user?.user?.full_name ?? "Unknown",
                        StudentCode = tm.student_user?.student_code ?? "N/A",
                        StudentId = tm.student_user?.student_code ?? "N/A",
                        Role = tm.team_role
                    }).ToList()
                }).ToList();

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[GetCourseByIdAsync] Failed courseId={CourseId}", courseId);
            throw new Exception(ex.InnerException?.Message ?? ex.Message);
        }
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

        // Limit to 1 lecturer per course
        course.lecturer_users.Clear();
        course.lecturer_users.Add(lecturer);
        
        // Add Audit Log for notification bell
        var auditLog = new audit_log
        {
            performed_by_user_id = lecturerUserId, // Technically performed by Admin, but we associate with Lecturer to show in their bell
            entity_type = "COURSE",
            entity_id = courseId,
            action = "ASSIGN_LECTURER",
            timestamp = DateTime.UtcNow
        };
        _unitOfWork.AuditLogs.Add(auditLog);
        
        await _unitOfWork.SaveChangesAsync();

        // Send Real-time notification via NEW system
        try
        {
            await _analyticsService.BuildNotificationAsync(
                lecturerUserId, 
                "SYSTEM", 
                $"Bạn đã được phân công vào lớp học {course.course_code} - {course.course_name}",
                System.Text.Json.JsonSerializer.Serialize(new { entityId = courseId, entityType = "COURSE" })
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send real-time notification to lecturer {LecturerId}", lecturerUserId);
        }

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

    public async Task<PagedResponse<EnrollmentInfo>> GetCourseStudentsAsync(long courseId, int page, int pageSize)
    {
        var query = _unitOfWork.CourseEnrollments.Query()
            .Include(e => e.student_user).ThenInclude(s => s.user)
            .Where(e => e.course_id == courseId && e.status == "ACTIVE");

        var total = await query.CountAsync();
        page = page > 0 ? page : 1;
        pageSize = pageSize > 0 ? pageSize : 50;

        var items = await query
            .OrderBy(e => e.student_user.user.full_name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new EnrollmentInfo
            {
                UserId = e.student_user_id,
                FullName = e.student_user.user.full_name,
                Email = e.student_user.user.email,
                StudentCode = e.student_user.student_code,
                StudentId = e.student_user.student_code
            })
            .ToListAsync();

        return new PagedResponse<EnrollmentInfo>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize)
        };
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
            var range = worksheet.RangeUsed();
            if (range != null)
            {
                foreach (var row in range.RowsUsed().Skip(1))
                {
                    var code = row.Cell(1).GetString()?.Trim();
                    var name = row.Cell(2).GetString()?.Trim();
                    var email = row.Cell(3).GetString()?.Trim();
                    if (!string.IsNullOrEmpty(code) && !string.IsNullOrEmpty(email))
                        studentInfos.Add((code, name ?? "Sinh viên mới", email));
                }
            }

            if (!studentInfos.Any())
                throw new BusinessException("No valid student rows found. Excel must have columns: [StudentCode, FullName, Email]");

            var studentRoleId = (await _unitOfWork.Roles.FirstOrDefaultAsync(r => r.role_name == "STUDENT")
                ?? throw new NotFoundException("Role 'STUDENT' not found")).id;

            // ─── BƯỚC 2: TÌM CÁC USER VÀ STUDENT ĐÃ TỒN TẠI (DỰA TRÊN EMAIL VÀ CODE) ─────────
            var emailsLower = studentInfos.Select(i => i.Email.ToLower()).ToList();
            var studentCodes = studentInfos.Select(i => i.Code).ToList();

            var existingUsers = await _unitOfWork.Users.Query()
                .Include(u => u.student)
                .Where(u => emailsLower.Contains(u.email.ToLower()))
                .ToListAsync();

            var existingStudentsByCode = await _unitOfWork.Students.Query()
                .Where(s => studentCodes.Contains(s.student_code))
                .ToListAsync();

            var existingEmailToId = existingUsers.ToDictionary(u => u.email.ToLower(), u => u.id);
            var existingCodesSet = existingStudentsByCode.Select(s => s.student_code).ToHashSet();

            // Những sinh viên CẦN tạo tài khoản mới: Email chưa tồn tại VÀ Student Code cũng chưa tồn tại
            var newUsersToCreate = studentInfos
                .Where(i => !existingEmailToId.ContainsKey(i.Email.ToLower()) && !existingCodesSet.Contains(i.Code))
                .ToList();

            // ─── BƯỚC 3: TẠO USER MỚI (không gán role, không gán student) ───────
            if (newUsersToCreate.Any())
            {
                foreach (var info in newUsersToCreate)
                {
                    var newUser = new user
                    {
                        email = info.Email,
                        password = _passwordHasher.HashPassword("Student@123"),
                        full_name = info.Name,
                        enabled = true,
                        created_at = DateTime.UtcNow,
                        updated_at = DateTime.UtcNow
                    };
                    _unitOfWork.Users.Add(newUser);
                }

                await _unitOfWork.SaveChangesAsync(); // → users.id được sinh ra

                // Lấy lại id của user vừa tạo (chính xác những email vừa nằm trong danh sách tạo mới)
                var createEmailsList = newUsersToCreate.Select(i => i.Email.ToLower()).ToList();
                var newlyCreatedUsers = await _unitOfWork.Users.Query()
                    .Where(u => createEmailsList.Contains(u.email.ToLower()))
                    .ToListAsync();

                var roleEntity = await _unitOfWork.Roles.GetByIdAsync(studentRoleId);

                foreach (var createdUser in newlyCreatedUsers)
                {
                    if (roleEntity != null) createdUser.roles.Add(roleEntity);

                    var info = newUsersToCreate.First(i => i.Email.ToLower() == createdUser.email.ToLower());
                    _unitOfWork.Students.Add(new student
                    {
                        user_id = createdUser.id,
                        student_code = info.Code,
                        created_at = DateTime.UtcNow,
                        updated_at = DateTime.UtcNow
                    });

                    existingEmailToId[createdUser.email.ToLower()] = createdUser.id;
                }

                await _unitOfWork.SaveChangesAsync(); // → lưu roles + students
            }

            // ─── BƯỚC 4: ĐẢM BẢO USER CŨ CÓ STUDENT RECORD (nếu CHƯA có mã trùng) ────────
            foreach (var existing in existingUsers.Where(u => u.student == null))
            {
                var info = studentInfos.FirstOrDefault(i => i.Email.ToLower() == existing.email.ToLower());
                if (info != default && !existingCodesSet.Contains(info.Code))
                {
                    // Chỉ tạo student nếu mã số sinh viên này chưa tồn tại ở tài khoản nào khác
                    _unitOfWork.Students.Add(new student
                    {
                        user_id = existing.id,
                        student_code = info.Code,
                        created_at = DateTime.UtcNow,
                        updated_at = DateTime.UtcNow
                    });

                    // Cập nhật existingCodesSet để tránh bị trùng lặp trong đợt lặp này
                    existingCodesSet.Add(info.Code);
                }
            }

            if (existingUsers.Any(u => u.student == null) || newUsersToCreate.Any())
                await _unitOfWork.SaveChangesAsync();

            // ─── BƯỚC 5: GHI DANH VÀO LỚP ──────────────────────────────────────
            // Lấy Id của cả những user đã có sẵn (khớp qua email) 
            // VÀ cả những student đã có sẵn trong bảng student (khớp qua code nhưng không khớp email - trường hợp dị biệt)
            var finalUserIds = new HashSet<long>();

            // Thêm ID từ email matching
            foreach (var e in emailsLower)
            {
                if (existingEmailToId.TryGetValue(e, out var id)) finalUserIds.Add(id);
            }

            // Thêm ID từ code matching (những người có student_code tồn tại)
            foreach (var c in studentCodes)
            {
                var studentId = existingStudentsByCode.FirstOrDefault(s => s.student_code == c)?.user_id;
                if (studentId.HasValue) finalUserIds.Add(studentId.Value);
            }

            var finalUserIdsList = finalUserIds.ToList();

            _logger.LogInformation("[Import] Enrolling {Count} students to course {CourseId}", finalUserIdsList.Count, courseId);
            return await EnrollStudentsAsync(courseId, finalUserIdsList);
        }
    }
}
