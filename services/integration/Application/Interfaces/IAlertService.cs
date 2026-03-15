using JiraGithubExport.Shared.Contracts.Common;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface IAlertService
{
    Task<PagedResponse<AlertResponse>> GetAlertsAsync(long userId, string userRole, PagedRequest request);
    Task ResolveAlertAsync(long alertId, long resolvedByUserId);
    Task SendAlertAsync(long projectId, string message, string severity = "MEDIUM");
}

public class AlertResponse
{
    public long Id { get; set; }
    public string AlertType { get; set; } = null!;
    public string TargetEntityType { get; set; } = null!;
    public long TargetEntityId { get; set; }
    public long? ProjectId { get; set; }
    public string? ProjectName { get; set; }
    public string? GroupName { get; set; }
    public string? CourseId { get; set; }
    public string Severity { get; set; } = null!;
    public string Message { get; set; } = null!;
    public string Status => IsResolved ? "RESOLVED" : "OPEN";
    public bool IsResolved { get; set; }
    public DateTime CreatedAt { get; set; }
}
