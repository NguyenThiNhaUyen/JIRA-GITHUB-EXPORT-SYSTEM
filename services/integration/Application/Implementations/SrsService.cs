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

    public SrsService(JiraGithubToolDbContext context, IWebHostEnvironment env, ILogger<SrsService> logger)
    {
        _context = context;
        _env = env;
        _logger = logger;
    }

    public async Task<SrsDocumentResponse> UploadSrsAsync(long projectId, long uploaderUserId, UploadSrsRequest request)
    {
        var project = await _context.projects.FindAsync(projectId)
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

        var currentMaxVersion = await _context.project_documents
            .Where(d => d.project_id == projectId && d.doc_type == "SRS")
            .MaxAsync(d => (int?)d.version_no) ?? 0;

        var srsDoc = new project_document
        {
            project_id = projectId,
            doc_type = "SRS",
            version_no = currentMaxVersion + 1,
            status = "DRAFT", // DRAFT initially, Lecturer updates to FINAL
            file_url = fileUrl,
            submitted_by_user_id = uploaderUserId,
            submitted_at = DateTime.UtcNow
        };

        _context.project_documents.Add(srsDoc);
        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} uploaded SRS version {Version} for project {ProjectId}", uploaderUserId, srsDoc.version_no, projectId);

        return await GetSrsResponseAsync(srsDoc.id);
    }

    public async Task<PagedResponse<SrsDocumentResponse>> GetSrsListAsync(long projectId, PagedRequest request)
    {
        var query = _context.project_documents
            .Include(d => d.submitted_by_user)
            .Include(d => d.reviewer_user)
            .Where(d => d.project_id == projectId && d.doc_type == "SRS")
            .AsQueryable();

        var total = await query.CountAsync();
        var page = request.Page > 0 ? request.Page : 1;
        var pageSize = request.PageSize > 0 ? request.PageSize : 20;
        
        var items = await query
            .OrderByDescending(d => d.version_no)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var mapped = items.Select(MapToResponse).ToList();

        return new PagedResponse<SrsDocumentResponse>
        {
            Items = mapped,
            TotalItems = total,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize)
        };
    }

    public async Task<SrsDocumentResponse> ReviewSrsStatusAsync(long srsId, long reviewerUserId, ReviewSrsStatusRequest request)
    {
        var srs = await _context.project_documents
            .FirstOrDefaultAsync(d => d.id == srsId && d.doc_type == "SRS")
            ?? throw new NotFoundException($"SRS {srsId} not found");

        srs.status = request.Status;
        srs.reviewer_user_id = reviewerUserId;
        srs.reviewed_at = DateTime.UtcNow;
        
        if (!string.IsNullOrEmpty(request.Feedback))
        {
            srs.feedback = request.Feedback;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Lecturer {ReviewerId} reviewed SRS {SrsId} with status {Status}", reviewerUserId, srsId, request.Status);

        return await GetSrsResponseAsync(srsId);
    }

    public async Task<SrsDocumentResponse> ProvideSrsFeedbackAsync(long srsId, long reviewerUserId, ReviewSrsFeedbackRequest request)
    {
        var srs = await _context.project_documents
            .FirstOrDefaultAsync(d => d.id == srsId && d.doc_type == "SRS")
            ?? throw new NotFoundException($"SRS {srsId} not found");

        srs.feedback = request.Feedback;
        srs.reviewer_user_id = reviewerUserId;
        srs.reviewed_at = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return await GetSrsResponseAsync(srsId);
    }

    public async Task DeleteSrsAsync(long srsId, long userId)
    {
        var srs = await _context.project_documents.FindAsync(srsId)
            ?? throw new NotFoundException($"SRS {srsId} not found");

        if (srs.status == "FINAL")
        {
            throw new BusinessException("Cannot delete FINAL SRS document");
        }

        _context.project_documents.Remove(srs);
        await _context.SaveChangesAsync();

        // Optional: delete physical file to save space
        var filePath = Path.Combine(_env.WebRootPath ?? "wwwroot", srs.file_url.TrimStart('/'));
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        _logger.LogInformation("User {UserId} deleted SRS {SrsId}", userId, srsId);
    }

    private async Task<SrsDocumentResponse> GetSrsResponseAsync(long srsId)
    {
        var srs = await _context.project_documents
            .Include(d => d.submitted_by_user)
            .Include(d => d.reviewer_user)
            .FirstOrDefaultAsync(d => d.id == srsId)
            ?? throw new NotFoundException($"SRS document {srsId} not found");

        return MapToResponse(srs);
    }

    private SrsDocumentResponse MapToResponse(project_document d)
    {
        return new SrsDocumentResponse
        {
            Id = d.id,
            ProjectId = d.project_id,
            VersionNo = d.version_no,
            Status = d.status,
            FileUrl = d.file_url,
            SubmittedByName = d.submitted_by_user?.full_name,
            SubmittedAt = d.submitted_at,
            ReviewerName = d.reviewer_user?.full_name,
            Feedback = d.feedback,
            ReviewedAt = d.reviewed_at
        };
    }
}
