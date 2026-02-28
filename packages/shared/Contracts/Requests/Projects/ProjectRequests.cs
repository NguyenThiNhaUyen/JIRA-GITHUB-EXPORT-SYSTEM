using System.ComponentModel.DataAnnotations;

namespace JiraGithubExport.Shared.Contracts.Requests.Projects;

public class CreateProjectRequest
{
    [Required]
    public long CourseId { get; set; }

    [Required]
    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public int MaxMembers { get; set; } = 5;
}

public class AddTeamMemberRequest
{
    [Required]
    public long StudentUserId { get; set; }

    [Required]
    public string TeamRole { get; set; } = "MEMBER"; // "LEADER" or "MEMBER"

    public string? Responsibility { get; set; }
}

public class LinkIntegrationRequest
{
    public string? GithubRepoUrl { get; set; }
    public string? JiraProjectKey { get; set; }
    public string? JiraSiteUrl { get; set; }
}







