using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace JiraGithubExport.Shared.Models;

public partial class project_document
{
    public long id { get; set; }

    public long project_id { get; set; }

    public string doc_type { get; set; } = null!;

    public int version_no { get; set; }

    public string status { get; set; } = null!;

    public string file_url { get; set; } = null!;

    public long submitted_by_user_id { get; set; }

    public DateTime submitted_at { get; set; }

    public long? reviewer_user_id { get; set; }

    // Database schema in production uses `reviewer_user_id`.
    // Some migration snapshots/older scaffolds introduce an extra property `reviewer_userid`
    // (missing underscore), but that column does not exist in prod.
    // Mark as NotMapped to avoid EF generating SQL referencing the wrong column.
    [NotMapped]
    public long? reviewer_userid { get; set; }

    public decimal? score { get; set; }

    public string? feedback { get; set; }

    public string? metadata { get; set; } // For checklist JSON

    public DateTime? reviewed_at { get; set; }

    public virtual project project { get; set; } = null!;

    public virtual user submitted_by_user { get; set; } = null!;

    public virtual user? reviewer_user { get; set; }
}








