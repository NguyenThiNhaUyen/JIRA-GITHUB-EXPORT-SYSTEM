using System.ComponentModel.DataAnnotations;

namespace JiraGithubExport.Shared.Contracts.Requests.Courses;

public class CreateSemesterRequest
{
    [Required]
    public string Name { get; set; } = null!;

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }
}

public class CreateSubjectRequest
{
    [Required]
    public string SubjectCode { get; set; } = null!;

    [Required]
    public string SubjectName { get; set; } = null!;
}

public class CreateCourseRequest
{
    [Required]
    public long SubjectId { get; set; }

    [Required]
    public long SemesterId { get; set; }

    [Required]
    public string CourseCode { get; set; } = null!;

    [Required]
    public string CourseName { get; set; } = null!;
}

public class AssignLecturerRequest
{
    [Required]
    public long LecturerUserId { get; set; }
}

public class EnrollStudentsRequest
{
    [Required]
    [MinLength(1)]
    public List<long> StudentUserIds { get; set; } = new();
}







