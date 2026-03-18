using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Contracts.Responses.Notifications
{
    public class NotificationResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "INVITATION", "COURSE_ALERT", "SYSTEM"
        public string Message { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public bool IsRead { get; set; }
        public Dictionary<string, object>? Metadata { get; set; }
    }
}
