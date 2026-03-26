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

    public ActivityDailiesController(JiraGithubToolDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Rebuild student_activity_dailies from GitHub commits/PRs so that commit statistics reports work on cloud.
    /// Notes:
    /// - This rebuild currently sets Jira issues metrics to 0 (this codebase has no mapping from jira_issue -> student).
    /// - It deletes existing rows for the given course's projects before rebuilding.
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
            .Where(pi => projectIds.Contains(pi.project_id) && pi.github_repo_id != null)
            .Select(pi => new { pi.project_id, repoId = pi.github_repo_id!.Value })
            .ToListAsync();

        if (!integrations.Any())
        {
            return Ok(ApiResponse<object>.SuccessResponse(new
            {
                courseId,
                days,
                deleted = 0,
                inserted = 0,
                message = "No approved GitHub repo integrations found for this course (github_repo_id is null)."
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

        // Rebuild per project to keep mapping (email -> student) correct.
        foreach (var project in integrations)
        {
            var projectId = project.project_id;
            var repoId = project.repoId;

            var members = await _context.team_members
                .AsNoTracking()
                .Where(tm => tm.project_id == projectId && tm.participation_status == "ACTIVE")
                .Include(tm => tm.student_user)
                .ThenInclude(su => su.user)
                .ToListAsync();

            if (!members.Any()) continue;

            // Map student email -> student_user_id for this project.
            var emailToStudentUserId = members
                .Select(m => new { email = m.student_user.user.email, studentUserId = m.student_user_id })
                .Where(x => !string.IsNullOrWhiteSpace(x.email))
                .GroupBy(x => x.email.Trim().ToLowerInvariant())
                .ToDictionary(g => g.Key, g => g.First().studentUserId);

            if (!emailToStudentUserId.Any()) continue;

            var studentEmails = emailToStudentUserId.Keys.ToList();

            var githubUsers = await _context.github_users
                .AsNoTracking()
                .Where(gu => gu.email != null && studentEmails.Contains(gu.email.ToLower()))
                .Select(gu => new { gu.id, email = gu.email })
                .ToListAsync();

            if (!githubUsers.Any()) continue;

            var githubUserIdToStudentUserId = githubUsers
                .Where(gu => !string.IsNullOrWhiteSpace(gu.email))
                .ToDictionary(
                    gu => gu.id,
                    gu => emailToStudentUserId[gu.email!.Trim().ToLowerInvariant()]);

            var githubUserIds = githubUserIdToStudentUserId.Keys.ToList();

            // --- Commits (count + lines) grouped by GitHub author + day ---
            var commitAgg = await _context.github_commits
                .AsNoTracking()
                .Where(c =>
                    c.repo_id == repoId &&
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
                .ToListAsync();

            // --- PRs grouped by GitHub author + day ---
            var prAgg = await _context.github_pull_requests
                .AsNoTracking()
                .Where(pr =>
                    pr.repo_id == repoId &&
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
                .ToListAsync();

            // Create upsert rows in memory keyed by (student, project, date).
            var rows = new Dictionary<(long studentUserId, DateOnly day), student_activity_daily>();

            foreach (var a in commitAgg)
            {
                if (!githubUserIdToStudentUserId.TryGetValue(a.AuthorId, out var studentUserId))
                    continue;

                var day = DateOnly.FromDateTime(a.Day);
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

                row.commits_count = a.Commits;
                row.lines_added = (int)a.LinesAdded;
                row.lines_deleted = (int)a.LinesDeleted;
            }

            foreach (var a in prAgg)
            {
                if (!githubUserIdToStudentUserId.TryGetValue(a.AuthorId, out var studentUserId))
                    continue;

                var day = DateOnly.FromDateTime(a.Day);
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

                row.pull_requests_count = a.PRs;
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
            deleted = integrationProjectIds.Count, // best-effort; exact deleted row count isn't tracked here
            inserted
        }, "Rebuilt student activity dailies."));
    }
}

