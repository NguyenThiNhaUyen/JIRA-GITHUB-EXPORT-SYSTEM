using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class ExternalAccount
{
    public long Id { get; set; }

    public long UserId { get; set; }

    public string Provider { get; set; } = null!;

    public string ExternalUserKey { get; set; } = null!;

    public string Username { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
