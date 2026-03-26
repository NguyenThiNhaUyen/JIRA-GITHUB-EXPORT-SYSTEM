using System;
using System.Collections.Generic;
using System.Linq;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Infrastructure.Persistence;
using JiraGithubExport.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JiraGithubExport.IntegrationService.Controllers;

[ApiController]
[Route("api/analytics")]
public class ActivityDailiesController : ControllerBase
{
    private readonly JiraGithubToolDbContext _context;

    private const string ProviderGitHub = "GITHUB";
    private const string ProviderJira = "JIRA";

    public ActivityDailiesController(JiraGithubToolDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Rebuild student_activity_dailies from GitHub commits/PRs + Jira "Done" issues.
    /// Notes:
    /// - GitHub mapping uses external_accounts (provider=GITHUB) with external_user_key = github_users.id (internal DB id).
    ///   If missing, it tries to infer mapping from GitHub user email == system user email and writes external_accounts.
    /// - Jira mapping uses external_accounts (provider=JIRA) with external_user_key = Jira account id (assignee/reporters).
    ///   If no Jira mapping exists, issues_completed will remain 0.
    /// - It deletes existing rows for integration projects before rebuilding.
    /// </summary>
    [HttpPost("rebuild-activity-dailies")]
    [Authorize(Roles = "ADMIN,LECTURER")]
    public async Task<IActionResult> RebuildActivityDailies([FromQuery] long courseId, [FromQuery] int days = 84)
    {
        if (days <= 0) return BadRequest(ApiResponse.ErrorResponse("`days` must be > 0"));

        var startDate = DateTime.UtcNow.AddDays(-days).Date;
        var endDateExclusive = DateTime.UtcNow.Date.AddDays(1); // < endDateExclusive

        var projectIds = await _context.projects
            .AsNoTracking()
            .Where(p => p.course_id == courseId)
            .Select(p => p.id)
            .ToListAsync();

        if (!projectIds.Any())
        {
            return Ok(ApiResponse<object>.SuccessResponse(new
            {
                deleted = 0,
                inserted = 0,
                message = "No projects found for this course."
            }));
        }

        var integrations = await _context.project_integrations
            .AsNoTracking()
            .Where(pi => projectIds.Contains(pi.project_id) && (pi.github_repo_id != null || pi.jira_project_id != null))
            .Select(pi => new
            {
                pi.project_id,
                githubRepoId = pi.github_repo_id,
                jiraProjectId = pi.jira_project_id
            })
            .ToListAsync();

        if (!integrations.Any())
        {
            return Ok(ApiResponse<object>.SuccessResponse(new
            {
                courseId,
                days,
                deleted = 0,
                inserted = 0,
                message = "No Jira/GitHub integrations found for this course."
            }, "Rebuild skipped."));
        }

        var integrationProjectIds = integrations
            .Select(i => i.project_id)
            .Distinct()
            .ToList();

        // Delete existing rows for integration projects so reports reflect the rebuilt window.
        var toDelete = await _context.student_activity_dailies
            .Where(sad => integrationProjectIds.Contains(sad.project_id))
            .ToListAsync();

        if (toDelete.Any())
            _context.student_activity_dailies.RemoveRange(toDelete);

        await _context.SaveChangesAsync();

        long inserted = 0;

        // Rebuild per project to keep mapping correct.
        foreach (var project in integrations)
        {
            var projectId = project.project_id;
            var repoId = project.githubRepoId;
            var jiraProjectId = project.jiraProjectId;

            var members = await _context.team_members
                .AsNoTracking()
                .Where(tm => tm.project_id == projectId && tm.participation_status == "ACTIVE")
                .Include(tm => tm.student_user)
                .ThenInclude(su => su.user)
                .ToListAsync();

            if (!members.Any()) continue;

            // Student users in this project (id + email).
            var projectStudents = members
                .Select(m => new
                {
                    studentUserId = m.student_user_id,
                    email = (m.student_user?.user?.email ?? "").Trim().ToLowerInvariant()
                })
                .Where(x => x.studentUserId > 0)
                .ToList();

            var studentUserIds = projectStudents.Select(x => x.studentUserId).Distinct().ToList();

            // -------------------------
            // 1) GitHub mapping
            // -------------------------
            // Use external_accounts mapping first (provider=GITHUB, external_user_key = github_users.id as string).
            var githubExternalMap = await _context.external_accounts
                .AsNoTracking()
                .Where(ea => ea.provider == ProviderGitHub && studentUserIds.Contains(ea.user_id))
                .Select(ea => new { ea.user_id, ea.external_user_key })
                .ToListAsync();

            var githubUserIdToStudentUserId = new Dictionary<long, long>();
            foreach (var row in githubExternalMap)
            {
                if (long.TryParse(row.external_user_key, out var ghUserId) && ghUserId > 0)
                    githubUserIdToStudentUserId[ghUserId] = row.user_id;
            }

            // If no explicit mapping exists, infer from GitHub author email == system email and write external_accounts.
            // This is best-effort only and does NOT require the emails to always match; it only helps bootstrap.
            if (repoId.HasValue)
            {
                var studentEmails = projectStudents
                    .Select(s => s.email)
                    .Where(e => !string.IsNullOrWhiteSpace(e))
                    .Distinct()
                    .ToList();

                if (studentEmails.Any())
                {
                    var ghUsersByEmail = await _context.github_users
                        .AsNoTracking()
                        .Where(gu => gu.email != null && studentEmails.Contains(gu.email.ToLower()))
                        .Select(gu => new { gu.id, email = gu.email })
                        .ToListAsync();

                    if (ghUsersByEmail.Any())
                    {
                        var emailToStudent = projectStudents
                            .Where(s => !string.IsNullOrWhiteSpace(s.email))
                            .GroupBy(s => s.email)
                            .ToDictionary(g => g.Key, g => g.First().studentUserId);

                        var existingGhKeys = await _context.external_accounts
                            .AsNoTracking()
                            .Where(ea => ea.provider == ProviderGitHub && studentUserIds.Contains(ea.user_id))
                            .Select(ea => new { ea.user_id, ea.external_user_key })
                            .ToListAsync();

                        var existingGhSet = new HashSet<(long userId, string key)>(
                            existingGhKeys.Select(x => (x.user_id, x.external_user_key)));

                        var toInsert = new List<external_account>();
                        foreach (var gh in ghUsersByEmail)
                        {
                            if (string.IsNullOrWhiteSpace(gh.email)) continue;
                            var normalized = gh.email.Trim().ToLowerInvariant();
                            if (!emailToStudent.TryGetValue(normalized, out var studentUserId)) continue;

                            var key = gh.id.ToString();
                            if (existingGhSet.Contains((studentUserId, key))) continue;

                            toInsert.Add(new external_account
                            {
                                user_id = studentUserId,
                                provider = ProviderGitHub,
                                external_user_key = key,
                                username = null,
                                created_at = DateTime.UtcNow,
                                updated_at = DateTime.UtcNow
                            });

                            // also use it immediately for aggregation
                            githubUserIdToStudentUserId[gh.id] = studentUserId;
                        }

                        if (toInsert.Any())
                        {
                            await _context.external_accounts.AddRangeAsync(toInsert);
                            await _context.SaveChangesAsync();
                        }
                    }
                }
            }

            var githubUserIds = githubUserIdToStudentUserId.Keys.Distinct().ToList();

            var commitAgg = new List<dynamic>();
            var prAgg = new List<dynamic>();
            if (repoId.HasValue && githubUserIds.Any())
            {
                // --- Commits (count + lines) grouped by GitHub author + day ---
                commitAgg = await _context.github_commits
                    .AsNoTracking()
                    .Where(c =>
                        c.repo_id == repoId.Value &&
                        c.author_github_user_id != null &&
                        githubUserIds.Contains(c.author_github_user_id.Value) &&
                        c.committed_at != null &&
                        c.committed_at >= startDate &&
                        c.committed_at < endDateExclusive)
                    .GroupBy(c => new { AuthorId = c.author_github_user_id!.Value, Day = c.committed_at!.Value.Date })
                    .Select(g => new
                    {
                        g.Key.AuthorId,
                        Day = g.Key.Day,
                        Commits = g.Count(),
                        LinesAdded = g.Sum(x => x.additions ?? 0),
                        LinesDeleted = g.Sum(x => x.deletions ?? 0)
                    })
                    .Cast<dynamic>()
                    .ToListAsync();

                // --- PRs grouped by GitHub author + day ---
                prAgg = await _context.github_pull_requests
                    .AsNoTracking()
                    .Where(pr =>
                        pr.repo_id == repoId.Value &&
                        pr.author_github_user_id != null &&
                        githubUserIds.Contains(pr.author_github_user_id.Value) &&
                        pr.created_at >= startDate &&
                        pr.created_at < endDateExclusive)
                    .GroupBy(pr => new { AuthorId = pr.author_github_user_id!.Value, Day = pr.created_at.Date })
                    .Select(g => new
                    {
                        g.Key.AuthorId,
                        Day = g.Key.Day,
                        PRs = g.Count()
                    })
                    .Cast<dynamic>()
                    .ToListAsync();
            }

            // -------------------------
            // 2) Jira mapping + issues_completed
            // -------------------------
            // Use external_accounts mapping (provider=JIRA, external_user_key = Jira account id).
            var jiraExternalMap = await _context.external_accounts
                .AsNoTracking()
                .Where(ea => ea.provider == ProviderJira && studentUserIds.Contains(ea.user_id))
                .Select(ea => new { ea.user_id, ea.external_user_key })
                .ToListAsync();

            // jira_account_id -> student_user_id
            var jiraAccountToStudentUserId = jiraExternalMap
                .Where(x => !string.IsNullOrWhiteSpace(x.external_user_key))
                .GroupBy(x => x.external_user_key.Trim())
                .ToDictionary(g => g.Key, g => g.First().user_id);

            var doneIssueAgg = new List<dynamic>();
            if (jiraProjectId.HasValue && jiraAccountToStudentUserId.Any())
            {
                var jiraAccounts = jiraAccountToStudentUserId.Keys.ToList();

                // Count completed issues by assignee + day.
                doneIssueAgg = await _context.jira_issues
                    .AsNoTracking()
                    .Where(i =>
                        i.jira_project_id == jiraProjectId.Value &&
                        i.status != null &&
                        i.status.ToLower() == "done" &&
                        i.assignee_jira_account_id != null &&
                        jiraAccounts.Contains(i.assignee_jira_account_id) &&
                        (i.resolution_date ?? i.updated_at) >= startDate &&
                        (i.resolution_date ?? i.updated_at) < endDateExclusive)
                    .GroupBy(i => new
                    {
                        Assignee = i.assignee_jira_account_id!,
                        Day = (i.resolution_date ?? i.updated_at).Date
                    })
                    .Select(g => new
                    {
                        g.Key.Assignee,
                        Day = g.Key.Day,
                        DoneIssues = g.Count()
                    })
                    .Cast<dynamic>()
                    .ToListAsync();
            }

            // Create upsert rows in memory keyed by (student, project, date).
            var rows = new Dictionary<(long studentUserId, DateOnly day), student_activity_daily>();

            foreach (var a in commitAgg)
            {
                long authorId = (long)a.AuthorId;
                if (!githubUserIdToStudentUserId.TryGetValue(authorId, out var studentUserId))
                    continue;

                var day = DateOnly.FromDateTime((DateTime)a.Day);
                var key = (studentUserId, day);

                if (!rows.TryGetValue(key, out var row))
                {
                    row = new student_activity_daily
                    {
                        student_user_id = studentUserId,
                        project_id = projectId,
                        activity_date = day,
                        created_at = DateTime.UtcNow,
                        updated_at = DateTime.UtcNow
                    };
                    rows[key] = row;
                }

                row.commits_count = (int)a.Commits;
                row.lines_added = (int)a.LinesAdded;
                row.lines_deleted = (int)a.LinesDeleted;
            }

            foreach (var a in prAgg)
            {
                long authorId = (long)a.AuthorId;
                if (!githubUserIdToStudentUserId.TryGetValue(authorId, out var studentUserId))
                    continue;

                var day = DateOnly.FromDateTime((DateTime)a.Day);
                var key = (studentUserId, day);

                if (!rows.TryGetValue(key, out var row))
                {
                    row = new student_activity_daily
                    {
                        student_user_id = studentUserId,
                        project_id = projectId,
                        activity_date = day,
                        created_at = DateTime.UtcNow,
                        updated_at = DateTime.UtcNow
                    };
                    rows[key] = row;
                }

                row.pull_requests_count = (int)a.PRs;
            }

            foreach (var a in doneIssueAgg)
            {
                var assignee = (string)a.Assignee;
                if (!jiraAccountToStudentUserId.TryGetValue(assignee, out var studentUserId))
                    continue;

                var day = DateOnly.FromDateTime((DateTime)a.Day);
                var key = (studentUserId, day);

                if (!rows.TryGetValue(key, out var row))
                {
                    row = new student_activity_daily
                    {
                        student_user_id = studentUserId,
                        project_id = projectId,
                        activity_date = day,
                        created_at = DateTime.UtcNow,
                        updated_at = DateTime.UtcNow
                    };
                    rows[key] = row;
                }

                row.issues_completed = (int)a.DoneIssues;
            }

            if (rows.Any())
            {
                await _context.student_activity_dailies.AddRangeAsync(rows.Values);
                await _context.SaveChangesAsync();
                inserted += rows.Count;
            }
        }

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            courseId,
            days,
            deleted = toDelete.Count,
            inserted
        }, "Rebuilt student activity dailies."));
    }
}

