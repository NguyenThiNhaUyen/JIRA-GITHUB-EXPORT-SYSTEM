using JiraGithubExport.Shared.Contracts.Responses.Projects;
namespace JiraGithubExport.Shared.Contracts.Responses.Courses;

public class CourseDetailResponse
{
    public long Id { get; set; }
    public string CourseCode { get; set; } = null!;
    public string CourseName { get; set; } = null!;
    public long SubjectId { get; set; }
    public string SubjectCode { get; set; } = null!;
    public SubjectInfo? Subject { get; set; }
    public long SemesterId { get; set; }
    public string SemesterName { get; set; } = null!;
    public SemesterInfo? Semester { get; set; }
    public string Status { get; set; } = "ACTIVE";
    public int? MaxStudents { get; set; }
    public int CurrentStudents { get; set; }
    public int EnrolledStudentsCount => CurrentStudents;
    public int ProjectsCount { get; set; }
    public List<LecturerInfo> Lecturers { get; set; } = new();
    public List<EnrollmentInfo> Enrollments { get; set; } = new();
    public List<CourseGroupInfo> Groups { get; set; } = new();
}

public class CourseGroupInfo
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public string GithubStatus { get; set; } = "NONE";
    public string JiraStatus { get; set; } = "NONE";
    public string? Topic { get; set; }
    public string? Description => Topic; // Alias
    public string Status => (GithubStatus != "NONE" || JiraStatus != "NONE") ? "ACTIVE" : "PENDING";
    public long CourseId { get; set; }
    public List<EnrollmentInfo> Team { get; set; } = new();
    public List<EnrollmentInfo> Members => Team; // Alias for FE mapProject
    
    public IntegrationInfo? Integration { get; set; }
}

public class SubjectInfo
{
    public long Id { get; set; }
    public string SubjectCode { get; set; } = null!;
    public string SubjectName { get; set; } = null!;
    public string Department { get; set; } = null!;
    public string? Description { get; set; }
    public int Credits { get; set; }
    public int MaxStudents { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}

public class SemesterInfo
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Code { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "UPCOMING";
}

public class LecturerInfo
{
    public long UserId { get; set; }
    public string FullName { get; set; } = null!;
    public string LecturerCode { get; set; } = null!;
    public string? Email { get; set; }
    public string? OfficeEmail { get; set; }
    public string? Department { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class EnrollmentInfo
{
    public long UserId { get; set; }
    public string FullName { get; set; } = null!;
    public string StudentCode { get; set; } = null!;
    public string StudentId { get; set; } = null!;
    public string? Email { get; set; }
    public string? Role { get; set; }
}

public class EnrollmentResult
{
    public int EnrolledCount { get; set; }
    public List<EnrollmentFailure> Failed { get; set; } = new();
}

public class EnrollmentFailure
{
    public long StudentUserId { get; set; }
    public string Reason { get; set; } = null!;
}

public class LecturerCourseStatResponse
{
    public long Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string SubjectCode { get; set; } = string.Empty;
    public string Semester { get; set; } = string.Empty;
    public int CurrentStudents { get; set; }
    public int ProjectsCount { get; set; } 
    public int ActiveTeams { get; set; }
    public int JiraConnected { get; set; }
    public int AlertsCount { get; set; }
    public bool Archived { get; set; }
    public DateTime? LastCommit { get; set; }
    public List<EnrollmentInfo> Enrollments { get; set; } = new();
    public List<int> CommitTrends { get; set; } = new(); 
}
