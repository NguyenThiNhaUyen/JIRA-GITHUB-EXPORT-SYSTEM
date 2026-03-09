using System.ComponentModel.DataAnnotations;

using System.Text.Json.Serialization;

namespace JiraGithubExport.Shared.Contracts.Requests.Courses;

public class CreateSemesterRequest : IValidatableObject
{
    [Required]
    public string Name { get; set; } = null!;

    [Required]
    [JsonPropertyName("startDate")]
    public DateTime StartDate { get; set; }

    [Required]
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

public class GenerateSemestersRequest
{
    [Required]
    [Range(2020, 2100, ErrorMessage = "Năm không hợp lệ (phải từ 2020 đến 2100).")]
    public int Year { get; set; }
}

public class CreateSubjectRequest
{
    [Required]
    public string SubjectCode { get; set; } = null!;

    [Required]
    public string SubjectName { get; set; } = null!;

    [Required]
    public string Department { get; set; } = null!;
    
    public string? Description { get; set; }
    
    [Required]
    public int Credits { get; set; } = 3;
    
    [Required]
    public int MaxStudents { get; set; } = 40;
    
    [Required]
    public string Status { get; set; } = "ACTIVE";
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

    public int? MaxStudents { get; set; }

    public string Status { get; set; } = "ACTIVE";
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







