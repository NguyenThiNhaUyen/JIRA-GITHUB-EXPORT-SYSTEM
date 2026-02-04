using JiraGithubExport.Shared.Contracts.Requests.Courses;
using JiraGithubExport.Shared.Contracts.Responses.Courses;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface ICourseService
{
    // Semester
    Task<SemesterInfo> CreateSemesterAsync(CreateSemesterRequest request);
    Task<List<SemesterInfo>> GetAllSemestersAsync();

    // Subject
    Task<SubjectInfo> CreateSubjectAsync(CreateSubjectRequest request);
    Task<List<SubjectInfo>> GetAllSubjectsAsync();

    // Course
    Task<CourseDetailResponse> CreateCourseAsync(CreateCourseRequest request, long createdByUserId);
    Task<CourseDetailResponse> GetCourseByIdAsync(long courseId);
    Task<List<CourseDetailResponse>> GetCoursesByLecturerAsync(long lecturerUserId);
    Task<List<CourseDetailResponse>> GetCoursesByStudentAsync(long studentUserId);

    // Lecturer Assignment
    Task AssignLecturerAsync(long courseId, long lecturerUserId);

    // Student Enrollment
    Task<EnrollmentResult> EnrollStudentsAsync(long courseId, List<long> studentUserIds);
}








