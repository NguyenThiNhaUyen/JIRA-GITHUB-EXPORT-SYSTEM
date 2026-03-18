using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Contracts.Responses.Integrations
{
    public class JiraAgileResponse<T>
    {
        public int MaxResults { get; set; }
        public int StartAt { get; set; }
        public int Total { get; set; }
        public bool IsLast { get; set; }
        public List<T> Values { get; set; } = new();
    }

    public class JiraBoardResponse
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
    }

    public class JiraSprintResponse
    {
        public long Id { get; set; }
        public string State { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? CompleteDate { get; set; }
        public long OriginBoardId { get; set; }
    }
}

