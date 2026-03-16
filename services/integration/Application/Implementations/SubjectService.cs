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
        var existing = await _unitOfWork.Subjects.FirstOrDefaultAsync(s => s.subject_code == request.SubjectCode);
        if (existing != null)
        {
            throw new BusinessException("Subject code already exists");
        }

        var subject = new subject
        {
            subject_code = request.SubjectCode,
            subject_name = request.SubjectName,
            department = request.Department,
            description = request.Description,
            credits = request.Credits,
            max_students = request.MaxStudents,
            status = request.Status,
            created_at = DateTime.UtcNow
        };

        _unitOfWork.Subjects.Add(subject);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<SubjectInfo>(subject);
    }

    public async Task<SubjectInfo> UpdateSubjectAsync(long subjectId, UpdateSubjectRequest request)
    {
        var subject = await _unitOfWork.Subjects.FirstOrDefaultAsync(s => s.id == subjectId);
        if (subject == null) throw new NotFoundException("Subject not found");

        if (!string.IsNullOrWhiteSpace(request.SubjectName))
            subject.subject_name = request.SubjectName;
            
        if (!string.IsNullOrWhiteSpace(request.Department))
            subject.department = request.Department;
            
        if (request.Description != null)
            subject.description = request.Description;
            
        if (request.Credits.HasValue)
            subject.credits = request.Credits.Value;
            
        if (request.MaxStudents.HasValue)
            subject.max_students = request.MaxStudents.Value;
            
        if (!string.IsNullOrWhiteSpace(request.Status))
            subject.status = request.Status;

        _unitOfWork.Subjects.Update(subject);
        await _unitOfWork.SaveChangesAsync();
        return _mapper.Map<SubjectInfo>(subject);
    }

    public async Task DeleteSubjectAsync(long subjectId)
    {
        var subject = await _unitOfWork.Subjects.FirstOrDefaultAsync(s => s.id == subjectId);
        if (subject == null) throw new NotFoundException("Subject not found");

        _unitOfWork.Subjects.Remove(subject);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<PagedResponse<SubjectInfo>> GetAllSubjectsAsync(PagedRequest request)
    {
        var (items, totalItems) = await _unitOfWork.Subjects.GetPagedAsync(
            request.Page, 
            request.PageSize,
            string.IsNullOrWhiteSpace(request.Q) ? null : s => (s.subject_name ?? "").ToLower().Contains(request.Q.ToLower()) || (s.subject_code ?? "").ToLower().Contains(request.Q.ToLower()),
            request.SortDir?.ToLower() == "desc" ? q => q.OrderByDescending(x => x.created_at) : q => q.OrderBy(x => x.created_at)
        );

        return new PagedResponse<SubjectInfo>(_mapper.Map<List<SubjectInfo>>(items), totalItems, request.Page, request.PageSize);
    }

    public async Task<List<SubjectInfo>> GetAllSubjectsAsync()
    {
        var items = await _unitOfWork.Subjects.Query()
            .OrderBy(s => s.subject_name)
            .ToListAsync();

        return _mapper.Map<List<SubjectInfo>>(items);
    }
}
