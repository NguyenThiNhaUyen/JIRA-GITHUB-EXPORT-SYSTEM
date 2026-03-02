using System;
using System.Linq;
using System.Threading.Tasks;
using JiraGithubExport.IntegrationService.Application.Implementations;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Requests.Projects;
using JiraGithubExport.Shared.Infrastructure.ExternalServices.Interfaces;
using JiraGithubExport.Shared.Infrastructure.Persistence;
using JiraGithubExport.Shared.Infrastructure.Repositories.Implementations;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace IntegrationService.Tests.Services
{
    public class ProjectIntegrationServiceTests : IDisposable
    {
        private readonly JiraGithubToolDbContext _context;
        private readonly UnitOfWork _unitOfWork;
        private readonly Mock<IServiceScopeFactory> _mockScopeFactory;
        private readonly Mock<ILogger<ProjectIntegrationService>> _mockLogger;
        private readonly ProjectIntegrationService _service;

        public ProjectIntegrationServiceTests()
        {
            var options = new DbContextOptionsBuilder<JiraGithubToolDbContext>()
                .UseSqlite("DataSource=:memory:")
                .Options;

            _context = new JiraGithubToolDbContext(options);
            _context.Database.OpenConnection();

            // Disable foreign keys for unit testing dummy data
            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "PRAGMA foreign_keys = OFF;";
                command.ExecuteNonQuery();
            }

            _context.Database.EnsureCreated();

            _unitOfWork = new UnitOfWork(_context);

            _mockScopeFactory = new Mock<IServiceScopeFactory>();
            _mockLogger = new Mock<ILogger<ProjectIntegrationService>>();

            // Setup a fake scope for the background worker kick-off
            var mockScope = new Mock<IServiceScope>();
            var mockServiceProvider = new Mock<IServiceProvider>();
            
            mockServiceProvider.Setup(x => x.GetService(typeof(IGitHubClient))).Returns(new Mock<IGitHubClient>().Object);
            mockServiceProvider.Setup(x => x.GetService(typeof(IJiraClient))).Returns(new Mock<IJiraClient>().Object);
            mockServiceProvider.Setup(x => x.GetService(typeof(ILogger<ProjectIntegrationService>))).Returns(_mockLogger.Object);
            
            mockScope.Setup(s => s.ServiceProvider).Returns(mockServiceProvider.Object);
            _mockScopeFactory.Setup(s => s.CreateScope()).Returns(mockScope.Object);

            _service = new ProjectIntegrationService(_unitOfWork, _mockScopeFactory.Object, _mockLogger.Object);
        }

        public void Dispose()
        {
            _context.Database.CloseConnection();
            _context.Dispose();
        }

        [Fact]
        public async Task LinkIntegrationAsync_ProjectNotFound_ThrowsNotFoundException()
        {
            // Arrange
            var request = new LinkIntegrationRequest { GithubRepoUrl = "https://github.com/owner/repo" };

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => _service.LinkIntegrationAsync(999, request));
        }

        [Fact]
        public async Task LinkIntegrationAsync_InvalidGithubUrl_ThrowsValidationException()
        {
            // Arrange
            var project = new project { name = "Test Project", status = "ACTIVE", created_at = DateTime.UtcNow, updated_at = DateTime.UtcNow };
            _context.projects.Add(project);
            await _context.SaveChangesAsync();

            var request = new LinkIntegrationRequest { GithubRepoUrl = "invalidurl" };

            // Act & Assert
            await Assert.ThrowsAsync<ValidationException>(() => _service.LinkIntegrationAsync(project.id, request));
        }

        [Fact]
        public async Task LinkIntegrationAsync_ValidNewGithubIntegration_AddsIntegration()
        {
            // Arrange
            var project = new project { name = "Test Project", status = "ACTIVE", created_at = DateTime.UtcNow, updated_at = DateTime.UtcNow };
            _context.projects.Add(project);
            await _context.SaveChangesAsync();

            var request = new LinkIntegrationRequest { GithubRepoUrl = "https://github.com/owner/repo" };

            // Act
            await _service.LinkIntegrationAsync(project.id, request);

            // Assert
            var githubRepo = await _context.github_repositories.FirstOrDefaultAsync(r => r.owner_login == "owner" && r.name == "repo");
            Assert.NotNull(githubRepo);

            var integration = await _context.project_integrations.FirstOrDefaultAsync(i => i.project_id == project.id);
            Assert.NotNull(integration);
            Assert.Equal(githubRepo.id, integration.github_repo_id);
        }

        [Fact]
        public async Task LinkIntegrationAsync_ExistingIntegration_UpdatesIntegration()
        {
            // Arrange
            var project = new project { name = "Test Project", status = "ACTIVE", created_at = DateTime.UtcNow, updated_at = DateTime.UtcNow };
            _context.projects.Add(project);
            await _context.SaveChangesAsync();

            var existingIntegration = new project_integration { project_id = project.id, created_at = DateTime.UtcNow, updated_at = DateTime.UtcNow };
            _context.project_integrations.Add(existingIntegration);
            await _context.SaveChangesAsync();

            var request = new LinkIntegrationRequest { JiraProjectKey = "TEST" };

            // Act
            await _service.LinkIntegrationAsync(project.id, request);

            // Assert
            var jiraProject = await _context.jira_projects.FirstOrDefaultAsync(p => p.jira_project_key == "TEST");
            Assert.NotNull(jiraProject);

            var integration = await _context.project_integrations.FirstOrDefaultAsync(i => i.project_id == project.id);
            Assert.NotNull(integration);
            Assert.Equal(jiraProject.id, integration.jira_project_id);
        }
    }
}
