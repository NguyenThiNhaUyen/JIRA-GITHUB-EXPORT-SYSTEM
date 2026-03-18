using JiraGithubExport.Shared.Contracts.Responses.Notifications;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface INotificationService
{
    Task<List<NotificationResponse>> GetRecentNotificationsAsync(long userId);
    Task BuildNotificationAsync(long userId, string type, string message, string? metadata = null);
    Task MarkNotificationAsReadAsync(long notificationId);
}

