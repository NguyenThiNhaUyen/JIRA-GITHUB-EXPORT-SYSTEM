using System.Collections.Generic;
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Projects;
using JiraGithubExport.Shared.Contracts.Responses.Projects;
using JiraGithubExport.Shared.Infrastructure.Persistence;
using JiraGithubExport.Shared.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class SrsService : ISrsService
{
    private readonly JiraGithubToolDbContext _context;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<SrsService> _logger;
    private readonly INotificationService _notificationService;


    
    public SrsService(JiraGithubToolDbContext context, IWebHostEnvironment env, ILogger<SrsService> logger, INotificationService notificationService)
    {
        _context = context;
        _env = env;
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task<SrsDocumentResponse> UploadSrsAsync(long projectId, long uploaderUserId, UploadSrsRequest request)
    {
        var Project = await _context.Projects.FindAsync(projectId)
            ?? throw new NotFoundException($"Project {projectId} not found");

        if (request.File == null || request.File.Length == 0)
        {
            throw new BusinessException("File cannot be empty");
        }

        var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "srs");
        Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(request.File.FileName)}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await request.File.CopyToAsync(stream);
        }

        var fileUrl = $"/uploads/srs/{uniqueFileName}";

        var currentMaxVersion = await _context.ProjectDocuments
            .Where(d => d.ProjectId == projectId && d.DocType == "SRS")
            .MaxAsync(d => (int?)d.VersionNo) ?? 0;

        var srsDoc = new ProjectDocument
        {
            ProjectId = projectId,
            DocType = "SRS",
            VersionNo = currentMaxVersion + 1,
            Status = "DRAFT", // DRAFT initially, Lecturer updates to FINAL
            FileUrl = fileUrl,
            SubmittedByUserId = uploaderUserId,
            SubmittedAt = DateTime.UtcNow
        };

        _context.ProjectDocuments.Add(srsDoc);
        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} uploaded SRS version {Version} for Project {ProjectId}", uploaderUserId, srsDoc.VersionNo, projectId);

        return await GetSrsResponseAsync(srsDoc.Id);
    }

    public async Task<PagedResponse<SrsDocumentResponse>> GetSrsListAsync(long projectId, PagedRequest request)
    {
        var query = _context.ProjectDocuments
            .Include(d => d.SubmittedByUser)
            .Include(d => d.ReviewerUser)
            .Where(d => d.ProjectId == projectId && d.DocType == "SRS")
            .AsQueryable();

        var total = await query.CountAsync();
        var page = request.Page > 0 ? request.Page : 1;
        var pageSize = request.PageSize > 0 ? request.PageSize : 20;
        
        var items = await query
            .OrderByDescending(d => d.VersionNo)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var mapped = items.Select(MapToResponse).ToList();

        return new PagedResponse<SrsDocumentResponse>
        {
            Items = mapped,
            TotalCount = total,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize)
        };
    }

    public async Task<SrsDocumentResponse> ReviewSrsStatusAsync(long srsId, long reviewerUserId, ReviewSrsStatusRequest request)
    {
        var srs = await _context.ProjectDocuments
            .FirstOrDefaultAsync(d => d.Id == srsId && d.DocType == "SRS")
            ?? throw new NotFoundException($"SRS {srsId} not found");

        srs.Status = request.Status;
        srs.ReviewerUserId = reviewerUserId;
        srs.ReviewedAt = DateTime.UtcNow;
        srs.Score = request.Score ?? 0m;
        if (!string.IsNullOrEmpty(request.Feedback))
        {
            srs.Feedback = request.Feedback;
        }

        await _context.SaveChangesAsync();

        // Notify Team Members
        var teamMembers = await _context.TeamMembers
            .Where(tm => tm.ProjectId == srs.ProjectId)
            .ToListAsync();

        foreach (var member in teamMembers)
        {
            await _notificationService.BuildNotificationAsync(
                member.StudentUserId,
                "ALERT",
                $"TĂ i liá»‡u SRS cá»§a nhĂ³m báº¡n Ä‘Ă£ Ä‘Æ°á»£c cáº­p nháº­t tráº¡ng thĂ¡i: {request.Status}",
                System.Text.Json.JsonSerializer.Serialize(new { srsId = srs.Id, projectId = srs.ProjectId })
            );
        }
        

        _logger.LogInformation("Lecturer {ReviewerId} reviewed SRS {SrsId} with status {Status}", reviewerUserId, srsId, request.Status);

        return await GetSrsResponseAsync(srsId);
    }

    public async Task<SrsDocumentResponse> ProvideSrsFeedbackAsync(long srsId, long reviewerUserId, ReviewSrsFeedbackRequest request)
    {
        var srs = await _context.ProjectDocuments
            .FirstOrDefaultAsync(d => d.Id == srsId && d.DocType == "SRS")
            ?? throw new NotFoundException($"SRS {srsId} not found");

        srs.Feedback = request.Feedback;
        srs.ReviewerUserId = reviewerUserId;
        srs.ReviewedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return await GetSrsResponseAsync(srsId);
    }

    public async Task<PagedResponse<SrsDocumentResponse>> GetSrsListByCourseAsync(long? courseId, long? projectId, string? status, string? milestone, int page, int pageSize)
    {
        var query = _context.ProjectDocuments
            .Include(d => d.SubmittedByUser)
            .Include(d => d.ReviewerUser)
            .Include(d => d.Project)
            .Where(d => d.DocType == "SRS")
            .AsQueryable();

        if (courseId.HasValue)
        {
            query = query.Where(d => d.Project.CourseId == courseId.Value);
        }
        if (projectId.HasValue)
        {
            query = query.Where(d => d.ProjectId == projectId.Value);
        }
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(d => d.Status == status);
        }
        
        var total = await query.CountAsync();
        page = page > 0 ? page : 1;
        pageSize = pageSize > 0 ? pageSize : 20;

        var items = await query
            .OrderByDescending(d => d.SubmittedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var mapped = items.Select(MapToResponse).ToList();

        return new PagedResponse<SrsDocumentResponse>
        {
            Items = mapped,
            TotalCount = total,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize)
        };
    }

    public async Task<SrsDocumentResponse> GetSrsByIdAsync(long srsId)
    {
        return await GetSrsResponseAsync(srsId);
    }

    public async Task RemindOverdueAsync()
    {
        // Find active Projects that do not have an SRS document yet
        var activeProjectsWithoutSrs = await _context.Projects
            .Where(p => p.Status == "ACTIVE" && !_context.ProjectDocuments.Any(pd => pd.ProjectId == p.Id && pd.DocType == "SRS"))
            .ToListAsync();

        foreach (var Project in activeProjectsWithoutSrs)
        {
            // Get all Students in the Project
            var teamMembers = await _context.TeamMembers
                .Where(tm => tm.ProjectId == Project.Id && tm.ParticipationStatus == "ACTIVE")
                .ToListAsync();

            foreach (var member in teamMembers)
            {
                await _notificationService.BuildNotificationAsync(
                    member.StudentUserId,
                    "WARNING",
                    $"NhĂ³m cá»§a báº¡n táº¡i dá»± Ă¡n {Project.Name} chÆ°a ná»™p tĂ i liá»‡u SRS. Vui lĂ²ng ná»™p sá»›m Ä‘á»ƒ khĂ´ng bá»‹ trá»… háº¡n.",
                    System.Text.Json.JsonSerializer.Serialize(new { projectId = Project.Id })
                );
            }
        }

        _logger.LogInformation("Sent reminders for {Count} Projects missing SRS documents", activeProjectsWithoutSrs.Count);
    }

    public async Task DeleteSrsAsync(long srsId, long userId)
    {
        var srs = await _context.ProjectDocuments.FindAsync(srsId)
            ?? throw new NotFoundException($"SRS {srsId} not found");

        if (srs.Status == "FINAL")
        {
            throw new BusinessException("Cannot delete FINAL SRS document");
        }

        _context.ProjectDocuments.Remove(srs);
        await _context.SaveChangesAsync();

        var filePath = Path.Combine(_env.WebRootPath ?? "wwwroot", srs.FileUrl.TrimStart('/'));
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        _logger.LogInformation("User {UserId} deleted SRS {SrsId}", userId, srsId);
    }

    private async Task<SrsDocumentResponse> GetSrsResponseAsync(long srsId)
    {
        var srs = await _context.ProjectDocuments
            .Include(d => d.SubmittedByUser)
            .Include(d => d.ReviewerUser)
            .FirstOrDefaultAsync(d => d.Id == srsId)
            ?? throw new NotFoundException($"SRS document {srsId} not found");

        return MapToResponse(srs);
    }

    private SrsDocumentResponse MapToResponse(ProjectDocument d)
    {
        return new SrsDocumentResponse
        {
            Id = d.Id,
            ProjectId = d.ProjectId,
            VersionNo = d.VersionNo,
            Status = d.Status,
            FileUrl = d.FileUrl,
            SubmittedByUserId = d.SubmittedByUserId,
            SubmittedByName = d.SubmittedByUser?.FullName,
            SubmittedAt = d.SubmittedAt,
            ReviewerUserId = d.ReviewerUserId,
            ReviewerName = d.ReviewerUser?.FullName,
            Feedback = d.Feedback,
            Score = d.Score,
            Metadata = d.Metadata,
            ReviewedAt = d.ReviewedAt
        };
    }
}

