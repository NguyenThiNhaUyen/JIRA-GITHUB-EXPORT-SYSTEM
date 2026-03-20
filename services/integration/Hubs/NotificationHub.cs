using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace JiraGithubExport.IntegrationService.Hubs;

public class NotificationHub : Hub
{
    private readonly ILogger<NotificationHub> _logger;

    public NotificationHub(ILogger<NotificationHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier ?? "Anonymous";
        _logger.LogInformation("Client connected to NotificationHub: {ConnectionId} (User: {UserId})", Context.ConnectionId, userId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected from NotificationHub: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Cho phép Client tự đăng ký tham gia vào một Room (Group) cụ thể, ví dụ ProjectId hoặc CourseId
    /// Frontend gọi: connection.invoke("JoinGroup", "Project_123")
    /// </summary>
    public async Task JoinGroup(string groupName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        _logger.LogInformation("Connection {ConnectionId} joined group {GroupName}", Context.ConnectionId, groupName);
    }

    /// <summary>
    /// Cho phép Client huỷ theo dõi một Room
    /// </summary>
    public async Task LeaveGroup(string groupName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        _logger.LogInformation("Connection {ConnectionId} left group {GroupName}", Context.ConnectionId, groupName);
    }

    /// <summary>
    /// TEST or INTERNAL PUSH: Đẩy thông báo trực tiếp đến 1 user
    /// Frontend sẽ lắng nghe sự kiện: "ReceiveNotification"
    /// </summary>
    public async Task SendToUser(string targetUserId, string type, object payload)
    {
        // Trong môi trường production, thường hàm này chỉ cấp quyền cho Admin/System gọi
        await Clients.User(targetUserId).SendAsync("ReceiveNotification", new 
        {
            Type = type,
            Payload = payload,
            Timestamp = DateTime.UtcNow
        });
        _logger.LogInformation("Sent {Type} notification to User {UserId}", type, targetUserId);
    }

    /// <summary>
    /// PUSH: Đẩy thông báo đến toàn bộ người trong 1 room/group (ví dụ khi Project có commit mới)
    /// </summary>
    public async Task SendToGroup(string groupName, string type, object payload)
    {
        await Clients.Group(groupName).SendAsync("ReceiveNotification", new 
        {
            Type = type,
            Payload = payload,
            Timestamp = DateTime.UtcNow
        });
        _logger.LogInformation("Sent {Type} notification to Group {GroupName}", type, groupName);
    }
}
