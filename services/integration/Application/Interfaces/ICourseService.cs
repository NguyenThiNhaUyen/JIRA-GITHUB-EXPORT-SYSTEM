<<<<<<< HEAD
=======
using Microsoft.AspNetCore.Http;
>>>>>>> origin
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Courses;
using JiraGithubExport.Shared.Contracts.Responses.Courses;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface ICourseService
{
<<<<<<< HEAD


=======
>>>>>>> origin
    // Course
    Task<CourseDetailResponse> CreateCourseAsync(CreateCourseRequest request, long createdByUserId);
    Task<CourseDetailResponse> UpdateCourseAsync(long courseId, UpdateCourseRequest request);
    Task DeleteCourseAsync(long courseId);
    Task<CourseDetailResponse> GetCourseByIdAsync(long courseId);
    Task<PagedResponse<CourseDetailResponse>> GetAllCoursesAsync(PagedRequest request);
    Task<PagedResponse<CourseDetailResponse>> GetCoursesByLecturerAsync(long lecturerUserId, PagedRequest request);
    Task<PagedResponse<CourseDetailResponse>> GetCoursesByStudentAsync(long studentUserId, PagedRequest request);
<<<<<<< HEAD
=======

>>>>>>> origin
    // Lecturer Assignment
    Task AssignLecturerAsync(long courseId, long lecturerUserId);
    Task RemoveLecturerAsync(long courseId, long lecturerUserId);

    // Student Enrollment
    Task<EnrollmentResult> EnrollStudentsAsync(long courseId, List<long> studentUserIds);
<<<<<<< HEAD
=======
    Task<EnrollmentResult> ImportEnrollmentsFromExcelAsync(long courseId, IFormFile file);
>>>>>>> origin
    Task RemoveStudentAsync(long courseId, long studentUserId);

    // Pending Integrations
    Task<object> GetPendingIntegrationsAsync(long courseId);
<<<<<<< HEAD
=======

    // Students list
    Task<PagedResponse<EnrollmentInfo>> GetCourseStudentsAsync(long courseId, int page, int pageSize);
>>>>>>> origin
}








