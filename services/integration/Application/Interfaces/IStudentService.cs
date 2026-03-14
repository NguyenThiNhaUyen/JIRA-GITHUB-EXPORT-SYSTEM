using JiraGithubExport.Shared.Contracts.Common;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface IStudentService
{
    Task<object> GetStudentStatsAsync(long userId);
    Task<PagedResponse<object>> GetStudentCoursesAsync(long userId, PagedRequest request);
    Task<PagedResponse<object>> GetStudentProjectsAsync(long userId, PagedRequest request);
    Task<PagedResponse<object>> GetStudentCommitsAsync(long userId, PagedRequest request);
    Task<PagedResponse<object>> GetStudentTasksAsync(long userId, PagedRequest request);
    Task<PagedResponse<object>> GetStudentGradesAsync(long userId, PagedRequest request);
    Task<List<object>> GetStudentWarningsAsync(long userId);
    
    // New methods for Phase 2
    Task<List<JiraGithubExport.Shared.Contracts.Responses.Analytics.HeatmapStat>> GetStudentHeatmapAsync(long userId, int days = 35);
    Task<List<JiraGithubExport.Shared.Contracts.Responses.Analytics.DailyCommitStat>> GetStudentCommitActivityAsync(long userId, int days = 7);
}
