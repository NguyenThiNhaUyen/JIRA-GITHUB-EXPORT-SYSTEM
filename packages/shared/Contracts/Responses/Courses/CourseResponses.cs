namespace JiraGithubExport.Shared.Contracts.Responses.Courses;

public class CourseDetailResponse
{
    public long Id { get; set; }
    public string CourseCode { get; set; } = null!;
    public string CourseName { get; set; } = null!;
<<<<<<< HEAD
    public SubjectInfo Subject { get; set; } = null!;
    public SemesterInfo Semester { get; set; } = null!;
    public int EnrolledStudentsCount { get; set; }
    public int ProjectsCount { get; set; }
    public List<LecturerInfo> Lecturers { get; set; } = new();
    public int? MaxStudents { get; set; }
    public string Status { get; set; } = "ACTIVE";
=======
    public long SubjectId { get; set; }
    public string SubjectCode { get; set; } = null!;
    public long SemesterId { get; set; }
    public string SemesterName { get; set; } = null!;
    public string Status { get; set; } = "ACTIVE";
    public int? MaxStudents { get; set; }
    public int CurrentStudents { get; set; }
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
>>>>>>> origin
}

public class SubjectInfo
{
    public long Id { get; set; }
    public string SubjectCode { get; set; } = null!;
    public string SubjectName { get; set; } = null!;
<<<<<<< HEAD
=======
    public string Department { get; set; } = null!;
    public string? Description { get; set; }
    public int Credits { get; set; }
    public int MaxStudents { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
>>>>>>> origin
}

public class SemesterInfo
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
<<<<<<< HEAD
    public string? Code { get; set; } // alias for Name, used by FE
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
=======
    public string? Code { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
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
>>>>>>> origin
}

public class LecturerInfo
{
    public long UserId { get; set; }
    public string FullName { get; set; } = null!;
    public string LecturerCode { get; set; } = null!;
<<<<<<< HEAD
    public string? OfficeEmail { get; set; }
=======
    public string? Email { get; set; }
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
>>>>>>> origin
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

<<<<<<< HEAD






=======
public class LecturerCourseStatResponse
{
    public long Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string SubjectCode { get; set; } = string.Empty;
    public string Semester { get; set; } = string.Empty;
    public int CurrentStudents { get; set; }
    public int ProjectsCount { get; set; } // Renamed from GroupCount to match FE real data expect
    public int ActiveTeams { get; set; }
    public int JiraConnected { get; set; }
    public int AlertsCount { get; set; }
    public bool Archived { get; set; }
    public DateTime? LastCommit { get; set; }
    public List<EnrollmentInfo> Enrollments { get; set; } = new();
    public List<int> CommitTrends { get; set; } = new(); // Match basic integer array
}
>>>>>>> origin
