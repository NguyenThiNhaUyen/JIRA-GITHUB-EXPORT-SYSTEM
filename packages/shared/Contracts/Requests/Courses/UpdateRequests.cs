namespace JiraGithubExport.Shared.Contracts.Requests.Courses;

public class UpdateSemesterRequest
{
    public string Name { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class UpdateSubjectRequest
{
    public string SubjectName { get; set; } = string.Empty;
}

public class UpdateCourseRequest
{
    public string? CourseCode { get; set; }
    public string? CourseName { get; set; }
    public long? SubjectId { get; set; }
    public long? SemesterId { get; set; }
    public int? MaxStudents { get; set; }
    public string? Status { get; set; }
}
