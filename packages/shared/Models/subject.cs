using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class subject
{
    public long id { get; set; }

    public string subject_code { get; set; } = null!;

    public string subject_name { get; set; } = null!;

    public DateTime created_at { get; set; }

    public virtual ICollection<course> courses { get; set; } = new List<course>();
}








