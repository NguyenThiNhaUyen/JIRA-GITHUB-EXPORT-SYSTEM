using System.Text.Json.Serialization;

namespace JiraGithubExport.Shared.Contracts.Responses.Projects;

public class SrsDocumentResponse
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("project_id")]
    public long ProjectId { get; set; }

    [JsonPropertyName("version_no")]
    public int VersionNo { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = null!;

    [JsonPropertyName("file_url")]
    public string FileUrl { get; set; } = null!;

    [JsonPropertyName("submitted_by_name")]
    public string? SubmittedByName { get; set; }

    [JsonPropertyName("submitted_at")]
    public DateTime SubmittedAt { get; set; }

    [JsonPropertyName("reviewer_name")]
    public string? ReviewerName { get; set; }

    [JsonPropertyName("reviewed_at")]
    public DateTime? ReviewedAt { get; set; }

    [JsonPropertyName("feedback")]
    public string? Feedback { get; set; }
}
