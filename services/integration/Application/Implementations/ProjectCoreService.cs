using AutoMapper;
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Projects;
using JiraGithubExport.Shared.Contracts.Responses.Projects;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.Extensions.Logging;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class ProjectCoreService : IProjectCoreService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<ProjectCoreService> _logger;

    public ProjectCoreService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<ProjectCoreService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<ProjectDetailResponse> CreateProjectAsync(CreateProjectRequest request, long courseId)
    {
        var course = await _unitOfWork.Courses.GetByIdAsync(courseId);
        if (course == null)
        {
            _logger.LogWarning("Course not found: {CourseId}", courseId);
            throw new NotFoundException("Course not found");
        }

        var existing = await _unitOfWork.Projects.FirstOrDefaultAsync(p =>
            p.course_id == courseId && p.name == request.Name && p.status == "ACTIVE");

        if (existing != null)
        {
            _logger.LogWarning("Duplicate project name in course {CourseId}", courseId);
            throw new BusinessException("Project with this name already exists in the course");
        }

        var project = new project
        {
            course_id = courseId,
            name = request.Name,
            description = request.Description,
            status = "ACTIVE",
            created_at = DateTime.UtcNow,
            updated_at = DateTime.UtcNow
        };

        _unitOfWork.Projects.Add(project);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<ProjectDetailResponse>(project);
    }

    public async Task<ProjectDetailResponse> GetProjectByIdAsync(long projectId)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.id == projectId);
        if (project == null) throw new NotFoundException("Project not found");
        return _mapper.Map<ProjectDetailResponse>(project);
    }

    public async Task<ProjectDetailResponse> UpdateProjectAsync(long projectId, UpdateProjectRequest request)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.id == projectId);
        if (project == null) throw new NotFoundException("Project not found");

        if (project.name != request.Name)
        {
            var existing = await _unitOfWork.Projects.FirstOrDefaultAsync(p =>
                p.course_id == project.course_id && p.name == request.Name && p.status == "ACTIVE");
            if (existing != null) throw new BusinessException("Project with this name already exists in the course");
        }

        project.name = request.Name;
        project.description = request.Description;
        project.updated_at = DateTime.UtcNow;

        _unitOfWork.Projects.Update(project);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<ProjectDetailResponse>(project);
    }

    public async Task DeleteProjectAsync(long projectId)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.id == projectId);
        if (project == null) throw new NotFoundException("Project not found");

        project.status = "INACTIVE";
        project.updated_at = DateTime.UtcNow;

        _unitOfWork.Projects.Update(project);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<PagedResponse<ProjectDetailResponse>> GetProjectsByCourseAsync(long courseId, PagedRequest request)
    {
        var (items, totalItems) = await _unitOfWork.Projects.GetPagedProjectsByCourseAsync(
            courseId,
            request.Q,
            request.SortDir,
            request.Page,
            request.PageSize
        );

        var dtoList = _mapper.Map<List<ProjectDetailResponse>>(items);
        return new PagedResponse<ProjectDetailResponse>(dtoList, totalItems, request.Page, request.PageSize);
    }
}
