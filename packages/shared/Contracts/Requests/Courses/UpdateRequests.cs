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
    public string CourseName { get; set; } = string.Empty;
}
