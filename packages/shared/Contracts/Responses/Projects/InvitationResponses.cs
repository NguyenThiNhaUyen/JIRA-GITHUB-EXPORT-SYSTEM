namespace JiraGithubExport.Shared.Contracts.Responses.Projects;

public class InvitationResponse
{
    public long Id { get; set; }
    // Merge Project (HEAD) and Group (origin) terminologies
    public long ProjectId { get; set; }
    public long GroupId 
    { 
        get => ProjectId; 
        set => ProjectId = value; 
    }
    
    public string ProjectName { get; set; } = null!;
    public string GroupName 
    { 
        get => ProjectName; 
        set => ProjectName = value; 
    }

    public long CourseId { get; set; }
    public string CourseName { get; set; } = null!;

    public long InvitedByUserId { get; set; }
    public long InvitedByStudentId 
    { 
        get => InvitedByUserId; 
        set => InvitedByUserId = value; 
    }
    public string InvitedByName { get; set; } = null!;

    public long InvitedStudentUserId { get; set; }
    public long InvitedStudentId 
    { 
        get => InvitedStudentUserId; 
        set => InvitedStudentUserId = value; 
    }
    public string? InvitedStudentName { get; set; }

    public string Status { get; set; } = null!;
    public string? Message { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? RespondedAt { get; set; }
}

