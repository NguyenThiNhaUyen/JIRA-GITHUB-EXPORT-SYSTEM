using AutoMapper;
using JiraGithubExportSystem.IntegrationService.Application.Interfaces;
using JiraGithubExportSystem.Shared.Common.Exceptions;
using JiraGithubExportSystem.Shared.Contracts.Common;
using JiraGithubExportSystem.Shared.Contracts.Requests.Courses;
using JiraGithubExportSystem.Shared.Contracts.Responses.Courses;
using JiraGithubExportSystem.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExportSystem.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace JiraGithubExportSystem.IntegrationService.Application.Implementations;

public class SemesterService : ISemesterService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    
    public SemesterService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<SemesterInfo> CreateSemesterAsync(CreateSemesterRequest request)
    {
        var existing = await _unitOfWork.Semesters.FirstOrDefaultAsync(s => s.name == request.Name);
        if (existing != null)
        {
            throw new BusinessException("Semester with this name already exists");
        }

        var semester = new semester
        {
            name = request.Name,
            start_date = DateOnly.FromDateTime(request.StartDate),
            end_date = DateOnly.FromDateTime(request.EndDate),
            created_at = DateTime.UtcNow
        };

        _unitOfWork.Semesters.Add(semester);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<SemesterInfo>(semester);
    }

    public async Task<SemesterInfo> UpdateSemesterAsync(long semesterId, UpdateSemesterRequest request)
    {
        var semester = await _unitOfWork.Semesters.FirstOrDefaultAsync(s => s.id == semesterId);
        if (semester == null) throw new NotFoundException("Semester not found");

        semester.name = request.Name;
        semester.start_date = DateOnly.FromDateTime(request.StartDate);
        semester.end_date = DateOnly.FromDateTime(request.EndDate);

        _unitOfWork.Semesters.Update(semester);
        await _unitOfWork.SaveChangesAsync();
        return _mapper.Map<SemesterInfo>(semester);
    }

    public async Task DeleteSemesterAsync(long semesterId)
    {
        var semester = await _unitOfWork.Semesters.FirstOrDefaultAsync(s => s.id == semesterId);
        if (semester == null) throw new NotFoundException("Semester not found");

        _unitOfWork.Semesters.Remove(semester);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<PagedResponse<SemesterInfo>> GetAllSemestersAsync(PagedRequest request)
    {
        var (items, totalItems) = await _unitOfWork.Semesters.GetPagedAsync(
            request.Page, 
            request.PageSize,
            string.IsNullOrWhiteSpace(request.Q) ? null : s => s.name.ToLower().Contains(request.Q.ToLower()),
            request.SortDir?.ToLower() == "desc" ? q => q.OrderByDescending(x => x.created_at) : q => q.OrderBy(x => x.created_at)
        );

        return new PagedResponse<SemesterInfo>(_mapper.Map<List<SemesterInfo>>(items), totalItems, request.Page, request.PageSize);
    }
}
