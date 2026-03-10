using System.Text.Json.Serialization;

namespace JiraGithubExport.Shared.Contracts.Responses.Courses;

public class CourseDetailResponse
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("course_code")]
    public string CourseCode { get; set; } = null!;

    [JsonPropertyName("course_name")]
    public string CourseName { get; set; } = null!;

    [JsonPropertyName("subject_id")]
    public long SubjectId { get; set; }

    [JsonPropertyName("subject_code")]
    public string SubjectCode { get; set; } = null!;

    [JsonPropertyName("semester_id")]
    public long SemesterId { get; set; }

    [JsonPropertyName("semester_name")]
    public string SemesterName { get; set; } = null!;

    [JsonPropertyName("status")]
    public string Status { get; set; } = "ACTIVE";

    [JsonPropertyName("max_students")]
    public int? MaxStudents { get; set; }

    [JsonPropertyName("lecturers")]
    public List<LecturerInfo> Lecturers { get; set; } = new();

    [JsonPropertyName("enrollments")]
    public List<EnrollmentInfo> Enrollments { get; set; } = new();
}

public class SubjectInfo
{
    [JsonPropertyName("id")]
    public long Id { get; set; }
    
    [JsonPropertyName("subject_code")]
    public string SubjectCode { get; set; } = null!;
    
    [JsonPropertyName("subject_name")]
    public string SubjectName { get; set; } = null!;
    
    [JsonPropertyName("department")]
    public string Department { get; set; } = null!;
    
    [JsonPropertyName("description")]
    public string? Description { get; set; }
    
    [JsonPropertyName("credits")]
    public int Credits { get; set; }
    
    [JsonPropertyName("max_students")]
    public int MaxStudents { get; set; }
    
    [JsonPropertyName("status")]
    public string Status { get; set; } = null!;
    
    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }
}

public class SemesterInfo
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = null!;

    [JsonPropertyName("semester_code")]
    public string? Code { get; set; } // alias for Name, used by FE

    [JsonPropertyName("start_date")]
    public DateOnly StartDate { get; set; }

    [JsonPropertyName("end_date")]
    public DateOnly EndDate { get; set; }
    
    [JsonPropertyName("status")]
    public string Status 
    {
        get 
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            if (today < StartDate) return "UPCOMING";
            if (today > EndDate) return "COMPLETED";
            return "ACTIVE";
        }
    }
}

public class LecturerInfo
{
    [JsonPropertyName("user_id")]
    public long UserId { get; set; }

    [JsonPropertyName("full_name")]
    public string FullName { get; set; } = null!;

    [JsonPropertyName("lecturer_code")]
    public string LecturerCode { get; set; } = null!;

    [JsonPropertyName("email")]
    public string? OfficeEmail { get; set; }
}

public class EnrollmentInfo
{
    [JsonPropertyName("user_id")]
    public long UserId { get; set; }

    [JsonPropertyName("full_name")]
    public string FullName { get; set; } = null!;

    [JsonPropertyName("student_code")]
    public string StudentCode { get; set; } = null!;
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







