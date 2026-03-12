using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class external_account
{
    public long id { get; set; }

    public long user_id { get; set; }

    public string provider { get; set; } = null!;

    public string external_user_key { get; set; } = null!;

    public string? username { get; set; }

    public DateTime created_at { get; set; }

    public DateTime updated_at { get; set; }

    public virtual user user { get; set; } = null!;
}








