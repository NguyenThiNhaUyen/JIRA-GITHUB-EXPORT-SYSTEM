using System.Text.Json.Serialization;

namespace JiraGithubExport.Shared.Contracts.Responses.Projects;

public class InvitationResponse
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("project_id")]
    public long ProjectId { get; set; }

    [JsonPropertyName("project_name")]
    public string ProjectName { get; set; } = null!;

    [JsonPropertyName("inviter_name")]
    public string InvitedByName { get; set; } = null!;

    [JsonPropertyName("invitee_user_id")]
    public long InvitedStudentUserId { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = null!;

    [JsonPropertyName("message")]
    public string? Message { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }
}
