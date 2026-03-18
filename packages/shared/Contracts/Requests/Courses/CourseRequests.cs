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
            yield return new ValidationResult("NgĂ y báº¯t Ä‘áº§u khĂ´ng há»£p lá»‡ (bá»‹ bá» trá»‘ng hoáº·c sai Ä‘á»‹nh dáº¡ng).", new[] { nameof(StartDate) });
        
        if (EndDate == DateTime.MinValue)
            yield return new ValidationResult("NgĂ y káº¿t thĂºc khĂ´ng há»£p lá»‡ (bá»‹ bá» trá»‘ng hoáº·c sai Ä‘á»‹nh dáº¡ng).", new[] { nameof(EndDate) });

        if (EndDate <= StartDate && StartDate != DateTime.MinValue && EndDate != DateTime.MinValue)
            yield return new ValidationResult("NgĂ y káº¿t thĂºc pháº£i lá»›n hÆ¡n ngĂ y báº¯t Ä‘áº§u.", new[] { nameof(EndDate) });
    }
}

public class GenerateSemestersRequest
{
    [Required]
    [Range(2020, 2100, ErrorMessage = "NÄƒm khĂ´ng há»£p lá»‡ (pháº£i tá»« 2020 Ä‘áº¿n 2100).")]
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
    [Range(1, long.MaxValue, ErrorMessage = "Vui lĂ²ng chá»n giáº£ng viĂªn há»£p lá»‡.")]
    public long LecturerUserId { get; set; }
}

public class EnrollStudentsRequest
{
    [Required]
    [MinLength(1)]
    public List<long> StudentUserIds { get; set; } = new();
}

public class BulkAssignRequest
{
    [Required]
    public List<AssignmentItem> Assignments { get; set; } = new();
}

public class AssignmentItem
{
    [Required]
    public long CourseId { get; set; }
    
    [Required]
    public long LecturerId { get; set; }
}
