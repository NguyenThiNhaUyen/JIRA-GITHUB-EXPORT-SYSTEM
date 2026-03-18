using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace JiraGithubExport.Shared.Contracts.Requests.Courses;

public class UpdateSemesterRequest : IValidatableObject
{
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("startDate")]
    public DateTime StartDate { get; set; }

    [JsonPropertyName("endDate")]
    public DateTime EndDate { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (StartDate == DateTime.MinValue)
            yield return new ValidationResult("Ngày bắt đầu không hợp lệ (bị bỏ trống hoặc sai định dạng).", new[] { nameof(StartDate) });
        
        if (EndDate == DateTime.MinValue)
            yield return new ValidationResult("Ngày kết thúc không hợp lệ (bị bỏ trống hoặc sai định dạng).", new[] { nameof(EndDate) });

        if (EndDate <= StartDate && StartDate != DateTime.MinValue && EndDate != DateTime.MinValue)
            yield return new ValidationResult("Ngày kết thúc phải lớn hơn ngày bắt đầu.", new[] { nameof(EndDate) });
    }
}

public class UpdateSubjectRequest
{
    public string? SubjectCode { get; set; }
    public string? SubjectName { get; set; }
    public string? Department { get; set; }
    public string? Description { get; set; }
    public int? Credits { get; set; }
    public int? MaxStudents { get; set; }
    public string? Status { get; set; }
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
