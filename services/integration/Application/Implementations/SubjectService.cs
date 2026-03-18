using AutoMapper;
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Courses;
using JiraGithubExport.Shared.Contracts.Responses.Courses;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class SubjectService : ISubjectService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    
    public SubjectService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<SubjectInfo> CreateSubjectAsync(CreateSubjectRequest request)
    {
        var existing = await _unitOfWork.Subjects.FirstOrDefaultAsync(s => s.SubjectCode == request.SubjectCode);
        if (existing != null)
        {
            throw new BusinessException("Subject code already exists");
        }

        var Subject = new Subject
        {
            SubjectCode = request.SubjectCode,
            SubjectName = request.SubjectName,
            Department = request.Department,
            Description = request.Description,
            Credits = request.Credits,
            MaxStudents = request.MaxStudents,
            Status = request.Status,
            CreatedAt = DateTime.UtcNow
        };

        _unitOfWork.Subjects.Add(Subject);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<SubjectInfo>(Subject);
    }

    public async Task<SubjectInfo> UpdateSubjectAsync(long subjectId, UpdateSubjectRequest request)
    {
        var Subject = await _unitOfWork.Subjects.FirstOrDefaultAsync(s => s.Id == subjectId);
        if (Subject == null) throw new NotFoundException("Subject not found");

        if (!string.IsNullOrWhiteSpace(request.SubjectCode))
        {
            // Check uniqueness if changed
            if (Subject.SubjectCode != request.SubjectCode)
            {
                var existing = await _unitOfWork.Subjects.FirstOrDefaultAsync(s => s.SubjectCode == request.SubjectCode);
                if (existing != null) throw new BusinessException("Subject code already exists");
                Subject.SubjectCode = request.SubjectCode;
            }
        }

        if (!string.IsNullOrWhiteSpace(request.SubjectName))
            Subject.SubjectName = request.SubjectName;
            
        if (!string.IsNullOrWhiteSpace(request.Department))
            Subject.Department = request.Department;
            
        if (request.Description != null)
            Subject.Description = request.Description;
            
        if (request.Credits.HasValue)
            Subject.Credits = request.Credits.Value;
            
        if (request.MaxStudents.HasValue)
            Subject.MaxStudents = request.MaxStudents.Value;
            
        if (!string.IsNullOrWhiteSpace(request.Status))
            Subject.Status = request.Status;

        _unitOfWork.Subjects.Update(Subject);
        await _unitOfWork.SaveChangesAsync();
        return _mapper.Map<SubjectInfo>(Subject);
    }

    public async Task DeleteSubjectAsync(long subjectId)
    {
        var Subject = await _unitOfWork.Subjects.FirstOrDefaultAsync(s => s.Id == subjectId);
        if (Subject == null) throw new NotFoundException("Subject not found");

        _unitOfWork.Subjects.Remove(Subject);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<PagedResponse<SubjectInfo>> GetAllSubjectsAsync(PagedRequest request)
    {
        var (items, totalItems) = await _unitOfWork.Subjects.GetPagedAsync(
            request.Page, 
            request.PageSize,
            string.IsNullOrWhiteSpace(request.Q) ? null : s => (s.SubjectName ?? "").ToLower().Contains(request.Q.ToLower()) || (s.SubjectCode ?? "").ToLower().Contains(request.Q.ToLower()),
            request.SortDir?.ToLower() == "desc" ? q => q.OrderByDescending(x => x.CreatedAt) : q => q.OrderBy(x => x.CreatedAt)
        );

        return new PagedResponse<SubjectInfo>(_mapper.Map<List<SubjectInfo>>(items), totalItems, request.Page, request.PageSize);
    }

    public async Task<List<SubjectInfo>> GetAllSubjectsAsync()
    {
        var items = await _unitOfWork.Subjects.Query()
            .OrderBy(s => s.SubjectName)
            .ToListAsync();

        return _mapper.Map<List<SubjectInfo>>(items);
    }
}

