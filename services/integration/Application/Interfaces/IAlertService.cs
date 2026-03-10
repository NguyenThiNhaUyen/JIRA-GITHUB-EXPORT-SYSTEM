using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface IAlertService
{
    Task<PagedResponse<AlertResponse>> GetAlertsAsync(long userId, string userRole, PagedRequest request);
    Task ResolveAlertAsync(long alertId, long resolvedByUserId);
}

public class AlertResponse
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("alert_type")]
    public string AlertType { get; set; } = null!;

    [JsonPropertyName("target_entity_type")]
    public string TargetEntityType { get; set; } = null!;

    [JsonPropertyName("target_entity_id")]
    public long TargetEntityId { get; set; }

    [JsonPropertyName("project_id")]
    public long? ProjectId { get; set; }

    [JsonPropertyName("project_name")]
    public string? ProjectName { get; set; }

    [JsonPropertyName("severity")]
    public string Severity { get; set; } = null!;

    [JsonPropertyName("message")]
    public string Message { get; set; } = null!;

    [JsonPropertyName("is_resolved")]
    public bool IsResolved { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }
}
