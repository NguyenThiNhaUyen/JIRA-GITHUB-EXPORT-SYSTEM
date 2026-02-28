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

    public CourseService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<CourseService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
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
        var course = await _unitOfWork.Courses.FirstOrDefaultAsync(c => c.id == courseId);
        if (course == null)
        {
            throw new NotFoundException("Course not found");
        }

        var lecturer = await _unitOfWork.Lecturers.FirstOrDefaultAsync(l => l.user_id == lecturerUserId);
        if (lecturer == null)
        {
            throw new NotFoundException("Lecturer not found");
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
}








