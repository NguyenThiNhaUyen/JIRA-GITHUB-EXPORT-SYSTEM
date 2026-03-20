using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class semester
{
    public long id { get; set; }

    public string name { get; set; } = null!;

    public DateOnly? start_date { get; set; }

    public DateOnly? end_date { get; set; }

    public DateTime created_at { get; set; }

    public virtual ICollection<course> courses { get; set; } = new List<course>();
}








