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
    private readonly INotificationService _notificationService;

    public CourseService(
        IUnitOfWork unitOfWork, 
        IMapper mapper, 
        ILogger<CourseService> logger,
        JiraGithubExport.Shared.Infrastructure.Identity.Interfaces.IPasswordHasher passwordHasher,
        IHubContext<NotificationHub> hubContext,
        INotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
        _passwordHasher = passwordHasher;
        _hubContext = hubContext;
        _notificationService = notificationService;
    }


    // ============================================
    // Course
    // ============================================

    public async Task<CourseDetailResponse> CreateCourseAsync(CreateCourseRequest request, long createdByUserId)
    {
        // Validate Semester exists
        var Semester = await _unitOfWork.Semesters.GetByIdAsync(request.SemesterId);
        if (Semester == null)
        {
            throw new NotFoundException("Semester not found");
        }

        // Validate Subject exists
        var Subject = await _unitOfWork.Subjects.GetByIdAsync(request.SubjectId);
        if (Subject == null)
        {
            throw new NotFoundException("Subject not found");
        }

        // Check duplicate Course code in same Semester and Subject
        var existing = await _unitOfWork.Courses.FirstOrDefaultAsync(c =>
            c.SemesterId == request.SemesterId &&
            c.SubjectId == request.SubjectId &&
            c.CourseCode == request.CourseCode);

        if (existing != null)
        {
            throw new BusinessException("Course with this code already exists in the selected Semester and Subject");
        }

        var Course = new Course
        {
            SubjectId = request.SubjectId,
            SemesterId = request.SemesterId,
            CourseCode = request.CourseCode,
            CourseName = request.CourseName,
            MaxStudents = request.MaxStudents ?? 0,
            Status = request.Status,
            CreatedByUserId = createdByUserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _unitOfWork.Courses.Add(Course);
        await _unitOfWork.SaveChangesAsync();

        // Reload with navigation properties
        var createdCourse = await _unitOfWork.Courses
            .FirstOrDefaultAsync(c => c.Id == Course.Id);

        return _mapper.Map<CourseDetailResponse>(createdCourse);
    }

    public async Task<CourseDetailResponse> UpdateCourseAsync(long courseId, UpdateCourseRequest request)
    {
        var Course = await _unitOfWork.Courses.FirstOrDefaultAsync(c => c.Id == courseId);
        if (Course == null) throw new NotFoundException("Course not found");

        Course.CourseName = request.CourseName;
        Course.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Courses.Update(Course);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<CourseDetailResponse>(Course);
    }

    public async Task DeleteCourseAsync(long courseId)
    {
        var Course = await _unitOfWork.Courses.FirstOrDefaultAsync(c => c.Id == courseId);
        if (Course == null) throw new NotFoundException("Course not found");

        // Consider real cascade delete if needed or validation before delete
        _unitOfWork.Courses.Remove(Course);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<CourseDetailResponse> GetCourseByIdAsync(long courseId)
    {
        var Course = await _unitOfWork.Courses.Query()
            .AsNoTracking()
            .Include(c => c.Subject)
            .Include(c => c.Semester)
            .Include(c => c.LecturerUsers).ThenInclude(l => l.User)
            .Include(c => c.Projects).ThenInclude(p => p.ProjectIntegration)
            .Include(c => c.CourseEnrollments).ThenInclude(e => e.StudentUser).ThenInclude(s => s.User)
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (Course == null)
        {
            throw new NotFoundException("Course not found");
        }

        var response = _mapper.Map<CourseDetailResponse>(Course);
        
        // Manual mapping for groups with clear status
        response.Groups = (Course.Projects ?? new List<Project>()).Select(p => new CourseGroupInfo
        {
            Id = p.Id,
            Name = p.Name,
            GithubStatus = p.ProjectIntegration?.ApprovalStatus ?? "NONE",
            JiraStatus = p.ProjectIntegration?.ApprovalStatus ?? "NONE"
        }).ToList();

        return response;
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
        var Lecturer = await _unitOfWork.Lecturers.Query()
            .Include(l => l.Courses)
            .FirstOrDefaultAsync(l => l.UserId == lecturerUserId);

        // Return empty list instead of 404/500 if Lecturer profile not created yet
        if (Lecturer == null)
        {
            _logger.LogWarning("No Lecturer profile found for User {UserId}. Returning empty list.", lecturerUserId);
            return new PagedResponse<CourseDetailResponse>(new List<CourseDetailResponse>(), 0, request.Page, request.PageSize);
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
        var Student = await _unitOfWork.Students.FirstOrDefaultAsync(s => s.UserId == studentUserId);
        // Return empty list instead of 404/500 if Student profile not created yet
        if (Student == null)
        {
            _logger.LogWarning("No Student profile found for User {UserId}. Returning empty list.", studentUserId);
            return new PagedResponse<CourseDetailResponse>(new List<CourseDetailResponse>(), 0, request.Page, request.PageSize);
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
    // ASSIGN Lecturer
    // ============================================

    public async Task AssignLecturerAsync(long courseId, long lecturerUserId)
    {
        var Course = await _unitOfWork.Courses.Query()
            .Include(c => c.LecturerUsers)
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (Course == null)
        {
            throw new NotFoundException("Course not found");
        }

        var Lecturer = await _unitOfWork.Lecturers.FirstOrDefaultAsync(l => l.UserId == lecturerUserId);
        if (Lecturer == null)
        {
            throw new NotFoundException($"Lecturer with UserID {lecturerUserId} not found in Lecturers table");
        }

        // Check if already assigned
        if (Course.LecturerUsers.Any(l => l.UserId == lecturerUserId))
        {
            throw new BusinessException("Lecturer already assigned to this Course");
        }

        Course.LecturerUsers.Add(Lecturer);
        
        // Add Audit Log for Notification bell
        var auditLog = new AuditLog
        {
            PerformedByUserId = lecturerUserId, // Technically performed by Admin, but we associate with Lecturer to show in their bell
            EntityType = "Course",
            EntityId = courseId,
            Action = "ASSIGN_LECTURER",
            Timestamp = DateTime.UtcNow
        };
        _unitOfWork.AuditLogs.Add(auditLog);
        
        await _unitOfWork.SaveChangesAsync();

        // Send Real-time Notification via NEW system
        try
        {
            await _notificationService.BuildNotificationAsync(
                lecturerUserId, 
                "SYSTEM", 
                $"Bạn đã được phân công vào lớp học {Course.CourseCode} - {Course.CourseName}",
                System.Text.Json.JsonSerializer.Serialize(new { entityId = courseId, entityType = "Course" })
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send real-time Notification to Lecturer {LecturerId}", lecturerUserId);
        }

        _logger.LogInformation("Lecturer {LecturerId} assigned to Course {CourseId}", lecturerUserId, courseId);
    }

    public async Task RemoveLecturerAsync(long courseId, long lecturerUserId)
    {
        var Course = await _unitOfWork.Courses.Query()
            .Include(c => c.LecturerUsers)
            .FirstOrDefaultAsync(c => c.Id == courseId);
            
        if (Course == null) throw new NotFoundException("Course not found");

        var Lecturer = Course.LecturerUsers.FirstOrDefault(l => l.UserId == lecturerUserId);
        if (Lecturer == null) throw new NotFoundException("Lecturer is not assigned to this Course");

        Course.LecturerUsers.Remove(Lecturer);
        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Lecturer {LecturerId} removed from Course {CourseId}", lecturerUserId, courseId);
    }

    // ============================================
    // ENROLL Students
    // ============================================

    public async Task<EnrollmentResult> EnrollStudentsAsync(long courseId, List<long> studentUserIds)
    {
        var Course = await _unitOfWork.Courses.FirstOrDefaultAsync(c => c.Id == courseId);
        if (Course == null)
        {
            throw new NotFoundException("Course not found");
        }

        var result = new EnrollmentResult
        {
            EnrolledCount = 0,
            Failed = new List<EnrollmentFailure>()
        };

        // Fetch Students in bulk
        var studentsMap = await _unitOfWork.Students.Query()
            .Where(s => studentUserIds.Contains(s.UserId))
            .ToDictionaryAsync(s => s.UserId, s => s);

        // Fetch existing enrollments in bulk
        var existingEnrollmentsMap = await _unitOfWork.CourseEnrollments.Query()
            .Where(e => e.CourseId == courseId && studentUserIds.Contains(e.StudentUserId))
            .ToDictionaryAsync(e => e.StudentUserId, e => e);

        foreach (var studentUserId in studentUserIds)
        {
            try
            {
                // Check if Student exists in bulk memory map or missing
                var Student = studentsMap.GetValueOrDefault(studentUserId);
                if (Student == null)
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
                    if (existingEnrollment.Status == "ACTIVE")
                    {
                        result.Failed.Add(new EnrollmentFailure
                        {
                            StudentUserId = studentUserId,
                            Reason = "Student already enrolled in this Course"
                        });
                        continue;
                    }
                    else
                    {
                        // Reactivate enrollment
                        existingEnrollment.Status = "ACTIVE";
                        existingEnrollment.EnrolledAt = DateTime.UtcNow;
                        _unitOfWork.CourseEnrollments.Update(existingEnrollment);
                    }
                }
                else
                {
                    // Create new enrollment
                    var enrollment = new CourseEnrollment
                    {
                        CourseId = courseId,
                        StudentUserId = studentUserId,
                        Status = "ACTIVE",
                        EnrolledAt = DateTime.UtcNow
                    };

                    _unitOfWork.CourseEnrollments.Add(enrollment);
                }

                result.EnrolledCount++;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to enroll Student {StudentId} to Course {CourseId}", studentUserId, courseId);
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
            .FirstOrDefaultAsync(e => e.CourseId == courseId && e.StudentUserId == studentUserId);

        if (enrollment == null || enrollment.Status != "ACTIVE")
        {
            throw new NotFoundException("Active enrollment not found for this Student in this Course");
        }

        enrollment.Status = "DROPPED";
        _unitOfWork.CourseEnrollments.Update(enrollment);
        
        // Optionally remove from Projects in this Course if needed, but keeping history is usually better
        var teamMemberships = await _unitOfWork.TeamMembers.Query()
            .Include(tm => tm.Project)
            .Where(tm => tm.StudentUserId == studentUserId && tm.Project.CourseId == courseId)
            .ToListAsync();
            
        foreach (var membership in teamMemberships)
        {
            _unitOfWork.TeamMembers.Remove(membership);
        }

        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Student {StudentId} removed from Course {CourseId}", studentUserId, courseId);
    }

    public async Task<object> GetPendingIntegrationsAsync(long courseId)
    {
        var pendingProjects = await _unitOfWork.Courses.Query()
            .Where(c => c.Id == courseId)
            .SelectMany(c => c.Projects)
            .Where(p => p.ProjectIntegration != null && p.ProjectIntegration.ApprovalStatus == "PENDING")
            .Select(p => new
            {
                ProjectId = p.Id,
                ProjectName = p.Name,
                p.ProjectIntegration!.ApprovalStatus,
                SubmittedAt = p.ProjectIntegration.SubmittedAt,
                GithubRepoUrl = p.ProjectIntegration.GithubRepo != null ? p.ProjectIntegration.GithubRepo.RepoUrl : null,
                JiraProjectKey = p.ProjectIntegration.JiraProject != null ? p.ProjectIntegration.JiraProject.JiraProjectKey : null
            })
            .ToListAsync();

        return pendingProjects;
    }

    public async Task<PagedResponse<EnrollmentInfo>> GetCourseStudentsAsync(long courseId, int page, int pageSize)
    {
        var query = _unitOfWork.CourseEnrollments.Query()
            .Include(e => e.StudentUser).ThenInclude(s => s.User)
            .Where(e => e.CourseId == courseId && e.Status == "ACTIVE");

        var total = await query.CountAsync();
        page = page > 0 ? page : 1;
        pageSize = pageSize > 0 ? pageSize : 50;

        var items = await query
            .OrderBy(e => e.StudentUser != null && e.StudentUser.User != null ? e.StudentUser.User.FullName : "")
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new EnrollmentInfo
            {
                UserId = e.StudentUserId,
                FullName = e.StudentUser != null && e.StudentUser.User != null ? e.StudentUser.User.FullName : "N/A",
                Email = e.StudentUser != null && e.StudentUser.User != null ? e.StudentUser.User.Email : "N/A",
                StudentCode = e.StudentUser != null ? e.StudentUser.StudentCode : "N/A",
                StudentId = e.StudentUser != null ? e.StudentUser.StudentCode : "N/A"
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

        var Course = await _unitOfWork.Courses.FirstOrDefaultAsync(c => c.Id == courseId);
        if (Course == null) throw new NotFoundException("Course not found");

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
                    var Name = row.Cell(2).GetString()?.Trim();
                    var Email = row.Cell(3).GetString()?.Trim();
                    if (!string.IsNullOrEmpty(code) && !string.IsNullOrEmpty(Email))
                        studentInfos.Add((code, Name ?? "Sinh viên mới", Email));
                }
            }

            if (!studentInfos.Any())
                throw new BusinessException("No valid Student rows found. Excel must have columns: [StudentCode, FullName, Email]");

            var studentRoleId = (await _unitOfWork.Roles.FirstOrDefaultAsync(r => r.RoleName == "Student")
                ?? throw new NotFoundException("Role 'Student' not found")).Id;

            // ─── BƯỚC 2: TÌM CÁC User VÀ Student ĐÃ TỒN TẠI (DỰA TRÊN Email VÀ CODE) ─────────
            var emailsLower = studentInfos.Select(i => i.Email.ToLower()).ToList();
            var studentCodes = studentInfos.Select(i => i.Code).ToList();

            var existingUsers = await _unitOfWork.Users.Query()
                .Include(u => u.Student)
                .Where(u => emailsLower.Contains(u.Email.ToLower()))
                .ToListAsync();

            var existingStudentsByCode = await _unitOfWork.Students.Query()
                .Where(s => studentCodes.Contains(s.StudentCode))
                .ToListAsync();

            var existingEmailToId = existingUsers.ToDictionary(u => u.Email.ToLower(), u => u.Id);
            var existingCodesSet = existingStudentsByCode.Select(s => s.StudentCode).ToHashSet();

            // Những sinh viên CẦN tạo tài khoản mới: Email chưa tồn tại VÀ Student Code cũng chưa tồn tại
            var newUsersToCreate = studentInfos
                .Where(i => !existingEmailToId.ContainsKey(i.Email.ToLower()) && !existingCodesSet.Contains(i.Code))
                .ToList();

            // ─── BƯỚC 3: TẠO User MỚI (không gán Role, không gán Student) ───────
            if (newUsersToCreate.Any())
            {
                foreach (var info in newUsersToCreate)
                {
                    var newUser = new User
                    {
                        Email = info.Email,
                        Password = _passwordHasher.HashPassword("Student@123"),
                        FullName = info.Name,
                        Enabled = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _unitOfWork.Users.Add(newUser);
                }

                await _unitOfWork.SaveChangesAsync(); // → Users.Id được sinh ra

                // Lấy lại id của User vừa tạo (chính xác những Email vừa nằm trong danh sách tạo mới)
                var createEmailsList = newUsersToCreate.Select(i => i.Email.ToLower()).ToList();
                var newlyCreatedUsers = await _unitOfWork.Users.Query()
                    .Where(u => createEmailsList.Contains(u.Email.ToLower()))
                    .ToListAsync();

                var roleEntity = await _unitOfWork.Roles.GetByIdAsync(studentRoleId);

                foreach (var createdUser in newlyCreatedUsers)
                {
                    if (roleEntity != null) createdUser.Roles.Add(roleEntity);

                    var info = newUsersToCreate.First(i => i.Email.ToLower() == createdUser.Email.ToLower());
                    _unitOfWork.Students.Add(new Student
                    {
                        UserId = createdUser.Id,
                        StudentCode = info.Code,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });

                    existingEmailToId[createdUser.Email.ToLower()] = createdUser.Id;
                }

                await _unitOfWork.SaveChangesAsync(); // → lưu Roles + Students
            }

            // ─── BƯỚC 4: ĐẢM BẢO User CŨ CÓ Student RECORD (nếu CHƯA có mã trùng) ────────
            foreach (var existing in existingUsers.Where(u => u.Student == null))
            {
                var info = studentInfos.FirstOrDefault(i => i.Email.ToLower() == existing.Email.ToLower());
                if (info != default && !existingCodesSet.Contains(info.Code))
                {
                    // Chỉ tạo Student nếu mã số sinh viên này chưa tồn tại ở tài khoản nào khác
                    _unitOfWork.Students.Add(new Student
                    {
                        UserId = existing.Id,
                        StudentCode = info.Code,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });

                    // Cập nhật existingCodesSet để tránh bị trùng lặp trong đợt lặp này
                    existingCodesSet.Add(info.Code);
                }
            }

            if (existingUsers.Any(u => u.Student == null) || newUsersToCreate.Any())
                await _unitOfWork.SaveChangesAsync();

            // ─── BƯỚC 5: GHI DANH VÀO LỚP ──────────────────────────────────────
            // Lấy Id của cả những User đã có sẵn (khớp qua Email) 
            // VÀ cả những Student đã có sẵn trong bảng Student (khớp qua code nhưng không khớp Email - trường hợp dị biệt)
            var finalUserIds = new HashSet<long>();

            // Thêm ID từ Email matching
            foreach (var e in emailsLower)
            {
                if (existingEmailToId.TryGetValue(e, out var id)) finalUserIds.Add(id);
            }

            // Thêm ID từ code matching (những người có student_code tồn tại)
            foreach (var c in studentCodes)
            {
                var studentId = existingStudentsByCode.FirstOrDefault(s => s.StudentCode == c)?.UserId;
                if (studentId.HasValue) finalUserIds.Add(studentId.Value);
            }

            var finalUserIdsList = finalUserIds.ToList();

            _logger.LogInformation("[Import] Enrolling {Count} Students to Course {CourseId}", finalUserIdsList.Count, courseId);
            return await EnrollStudentsAsync(courseId, finalUserIdsList);
        }
    }
}

