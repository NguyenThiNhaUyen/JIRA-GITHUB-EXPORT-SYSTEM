using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Responses.Notifications;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class NotificationService : INotificationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<NotificationService> _logger;
    private readonly IHubContext<JiraGithubExport.IntegrationService.Hubs.NotificationHub> _hubContext;

    public NotificationService(
        IUnitOfWork unitOfWork,
        ILogger<NotificationService> logger,
        IHubContext<JiraGithubExport.IntegrationService.Hubs.NotificationHub> hubContext)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _hubContext = hubContext;
    }

    public async Task<List<NotificationResponse>> GetRecentNotificationsAsync(long userId)
    {
        try
        {
            var notifications = await _unitOfWork.Notifications.Query()
                .AsNoTracking()
                .Where(n => n.RecipientUserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(20)
                .ToListAsync();

            return notifications.Select(n =>
            {
                Dictionary<string, object>? metaObj = null;
                if (!string.IsNullOrEmpty(n.Metadata))
                {
                    try { metaObj = JsonSerializer.Deserialize<Dictionary<string, object>>(n.Metadata); }
                    catch { /* Ignore invalid JSON */ }
                }

                return new NotificationResponse
                {
                    Id = n.Id.ToString(),
                    Type = n.Type ?? "SYSTEM",
                    Message = n.Message ?? "",
                    Timestamp = n.CreatedAt,
                    IsRead = n.IsRead,
                    Metadata = metaObj
                };
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching notifications for user {UserId}", userId);
            return new List<NotificationResponse>();
        }
    }

    public async Task BuildNotificationAsync(long userId, string type, string message, string? metadata = null)
    {
        var notif = new Notification
        {
            RecipientUserId = userId,
            Type = type,
            Message = message,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
            Metadata = metadata
        };

        _unitOfWork.Notifications.Add(notif);
        await _unitOfWork.SaveChangesAsync();

        try
        {
            await _hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", new
            {
                id = notif.Id.ToString(),
                Type = type,
                Message = message,
                Timestamp = notif.CreatedAt,
                isRead = false,
                metadata = string.IsNullOrEmpty(metadata) ? null : JsonSerializer.Deserialize<object>(metadata)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SignalR notification to user {UserId}", userId);
        }
    }

    public async Task MarkNotificationAsReadAsync(long notificationId)
    {
        var notif = await _unitOfWork.Notifications.GetByIdAsync(notificationId);
        if (notif != null)
        {
            notif.IsRead = true;
            _unitOfWork.Notifications.Update(notif);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}

