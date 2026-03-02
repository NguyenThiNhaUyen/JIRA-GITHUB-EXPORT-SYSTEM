namespace JiraGithubExport.Shared.Contracts.Responses.Courses;

public class CourseDetailResponse
{
    public long Id { get; set; }
    public string CourseCode { get; set; } = null!;
    public string CourseName { get; set; } = null!;
    public SubjectInfo Subject { get; set; } = null!;
    public SemesterInfo Semester { get; set; } = null!;
    public int EnrolledStudentsCount { get; set; }
    public int ProjectsCount { get; set; }
    public List<LecturerInfo> Lecturers { get; set; } = new();
}

public class SubjectInfo
{
    public long Id { get; set; }
    public string SubjectCode { get; set; } = null!;
    public string SubjectName { get; set; } = null!;
}

public class SemesterInfo
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class LecturerInfo
{
    public long UserId { get; set; }
    public string FullName { get; set; } = null!;
    public string LecturerCode { get; set; } = null!;
    public string? OfficeEmail { get; set; }
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







