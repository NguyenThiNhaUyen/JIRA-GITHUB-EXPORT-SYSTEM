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
        var existing = await _unitOfWork.Semesters.FirstOrDefaultAsync(s => s.Name == request.Name);
        if (existing != null)
        {
            throw new BusinessException("Semester with this name already exists");
        }

        var Semester = new Semester
        {
            Name = request.Name,
            StartDate = DateOnly.FromDateTime(request.StartDate),
            EndDate = DateOnly.FromDateTime(request.EndDate),
            CreatedAt = DateTime.UtcNow
        };

        _unitOfWork.Semesters.Add(Semester);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<SemesterInfo>(Semester);
    }

    public async Task<List<SemesterInfo>> GenerateSemestersAsync(GenerateSemestersRequest request)
    {
        int year = request.Year;

        var semestersToCreate = new List<(string Name, DateOnly Start, DateOnly End)>
        {
            ($"Spring {year}", new DateOnly(year, 1, 1), new DateOnly(year, 4, 30)),
            ($"Summer {year}", new DateOnly(year, 5, 1), new DateOnly(year, 8, 31)),
            ($"Fall {year}", new DateOnly(year, 9, 1), new DateOnly(year, 12, 31))
        };

        var createdSemesters = new List<Semester>();

        foreach (var s in semestersToCreate)
        {
            var existing = await _unitOfWork.Semesters.FirstOrDefaultAsync(x => x.Name == s.Name);
            if (existing == null)
            {
                var Semester = new Semester
                {
                    Name = s.Name,
                    StartDate = s.Start,
                    EndDate = s.End,
                    CreatedAt = DateTime.UtcNow
                };
                _unitOfWork.Semesters.Add(Semester);
                createdSemesters.Add(Semester);
            }
            else
            {
                createdSemesters.Add(existing); // Include even if already exists
            }
        }

        await _unitOfWork.SaveChangesAsync(); // All in one transaction

        return _mapper.Map<List<SemesterInfo>>(createdSemesters);
    }

    public async Task<SemesterInfo> UpdateSemesterAsync(long semesterId, UpdateSemesterRequest request)
    {
        var Semester = await _unitOfWork.Semesters.FirstOrDefaultAsync(s => s.Id == semesterId);
        if (Semester == null) throw new NotFoundException("Semester not found");

        var existing = await _unitOfWork.Semesters.FirstOrDefaultAsync(s => s.Name == request.Name && s.Id != semesterId);
        if (existing != null) throw new BusinessException("Semester with this name already exists");

        Semester.Name = request.Name;
        Semester.StartDate = DateOnly.FromDateTime(request.StartDate);
        Semester.EndDate = DateOnly.FromDateTime(request.EndDate);

        _unitOfWork.Semesters.Update(Semester);
        await _unitOfWork.SaveChangesAsync();
        return _mapper.Map<SemesterInfo>(Semester);
    }

    public async Task DeleteSemesterAsync(long semesterId)
    {
        var Semester = await _unitOfWork.Semesters.Query()
            .Include(s => s.Courses)
            .FirstOrDefaultAsync(s => s.Id == semesterId);
            
        if (Semester == null) throw new NotFoundException("Semester not found");

        if (Semester.Courses != null && Semester.Courses.Any())
        {
            throw new BusinessException("Không thể xóa học kỳ vì đã có lớp học (Course) đang diễn ra trong học kỳ này. Vui lòng xóa các lớp học trước.");
        }

        _unitOfWork.Semesters.Remove(Semester);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<List<SemesterInfo>> GetAllSemestersAsync()
    {
        var Semesters = await _unitOfWork.Semesters.GetAllAsync();
        return _mapper.Map<List<SemesterInfo>>(Semesters);
    }

    public async Task<PagedResponse<SemesterInfo>> GetAllSemestersAsync(PagedRequest request)
    {
        var (items, totalItems) = await _unitOfWork.Semesters.GetPagedAsync(
            request.Page, 
            request.PageSize,
            string.IsNullOrWhiteSpace(request.Q) ? null : s => s.Name.ToLower().Contains(request.Q.ToLower()),
            request.SortDir?.ToLower() == "desc" ? q => q.OrderByDescending(x => x.CreatedAt) : q => q.OrderBy(x => x.CreatedAt)
        );

        return new PagedResponse<SemesterInfo>(_mapper.Map<List<SemesterInfo>>(items), totalItems, request.Page, request.PageSize);
    }
}

